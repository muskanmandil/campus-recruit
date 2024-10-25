const pool = require('../config/db');

exports.createProfile = async (req, res) => {
    try {
        const {
            enrollment_no, first_name, last_name,
            department, course, branch, year_of_passing, gender, email, contact_no,
            tenth_percentage, twelfth_percentage, diploma_cgpa, ug_cgpa, pg_cgpa,
            total_backlogs, active_backlogs,
            permanent_address, permanent_city, permanent_pincode,
            temporary_address, temporary_city, temporary_pincode
        } = req.body;

        // Construct the query with only available columns
        const query = `
            INSERT INTO students (
                ${Object.keys(req.body).join(', ')}
            ) VALUES (
                ${Object.keys(req.body).map((_, idx) => `$${idx + 1}`).join(', ')}
            )
        `;

        const values = Object.values(req.body);
        await pool.query(query, values);
        res.status(201).json({ message: 'Student profile created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create student profile' });
    }

};


exports.listCompanies = async (req, res) => {
    try {
        const query = `
            SELECT company_id, company_name, eligible_batch, eligible_department, 
            eligible_branch, tenth_percentage, twelfth_percentage, diploma_cgpa, 
            ug_cgpa, pg_cgpa, total_backlogs, active_backlogs, ctc, internship_stipend, 
            internship_duration_in_months, location 
            FROM companies
        `;

        const { rows: companies } = await pool.query(query);

        return res.status(200).json(companies);
    } catch (error) {
        console.error("Error fetching companies:", error);
        return res.status(500).json({ message: "Error fetching companies." });
    }
};


exports.addCompany = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            company_name, eligible_batch, eligible_department, eligible_branch,
            tenth_percentage, twelfth_percentage, diploma_cgpa, ug_cgpa, pg_cgpa,
            total_backlogs, active_backlogs, ctc, internship_stipend, internship_duration_in_months, location
        } = req.body;

        // Start a transaction
        await client.query('BEGIN');

        // Construct the query to insert into the companies table
        const insertCompanyQuery = `
            INSERT INTO companies (
                ${Object.keys(req.body).join(', ')}
            ) VALUES (
                ${Object.keys(req.body).map((_, idx) => `$${idx + 1}`).join(', ')}
            ) RETURNING company_name
        `;
        const values = Object.values(req.body);

        // Insert company data into companies table
        const result = await client.query(insertCompanyQuery, values);
        const insertedCompanyName = result.rows[0].company_name;

        // Sanitize the company name for table creation (replace spaces with underscores and make lowercase)
        const sanitizedCompanyName = insertedCompanyName.replace(/\s+/g, '_').toLowerCase();

        // Query to create a new table with the company_name
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS ${sanitizedCompanyName} (
                id SERIAL PRIMARY KEY,
                student_enrollment_no VARCHAR(10) REFERENCES students(enrollment_no) ON DELETE CASCADE,
                resume BYTEA,
                status VARCHAR(50)
            );
        `;

        // Execute the table creation query
        await client.query(createTableQuery);

        // Commit the transaction
        await client.query('COMMIT');

        res.status(201).json({ message: `Company ${insertedCompanyName} added and table ${sanitizedCompanyName} created successfully` });
    } catch (err) {
        // Rollback the transaction in case of an error
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to insert company data and create table' });
    } finally {
        client.release();
    }
};

exports.apply = async (req, res) => {
    const { company_name, enrollment_no, resume } = req.body;

    if (!company_name || !enrollment_no || !resume) {
        return res.status(400).json({ message: 'Please provide all required fields: company_name, enrollment_no, resume' });
    }

    try {
        const companyResult = await pool.query('SELECT * FROM companies WHERE company_name = $1', [company_name]);

        if (companyResult.rows.length === 0) {
            return res.status(400).json({ message: `No company found with the name ${company_name}. Please check the name or contact support.` });
        }

        // const checkTableQuery = `SELECT * FROM information_schema.tables WHERE table_name = $1`;
        const companyTableName = `${company_name.toLowerCase().replace(/ /g, "_")}`;
        // const checkTableResult = await pool.query(checkTableQuery, [companyTableName]);

        const insertApplicationQuery = `
            INSERT INTO ${companyTableName} (student_enrollment_no, resume, status)
            VALUES ($1, $2, 'Applied')
        `;
        await pool.query(insertApplicationQuery, [enrollment_no, resume]);

        return res.status(200).json({ message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error processing application:', error);
        return res.status(500).json({ message: 'An error occurred while processing your application' });
    }

}