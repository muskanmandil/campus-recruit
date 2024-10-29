const express = require('express');
const fetchUser = require('../middleware/auth');
const {createProfile} = require('../controllers/studentController');

const router = express.Router();
router.post('/create-profile', fetchUser, createProfile);
module.exports = router;