const express = require('express');
const router = express.Router();
const alumniController = require('../controllers/alumniController');

// Route to import CSV to MongoDB
router.get('/import', alumniController.importCSVToDB);

// Route to add a new Alumni
router.post('/add', alumniController.addAlumni);

// Route to get all Alumni
router.get('/', alumniController.getAllAlumni);

// --- PENDING REGISTRATION ROUTES ---

// Submit a new registration to pending queue
router.post('/register', alumniController.submitRegistration);

// Get all pending registrations for Admin Dashboard
router.get('/pending', alumniController.getPendingQueue);

// Approve a registration (moves to main directory)
router.post('/approve/:id', alumniController.approveRegistration);

// Reject and delete a registration
router.delete('/reject/:id', alumniController.rejectRegistration);

// Authentication Endpoint
router.post('/login', alumniController.login);

module.exports = router;
