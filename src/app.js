const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Placeholder for routes
app.get('/', (req, res) => {
    res.send('Feed Activity System API');
});

const apiRoutes = require('./routes/api');

app.use('/', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
