const pool = require('../config/db');
const moment = require('moment');
const { uploadImage } = require('../utilities/s3Upload');
const { console } = require('inspector');

exports.fetchProfile = async (req, res) => {
    const { institute_email } = req.user;

    try {
        const resultSet = await pool.query('SELECT profile_id FROM users WHERE institute_email = $1', [institute_email]);
        if (resultSet.rows.length === 0) {
            return res.status(404).json({ message: "Profile not found" });
        }

        const profileId = resultSet.rows[0].profile_id;
        const profile = await pool.query('SELECT * FROM students WHERE enrollment_no = $1', [profileId]);
        profile.rows[0].date_of_birth = moment(profile.rows[0].date_of_birth).format("DD-MM-YYYY");
        return res.status(200).json(profile.rows[0]);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching profile' });
    }
};


exports.createProfile = async (req, res) => {
    const { institute_email } = req.user;

    const validFields = ['enrollment_no', 'first_name', 'last_name', 'image', 'gender', 'college', 'course', 'branch', 'date_of_birth', 'year_of_passing', 'personal_email', 'contact_no', 'tenth_percentage', 'twelfth_percentage', 'diploma_cgpa', 'ug_cgpa', 'total_backlogs', 'active_backlogs'];
    const fields = Object.keys(req.body).filter(field => validFields.includes(field));
    const values = fields.map(field => req.body[field]);

    if (fields.length === 0) return res.status(400).json({ message: "No valid fields provided." });
    if (!req.file) return res.status(400).json({ message: "Please upload a profile image." });

    try {
        const enrollment_no = req.body.enrollment_no;
        const imageKey = `students/${enrollment_no}.jpg`;
        const imageUrl = await uploadImage(req.file, imageKey, req.file.mimetype);

        const dobIndex = fields.indexOf('date_of_birth');
        const dobValue = values[dobIndex];

        if (dobValue) {
            const formattedDob = moment(dobValue, 'DD-MM-YYYY').format('YYYY-MM-DD');
            values[dobIndex] = formattedDob;
        }

        fields.push('image');
        values.push(imageUrl);

        const columns = fields.join(", ");
        const placeholders = fields.map((_, index) => `$${index + 1}`).join(", ");

        await pool.query('BEGIN');

        await pool.query(`INSERT INTO students (${columns}) VALUES (${placeholders}) RETURNING enrollment_no`, values);

        await pool.query('UPDATE users SET profile_id = $1 WHERE institute_email = $2', [enrollment_no, institute_email]);

        await pool.query('COMMIT');
        return res.status(201).json({ message: "Profile created successfully." });

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error(err);
        return res.status(500).json({ message: err });
    }
}

// exports.editProfile = async (req, res) => {
//     const { institute_email } = req.user;

//     const validFields = ['first_name', 'last_name', 'gender', 'college', 'course', 'branch', 'date_of_birth', 'year_of_passing', 'personal_email', 'contact_no', 'tenth_percentage', 'twelfth_percentage', 'diploma_cgpa', 'ug_cgpa', 'total_backlogs', 'active_backlogs'];
//     const fieldsToUpdate = Object.keys(req.body).filter(field => validFields.includes(field));
//     const valuesToUpdate = fieldsToUpdate.map(field => req.body[field]);

//     if (fieldsToUpdate.length === 0 && !req.file) {
//         return res.status(400).json({ message: "No valid fields provided for update." });
//     }

//     try {
//         const resultSet = await pool.query('SELECT profile_id FROM users WHERE institute_email = $1', [institute_email]);
//         if (resultSet.rows.length === 0) {
//             return res.status(404).json({ message: "Profile not found" });
//         }

//         const profileId = resultSet.rows[0].profile_id;

//         const dobIndex = fieldsToUpdate.indexOf('date_of_birth');
//         if (dobIndex !== -1) {
//             const formattedDob = moment(valuesToUpdate[dobIndex], 'DD-MM-YYYY').format('YYYY-MM-DD');
//             valuesToUpdate[dobIndex] = formattedDob;
//         }

//         // Handle image upload if a new file is provided
//         let imageUrl;
//         if (req.file) {
//             const imageKey = `students/${profileId}.jpg`;
//             imageUrl = await uploadImage(req.file, imageKey, req.file.mimetype);
//             fieldsToUpdate.push('image');
//             valuesToUpdate.push(imageUrl);
//         }

//         // Dynamically build the SQL query
//         const setClause = fieldsToUpdate.map((field, index) => `${field} = $${index + 1}`).join(', ');
//         const query = `UPDATE students SET ${setClause} WHERE enrollment_no = $${fieldsToUpdate.length + 1}`;

//         // Execute the update query
//         await pool.query(query, [...valuesToUpdate, profileId]);

//         return res.status(200).json({ message: "Profile updated successfully." });

//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Error updating profile." });
//     }
// };