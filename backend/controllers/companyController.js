const pool = require('../config/db');
const { uploadToS3, uploadExcel } = require('../utilities/s3Upload');
const toSnakeCase = require('../utilities/snakeCasing');
const xlsx = require('xlsx');

exports.allCompanies = async (req, res) => {
    try {
        const { rows: companies } = await pool.query('SELECT * from companies');
        return res.status(200).json({ companies: companies });
    } catch (err) {
        console.error(err);
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
                return res.status(500).json({ message: "Error uploading files" });
            }
        }
        fields.push('docs_attached');
        values.push(docsUrls);
    }

    if (fields.length === 0) return res.status(400).json({ message: "No valid fields provided." });

    try {
        const columns = fields.join(", ");
        const placeholders = fields.map((_, index) => `$${index + 1}`).join(", ");

        await pool.query(`INSERT INTO companies (${columns}) VALUES (${placeholders}) RETURNING *`, values);

        const resultSet = await pool.query(`SELECT EXISTS(SELECT FROM information_schema.tables WHERE table_schema ='public' AND table_name = $1)`, [company_name]);
        if (resultSet.rows[0].exists) {
            return res.status(200).json({ message: "Company listed and company table already exists" });
        }

        await pool.query(`CREATE TABLE ${company_name} (
            enrollment_no VARCHAR(10),
            role TEXT,
            resume TEXT,
            status VARCHAR(20) DEFAULT 'Applied',
            PRIMARY KEY (enrollment_no, role),
            CHECK (status IN ('Applied', 'Shortlisted', 'Selected', 'Rejected'))
        )`);

        return res.status(201).json({ message: "Company listed and associated table created successfully." });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err });
    }
}

exports.apply = async (req, res) => {
    const { institute_email } = req.user;

    if (!req.file) return res.status(400).json({ message: "Please upload a PDF resume file." });

    try {
        const resultSet = await pool.query(`SELECT profile_id FROM users WHERE institute_email = $1`, [institute_email]);
        const enrollment_no = resultSet.rows[0].profile_id;
        const company_name = toSnakeCase(req.body.company_name);

        const checkResult = await pool.query(`SELECT * FROM ${company_name} WHERE enrollment_no = $1 AND role = $2`, [enrollment_no, req.body.role]);
        if (checkResult.rows.length > 0) return res.status(409).json({ message: "Already applied" });

        const resumeUrl = await uploadToS3(req.file, company_name, 'applications');
        await pool.query(`INSERT INTO ${company_name} (enrollment_no, role, resume) VALUES ($1, $2, $3)`, [enrollment_no, req.body.role, resumeUrl]);

        return res.status(201).json({ message: "Application submitted successfully." });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err });
    }
}

exports.exportData = async (req, res) => {
    const { role } = req.user;
    const company_name = toSnakeCase(req.body.company_name);

    if (role === 'student') return res.status(403).json({ message: "Access denied, coordinators and admins only" });

    try {
        const resultSet = await pool.query(
            `SELECT st.*, c.role, c.resume, c.status, u.institute_email
             FROM ${company_name} AS c
             JOIN students AS st ON c.enrollment_no = st.enrollment_no
             JOIN users AS u ON c.enrollment_no = u.profile_id`
        );

        const applications = resultSet.rows;
        if (applications.length === 0) return res.status(404).json({ message: "No applications found for this company." });

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

        const fileName = `${company_name}/${company_name}_data.xlsx`;
        const fileUrl = await uploadExcel(buffer, fileName, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        await pool.query(`UPDATE companies SET data_file = $1 WHERE company_name = $2`, [fileUrl, company_name]);

        return res.status(200).json({ message: "Data exported successfully", fileUrl: fileUrl });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err });
    }
}

exports.importData = async (req, res) => {
    const { role } = req.user;
    const file = req.file;
    const finalSelects = req.body.finalSelects;
    const company_name = toSnakeCase(req.body.company_name);

    if (role === 'student') return res.status(403).json({ message: "Access denied, coordinators and admins only" });

    if (!file) return res.status(400).json({ message: "No file uploaded." });

    try {
        const workbook = xlsx.read(file.buffer);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const enrollmentNumbers = data.map(row => row.enrollment_no);

        const resultSet = await pool.query(`SELECT enrollment_no, status FROM ${company_name}`);
        const applications = resultSet.rows;

        if (finalSelects) {
            const updates = [];
            const deletions = [];

            // Determine updates and deletions
            applications.forEach(app => {
                if (enrollmentNumbers.includes(app.enrollment_no)) {
                    updates.push(app.enrollment_no); // For "Selected" status
                } else {
                    deletions.push(app.enrollment_no); // For deletion
                }
            });

            // Bulk update "Selected" status
            if (updates.length > 0) {
                await pool.query(
                    `UPDATE ${company_name} SET status = 'Selected' WHERE enrollment_no = ANY($1)`,
                    [updates]
                );
            }

            // Bulk delete unmatched rows
            if (deletions.length > 0) {
                await pool.query(
                    `DELETE FROM ${company_name} WHERE enrollment_no = ANY($1)`,
                    [deletions]
                );
            }

            return res.status(200).json({ message: "Final selections updated successfully." });


        } else {
            // Shortlist/Reject logic
            const updates = [];

            applications.forEach(app => {
                if (enrollmentNumbers.includes(app.enrollment_no)) {
                    updates.push({ enrollment_no: app.enrollment_no, status: 'Shortlisted' });
                } else {
                    updates.push({ enrollment_no: app.enrollment_no, status: 'Rejected' });
                }
            });

            // Execute updates
            for (const update of updates) {
                await pool.query(
                    `UPDATE ${company_name} SET status = $1 WHERE enrollment_no = $2`,
                    [update.status, update.enrollment_no]
                );
            }

            return res.status(200).json({ message: "Data imported and statuses updated successfully." });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err });
    }
}