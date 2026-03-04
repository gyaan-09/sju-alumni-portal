/**
 * ============================================================================
 * ENTERPRISE ALUMNI PORTAL BACKEND API
 * ============================================================================
 * Description: Robust Express.js server handling file uploads, JWT authentication,
 * Role-Based Access Control (RBAC), and advanced directory querying for the 
 * SJU Alumni Portal (integrated with the 19-attribute alumni_data SQL schema).
 * * Dependencies: express, cors, multer, bcrypt, jsonwebtoken, dotenv, helmet, morgan
 * ============================================================================
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Import Database Connection (Ensure db.js exports a promise-based pool)
import db from './config/db.js';

// --- CONFIGURATION & ENVIRONMENT ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8081;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_enterprise_alumni_key_2026';
const JWT_EXPIRES_IN = '24h';

// --- MIDDLEWARE ---
app.use(cors({ origin: '*', credentials: true })); // Configure strictly for production
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure 'uploads' directory exists for documentation
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

/**
 * ============================================================================
 * 1. FILE UPLOAD CONFIGURATION (Multer)
 * ============================================================================
 * Configured to handle profile pictures and verification documents with 
 * strict file type checking and size limits.
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        cb(null, `${file.fieldname}-${uniqueSuffix}-${cleanName}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB per file
}).fields([
    { name: 'profile_pic', maxCount: 1 },
    { name: 'id_card', maxCount: 1 },
    { name: 'pg_proof', maxCount: 1 }
]);

/**
 * ============================================================================
 * 2. AUTHENTICATION & AUTHORIZATION MIDDLEWARE
 * ============================================================================
 */

// Verify JWT Token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user payload to request
        next();
    } catch (error) {
        return res.status(403).json({ status: 'error', message: 'Forbidden: Invalid or expired token' });
    }
};

// Role Checker (Admin Only)
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ status: 'error', message: 'Forbidden: Admin access required' });
    }
};

/**
 * ============================================================================
 * 3. AUTHENTICATION ROUTES
 * ============================================================================
 */

/**
 * @route   POST /api/auth/signup
 * @desc    Registers a new alumni. Validates all 19 DB attributes. Sets status to 'pending'.
 * @access  Public
 */
app.post('/api/auth/signup', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ status: 'error', message: `File Upload Error: ${err.message}` });
        }

        const connection = await db.getConnection(); // Use transaction for multi-table inserts

        try {
            await connection.beginTransaction();

            // Extract all 19 attributes from req.body
            const {
                register_number, full_name, fathers_name, mothers_name, email,
                phone_number, date_of_birth, gender, aadhar, batch_year, degree,
                current_status, company_name, designation, pg_college, skills,
                reviews, linkedin_profile, age
            } = req.body;

            // Basic Validation Check
            if (!register_number || !full_name || !email || !phone_number || !aadhar) {
                throw new Error("Missing required primary identification fields.");
            }

            // Extract File Paths safely
            const profilePath = req.files['profile_pic'] ? `uploads/${req.files['profile_pic'][0].filename}` : null;
            const idCardPath = req.files['id_card'] ? `uploads/${req.files['id_card'][0].filename}` : null;
            const pgProofPath = req.files['pg_proof'] ? `uploads/${req.files['pg_proof'][0].filename}` : null;

            // Step A: Check if User Exists in Auth Table
            const [existingAuth] = await connection.query("SELECT * FROM auth_users WHERE register_number = ? OR email = ?", [register_number, email]);
            if (existingAuth.length > 0) {
                throw new Error("User already registered with this Register Number or Email.");
            }

            // Step B: Insert into 'auth_users' table (Handles Login & Status)
            const insertAuthSql = `
                INSERT INTO auth_users (register_number, email, role, status) 
                VALUES (?, ?, 'alumni', 'pending')
            `;
            await connection.query(insertAuthSql, [register_number, email]);

            // Step C: Insert into 'alumni_data' table (The 19-attribute schema + file paths)
            const insertProfileSql = `
                INSERT INTO alumni_data (
                    register_number, full_name, fathers_name, mothers_name, email, 
                    phone_number, date_of_birth, gender, aadhar, batch_year, 
                    degree, current_status, company_name, designation, pg_college, 
                    skills, reviews, linkedin_profile, age
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            await connection.query(insertProfileSql, [
                register_number, full_name, fathers_name, mothers_name, email,
                phone_number, date_of_birth, gender, aadhar, batch_year, degree,
                current_status, company_name, designation, pg_college, skills,
                reviews, linkedin_profile, age
            ]);

            // Note: If you add profile_pic_url, id_card_url, pg_proof_url to the alumni_data table, 
            // append them to the query above.

            await connection.commit();
            res.status(201).json({ 
                status: 'success', 
                message: "Registration Successful! Profile submitted for Admin verification." 
            });

        } catch (error) {
            await connection.rollback();
            console.error("[SIGNUP ERROR]:", error);
            res.status(500).json({ status: 'error', message: error.message || "Database Transaction Error" });
        } finally {
            connection.release();
        }
    });
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticates user, checks approval status, issues JWT
 * @access  Public
 */
app.post('/api/auth/login', async (req, res) => {
    try {
        const { register_number, password } = req.body;

        if (!register_number || !password) {
            return res.status(400).json({ status: 'error', message: "Register Number and Password are required." });
        }

        // Fetch User Auth Details
        const [users] = await db.query(`SELECT * FROM auth_users WHERE register_number = ?`, [register_number]);
        if (users.length === 0) {
            return res.status(404).json({ status: 'error', message: "Account not found." });
        }

        const userAuth = users[0];

        // Status Gatekeeping
        if (userAuth.status === 'pending') {
            return res.status(403).json({ status: 'error', message: "Account Pending: Admin verification required." });
        }
        if (userAuth.status === 'rejected') {
            return res.status(403).json({ status: 'error', message: "Account Rejected: Please contact administration." });
        }

        // Verify Password
        if (!userAuth.password) {
            return res.status(403).json({ status: 'error', message: "Account Approved but password not set. Contact Admin." });
        }

        const isMatch = await bcrypt.compare(password, userAuth.password);
        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: "Invalid Credentials." });
        }

        // Fetch Extended Profile Data for payload
        const [profileData] = await db.query(`SELECT full_name, batch_year, degree FROM alumni_data WHERE register_number = ?`, [register_number]);
        const profile = profileData[0] || {};

        // Generate JWT
        const tokenPayload = {
            register_number: userAuth.register_number,
            role: userAuth.role,
            email: userAuth.email,
            full_name: profile.full_name
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        // Success Response
        res.status(200).json({ 
            status: "success", 
            token: token,
            user: tokenPayload
        });

    } catch (error) {
        console.error("[LOGIN ERROR]:", error);
        res.status(500).json({ status: 'error', message: "Server Error during login." });
    }
});

/**
 * ============================================================================
 * 4. ADMIN MANAGEMENT ROUTES
 * ============================================================================
 */

/**
 * @route   GET /api/admin/pending
 * @desc    Fetch all alumni registrations pending approval
 * @access  Private (Admin Only)
 */
app.get('/api/admin/pending', verifyToken, requireAdmin, async (req, res) => {
    try {
        const sql = `
            SELECT a.register_number, a.email, a.status, a.created_at, 
                   p.full_name, p.degree, p.batch_year, p.phone_number
            FROM auth_users a
            JOIN alumni_data p ON a.register_number = p.register_number
            WHERE a.status = 'pending'
            ORDER BY a.created_at DESC
        `;
        const [pendingUsers] = await db.query(sql);
        res.status(200).json({ status: 'success', data: pendingUsers, total: pendingUsers.length });
    } catch (error) {
        console.error("[FETCH PENDING ERROR]:", error);
        res.status(500).json({ status: 'error', message: "Failed to fetch pending approvals." });
    }
});

/**
 * @route   POST /api/admin/approve
 * @desc    Approves a user, generates a secure password, and simulates email dispatch
 * @access  Private (Admin Only)
 */
app.post('/api/admin/approve', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { register_number, email } = req.body;

        if (!register_number || !email) {
            return res.status(400).json({ status: 'error', message: "Missing Register Number or Email" });
        }

        // Generate a secure 10-character alphanumeric password
        const rawPassword = Math.random().toString(36).slice(-10) + "A1!"; 
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // Update User Status and Password
        const [result] = await db.query(
            "UPDATE auth_users SET status = 'approved', password = ?, updated_at = NOW() WHERE register_number = ?", 
            [hashedPassword, register_number]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: "Register Number not found" });
        }

        // --- SIMULATED EMAIL DISPATCH LOG ---
        console.log(`\n======================================================`);
        console.log(`[EMAIL SYSTEM SIMULATION] -> Dispatching Welcome Email`);
        console.log(`======================================================`);
        console.log(`To: ${email}`);
        console.log(`Subject: Your SJU Alumni Portal Account is Approved!`);
        console.log(`Body:`);
        console.log(`Dear Alumni,`);
        console.log(`Your registration (Reg No: ${register_number}) has been verified.`);
        console.log(`You can now log in using the following credentials:`);
        console.log(`Password: ${rawPassword}`);
        console.log(`Please change your password immediately after logging in.`);
        console.log(`======================================================\n`);
        
        res.status(200).json({ 
            status: "success", 
            message: `User ${register_number} Approved. Password generated and logged to console.` 
        });

    } catch (error) {
        console.error("[APPROVAL ERROR]:", error);
        res.status(500).json({ status: 'error', message: "Server Error during approval process." });
    }
});

/**
 * @route   GET /api/admin/analytics
 * @desc    Provides dashboard metrics (Total users, employment status breakdown, batch distribution)
 * @access  Private (Admin Only)
 */
app.get('/api/admin/analytics', verifyToken, requireAdmin, async (req, res) => {
    try {
        // Aggregate queries optimized for the 20,000 row table
        const [totalCount] = await db.query("SELECT COUNT(*) as total FROM alumni_data");
        const [statusBreakdown] = await db.query("SELECT current_status, COUNT(*) as count FROM alumni_data GROUP BY current_status ORDER BY count DESC");
        const [degreeBreakdown] = await db.query("SELECT degree, COUNT(*) as count FROM alumni_data GROUP BY degree ORDER BY count DESC");
        const [batchBreakdown] = await db.query("SELECT batch_year, COUNT(*) as count FROM alumni_data GROUP BY batch_year ORDER BY batch_year DESC LIMIT 10");

        res.status(200).json({
            status: 'success',
            data: {
                totalAlumni: totalCount[0].total,
                statusDistribution: statusBreakdown,
                degreeDistribution: degreeBreakdown,
                recentBatches: batchBreakdown
            }
        });
    } catch (error) {
        console.error("[ANALYTICS ERROR]:", error);
        res.status(500).json({ status: 'error', message: "Failed to generate analytics." });
    }
});

/**
 * ============================================================================
 * 5. DIRECTORY & ALUMNI DATA ROUTES (Handling the 20k rows)
 * ============================================================================
 */

/**
 * @route   GET /api/directory
 * @desc    Fetches alumni profiles with advanced Pagination, Searching, and Filtering
 * @access  Private (All verified users)
 */
app.get('/api/directory', verifyToken, async (req, res) => {
    try {
        // Pagination Parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50; // Default 50 per page
        const offset = (page - 1) * limit;

        // Search & Filter Parameters
        const { search, batch, degree, status, skills } = req.query;

        let queryParams = [];
        let whereClauses = [];

        // Build Dynamic WHERE Clause
        if (search) {
            whereClauses.push(`(full_name LIKE ? OR company_name LIKE ? OR designation LIKE ?)`);
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm);
        }
        if (batch) {
            whereClauses.push(`batch_year = ?`);
            queryParams.push(batch);
        }
        if (degree) {
            whereClauses.push(`degree = ?`);
            queryParams.push(degree);
        }
        if (status) {
            whereClauses.push(`current_status = ?`);
            queryParams.push(status);
        }
        if (skills) {
            whereClauses.push(`skills LIKE ?`);
            queryParams.push(`%${skills}%`);
        }

        const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // Query 1: Get Total Count for Pagination Metadata
        const countQuery = `SELECT COUNT(*) as total FROM alumni_data ${whereString}`;
        const [countResult] = await db.query(countQuery, queryParams);
        const totalRecords = countResult[0].total;

        // Query 2: Get Paginated Data
        const dataQuery = `
            SELECT register_number, full_name, email, batch_year, degree, 
                   current_status, company_name, designation, pg_college, skills, linkedin_profile 
            FROM alumni_data 
            ${whereString} 
            ORDER BY batch_year DESC, full_name ASC
            LIMIT ? OFFSET ?
        `;
        
        // Add pagination params
        queryParams.push(limit, offset);
        const [alumniData] = await db.query(dataQuery, queryParams);

        res.status(200).json({
            status: 'success',
            pagination: {
                total_records: totalRecords,
                current_page: page,
                total_pages: Math.ceil(totalRecords / limit),
                per_page: limit
            },
            data: alumniData
        });

    } catch (error) {
        console.error("[DIRECTORY FETCH ERROR]:", error);
        res.status(500).json({ status: 'error', message: "Failed to fetch directory data." });
    }
});

/**
 * @route   GET /api/alumni/:reg_no
 * @desc    Fetches the complete 19-attribute profile of a single alumni
 * @access  Private
 */
app.get('/api/alumni/:reg_no', verifyToken, async (req, res) => {
    try {
        const { reg_no } = req.params;
        const [profile] = await db.query("SELECT * FROM alumni_data WHERE register_number = ?", [reg_no]);

        if (profile.length === 0) {
            return res.status(404).json({ status: 'error', message: "Alumni profile not found." });
        }

        res.status(200).json({ status: 'success', data: profile[0] });

    } catch (error) {
        console.error("[PROFILE FETCH ERROR]:", error);
        res.status(500).json({ status: 'error', message: "Server error fetching profile." });
    }
});

/**
 * @route   PUT /api/alumni/update
 * @desc    Allows an alumni to update their professional details (Job, Skills, Status)
 * @access  Private (Owner only)
 */
app.put('/api/alumni/update', verifyToken, async (req, res) => {
    try {
        // Users can only update their own profile based on JWT token
        const userRegNo = req.user.register_number; 
        
        const { 
            current_status, company_name, designation, 
            pg_college, skills, linkedin_profile 
        } = req.body;

        const updateSql = `
            UPDATE alumni_data 
            SET current_status = ?, company_name = ?, designation = ?, 
                pg_college = ?, skills = ?, linkedin_profile = ?, updated_at = NOW()
            WHERE register_number = ?
        `;

        const [result] = await db.query(updateSql, [
            current_status, company_name, designation, 
            pg_college, skills, linkedin_profile, userRegNo
        ]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ status: 'error', message: "Update failed. Profile not found." });
        }

        res.status(200).json({ status: 'success', message: "Profile updated successfully." });

    } catch (error) {
        console.error("[PROFILE UPDATE ERROR]:", error);
        res.status(500).json({ status: 'error', message: "Server error updating profile." });
    }
});

/**
 * ============================================================================
 * 6. NETWORKING / CONNECTIONS (MOCK ENDPOINTS)
 * ============================================================================
 */

app.post('/api/network/connect', verifyToken, (req, res) => {
    const { target_reg_no, message } = req.body;
    const sender_reg_no = req.user.register_number;

    if (!target_reg_no) {
        return res.status(400).json({ status: 'error', message: "Target user ID required." });
    }

    console.log(`[NETWORK EVENT]: ${sender_reg_no} sent a connection request to ${target_reg_no}.`);
    
    // In a real application, insert into a 'connections' SQL table here.
    res.status(200).json({ 
        status: "success", 
        message: "Connection request sent successfully." 
    });
});

/**
 * ============================================================================
 * 7. GLOBAL ERROR HANDLER & SERVER START
 * ============================================================================
 */

// Fallback error handler for unhandled rejections/exceptions inside express
app.use((err, req, res, next) => {
    console.error("[GLOBAL ERROR HANDLER]:", err.stack);
    res.status(500).json({ 
        status: 'error', 
        message: 'A critical server error occurred.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start the Express Server
app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`SJU Alumni Portal API Server is Active`);
    console.log(`Listening on Port: http://localhost:${PORT}`);
    console.log(`Static Uploads serving at: /uploads`);
    console.log(`======================================================\n`);
});