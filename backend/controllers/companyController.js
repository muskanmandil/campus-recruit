const pool = require('../config/db');
const moment = require('moment');
const { uploadToS3, uploadExcel } = require('../utilities/s3Upload');
const toSnakeCase = require('../utilities/snakeCasing');
const xlsx = require('xlsx');
// const path = require('path');

exports.allCompanies = async (req, res) => {
    try {
        const { rows: companies } = await pool.query('SELECT * from companies');
        return res.status(200).json({ companies: companies });
    } catch (err) {
        return res.status(500).json({ message: "Error fetching companies" });
    }
};

exports.addCompany = async (req, res) => {
    const { role } = req.user;
    if (role === 'student') return res.status(403).json({ message: "Access denied. Coordinator & Admins only." });

    const validFields = ['company_name', 'role', 'ctc', 'location', 'description', 'docs_attached', 'deadline', 'eligible_branch', 'tenth_percentage', 'twelfth_percentage', 'diploma_cgpa', 'ug_cgpa'];
    const fields = Object.keys(req.body).filter(field => validFields.includes(field));
    const values = fields.map(field => req.body[field]);

    let docsUrls = [];
    const company_name = toSnakeCase(req.body.company_name);
    const role_name = toSnakeCase(req.body.role);

    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            try {
                const fileUrl = await uploadToS3(file, company_name, role_name);
                docsUrls.push(fileUrl);
            } catch (err) {
                console.error("Error uploading file to S3:", err);
                return res.status(500).json({ message: "Error uploading files" });
            }
        }
        fields.push('docs_attached');
        values.push(docsUrls);
    }

    if (fields.length === 0) {
        return res.status(400).json({ message: "No valid fields provided." });
    }

    try {
        const columns = fields.join(", ");
        const placeholders = fields.map((_, index) => `$${index + 1}`).join(", ");

        const deadlineIndex = fields.indexOf('deadline');
        const deadlineValue = values[deadlineIndex];

        if (deadlineValue) {
            const formattedDeadline = moment(deadlineValue, 'DD-MM-YYYY hh:mm A').format('YYYY-MM-DD HH:mm:ss');
            values[deadlineIndex] = formattedDeadline;
        }


        const company = await pool.query(`INSERT INTO companies (${columns}) VALUES (${placeholders}) RETURNING *`, values);
        const companyName = company.rows[0].company_name;

        const resultSet = await pool.query(`SELECT EXISTS(SELECT FROM information_schema.tables WHERE table_schema ='public' AND table_name = $1)`, [companyName]);
        if (resultSet.rows[0].exists) {
            return res.status(200).json({ message: "Company listed and company table already exists" });
        }

        await pool.query(`CREATE TABLE ${companyName} (
            enrollment_no VARCHAR(10),
            role TEXT,
            resume TEXT,
            status VARCHAR(20) DEFAULT 'Applied',
            PRIMARY KEY (enrollment_no, role),
            CHECK (status IN ('Applied', 'Shortlisted', 'Selected', 'Rejected'))
        )`);

        return res.status(201).json({ message: "Company listed and associated table created successfully." });

    } catch (err) {
        return res.status(500).json({ message: err });
    }
}

exports.apply = async (req, res) => {
    const { institute_email } = req.user;

    if (!req.file) {
        return res.status(400).json({ message: "Please upload a PDF resume file." });
    }

    try {
        const resultSet = await pool.query(`SELECT profile_id FROM users WHERE institute_email = $1`, [institute_email]);
        const enrollment_no = resultSet.rows[0].profile_id;

        const companyName = toSnakeCase(req.body.company_name);
        const resumeUrl = await uploadToS3(req.file, companyName, 'applications');
        await pool.query(`INSERT INTO ${companyName} (enrollment_no, role, resume) VALUES ($1, $2, $3)`,
            [enrollment_no, req.body.role, resumeUrl]
        );

        return res.status(201).json({ message: "Application submitted successfully." });

    } catch (err) {
        return res.status(500).json({ message: err });
    }
}

exports.exportData = async (req, res) => {
    const { company_name } = req.body;
    const { role } = req.user;

    if (role === 'student') {
        return res.status(403).json({ message: "Access denied, coordinators and admins only" });
    }

    try {
        const resultSet = await pool.query(
            `SELECT st.*, c.role, c.resume, c.status, u.institute_email
             FROM ${company_name} AS c
             JOIN students AS st ON c.enrollment_no = st.enrollment_no
             JOIN users AS u ON c.enrollment_no = u.profile_id`
        );

        const applications = resultSet.rows;
        if (applications.length === 0) {
            return res.status(404).json({ message: "No applications found for this company." });
        }

        const data = applications.map((app) => ({
            enrollment_no: app.enrollment_no,
            first_name: app.first_name,
            last_name: app.last_name,
            gender: app.gender,
            college: app.college,
            course: app.course,
            branch: app.branch,
            date_of_birth: app.date_of_birth,
            year_of_passing: app.year_of_passing,
            personal_email: `HYPERLINK("mailto:${app.personal_email}", "${app.personal_email}")`,
            institute_email: `HYPERLINK("mailto:${app.institute_email}", "${app.institute_email}")`,
            contact_no: app.contact_no,
            tenth_percentage: app.tenth_percentage,
            twelfth_percentage: app.twelfth_percentage,
            diploma_cgpa: app.diploma_cgpa,
            ug_cgpa: app.ug_cgpa,
            total_backlogs: app.total_backlogs,
            active_backlogs: app.active_backlogs,
            role: app.role,
            resume: `HYPERLINK("${app.resume}", "${app.resume}")`,
            status: app.status
        }));


        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(data);

        Object.keys(data).forEach((rowIdx) => {
            if (data[rowIdx].personal_email) {
                worksheet[`J${parseInt(rowIdx) + 2}`].f = data[rowIdx].personal_email;
            }
            if (data[rowIdx].institute_email) {
                worksheet[`K${parseInt(rowIdx) + 2}`].f = data[rowIdx].institute_email;
            }
            if (data[rowIdx].resume) {
                worksheet[`T${parseInt(rowIdx) + 2}`].f = data[rowIdx].resume;
            }
        });

        xlsx.utils.book_append_sheet(workbook, worksheet, "Applications");

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        const fileName = `${toSnakeCase(company_name)}/${toSnakeCase(company_name)}_data.xlsx`;
        const fileUrl = await uploadExcel(buffer, fileName, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        await pool.query(`UPDATE companies SET data_file = $1 WHERE company_name = $2`, [fileUrl, company_name]);

        return res.status(200).json({ message: "Data exported successfully", fileUrl: fileUrl });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Error occurred while exporting data.' });
    }
}