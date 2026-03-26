const mongoose = require('mongoose');

const pendingRegistrationSchema = new mongoose.Schema({
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
    pgCollegeProofUrl: { type: String },
    skills: { type: [String] }, 
    workingSince: { type: String },
    description: { type: String },
    achievements: { type: String },
    linkedInProfile: { type: String },
    age: { type: Number },
    // Frontend specific
    profilePhotoUrl: { type: String },
    idProofUrl: { type: String },
    sjuIdProofUrl: { type: String },
    status: { type: String, default: 'PENDING' }
}, {
    timestamps: true
});

module.exports = mongoose.model('PendingRegistration', pendingRegistrationSchema);
