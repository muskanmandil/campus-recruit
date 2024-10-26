const express = require('express');
const fetchUser = require('../middleware/auth');
const upload = require('../middleware/upload');
const { allCompanies, addCompany } = require('../controllers/companyController');

const router = express.Router();
router.get('/all', allCompanies);
router.post('/add', fetchUser, upload.single('docs_attached'), addCompany);
module.exports = router;