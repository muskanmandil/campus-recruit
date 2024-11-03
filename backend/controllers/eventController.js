const pool = require('../config/db');

exports.allEvents = async (req, res) => {
    try {
        const { rows: events } = await pool.query('SELECT * from events');
        return res.status(200).json({ events: events });
    } catch (err) {
        return res.status(500).json({ message: "Error fetching events" });
    }
};

exports.addEvent = async (req, res) => {
    const { role } = req.user;
    const { speaker_name, company_name, date, description } = req.body;
    if (role === 'student') return res.status(403).json({ message: "Access denied. Coordinator & Admins only." });

    try {
        await pool.query(`INSERT INTO events (speaker_name, company_name, date, description) VALUES ($1, $2, $3, $4)`, [speaker_name, company_name, date, description]);
        res.status(201).json({ message: "Event added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err });
    }
}

exports.cancelEvent = async (req, res) => {
    const { role } = req.user;
    const { event_id } = req.body;
    if (role === 'student') return res.status(403).json({ message: "Access denied. Coordinator & Admins only." });

    try {
        await pool.query(`DELETE FROM events WHERE event_id = $1`, [event_id]);
        res.status(200).json({ message: "Event deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err });
    }
}