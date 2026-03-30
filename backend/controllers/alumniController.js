const Alumni = require('../models/Alumni');
const PendingRegistration = require('../models/PendingRegistration');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const CSV_FILE_PATH = path.join(__dirname, '../../SJU_ALUMNI.csv');

// ============================================================
// HELPER: Build a clean alumni record from CSV row
// ============================================================
const buildAlumniFromCSVRow = (data) => ({
    registerNumber: data['Register number'].trim(),
    fullName: (data['Full Name'] || '').trim(),
    fathersName: (data['Father\u2019s Name'] || data["Father's Name"] || '').trim(),
    mothersName: (data['Mother\u2019s Name'] || data["Mother's Name"] || '').trim(),
    email: (data['Email'] || '').trim(),
    phoneNumber: (data['Phone Number'] || '').trim(),
    dateOfBirth: data['Date Of Birth'] ? new Date(data['Date Of Birth']) : null,
    gender: (data['Gender'] || '').trim(),
    aadhar: (data['Aadhar'] || '').trim(),
    batchYear: data['Batch Year'] ? parseInt(data['Batch Year']) : null,
    degree: (data['Degree'] || '').trim(),
    currentStatus: (data['Current Status'] || '').trim(),
    companyName: (data['Company Name'] || '').trim(),
    designation: (data['Designation'] || '').trim(),
    pgCollege: (data['PG College'] || '').trim(),
    skills: (data['Skills'] || '').trim(),
    reviews: (data['Reviews'] || '').trim(),
    linkedInProfile: (data['LinkedIn Profile'] || '').trim(),
    age: data['Age'] ? parseInt(data['Age']) : null,
    username: (data['Username'] || '').trim(),
    password: (data['Password'] || '').trim(),
});

// ============================================================
// IMPORT CSV → MongoDB  (SAFE: uses upsert, NEVER wipes data)
// ============================================================
const importCSVToDB = async (req, res) => {
    if (!fs.existsSync(CSV_FILE_PATH)) {
        return res.status(404).json({ error: 'CSV file not found on server. Upload is required first.' });
    }

    try {
        const results = [];

        fs.createReadStream(CSV_FILE_PATH)
            .pipe(csv({
                mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '')
            }))
            .on('data', (data) => {
                if (!data['Register number'] || data['Register number'].trim() === '') return;
                results.push(buildAlumniFromCSVRow(data));
            })
            .on('end', async () => {
                try {
                    if (results.length === 0) {
                        return res.status(400).json({
                            error: 'No valid records found in CSV. Existing alumni data was NOT modified.'
                        });
                    }

                    // ✅ SAFE: bulkWrite with upsert — never deletes existing alumni
                    const ops = results.map(record => ({
                        updateOne: {
                            filter: { registerNumber: record.registerNumber },
                            update: { $set: record },
                            upsert: true
                        }
                    }));

                    const result = await Alumni.bulkWrite(ops, { ordered: false });

                    res.status(200).json({
                        message: 'CSV Data synchronized successfully',
                        upserted: result.upsertedCount,
                        modified: result.modifiedCount,
                        total: results.length
                    });
                } catch (err) {
                    console.error('[IMPORT] bulkWrite error:', err.message);
                    res.status(500).json({ error: 'Failed to sync data into DB', details: err.message });
                }
            })
            .on('error', (streamErr) => {
                console.error('[IMPORT] Stream error:', streamErr.message);
                res.status(500).json({ error: 'CSV stream error', details: streamErr.message });
            });
    } catch (error) {
        console.error('[IMPORT] Outer error:', error.message);
        res.status(500).json({ error: 'Failed to read CSV file', details: error.message });
    }
};

// ============================================================
// ADD a single new Alumni record
// ============================================================
const addAlumni = async (req, res) => {
    try {
        const alumniData = req.body;

        // 1. Save to MongoDB
        const newAlumni = new Alumni(alumniData);
        await newAlumni.save();

        // 2. Append to CSV as backup
        const csvWriter = createCsvWriter({
            path: CSV_FILE_PATH,
            header: [
                { id: 'registerNumber', title: 'Register number' },
                { id: 'fullName', title: 'Full Name' },
                { id: 'fathersName', title: "Father's Name" },
                { id: 'mothersName', title: "Mother's Name" },
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

        const recordToAppend = { ...alumniData };
        if (recordToAppend.dateOfBirth) {
            recordToAppend.dateOfBirth = new Date(recordToAppend.dateOfBirth).toISOString().split('T')[0];
        }

        try {
            await csvWriter.writeRecords([recordToAppend]);
        } catch (csvError) {
            // CSV append failure should not fail the whole request
            console.warn('[ADD] CSV append failed:', csvError.message);
        }

        res.status(201).json({ message: 'Alumni added to database', data: newAlumni });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Register number already exists' });
        }
        res.status(500).json({ error: 'Failed to add alumni', details: error.message });
    }
};

// ============================================================
// GET all approved Alumni  (main directory feed)
// ============================================================
const getAllAlumni = async (req, res) => {
    try {
        const alumni = await Alumni.find({}).lean();
        res.status(200).json(alumni);
    } catch (error) {
        console.error('[GET_ALL] Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch alumni', details: error.message });
    }
};

// ============================================================
// GET stats (used by Admin Dashboard)
// ============================================================
const getStats = async (req, res) => {
    try {
        const [totalAlumni, pendingCount, degrees, batchYears] = await Promise.all([
            Alumni.countDocuments(),
            PendingRegistration.countDocuments({ status: 'PENDING' }),
            Alumni.distinct('degree'),
            Alumni.distinct('batchYear')
        ]);

        res.status(200).json({
            totalAlumni,
            pendingCount,
            degreesRepresented: degrees.filter(Boolean).length,
            batchYears: batchYears.filter(Boolean).length
        });
    } catch (error) {
        console.error('[STATS] Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
    }
};

// ============================================================
// PENDING REGISTRATION: Submit
// ============================================================
const submitRegistration = async (req, res) => {
    try {
        const data = { ...req.body };

        // Sanitize critical fields
        if (data.registerNumber) data.registerNumber = data.registerNumber.trim();
        if (data.username) data.username = data.username.trim();
        if (data.email) data.email = data.email.trim().toLowerCase();

        // Prevent duplicate pending submissions or already-approved alumni
        const [existingPending, existingAlumni] = await Promise.all([
            PendingRegistration.findOne({ registerNumber: data.registerNumber }),
            Alumni.findOne({ registerNumber: data.registerNumber })
        ]);

        if (existingAlumni) {
            return res.status(400).json({
                error: 'Already registered',
                detail: 'An approved alumni exists with this register number.'
            });
        }

        if (existingPending) {
            return res.status(400).json({
                error: 'Already in queue',
                detail: 'A pending verification request already exists for this register number.'
            });
        }

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

// ============================================================
// PENDING REGISTRATION: Get all pending
// ============================================================
const getPendingQueue = async (req, res) => {
    try {
        const queue = await PendingRegistration.find({ status: 'PENDING' }).sort({ createdAt: -1 }).lean();
        res.status(200).json(queue);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending queue', details: error.message });
    }
};

// ============================================================
// PENDING REGISTRATION: Approve → move to Alumni collection
// ============================================================
const approveRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const pendingUser = await PendingRegistration.findById(id);

        if (!pendingUser) {
            return res.status(404).json({ error: 'Registration not found' });
        }

        // Build clean alumni object from pending record
        const alumniData = pendingUser.toObject();
        delete alumniData._id;
        delete alumniData.status;
        delete alumniData.createdAt;
        delete alumniData.updatedAt;
        delete alumniData.__v;

        // Fix: PendingRegistration stores skills as [String], Alumni wants String
        if (Array.isArray(alumniData.skills)) {
            alumniData.skills = alumniData.skills.join(', ');
        }

        // Determine credentials
        const genPassword = () =>
            Math.random().toString(36).substring(2, 10).toUpperCase() +
            Math.random().toString(36).substring(2, 6).toUpperCase();

        let finalUsername = (req.body.username || alumniData.registerNumber || '').toString().trim();
        let finalPassword = req.body.password ? req.body.password.toString().trim() : null;

        // Check if alumni already exists (re-approval scenario)
        const existingAlumni = await Alumni.findOne({ registerNumber: alumniData.registerNumber });

        if (!finalPassword) {
            if (existingAlumni && existingAlumni.password && existingAlumni.password.trim() !== '') {
                finalPassword = existingAlumni.password;
                finalUsername = existingAlumni.username || finalUsername;
            } else {
                finalPassword = genPassword();
            }
        }

        // Upsert into Alumni collection
        const savedAlumni = await Alumni.findOneAndUpdate(
            { registerNumber: alumniData.registerNumber },
            { $set: { ...alumniData, username: finalUsername, password: finalPassword } },
            { upsert: true, new: true, runValidators: false }
        );

        // Append to CSV as backup (errors here are non-fatal)
        try {
            if (fs.existsSync(CSV_FILE_PATH)) {
                const csvWriter = createCsvWriter({
                    path: CSV_FILE_PATH,
                    header: [
                        { id: 'registerNumber', title: 'Register number' },
                        { id: 'fullName', title: 'Full Name' },
                        { id: 'fathersName', title: "Father's Name" },
                        { id: 'mothersName', title: "Mother's Name" },
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

                const recordToAppend = {
                    ...alumniData,
                    username: finalUsername,
                    password: finalPassword
                };
                if (recordToAppend.dateOfBirth) {
                    recordToAppend.dateOfBirth = new Date(recordToAppend.dateOfBirth).toISOString().split('T')[0];
                }
                await csvWriter.writeRecords([recordToAppend]);
            }
        } catch (csvError) {
            console.warn('[APPROVE] CSV append failed (non-fatal):', csvError.message);
        }

        // Remove from pending queue
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
        console.error('[APPROVE] Error:', error.message);
        res.status(500).json({ error: 'Approval failed', details: error.message });
    }
};

// ============================================================
// PENDING REGISTRATION: Reject
// ============================================================
const rejectRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const pending = await PendingRegistration.findById(id);
        if (!pending) {
            return res.status(404).json({ error: 'Registration not found' });
        }
        await PendingRegistration.findByIdAndDelete(id);
        res.status(200).json({ message: 'Registration rejected and deleted from queue' });
    } catch (error) {
        res.status(500).json({ error: 'Rejection failed', details: error.message });
    }
};

// ============================================================
// AUTH: Login endpoint
// ============================================================
const login = async (req, res) => {
    try {
        const identifier = (req.body.identifier || '').toString().trim();
        const password = (req.body.password || '').toString().trim();

        console.log(`[AUTH] Login attempt: ID="${identifier}" (len:${identifier.length}), PassLen:${password.length}`);

        // 1. Check Admin credentials from env
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

        // 2. Find user by registerNumber or username (case-insensitive & whitespace-tolerant)
        const escapedId = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const user = await Alumni.findOne({
            $or: [
                { registerNumber: { $regex: new RegExp(`^\\s*${escapedId}\\s*$`, 'i') } },
                { username: { $regex: new RegExp(`^\\s*${escapedId}\\s*$`, 'i') } }
            ]
        });

        if (!user) {
            console.warn(`[AUTH] User not found: "${identifier}"`);
            return res.status(401).json({
                error: 'User Not Found',
                detail: `No account exists for "${identifier}". Please check your Register Number or Username.`
            });
        }

        let dbPass = (user.password || '').toString().trim();

        // Fallback: if password was accidentally stored in username field
        if (!dbPass && user.username && user.username.trim().length > 6) {
            dbPass = user.username.toString().trim();
        }

        if (dbPass !== password) {
            const dbHex = Buffer.from(dbPass).toString('hex');
            const inputHex = Buffer.from(password).toString('hex');
            console.warn(`[AUTH] Password mismatch for "${identifier}".`);
            console.warn(`[AUTH] DB_Hex:    ${dbHex}`);
            console.warn(`[AUTH] Input_Hex: ${inputHex}`);
            return res.status(401).json({
                error: 'Incorrect Password',
                detail: 'The password provided does not match. Please verify for hidden spaces or caps lock.'
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
        console.error('[AUTH] Error:', error.message);
        res.status(500).json({ error: 'Authentication service offline.' });
    }
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
    importCSVToDB,
    addAlumni,
    getAllAlumni,
    getStats,
    submitRegistration,
    getPendingQueue,
    approveRegistration,
    rejectRegistration,
    login
};
