const express = require('express');
const router = express.Router();
const alumniController = require('../controllers/alumniController');

// ── Utility ──────────────────────────────────────────────────
// Import CSV data into MongoDB (safe upsert, never deletes existing)
router.get('/import', alumniController.importCSVToDB);

// Stats for admin dashboard (fast aggregation counts)
router.get('/stats', alumniController.getStats);

// ── Main Alumni Collection ────────────────────────────────────
// Get all approved alumni (used by Home, Directory, Mentorship)
router.get('/', alumniController.getAllAlumni);

// Add a single alumni record directly
router.post('/add', alumniController.addAlumni);

// ── Pending Registration Flow ─────────────────────────────────
// Submit a new registration to the pending queue
router.post('/register', alumniController.submitRegistration);

// Get all pending registrations (Admin Dashboard)
router.get('/pending', alumniController.getPendingQueue);

// Approve a registration (moves from pending → main Alumni collection)
router.post('/approve/:id', alumniController.approveRegistration);

// Reject and delete a registration
router.delete('/reject/:id', alumniController.rejectRegistration);

// ── Authentication ────────────────────────────────────────────
router.post('/login', alumniController.login);

module.exports = router;
