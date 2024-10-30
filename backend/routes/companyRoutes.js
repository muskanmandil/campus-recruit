const express = require('express');
const fetchUser = require('../middleware/auth');
const { upload, resumeUpload, excelUpload } = require('../middleware/fileUpload');
const { allCompanies, addCompany, apply, exportData, importData } = require('../controllers/companyController');

const router = express.Router();
router.get('/all', allCompanies);
router.post('/add', fetchUser, upload.array('docs_attached'), addCompany);
router.post('/apply', fetchUser, resumeUpload.single('resume'), apply);
router.post('/export-data', fetchUser, exportData);
router.post('/import-data', fetchUser, excelUpload.single('file'), importData);

module.exports = router;