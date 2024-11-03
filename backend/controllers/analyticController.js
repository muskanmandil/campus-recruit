const pool = require('../config/db');
const toSnakeCase = require('../utilities/snakeCasing')

exports.getAnalytics = async (req, res) => {
    try {
        // Total Students
        const res1 = await pool.query('SELECT COUNT(*) FROM students');
        const totalStudents = res1.rows[0].count;

        // Placed Students
        const res2 = await pool.query('SELECT COUNT(*) FROM students WHERE status = $1', ['Placed']);
        const placedStudents = res2.rows[0].count;

        // Placed Students by branch
        const res3 = await pool.query('SELECT branch, COUNT(*) FROM students WHERE status = $1 GROUP BY branch', ['Placed']);
        const placedStudentsByBranch = res3.rows;

        // Placed Students by gender
        const res4 = await pool.query('SELECT gender, COUNT(*) FROM students WHERE status = $1 GROUP BY gender', ['Placed']);
        const placedStudentsByGender = res4.rows;

        // Total Companies
        const res5 = await pool.query('SELECT DISTINCT COUNT(*) FROM companies');
        const totalCompanies = res5.rows[0].count;

        // Number of Students Selected by each company
        const res6 = await pool.query('SELECT DISTINCT company_name FROM companies WHERE status = $1', ['Completed']);
        const companies = res6.rows.map(row => toSnakeCase(row.company_name));

        const placedStudentsByCompany = {};

        for (const company of companies) {
            try {
                const res = await pool.query(`SELECT COUNT(*) FROM ${company}`);
                placedStudentsByCompany[company] = res.rows[0].count;
            } catch (err) {
                console.error(`Error querying table for company ${company}:`, err);
                placedStudentsByCompany[company] = 0;
            }
        }

        res.status(200).json({ totalStudents, placedStudents, placedStudentsByBranch, placedStudentsByGender, totalCompanies, placedStudentsByCompany });
    } catch (err) {
        console.error("Error fetching analytics:", err);
        res.status(500).json({ message: err });
    }
};