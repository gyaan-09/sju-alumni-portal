const express = require('express');
const router = express.Router();
const { getAllJobs, postJob, deleteJob } = require('../controllers/jobController');

router.get('/', getAllJobs);
router.post('/', postJob);
router.delete('/:id', deleteJob);

module.exports = router;
