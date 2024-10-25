const jwt = require("jsonwebtoken");
const jwtKey = process.env.JWT_KEY;

const fetchUser = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token || typeof token !== 'string') return res.status(401).json({ message: "Invalid or missing token" });

    try {
        const data = jwt.verify(token, jwtKey);
        req.user = data;
        next();
    } catch (err) {
        res.status(401).json({ message: "Please authenticate using a valid token" });
    }
};

module.exports = fetchUser;
