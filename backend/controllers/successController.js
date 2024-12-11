const pool = require('../config/db');
const toSnakeCase = require('../utilities/snakeCasing');

exports.getSuccess = async (req, res) => {
    try {
        // Fetch completed companies
        const res1 = await pool.query('SELECT DISTINCT company_name FROM companies WHERE status = $1', ['Completed']);
        const companies = res1.rows.map(row => toSnakeCase(row.company_name));

        const finalSelects = [];

        for (const company of companies) {
            try {
                // Fetch selected students for the company and join with the students table
                const res2 = await pool.query(`
                    SELECT 
                        s.first_name || ' ' || s.last_name AS name,
                        s.branch,
                        s.image
                    FROM ${company} AS c
                    JOIN students AS s ON c.enrollment_no = s.enrollment_no
                    WHERE c.status = $1
                `, ['Selected']);

                finalSelects.push({ company, students: res2.rows });
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: err });

            }
        }

        res.status(200).json({ finalSelects });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err });
    }
};
