const express = require('express');
const fetchUser = require('../middleware/auth');
const { allEvents, addEvent, removeEvent} = require('../controllers/eventController');

const router = express.Router();
router.get('/all', allEvents);
router.post('/add', fetchUser, addEvent);
router.post('/remove', fetchUser, removeEvent);

module.exports = router;