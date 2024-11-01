const express = require('express');
const fetchUser = require('../middleware/auth');
const {createProfile, fetchProfile} = require('../controllers/studentController');

const router = express.Router();
router.post('/create-profile', fetchUser, createProfile);
router.get('/profile', fetchUser, fetchProfile);
module.exports = router;