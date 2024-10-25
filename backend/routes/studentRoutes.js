const express = require('express');
const { createProfile, listCompanies, addCompany } = require('../controllers/studentController');
const { fetchUser } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/profile', fetchUser, createProfile);
router.get('/companies', listCompanies);
router.post('/company', addCompany);

module.exports = router;