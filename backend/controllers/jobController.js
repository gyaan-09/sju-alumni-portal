const Job = require('../models/Job');

// GET all active jobs
const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch jobs', details: error.message });
    }
};

// POST a new job
const postJob = async (req, res) => {
    try {
        const { title, company, location, type, description, requirements, salary, domain, postedBy, postedByName, applicationLink } = req.body;
        if (!title || !company) {
            return res.status(400).json({ error: 'Title and Company are required' });
        }
        const newJob = new Job({ title, company, location, type, description, requirements, salary, domain, postedBy, postedByName, applicationLink });
        await newJob.save();
        res.status(201).json({ message: 'Job posted successfully', job: newJob });
    } catch (error) {
        res.status(500).json({ error: 'Failed to post job', details: error.message });
    }
};

// DELETE a job by ID
const deleteJob = async (req, res) => {
    try {
        await Job.findByIdAndUpdate(req.params.id, { isActive: false });
        res.status(200).json({ message: 'Job removed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete job', details: error.message });
    }
};

module.exports = { getAllJobs, postJob, deleteJob };
