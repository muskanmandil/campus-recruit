const pool = require('../config/db');
const moment = require('moment');
const { uploadToS3 } = require('../utilities/s3Upload');
const toSnakeCase = require('../utilities/snakeCasing');
// const xlsx = require('xlsx');
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

// exports.exportData = async (req, res) => {
//     const { company_name } = req.body;
//     const { role } = req.user;

//     if (role !== 'admin') {
//         return res.status(403).json({ message: "Access denied, admins only" });
//     }


//     try {
//         const resultSet = await pool.query(
//             `SELECT st.*, c.role, c.resume, c.status
//              FROM ${company_name} AS c
//              JOIN students AS st ON c.enrollment_no = st.enrollment_no`
//         );

//         const applications = resultSet.rows;

//         if (applications.length === 0) {
//             return res.status(404).json({ message: "No applications found for this company." });
//         }


//         const data = applications.map((app) => ({
//             Enrollment_No: app.enrollment_no,
//             First_Name: app.first_name,
//             Last_Name: app.last_name,
//             Gender: app.gender,
//             College: app.college,
//             Course: app.course,
//             Branch: app.branch,
//             Date_of_Birth: app.date_of_birth,
//             Year_of_Passing: app.year_of_passing,
//             Personal_Email: app.personal_email,
//             Contact_No: app.contact_no,
//             Tenth_Percentage: app.tenth_percentage,
//             Twelfth_Percentage: app.twelfth_percentage,
//             Diploma_CGPA: app.diploma_cgpa,
//             UG_CGPA: app.ug_cgpa,
//             Total_Backlogs: app.total_backlogs,
//             Active_Backlogs: app.active_backlogs,
//             Role: app.role,
//             Resume: app.resume,
//             Status: app.status
//         }));


//         const workbook = xlsx.utils.book_new();
//         const worksheet = xlsx.utils.json_to_sheet(data);
//         xlsx.utils.book_append_sheet(workbook, worksheet, "Applications");

//         const filePath = path.join(__dirname, `${company_name}_applications.xlsx`);
//         xlsx.writeFile(workbook, filePath);

//         res.download(filePath, `${company_name}_applications.xlsx`, (err) => {
//             if (err) {
//                 console.error("Error sending file:", err);
//                 return res.status(500).json({ message: "Error downloading file." });
//             }
//             // Delete the file after sending it
//             fs.unlink(filePath, (unlinkErr) => {
//                 if (unlinkErr) {
//                     console.error("Error deleting file:", unlinkErr);
//                 }
//             });
//         });

//     } catch (err) {
//         console.log(err);
//         return res.status(500).json({ message: 'Error occurred while exporting data.' });
//     }
// }