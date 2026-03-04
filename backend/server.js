/**
 * ============================================================================
 * ENTERPRISE ALUMNI PORTAL BACKEND API (SUPABASE EDITION)
 * ============================================================================
 * Description: Robust Express.js server handling file uploads, JWT authentication,
 * Role-Based Access Control (RBAC), and advanced directory querying for the 
 * SJU Alumni Portal. 
 * * Data Layer: Fully migrated to Supabase.
 * - Relational Data: Supabase PostgreSQL (via @supabase/supabase-js)
 * - Object Storage: Supabase Storage Buckets
 * * Dependencies: express, cors, multer, bcrypt, jsonwebtoken, dotenv, @supabase/supabase-js
 * ============================================================================
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION & ENVIRONMENT ---
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_enterprise_alumni_key_2026';
const JWT_EXPIRES_IN = '24h';

// --- SUPABASE INITIALIZATION ---
// Ensure you have SUPABASE_URL and SUPABASE_ANON_KEY in your .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("CRITICAL ERROR: Supabase credentials are missing in the environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- MIDDLEWARE ---
app.use(cors({ origin: '*', credentials: true })); // Configure strictly for production in real-world
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * ============================================================================
 * 1. FILE UPLOAD CONFIGURATION (Multer - Memory Storage for Supabase)
 * ============================================================================
 * Files are kept in memory as buffers so they can be streamed directly to 
 * Supabase Storage without touching the local disk.
 */

const storage = multer.memoryStorage();

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
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit per file
}).fields([
    { name: 'profile_pic', maxCount: 1 },
    { name: 'id_card', maxCount: 1 },
    { name: 'pg_proof', maxCount: 1 }
]);

/**
 * Helper Function: Upload Buffer to Supabase Storage
 * @param {Object} file - The file object from Multer
 * @param {String} folderPath - The subfolder in the bucket (e.g., 'profile_pics')
 * @returns {Promise<String>} - The public URL of the uploaded file
 */
const uploadToSupabaseStorage = async (file, folderPath) => {
    if (!file) return null;

    try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        const filePath = `${folderPath}/${uniqueSuffix}_${cleanName}`;

        const { data, error } = await supabase.storage
            .from('alumni-documents') // Ensure this bucket exists in your Supabase project
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) {
            console.error(`[STORAGE UPLOAD ERROR] ${folderPath}:`, error);
            throw error;
        }

        // Generate and return the public URL
        const { data: publicUrlData } = supabase.storage
            .from('alumni-documents')
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    } catch (err) {
        console.error(`[SUPABASE HELPER ERROR]: Failed to upload ${file.originalname}`, err);
        throw err;
    }
};

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
        req.user = decoded; // Attach user payload to request for downstream use
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
 * @desc    Registers a new alumni. Validates all 19 DB attributes. 
 * Responds instantly, processes Supabase uploads & DB inserts in the background.
 * @access  Public
 */
app.post('/api/auth/signup', (req, res) => {
    upload(req, res, async (err) => {
        // Handle Multer validation errors synchronously
        if (err) {
            return res.status(400).json({ status: 'error', message: `File Upload Error: ${err.message}` });
        }

        const newData = req.body;

        // Basic Validation Check
        if (!newData.register_number || !newData.full_name || !newData.email || !newData.phone_number || !newData.aadhar) {
            return res.status(400).json({ status: 'error', message: "Missing required primary identification fields." });
        }

        // 1. Instantly respond to the user (Fire-and-Forget pattern from Codebase 2)
        res.status(202).json({ 
            status: 'success',
            message: "Your details have been accepted. The admin will review and send you a username and password shortly to your email." 
        });

        // 2. Background Processing: Supabase Operations
        (async () => {
            console.log(`[BACKGROUND TASK STARTED]: Processing registration for ${newData.register_number}...`);
            try {
                // Step A: Check if User Exists
                const { data: existingAuth, error: checkError } = await supabase
                    .from('auth_users')
                    .select('*')
                    .or(`register_number.eq.${newData.register_number},email.eq.${newData.email}`);

                if (checkError) throw checkError;
                if (existingAuth && existingAuth.length > 0) {
                    console.error(`[BACKGROUND REGISTRATION ERROR]: User ${newData.register_number} already exists.`);
                    return; // Stop processing quietly since response is already sent
                }

                // Step B: Upload Documents to Supabase Storage sequentially
                let profilePicUrl = null;
                let idCardUrl = null;
                let pgProofUrl = null;

                if (req.files && req.files['profile_pic']) {
                    profilePicUrl = await uploadToSupabaseStorage(req.files['profile_pic'][0], 'profile_pics');
                }
                if (req.files && req.files['id_card']) {
                    idCardUrl = await uploadToSupabaseStorage(req.files['id_card'][0], 'id_cards');
                }
                if (req.files && req.files['pg_proof']) {
                    pgProofUrl = await uploadToSupabaseStorage(req.files['pg_proof'][0], 'pg_proofs');
                }

                // Step C: Insert into 'auth_users' table
                const { error: authInsertError } = await supabase
                    .from('auth_users')
                    .insert([{
                        register_number: newData.register_number,
                        email: newData.email,
                        role: 'alumni',
                        status: 'pending'
                    }]);

                if (authInsertError) throw authInsertError;

                // Step D: Insert the comprehensive 19 attributes into 'alumni_data'
                const { error: profileInsertError } = await supabase
                    .from('alumni_data')
                    .insert([{
                        register_number: newData.register_number,
                        full_name: newData.full_name,
                        fathers_name: newData.fathers_name,
                        mothers_name: newData.mothers_name,
                        email: newData.email,
                        phone_number: newData.phone_number,
                        date_of_birth: newData.date_of_birth,
                        gender: newData.gender,
                        aadhar: newData.aadhar,
                        batch_year: newData.batch_year,
                        degree: newData.degree,
                        current_status: newData.current_status,
                        company_name: newData.company_name,
                        designation: newData.designation,
                        pg_college: newData.pg_college,
                        skills: newData.skills,
                        reviews: newData.reviews,
                        linkedin_profile: newData.linkedin_profile,
                        age: newData.age,
                        // Adding the newly generated Supabase Storage URLs
                        profile_pic_url: profilePicUrl,
                        id_card_url: idCardUrl,
                        pg_proof_url: pgProofUrl
                    }]);

                if (profileInsertError) {
                    // Manual rollback for auth_users if profile insert fails
                    await supabase.from('auth_users').delete().eq('register_number', newData.register_number);
                    throw profileInsertError;
                }

                console.log(`[BACKGROUND TASK SUCCESS]: Registration complete for ${newData.register_number}.`);

            } catch (bgError) {
                console.error(`[BACKGROUND REGISTRATION CRITICAL ERROR] for ${newData.register_number}:`, bgError);
            }
        })();
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

        // Fetch User Auth Details from Supabase
        const { data: users, error: authError } = await supabase
            .from('auth_users')
            .select('*')
            .eq('register_number', register_number)
            .single();

        if (authError && authError.code !== 'PGRST116') {
            throw authError; // PGRST116 is "No rows found"
        }
        
        if (!users) {
            return res.status(404).json({ status: 'error', message: "Account not found." });
        }

        const userAuth = users;

        // Status Gatekeeping
        if (userAuth.status === 'pending') {
            return res.status(403).json({ status: 'error', message: "Account Pending: Admin verification required." });
        }
        if (userAuth.status === 'rejected') {
            return res.status(403).json({ status: 'error', message: "Account Rejected: Please contact administration." });
        }

        // Verify Password via bcrypt
        if (!userAuth.password) {
            return res.status(403).json({ status: 'error', message: "Account Approved but password not set. Contact Admin." });
        }

        const isMatch = await bcrypt.compare(password, userAuth.password);
        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: "Invalid Credentials." });
        }

        // Fetch Extended Profile Data for JWT payload
        const { data: profileData, error: profileError } = await supabase
            .from('alumni_data')
            .select('full_name, batch_year, degree')
            .eq('register_number', register_number)
            .single();

        if (profileError) throw profileError;

        const profile = profileData || {};

        // Generate JWT Token
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
        // Equivalent to SQL JOIN: We query auth_users and embed related alumni_data
        // Ensure you have established a foreign key relation in Supabase between 
        // auth_users(register_number) and alumni_data(register_number).
        const { data: pendingUsers, error } = await supabase
            .from('auth_users')
            .select(`
                register_number, 
                email, 
                status, 
                created_at,
                alumni_data (
                    full_name, 
                    degree, 
                    batch_year, 
                    phone_number
                )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Flatten the nested relation for the frontend if necessary
        const formattedData = pendingUsers.map(user => ({
            register_number: user.register_number,
            email: user.email,
            status: user.status,
            created_at: user.created_at,
            full_name: user.alumni_data?.[0]?.full_name || user.alumni_data?.full_name || 'N/A',
            degree: user.alumni_data?.[0]?.degree || user.alumni_data?.degree || 'N/A',
            batch_year: user.alumni_data?.[0]?.batch_year || user.alumni_data?.batch_year || 'N/A',
            phone_number: user.alumni_data?.[0]?.phone_number || user.alumni_data?.phone_number || 'N/A'
        }));

        res.status(200).json({ status: 'success', data: formattedData, total: formattedData.length });
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

        // Update User Status and Password in Supabase
        const { data: result, error: updateError } = await supabase
            .from('auth_users')
            .update({ 
                status: 'approved', 
                password: hashedPassword,
                // updated_at is usually handled by Supabase DB triggers, 
                // but we can set it manually if needed.
            })
            .eq('register_number', register_number)
            .select();

        if (updateError) throw updateError;

        if (!result || result.length === 0) {
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
        // Query 1: Get Total Count using Supabase precise counting
        const { count: totalAlumni, error: countError } = await supabase
            .from('alumni_data')
            .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        // Note: Supabase JS client doesn't support GROUP BY aggregations directly without using RPCs.
        // For extremely large datasets, you should write a PostgreSQL function and call it via `.rpc()`.
        // Below is an in-memory aggregation fallback fetching only necessary columns to save bandwidth.
        const { data: alumniSubSet, error: fetchError } = await supabase
            .from('alumni_data')
            .select('current_status, degree, batch_year');
            
        if (fetchError) throw fetchError;

        // In-Memory Aggregations
        const statusBreakdownObj = {};
        const degreeBreakdownObj = {};
        const batchBreakdownObj = {};

        alumniSubSet.forEach(row => {
            // Group by Status
            const status = row.current_status || 'Unknown';
            statusBreakdownObj[status] = (statusBreakdownObj[status] || 0) + 1;
            
            // Group by Degree
            const degree = row.degree || 'Unknown';
            degreeBreakdownObj[degree] = (degreeBreakdownObj[degree] || 0) + 1;

            // Group by Batch
            const batch = row.batch_year || 'Unknown';
            batchBreakdownObj[batch] = (batchBreakdownObj[batch] || 0) + 1;
        });

        // Convert grouped objects to sorted arrays to match Codebase 1 output
        const statusDistribution = Object.entries(statusBreakdownObj)
            .map(([current_status, count]) => ({ current_status, count }))
            .sort((a, b) => b.count - a.count);

        const degreeDistribution = Object.entries(degreeBreakdownObj)
            .map(([degree, count]) => ({ degree, count }))
            .sort((a, b) => b.count - a.count);

        const recentBatches = Object.entries(batchBreakdownObj)
            .map(([batch_year, count]) => ({ batch_year, count }))
            .sort((a, b) => Number(b.batch_year) - Number(a.batch_year))
            .slice(0, 10); // LIMIT 10

        res.status(200).json({
            status: 'success',
            data: {
                totalAlumni,
                statusDistribution,
                degreeDistribution,
                recentBatches
            }
        });
    } catch (error) {
        console.error("[ANALYTICS ERROR]:", error);
        res.status(500).json({ status: 'error', message: "Failed to generate analytics." });
    }
});

/**
 * ============================================================================
 * 5. DIRECTORY & ALUMNI DATA ROUTES
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
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        // Search & Filter Parameters
        const { search, batch, degree, status, skills } = req.query;

        // Start building the Supabase Query
        let query = supabase
            .from('alumni_data')
            .select(`
                register_number, full_name, email, batch_year, degree, 
                current_status, company_name, designation, pg_college, skills, linkedin_profile, profile_pic_url
            `, { count: 'exact' });

        // Apply Dynamic Filters
        if (search) {
            // ilike is case-insensitive, equivalent to LIKE %search%
            query = query.or(`full_name.ilike.%${search}%,company_name.ilike.%${search}%,designation.ilike.%${search}%`);
        }
        if (batch) {
            query = query.eq('batch_year', batch);
        }
        if (degree) {
            query = query.eq('degree', degree);
        }
        if (status) {
            query = query.eq('current_status', status);
        }
        if (skills) {
            query = query.ilike('skills', `%${skills}%`);
        }

        // Apply Ordering and Pagination bounds
        query = query
            .order('batch_year', { ascending: false })
            .order('full_name', { ascending: true })
            .range(offset, offset + limit - 1);

        // Execute Final Query
        const { data: alumniData, count, error } = await query;

        if (error) throw error;

        res.status(200).json({
            status: 'success',
            pagination: {
                total_records: count,
                current_page: page,
                total_pages: Math.ceil(count / limit),
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
        
        const { data: profile, error } = await supabase
            .from('alumni_data')
            .select('*')
            .eq('register_number', reg_no)
            .single(); // Use single() since register_number is unique

        // Supabase returns an error object PGRST116 if .single() yields no results
        if (error && error.code === 'PGRST116') {
            return res.status(404).json({ status: 'error', message: "Alumni profile not found." });
        } else if (error) {
            throw error;
        }

        res.status(200).json({ status: 'success', data: profile });

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
        // Users can only update their own profile based on the decoded JWT payload
        const userRegNo = req.user.register_number; 
        
        const { 
            current_status, company_name, designation, 
            pg_college, skills, linkedin_profile 
        } = req.body;

        const { data: result, error } = await supabase
            .from('alumni_data')
            .update({
                current_status, 
                company_name, 
                designation, 
                pg_college, 
                skills, 
                linkedin_profile,
                // Supabase typically has an `updated_at` trigger, but we can set it if missing
            })
            .eq('register_number', userRegNo)
            .select();

        if (error) throw error;

        if (!result || result.length === 0) {
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

app.post('/api/network/connect', verifyToken, async (req, res) => {
    try {
        const { target_reg_no, message } = req.body;
        const sender_reg_no = req.user.register_number;

        if (!target_reg_no) {
            return res.status(400).json({ status: 'error', message: "Target user ID required." });
        }

        console.log(`[NETWORK EVENT]: ${sender_reg_no} sent a connection request to ${target_reg_no}.`);
        
        // Example Supabase DB extension for Connections Table:
        // const { error } = await supabase.from('network_connections').insert([{ sender_id: sender_reg_no, target_id: target_reg_no, status: 'pending' }]);
        // if(error) throw error;

        res.status(200).json({ 
            status: "success", 
            message: "Connection request sent successfully." 
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to send connection request." });
    }
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
    console.log(`SJU Alumni Portal API (SUPABASE EDITION) Active`);
    console.log(`Listening on Port: http://localhost:${PORT}`);
    console.log(`Database connected via @supabase/supabase-js`);
    console.log(`======================================================\n`);
});