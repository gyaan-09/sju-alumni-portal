const mongoose = require('mongoose');

const alumniSchema = new mongoose.Schema({
    registerNumber: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    fathersName: { type: String },
    mothersName: { type: String },
    email: { type: String, required: true },
    phoneNumber: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String },
    aadhar: { type: String },
    batchYear: { type: Number },
    degree: { type: String },
    currentStatus: { type: String },
    companyName: { type: String },
    designation: { type: String },
    pgCollege: { type: String },
    skills: { type: String },
    reviews: { type: String },
    linkedInProfile: { type: String },
    age: { type: Number },
    username: { type: String },
    password: { type: String },
}, {
    timestamps: true
});

module.exports = mongoose.model('Alumni', alumniSchema);