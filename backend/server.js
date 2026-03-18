const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const alumniRoutes = require('./routes/alumniRoutes');

// Load env variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/health', require('./routes/healthRoutes'));
app.use('/api/alumni', alumniRoutes);
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/send-email', require('./routes/emailRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 Server is actively running on port ${PORT} 🚀`);
    console.log(`=================================================\n`);
});
