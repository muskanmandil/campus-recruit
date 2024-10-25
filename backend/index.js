const express = require('express');
const pool = require('./config/db');
const cors = require("cors");
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

pool.connect();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);

const port = 4000;
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

app.get('/', (req, res) => {
    res.send('Hello from Node and Express!');
});