const express = require('express');
const fetchUser = require('../middleware/auth');
const { allEvents, addEvent, cancelEvent} = require('../controllers/eventController');

const router = express.Router();
router.get('/all', allEvents);
router.post('/add', fetchUser, addEvent);
router.post('/cancel', fetchUser, cancelEvent);

module.exports = router;