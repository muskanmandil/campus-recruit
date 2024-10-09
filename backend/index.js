const express = require('express');
const { Pool } = require('pg');
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bcrypt = require("bcrypt");
require('dotenv').config();

const port = 4000;

const dbUser = process.env.DB_USER;
const dbHost = process.env.DB_HOST;
const dbDatabase = process.env.DB_DATABASE;
const dbPassword = process.env.DB_PASSWORD;
const dbPort = 5432;

const pool = new Pool({
    user: dbUser,
    host: dbHost,
    database: dbDatabase,
    password: dbPassword,
    port: dbPort,
});

const jwtKey = process.env.JWT_KEY;
const saltRounds = 10;

const app = express();
app.use(express.json());
app.use(cors());

pool.on('connect', () => {
    console.log('Connected to the Postgres database');
});

app.get('/', (req, res) => {
    res.send('Hello from Node and Express!');
});

// Nodemailer service
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Signup Route
app.post("/signup", async (req, res) => {
    try {
        // Check if user already exists
        const checkUser = await pool.query("SELECT * FROM users WHERE email = $1", [
            req.body.email,
        ]);
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Delete any existing OTP for the email
        await pool.query("DELETE FROM otp WHERE email = $1", [req.body.email]);

        // Generate a 6-digit OTP and expiration time
        const otpGenerated = Math.floor(100000 + Math.random() * 900000);
        const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

        const otpToHash = otpGenerated.toString();

        // Hash OTP
        bcrypt.hash(otpToHash, saltRounds, async (err, hashOTP) => {
            if (err) {
                return res.status(500).json({ message: "Error while hashing OTP" });
            }

            // Hash password
            bcrypt.hash(req.body.password, saltRounds, async (err, hashPassw) => {
                if (err) {
                    return res.status(500).json({ message: "Error while hashing password" });
                }

                // Insert OTP and user data into otps table
                await pool.query(
                    "INSERT INTO otp (email, otp, expires_at, name, password) VALUES ($1, $2, $3, $4, $5)",
                    [req.body.email, hashOTP, expiryTime, req.body.name, hashPassw ]
                );

                // Send OTP via email (placeholder code)
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: req.body.email,
                    subject: "Campus Recruit: Account Verification",
                    text: `Your code to verify account is ${otpGenerated}. It is valid till ${expiryTime}.`,
                };

                // Assuming transporter is configured (replace with your email config)
                transporter.sendMail(mailOptions, async (error, info) => {
                    if (error) {
                        return res.status(500).json({ message: "Failed to send OTP email" });
                    }
                    return res.status(200).json({ message: "OTP sent to your email. Please verify." });
                });
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});


// Verify Route
app.post("/verify", async (req, res) => {
    try {
        const otpRecord = await pool.query("SELECT * FROM otp WHERE email = $1", [req.body.email]);

        if (otpRecord.rows.length === 0) {
            return res.status(400).json({ message: "Code Expired" });
        }

        const otpData = otpRecord.rows[0];

        // Check OTP expiration
        if (new Date() > otpData.expires_at) {
            await pool.query("DELETE FROM otp WHERE email = $1", [req.body.email]);
            return res.status(400).json({ message: "OTP Expired" });
        }

        // Compare provided OTP with stored (hashed) OTP
        bcrypt.compare(req.body.otp, otpData.otp, async (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Error while comparing OTP" });
            }

            if (!result) {
                return res.status(400).json({ message: "Wrong OTP" });
            }

            // OTP is verified, delete OTP record
            await pool.query("DELETE FROM otp WHERE email = $1", [req.body.email]);

            // Check if user already exists
            const checkUser = await pool.query("SELECT * FROM users WHERE email = $1", [req.body.email]);
            if (checkUser.rows.length > 0) {
                // User already exists, generate token
                const token = jwt.sign({ id: checkUser.rows[0].id }, jwtKey);
                return res.status(200).json({
                    message: "User has been verified successfully",
                    token,
                    flag: "existingUser",
                });
            } else {
                // New user creation
                const newUser = await pool.query(
                    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id",
                    [otpData.name, otpData.email, otpData.password]
                );

                // Generate token for new user
                const token = jwt.sign({ id: newUser.rows[0].id }, jwtKey);
                return res.status(200).json({
                    message: "User has been registered successfully",
                    token,
                    flag: "newUser",
                });
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Login Route
app.post("/login", async (req, res) => {
    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [req.body.email]);

        if (user.rows.length === 0) {
            return res.status(400).json({ message: "No user found with this email. Signup first." });
        }

        bcrypt.compare(req.body.password, user.rows[0].password, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Error while comparing passwords" });
            }

            if (result) {
                const token = jwt.sign({ id: user.rows[0].id }, jwtKey);
                return res.status(200).json({ message: "Logged in successfully", token });
            } else {
                return res.status(400).json({ message: "Wrong password" });
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Forgot Password
app.post("/forgot-password", async (req, res) => {
    try {
        // Query to check if the user exists by email
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [req.body.email]);

        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];

            // Generate a 6-digit OTP & Set expiration time to 10 minutes from now
            const otpGenerated = Math.floor(100000 + Math.random() * 900000);
            const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

            const otpToHash = otpGenerated.toString();

            // Hash the OTP using bcrypt
            bcrypt.hash(otpToHash, saltRounds, async (err, hashOTP) => {
                if (err) {
                    return res.status(500).json({ message: "Error while hashing OTP" });
                }

                // Insert OTP details into PostgreSQL OTP table
                const insertOTPQuery = `
                    INSERT INTO otp (email, otp, expires_at, name, password)
                    VALUES ($1, $2, $3, $4, $5)`;
                const insertOTPValues = [req.body.email, hashOTP, expiryTime, user.name, user.password];

                try {
                    await pool.query(insertOTPQuery, insertOTPValues);

                    // Prepare and send the OTP email
                    const mailOptions = {
                        from: process.env.EMAIL,
                        to: req.body.email,
                        subject: "CampusRecruit: Account Verification",
                        text: `Your code to verify account is ${otpGenerated}. It is valid till ${expiryTime}.`,
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.log(error);
                            return res.status(500).json({ message: "Failed to send OTP email" });
                        }

                        return res.status(200).json({ message: "OTP sent to your email. Please verify." });
                    });
                } catch (error) {
                    console.error(error);
                    return res.status(500).json({ message: "Error saving OTP to database" });
                }
            });
        } else {
            return res.status(400).json({ message: "No user found with this email. Sign up first." });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});



// MIDDLEWARE: used for authentication
const fetchUser = async (req, res, next) => {
    // retrieves value of auth-token header from request, to pass jwt for authentication
    const token = req.header("auth-token");

    // if token is not present or is an empty string
    if (!token) {
        // sending an unauthorized request (401) response of invalid token
        return res.status(401).json({ message: "Please authenticate using a valid token" });
    }

    try {
        // verify it with secret key
        const data = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Get the user's ID from the decoded token
        const userId = data.user.id;

        // Fetch the user from the PostgreSQL database using the user ID
        const queryText = 'SELECT * FROM users WHERE id = $1';
        const userResult = await pool.query(queryText, [userId]);

        // If no user is found in the database
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: "User not found. Please authenticate again." });
        }

        // Attach user data to the request object
        req.user = userResult.rows[0];

        // Proceed to the next middleware in the chain
        next();
    } catch (error) {
        console.error(error.message);
        res.status(401).json({ message: "Please authenticate using a valid token" });
    }
};


// STUDENT'S PROFILE
app.post('/student-profile', async (req, res) => {
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
});


// LIST COMPANY
app.post('/list-company', async (req, res) => {
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
});

// Apply
app.post('/apply', async (req, res) => {
    const { company_name, enrollment_no, resume } = req.body;

    // if (!company_name || !enrollment_no || !resume) {
    //     return res.status(400).json({ message: 'Please provide all required fields: company_name, enrollment_no, resume' });
    // }

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
});



app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});




// students
// CREATE TABLE students
// (
//     enrollment_no VARCHAR(10) PRIMARY KEY,
//     first_name VARCHAR(50),
//     last_name VARCHAR(50),
//     department VARCHAR(10),
//     course VARCHAR(10),
//     branch VARCHAR(10),
//     year_of_passing INTEGER,
//     gender VARCHAR(6),
//     email VARCHAR(100),
//     contact_no VARCHAR(15),
//     tenth_percentage NUMERIC(5,2),
//     twelfth_percentage NUMERIC(5,2),
//     diploma_cgpa NUMERIC(3,2),
//     ug_cgpa NUMERIC(3,2),
//     pg_cgpa NUMERIC(3,2),
//     total_backlogs INTEGER,
//     active_backlogs INTEGER,
//     permanent_address VARCHAR(500),
//     permanent_city VARCHAR(50),
//     permanent_pincode VARCHAR(10),
//     temporary_address VARCHAR(500),
//     temporary_city VARCHAR(50),
//     temporary_pincode VARCHAR(10)
// )

// companies
// CREATE TABLE companies
// (
//     company_id SERIAL PRIMARY KEY,
//     company_name VARCHAR(200),
//     eligible_batch INTEGER,
//     eligible_department VARCHAR[],
//     eligible_branch VARCHAR[] ,
//     tenth_percentage NUMERIC(5,2) DEFAULT 60,
//     twelfth_percentage NUMERIC(5,2) DEFAULT 60,
//     diploma_cgpa NUMERIC(3,2),
//     ug_cgpa NUMERIC(3,2) DEFAULT 6,
//     pg_cgpa NUMERIC(3,2),
//     total_backlogs INTEGER,
//     active_backlogs INTEGER DEFAULT 0,
//     ctc INTEGER,
//     internship_stipend INTEGER,
//     internship_duration_in_months INTEGER,
//     location VARCHAR[],
// )

// users
// CREATE TABLE users 
// (
//     id SERIAL PRIMARY KEY,
//     name VARCHAR(100),
//     email VARCHAR(255) UNIQUE NOT NULL,
//     password VARCHAR(255)
// )


// otp
// CREATE TABLE otp 
// (
//     email VARCHAR(255) PRIMARY KEY
//     otp VARCHAR(200),
//     expires_at TIMESTAMP,
//     name VARCHAR(100),
//     password VARCHAR(255)
// )

// -- Add an index on the expires_at field for efficient querying
// CREATE INDEX idx_expires_at ON otp (expires_at);

// -- Add a trigger to delete expired rows automatically
// CREATE OR REPLACE FUNCTION delete_expired_otps() RETURNS trigger AS $$
// BEGIN
//     DELETE FROM otp WHERE expires_at <= NOW();
//     RETURN NEW;
// END;
// $$ LANGUAGE plpgsql;

// CREATE TRIGGER trigger_delete_expired_otps
// AFTER INSERT OR UPDATE ON otp
// FOR EACH ROW EXECUTE FUNCTION delete_expired_otps();
