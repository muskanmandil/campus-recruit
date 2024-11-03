const express = require('express');
const { getAnalytics } = require('../controllers/analyticController');

const router = express.Router();
router.get('/', getAnalytics);

module.exports = router;