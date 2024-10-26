const pool = require('../config/db');
const moment = require('moment');

exports.createProfile = async (req, res) => {
    const { institute_email } = req.user;

    const validFields = ['enrollment_no', 'first_name', 'last_name', 'gender', 'college', 'course', 'branch', 'date_of_birth', 'year_of_passing', 'personal_email', 'contact_no', 'tenth_percentage', 'twelfth_percentage', 'diploma_cgpa', 'ug_cgpa', 'total_backlogs', 'active_backlogs'];
    const fields = Object.keys(req.body).filter(field => validFields.includes(field));
    const values = fields.map(field => req.body[field]);

    if (fields.length === 0) {
        return res.status(400).json({ message: "No valid fields provided." });
    }

    try {
        const columns = fields.join(", ");
        const placeholders = fields.map((_, index) => `$${index + 1}`).join(", ");

        const dobIndex = fields.indexOf('date_of_birth');
        const dobValue = values[dobIndex];

        if (dobValue) {
            const formattedDob = moment(dobValue, 'DD-MM-YYYY').format('YYYY-MM-DD');
            values[dobIndex] = formattedDob;
        }

        await pool.query('BEGIN');

        const resultSet = await pool.query(`INSERT INTO students (${columns}) VALUES (${placeholders}) RETURNING enrollment_no`, values);
        const enrollment_no = resultSet.rows[0].enrollment_no;

        await pool.query('UPDATE users SET profile_id = $1 WHERE institute_email = $2', [enrollment_no, institute_email]);

        await pool.query('COMMIT');
        return res.status(201).json({ message: "Profile created successfully." });

    } catch (err) {

        await pool.query('ROLLBACK');
        return res.status(500).json({ message: "Server error" });
    }
}