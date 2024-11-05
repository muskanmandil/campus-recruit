const pool = require('../config/db');
const toSnakeCase = require('../utilities/snakeCasing')

exports.getAnalytics = async (req, res) => {
    try {
        const branches = {
            CS: 0,
            IT: 0,
            ETC: 0,
            EI: 0,
            Mechanical: 0,
            Civil: 0,
        };

        const gender = {
            Male: 0,
            Female: 0,
        };

        // Total Students
        const res1 = await pool.query('SELECT COUNT(*) FROM students');
        const totalStudents = res1.rows[0].count;

        // Placed Students
        const res2 = await pool.query('SELECT COUNT(*) FROM students WHERE status = $1', ['Placed']);
        const placedStudents = res2.rows[0].count;

        // Unplaced Students
        const unplacedStudents = totalStudents - placedStudents;

        // Placed Students by branch
        const res3 = await pool.query('SELECT branch, COUNT(*) FROM students WHERE status = $1 GROUP BY branch', ['Placed']);
        const placedStudentsByBranch = { ...branches };
        res3.rows.forEach(row => {
            placedStudentsByBranch[row.branch] = parseInt(row.count, 10);
        });

        // Placed Students by gender
        const res4 = await pool.query('SELECT gender, COUNT(*) FROM students WHERE status = $1 GROUP BY gender', ['Placed']);
        const placedStudentsByGender = {...gender};
        res4.rows.forEach(row => {
            placedStudentsByGender[row.gender] = parseInt(row.count, 10);
        });

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

        res.status(200).json({ totalStudents, placedStudents, unplacedStudents, placedStudentsByBranch, placedStudentsByGender, totalCompanies, placedStudentsByCompany });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err });
    }
};