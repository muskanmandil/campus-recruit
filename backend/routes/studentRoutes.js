const express = require('express');
const fetchUser = require('../middleware/auth');
const { imageUpload } = require('../middleware/fileUpload');
const { createProfile, fetchProfile } = require('../controllers/studentController');


const router = express.Router();
router.get('/profile', fetchUser, fetchProfile);
router.post('/create-profile', fetchUser, imageUpload.single('image'), createProfile);
module.exports = router;