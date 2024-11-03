const express = require('express');
const pool = require('./config/db');
const path = require('path');
const cors = require("cors");
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const studentRoutes = require('./routes/studentRoutes');
const eventRoutes = require('./routes/eventRoutes');
const analyticRoutes = require('./routes/analyticRoutes');
require('dotenv').config();

pool.connect();

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/analytic', analyticRoutes);



const port = 4000;
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

app.get('/', (req, res) => {
    res.send('Hello from Node and Express!');
});