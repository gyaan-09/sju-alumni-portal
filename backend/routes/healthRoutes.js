const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
    res.status(200).json({ 
        status: 'Online', 
        timestamp: new Date().toISOString(),
        service: 'SJU Alumni Portal Backend'
    });
});

module.exports = router;
