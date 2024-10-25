const express = require('express');
const fetchUser = require('../middleware/auth');
const { signup, verify, login, forgotPassword, newPassword, changePassword } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/verify', verify);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/new-password', fetchUser, newPassword);
router.post('/change-password', fetchUser, changePassword);

module.exports = router;