const Alumni = require('../models/Alumni');
const PendingRegistration = require('../models/PendingRegistration');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const CSV_FILE_PATH = path.join(__dirname, '../../SJU_ALUMNI.csv');

// Import CSV data into MongoDB
const importCSVToDB = async (req, res) => {
    try {
        const results = [];
        fs.createReadStream(CSV_FILE_PATH)
            .pipe(csv({
                mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '')
            }))
            .on('data', (data) => {
                if (!data['Register number'] || data['Register number'].trim() === '') return; // Skip empty rows

                // Map CSV fields to schema fields
                results.push({
                    registerNumber: data['Register number'].trim(),
                    fullName: data['Full Name'],
                    fathersName: data['Father’s Name'],
                    mothersName: data['Mother’s Name'],
                    email: data['Email'],
                    phoneNumber: data['Phone Number'],
                    dateOfBirth: data['Date Of Birth'] ? new Date(data['Date Of Birth']) : null,
                    gender: data['Gender'],
                    aadhar: data['Aadhar'],
                    batchYear: data['Batch Year'] ? parseInt(data['Batch Year']) : null,
                    degree: data['Degree'],
                    currentStatus: data['Current Status'],
                    companyName: data['Company Name'],
                    designation: data['Designation'],
                    pgCollege: data['PG College'],
                    skills: data['Skills'],
                    reviews: data['Reviews'],
                    linkedInProfile: data['LinkedIn Profile'],
                    age: data['Age'] ? parseInt(data['Age']) : null,
                    username: data['Username'],
                    password: data['Password']
                });
            })
            .on('end', async () => {
                try {
                    // Clear existing data (optional, remove if you want to keep existing)
                    await Alumni.deleteMany({});
                    
                    // Bulk insert
                    await Alumni.insertMany(results);
                    res.status(200).json({ message: 'CSV Data imported successfully', count: results.length });
                } catch (err) {
                    res.status(500).json({ error: 'Failed to insert data into DB', details: err.message });
                }
            });
    } catch (error) {
        res.status(500).json({ error: 'Failed to read CSV file' });
    }
};

// Add new Alumni to MongoDB and append to CSV
const addAlumni = async (req, res) => {
    try {
        const alumniData = req.body;
        
        // 1. Save to MongoDB
        const newAlumni = new Alumni(alumniData);
        await newAlumni.save();

        // 2. Append to CSV
        // Map database fields back to CSV headers
        const csvWriter = createCsvWriter({
            path: CSV_FILE_PATH,
            header: [
                { id: 'registerNumber', title: 'Register number' },
                { id: 'fullName', title: 'Full Name' },
                { id: 'fathersName', title: 'Father’s Name' },
                { id: 'mothersName', title: 'Mother’s Name' },
                { id: 'email', title: 'Email' },
                { id: 'phoneNumber', title: 'Phone Number' },
                { id: 'dateOfBirth', title: 'Date Of Birth' },
                { id: 'gender', title: 'Gender' },
                { id: 'aadhar', title: 'Aadhar' },
                { id: 'batchYear', title: 'Batch Year' },
                { id: 'degree', title: 'Degree' },
                { id: 'currentStatus', title: 'Current Status' },
                { id: 'companyName', title: 'Company Name' },
                { id: 'designation', title: 'Designation' },
                { id: 'pgCollege', title: 'PG College' },
                { id: 'skills', title: 'Skills' },
                { id: 'reviews', title: 'Reviews' },
                { id: 'linkedInProfile', title: 'LinkedIn Profile' },
                { id: 'age', title: 'Age' },
                { id: 'username', title: 'Username' },
                { id: 'password', title: 'Password' }
            ],
            append: true
        });

        // Format dates correctly for CSV
        const recordToAppend = { ...alumniData };
        if (recordToAppend.dateOfBirth) {
            recordToAppend.dateOfBirth = new Date(recordToAppend.dateOfBirth).toISOString().split('T')[0];
        }

        await csvWriter.writeRecords([recordToAppend]);

        res.status(201).json({ message: 'Alumni added to database and CSV file', data: newAlumni });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Register number already exists' });
        }
        res.status(500).json({ error: 'Failed to add alumni', details: error.message });
    }
};

// Get all Alumni
const getAllAlumni = async (req, res) => {
    try {
        const alumni = await Alumni.find();
        res.status(200).json(alumni);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch alumni' });
    }
};

// --- PENDING REGISTRATION LOGIC ---

// 1. Submit a new registration to the pending queue
const submitRegistration = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.registerNumber) data.registerNumber = data.registerNumber.trim();
        if (data.username) data.username = data.username.trim();
        if (data.email) data.email = data.email.trim();
        
        const newPending = new PendingRegistration({ ...data, status: 'PENDING' });
        await newPending.save();
        res.status(201).json({ message: 'Registration submitted to verification queue', data: newPending });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Register number already exists in queue or directory' });
        }
        res.status(500).json({ error: 'Failed to submit registration', details: error.message });
    }
};

// 2. Get all pending registrations for Admin Dashboard
const getPendingQueue = async (req, res) => {
    try {
        const queue = await PendingRegistration.find({ status: 'PENDING' }).sort({ createdAt: -1 });
        res.status(200).json(queue);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending queue' });
    }
};

// 3. Approve a registration
const approveRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const pendingUser = await PendingRegistration.findById(id);
        
        if (!pendingUser) {
            return res.status(404).json({ error: 'Registration not found' });
        }

        // Move to main Alumni collection
        const alumniData = pendingUser.toObject();
        delete alumniData._id; // Remove pending ID
        delete alumniData.status; 
        delete alumniData.createdAt;
        delete alumniData.updatedAt;
         // Fix Mongoose Schema Mismatch: Alumni strictly wants String, Pending stores [String]
        if (Array.isArray(alumniData.skills)) {
             alumniData.skills = alumniData.skills.join(', ');
        }
        
        // Check if already exists in main Alumni collection
        const existingAlumni = await Alumni.findOne({ registerNumber: alumniData.registerNumber });

        // Logic for credentials:
        // 1. If the frontend provided a specific username/password, USE THEM (they were generated/reviewed by admin).
        // 2. Otherwise, check if user already existed and had a password.
        // 3. Fallback to registerNumber as username and a new random password.
        
        const genPassword = () => Math.random().toString(36).substring(2, 10).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

        let finalUsername = (req.body.username || alumniData.registerNumber || "").toString().trim();
        let finalPassword = req.body.password ? req.body.password.toString().trim() : null;

        if (!finalPassword) {
            if (existingAlumni && existingAlumni.password && existingAlumni.password.trim() !== '') {
                finalPassword = existingAlumni.password;
                finalUsername = existingAlumni.username || finalUsername;
            } else {
                finalPassword = genPassword();
            }
        }

        const savedAlumni = await Alumni.findOneAndUpdate(
            { registerNumber: alumniData.registerNumber },
            { $set: { ...alumniData, username: finalUsername, password: finalPassword } },
            { upsert: true, new: true, runValidators: false }
        );

        // Append to CSV for backup
        const csvWriter = createCsvWriter({
            path: CSV_FILE_PATH,
            header: [
                { id: 'registerNumber', title: 'Register number' },
                { id: 'fullName', title: 'Full Name' },
                { id: 'fathersName', title: 'Father\'s Name' },
                { id: 'mothersName', title: 'Mother\'s Name' },
                { id: 'email', title: 'Email' },
                { id: 'phoneNumber', title: 'Phone Number' },
                { id: 'dateOfBirth', title: 'Date Of Birth' },
                { id: 'gender', title: 'Gender' },
                { id: 'aadhar', title: 'Aadhar' },
                { id: 'batchYear', title: 'Batch Year' },
                { id: 'degree', title: 'Degree' },
                { id: 'currentStatus', title: 'Current Status' },
                { id: 'companyName', title: 'Company Name' },
                { id: 'designation', title: 'Designation' },
                { id: 'pgCollege', title: 'PG College' },
                { id: 'skills', title: 'Skills' },
                { id: 'linkedInProfile', title: 'LinkedIn Profile' },
                { id: 'age', title: 'Age' },
                { id: 'username', title: 'Username' },
                { id: 'password', title: 'Password' }
            ],
            append: true
        });

        const recordToAppend = { ...alumniData, username: finalUsername, password: finalPassword };
        if (recordToAppend.dateOfBirth) {
            recordToAppend.dateOfBirth = new Date(recordToAppend.dateOfBirth).toISOString().split('T')[0];
        }
        await csvWriter.writeRecords([recordToAppend]);

        // Delete from pending queue
        await PendingRegistration.findByIdAndDelete(id);

        res.status(200).json({ 
            message: 'Registration approved and added to directory', 
            user: { 
                ...savedAlumni.toObject(),
                username: finalUsername, 
                password: finalPassword
            } 
        });
    } catch (error) {
        res.status(500).json({ error: 'Approval failed', details: error.message });
    }
};

// 4. Reject and delete a registration
const rejectRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        await PendingRegistration.findByIdAndDelete(id);
        res.status(200).json({ message: 'Registration rejected and deleted from queue' });
    } catch (error) {
        res.status(500).json({ error: 'Rejection failed', details: error.message });
    }
};

// 5. Authenticaton Endpoint
const login = async (req, res) => {
    try {
        const identifier = (req.body.identifier || "").toString().trim();
        const password = (req.body.password || "").toString().trim();

        console.log(`[AUTH] Login attempt: ID="${identifier}" (len:${identifier.length}), PassLen:${password.length}`);

        // 1. Check for Admin Credentials
        if (process.env.ADMIN_ID && process.env.ADMIN_PASSWORD) {
            if (identifier === process.env.ADMIN_ID && password === process.env.ADMIN_PASSWORD) {
                console.log(`[AUTH] Admin login success: "${identifier}"`);
                return res.status(200).json({
                    id: 'admin_session',
                    role: 'admin',
                    name: 'System Administrator',
                    reg_no: identifier
                });
            }
        }

        // 2. Find user by registerNumber or username (Case-insensitive & Whitespace-tolerant)
        const user = await Alumni.findOne({ 
            $or: [
                { registerNumber: { $regex: new RegExp(`^\\s*${identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i') } }, 
                { username: { $regex: new RegExp(`^\\s*${identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i') } }
            ]
        });

        if (!user) {
            console.warn(`[AUTH] User not found: "${identifier}"`);
            return res.status(401).json({ 
                error: 'User Not Found', 
                detail: `No account exists for "${identifier}". Please ensure your Register Number or Username is correct.`
            });
        }

        let dbPass = (user.password || "").toString().trim();
        // Fallback: If DB failed to save password previously, it was saved into the username field
        if (!dbPass && user.username && user.username.trim().length > 6) {
            dbPass = user.username.toString().trim();
        }

        if (dbPass !== password) {
            // Hex logging to detect invisible characters (like zero-width spaces)
            const dbHex = Buffer.from(dbPass).toString('hex');
            const inputHex = Buffer.from(password).toString('hex');
            console.warn(`[AUTH] Password mismatch for "${identifier}".`);
            console.warn(`[AUTH] DB_Hex:    ${dbHex}`);
            console.warn(`[AUTH] Input_Hex: ${inputHex}`);
            return res.status(401).json({ 
                error: 'Incorrect Password', 
                detail: 'The password provided does not match our records. Please verify for hidden spaces or caps lock.' 
            });
        }

        console.log(`[AUTH] Login success: "${identifier}"`);

        res.status(200).json({
            id: user._id,
            role: 'alumni',
            name: user.fullName,
            reg_no: user.registerNumber
        });
    } catch (error) {
        res.status(500).json({ error: 'Authentication service offline.' });
    }
};

// Final exports
module.exports = {
    importCSVToDB,
    addAlumni,
    getAllAlumni,
    submitRegistration,
    getPendingQueue,
    approveRegistration,
    rejectRegistration,
    login
};
