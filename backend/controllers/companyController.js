const pool = require('../config/db');
const moment = require('moment');
const fs = require('fs');

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
    if (role !== 'admin') return res.status(403).json({ message: "Access denied. Admins only." });

    const validFields = ['company_name', 'role', 'ctc', 'location', 'description', 'docs_attached', 'deadline', 'eligible_branch', 'tenth_percentage', 'twelfth_percentage', 'diploma_cgpa', 'ug_cgpa'];
    const fields = Object.keys(req.body).filter(field => validFields.includes(field));
    const values = fields.map(field => req.body[field]);

    if (req.file) {
        fields.push('docs_attached');
        values.push(req.file.path);
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


        await pool.query(`INSERT INTO companies (${columns}) VALUES (${placeholders}) RETURNING *`, values);
        return res.status(201).json({ message: "Company added successfully." });

    } catch (err) {
        console.log(err);
        if (req.file) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) {
                    console.error("Error deleting file:", unlinkErr);
                }
            });
        }
        return res.status(500).json({ message: "Error occured while adding company" });
    }
}
