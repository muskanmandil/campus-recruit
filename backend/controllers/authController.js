const pool = require('../config/db')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require('../utilities/mailer');

const jwtKey = process.env.JWT_KEY;
const saltRounds = 10;

exports.signup = async (req, res) => {
    const { email, password } = req.body;

    const collegeDomainRegex = /^[a-zA-Z0-9._%+-]+@ietdavv\.edu\.in$/;
    if (!collegeDomainRegex.test(email))
        return res.status(400).json({ message: "Only emails from @ietdavv.edu.in are allowed to create an account" });

    try {
        const checkUser = await pool.query("SELECT * FROM users WHERE institute_email = $1", [email]);

        if (checkUser.rows.length > 0) return res.status(400).json({ message: "User already exists. Login to your account" });

        await pool.query("DELETE FROM otps WHERE email = $1", [email]);

        const otpGenerated = Math.floor(100000 + Math.random() * 900000);
        const expiry = new Date(Date.now() + 10 * 60 * 1000);
        const otp = otpGenerated.toString();

        bcrypt.hash(otp, saltRounds, async (err, otpHash) => {
            if (err) return res.status(500).json({ message: "Error while hashing OTP" });

            bcrypt.hash(password, saltRounds, async (err, passwordHash) => {
                if (err) return res.status(500).json({ message: "Error while hashing password" });

                await pool.query("INSERT INTO otps (email, password, otp, expires_at) VALUES ($1, $2, $3, $4)", [email, passwordHash, otpHash, expiry]);

                const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: "Campus Recruit: Account Verification",
                    text: `Your code to verify account is ${otpGenerated}. It is valid till ${expiry}.`,
                };

                transporter.sendMail(mailOptions, async (err, info) => {
                    if (err) return res.status(500).json({ message: "Failed to send OTP on email" });
                    return res.status(200).json({ message: "OTP sent to your email. Please verify." });
                });
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err });
    }
}

exports.verify = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const resultSet = await pool.query("SELECT * FROM otps WHERE email = $1", [email]);
        if (resultSet.rows.length === 0) return res.status(400).json({ message: "Code does not exists. Signup Again" });

        const otpRecord = resultSet.rows[0];

        bcrypt.compare(otp, otpRecord.otp, async (err, result) => {
            if (err) return res.status(500).json({ message: "Error while comparing OTP" });
            if (!result) return res.status(400).json({ message: "Wrong OTP" });

            const checkUser = await pool.query("SELECT * FROM users WHERE institute_email = $1", [email]);

            if (checkUser.rows.length > 0) {
                const token = jwt.sign({ institute_email: checkUser.rows[0].institute_email }, jwtKey);
                await pool.query("DELETE FROM otps WHERE email = $1", [email]);
                return res.status(200).json({ message: "User has been verified successfully", token, role: checkUser.rows[0].role });
            } else {
                const newUser = await pool.query("INSERT INTO users (institute_email, password) VALUES ($1, $2) RETURNING institute_email", [email, otpRecord.password]);
                const token = jwt.sign({ institute_email: newUser.rows[0].institute_email }, jwtKey);
                await pool.query("DELETE FROM otps WHERE email = $1", [email]);
                return res.status(200).json({ message: "User has been registered successfully", token, role: 'student' });
            }

        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err });
    }
}

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query("SELECT * FROM users WHERE institute_email = $1", [email]);

        if (user.rows.length === 0) return res.status(400).json({ message: "No user found. Signup first." });

        await pool.query("DELETE FROM otps WHERE email = $1", [email]);

        bcrypt.compare(password, user.rows[0].password, (err, result) => {
            if (err) return res.status(500).json({ message: "Error while comparing passwords" }); 
            
            if (result) {
                const token = jwt.sign({ institute_email: user.rows[0].institute_email, role: user.rows[0].role }, jwtKey);
                return res.status(200).json({ message: "Logged in successfully", token, role: user.rows[0].role });
            } else {
                return res.status(400).json({ message: "Wrong password" });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err });
    }
}

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE institute_email = $1', [email]);

        if (user.rows.length === 0) return res.status(400).json({ message: "No user found. Signup first." });

        await pool.query("DELETE FROM otps WHERE email = $1", [email]);

        const otpGenerated = Math.floor(100000 + Math.random() * 900000);
        const expiry = new Date(Date.now() + 10 * 60 * 1000);
        const otp = otpGenerated.toString();

        bcrypt.hash(otp, saltRounds, async (err, otpHash) => {
            if (err) return res.status(500).json({ message: "Error while hashing OTP" });

            await pool.query('INSERT INTO otps (email, otp, expires_at, password) VALUES ($1, $2, $3, $4)', [email, otpHash, expiry, ''])
            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: "CampusRecruit: Account Verification",
                text: `Your code to verify account is ${otpGenerated}. It is valid till ${expiry}.`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) return res.status(500).json({ message: "Failed to send OTP email" });
                return res.status(200).json({ message: "OTP sent to your email. Please verify." });
            });
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err });
    }
}

exports.newPassword = async (req, res) => {
    const { new_password } = req.body;
    const { institute_email } = req.user;

    try {
        bcrypt.hash(new_password, saltRounds, async (err, passwordHash) => {
            if (err) return res.status(500).json({ message: "Error while hashing password" });

            await pool.query("UPDATE users SET password = $1 WHERE institute_email = $2", [passwordHash, institute_email]);

            return res.status(200).json({ message: "Password changed successfully" });
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err });
    }
};

exports.changePassword = async (req, res) => {
    const { curr_password, new_password } = req.body;
    const { institute_email } = req.user;

    const resultSet = await pool.query("SELECT * from users WHERE institute_email = $1", [institute_email]);
    const user = resultSet.rows[0];

    try {
        bcrypt.compare(curr_password, user.password, (err, result) => {
            if (err) return res.status(500).json({ message: "Error while comparing passwords" });
            if (!result) return res.status(400).json({ message: "Wrong Password" });

            bcrypt.hash(new_password, saltRounds, async (err, passwordHash) => {
                if (err) return res.status(500).json({ message: "Error while hashing new password" });

                await pool.query('UPDATE users SET password = $1 WHERE institute_email = $2', [passwordHash, institute_email]);
                return res.status(200).json({ message: "Password Updated" });
            });
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err });
    }
}