const express = require('express');
const { getSuccess } = require('../controllers/successController');

const router = express.Router();
router.get('/', getSuccess);

module.exports = router;