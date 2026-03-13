const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String },
    type: { type: String, enum: ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Remote'], default: 'Full-Time' },
    description: { type: String },
    requirements: { type: String },
    salary: { type: String },
    domain: { type: String },
    postedBy: { type: String }, // Alumni register number or name
    postedByName: { type: String },
    applicationLink: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
