/**
 * ==================================================================================
 * ENTERPRISE DATABASE SERVICE LAYER (ES MODULES)
 * Project: SJU Alumni Portal
 * ==================================================================================
 * Description: An advanced, highly robust wrapper around the mysql2/promise pool.
 * Features include auto-reconnection, detailed query execution logging, performance 
 * tracking, transaction management, and connection pool health monitoring.
 * ==================================================================================
 */

import mysql from 'mysql2/promise';
import { performance } from 'perf_hooks';
import EventEmitter from 'events';

// ==================================================================================
// 1. MYSQL ERROR DICTIONARY
// ==================================================================================
/**
 * Maps common MySQL error codes to readable application errors.
 * Useful for standardizing error responses sent to the frontend.
 */
const MYSQL_ERRORS = {
    ER_DUP_ENTRY: 'A record with this unique identifier already exists.',
    ER_NO_REFERENCED_ROW_2: 'A referenced foreign key record does not exist.',
    ER_ROW_IS_REFERENCED_2: 'Cannot delete this record because it is referenced elsewhere.',
    ER_DATA_TOO_LONG: 'The provided data exceeds the maximum length for a column.',
    ER_BAD_NULL_ERROR: 'A required field was left empty (NULL).',
    ER_PARSE_ERROR: 'There is a syntax error in the SQL query.',
    ER_ACCESS_DENIED_ERROR: 'Database access denied. Check your credentials.',
    ER_CON_COUNT_ERROR: 'Too many active database connections.',
    ECONNREFUSED: 'Could not connect to the database server. Is MySQL running?'
};

// ==================================================================================
// 2. CONFIGURATION OBJECT
// ==================================================================================
/**
 * Comprehensive configuration for the MySQL Pool.
 * Optimized for handling concurrent connections for the 20,000-row directory.
 */
const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sju_alumni_portal',
    
    // Connection limits and timeouts
    waitForConnections: true,
    connectionLimit: 20,         // Increased for better concurrent handling
    maxIdle: 10,                 // Max idle connections to keep in the pool
    idleTimeout: 60000,          // Time (ms) before an idle connection is closed
    queueLimit: 0,               // 0 means unlimited queueing for connections
    connectTimeout: 10000,       // 10 seconds to establish a connection
    
    // Formatting and features
    multipleStatements: false,   // Set to false to prevent SQL injection via stacked queries
    namedPlaceholders: true,     // Allows using :name instead of ? for params
    timezone: '+05:30',          // Set to IST (Indian Standard Time)
    charset: 'utf8mb4',          // Full unicode support for text and emojis
    
    // Security and Performance
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : null
};

// ==================================================================================
// 3. DATABASE MANAGER CLASS
// ==================================================================================
/**
 * DatabaseManager
 * Implements a Singleton pattern to ensure only one connection pool exists.
 * Extends EventEmitter to allow the main server to listen for DB events.
 */
class DatabaseManager extends EventEmitter {
    constructor() {
        super();
        this.pool = null;
        this.isInitialized = false;
        this._initializePool();
    }

    /**
     * Initializes the connection pool and attaches event listeners for monitoring.
     * @private
     */
    _initializePool() {
        try {
            this.pool = mysql.createPool(DB_CONFIG);
            this._attachPoolEvents();
            this.isInitialized = true;
            console.log(`[DB SYSTEM] MySQL Pool initialized for database: ${DB_CONFIG.database}`);
        } catch (error) {
            console.error(`[DB SYSTEM ERROR] Failed to initialize pool: ${error.message}`);
            process.exit(1);
        }
    }

    /**
     * Attaches lifecycle event listeners to the pool for deep diagnostics.
     * @private
     */
    _attachPoolEvents() {
        // Triggered when a new connection is created
        this.pool.on('connection', (connection) => {
            this.emit('connection_created', connection.threadId);
            // Optionally set session variables here
            connection.query('SET SESSION sql_mode = "STRICT_ALL_TABLES"');
        });

        // Triggered when a connection is acquired from the pool
        this.pool.on('acquire', (connection) => {
            this.emit('connection_acquired', connection.threadId);
        });

        // Triggered when a connection is returned to the pool
        this.pool.on('release', (connection) => {
            this.emit('connection_released', connection.threadId);
        });

        // Triggered when a callback has been queued to wait for an available connection
        this.pool.on('enqueue', () => {
            console.warn('[DB SYSTEM WARNING] Connection pool is at capacity. Query queued.');
            this.emit('connection_queued');
        });
    }

    /**
     * Tests the database connection immediately upon startup.
     * @returns {Promise<boolean>} True if connected, false otherwise.
     */
    async testConnection() {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [rows] = await connection.query('SELECT 1 as val');
            if (rows && rows[0].val === 1) {
                console.log('[DB SYSTEM] Connection test successful. Database is ready.');
                return true;
            }
            return false;
        } catch (error) {
            const friendlyMsg = MYSQL_ERRORS[error.code] || error.message;
            console.error(`[DB SYSTEM CRITICAL] Connection test failed: ${friendlyMsg}`);
            return false;
        } finally {
            if (connection) connection.release();
        }
    }

    // ==============================================================================
    // 4. CORE QUERY EXECUTION METHODS
    // ==============================================================================

    /**
     * Executes a standard SQL query with performance tracking and error handling.
     * @param {string} sql - The SQL query to execute.
     * @param {Array|Object} [params] - The parameters to bind to the query.
     * @returns {Promise<any>} The result of the query.
     */
    async query(sql, params = []) {
        const start = performance.now();
        try {
            const [results, fields] = await this.pool.query(sql, params);
            this._logQueryPerformance(sql, start);
            return results;
        } catch (error) {
            this._handleQueryError(error, sql, params);
            throw error; // Re-throw to be handled by the specific route
        }
    }

    /**
     * Executes a prepared statement (optimized for repeated execution).
     * @param {string} sql - The SQL query to execute.
     * @param {Array|Object} [params] - The parameters to bind.
     * @returns {Promise<any>} The result of the execution.
     */
    async execute(sql, params = []) {
        const start = performance.now();
        try {
            const [results, fields] = await this.pool.execute(sql, params);
            this._logQueryPerformance(sql, start);
            return results;
        } catch (error) {
            this._handleQueryError(error, sql, params);
            throw error;
        }
    }

    /**
     * Logs the execution time of a query. Warns if a query is too slow.
     * @param {string} sql - The executed SQL.
     * @param {number} startTime - The performance.now() start time.
     * @private
     */
    _logQueryPerformance(sql, startTime) {
        const duration = (performance.now() - startTime).toFixed(2);
        // Only log the first 100 chars of the query to keep logs clean
        const shortSql = sql.length > 100 ? sql.substring(0, 100) + '...' : sql;
        
        if (duration > 500) {
            console.warn(`[DB PERFORMANCE] SLOW QUERY (${duration}ms): ${shortSql}`);
        } else if (process.env.LOG_QUERIES === 'true') {
            console.log(`[DB QUERY] Executed in ${duration}ms: ${shortSql}`);
        }
    }

    /**
     * Centralized error handler for database queries.
     * @param {Error} error - The caught error object.
     * @param {string} sql - The query that caused the error.
     * @param {any} params - The parameters passed.
     * @private
     */
    _handleQueryError(error, sql, params) {
        const friendlyMsg = MYSQL_ERRORS[error.code] || 'An unknown database error occurred.';
        console.error(`\n[DB ERROR THROWN]`);
        console.error(`Code: ${error.code}`);
        console.error(`Message: ${friendlyMsg}`);
        console.error(`SQL: ${sql}`);
        console.error(`Params: ${JSON.stringify(params).substring(0, 200)}\n`);
    }

    // ==============================================================================
    // 5. TRANSACTION MANAGEMENT
    // ==============================================================================

    /**
     * Executes a series of database operations within an isolated transaction.
     * If any operation fails, the entire transaction is automatically rolled back.
     * * @param {Function} callback - An async function containing the DB operations. 
     * It receives a connected 'connection' object.
     * @returns {Promise<any>} The result of the callback.
     */
    async runTransaction(callback) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            await connection.beginTransaction();

            // Execute the provided logic, passing the specific connection
            const result = await callback(connection);

            await connection.commit();
            console.log('[DB TRANSACTION] Commit successful.');
            return result;

        } catch (error) {
            if (connection) {
                await connection.rollback();
                console.warn('[DB TRANSACTION] Rolled back due to error:', error.message);
            }
            throw error;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    // ==============================================================================
    // 6. CRUD UTILITY METHODS (ORM-Lite)
    // ==============================================================================
    // These methods save you from writing boilerplate SQL in your controllers.

    /**
     * Finds a single record by a specific field.
     * @param {string} table - Table name.
     * @param {string} field - Column name to search.
     * @param {any} value - Value to match.
     * @returns {Promise<Object|null>} The database row, or null if not found.
     */
    async findOne(table, field, value) {
        const sql = `SELECT * FROM ?? WHERE ?? = ? LIMIT 1`;
        const results = await this.query(sql, [table, field, value]);
        return results.length > 0 ? results[0] : null;
    }

    /**
     * Finds all records matching given conditions.
     * @param {string} table - Table name.
     * @param {Object} conditions - Key-value pairs of conditions (e.g., { status: 'approved' })
     * @returns {Promise<Array>} Array of matching rows.
     */
    async findMany(table, conditions = {}) {
        let sql = `SELECT * FROM ??`;
        const params = [table];
        const keys = Object.keys(conditions);

        if (keys.length > 0) {
            const whereClause = keys.map(k => `?? = ?`).join(' AND ');
            sql += ` WHERE ${whereClause}`;
            keys.forEach(k => {
                params.push(k, conditions[k]);
            });
        }

        return await this.query(sql, params);
    }

    /**
     * Safely inserts a new record into a table.
     * @param {string} table - Table name.
     * @param {Object} data - Key-value pairs representing column names and values.
     * @returns {Promise<number|string>} The Insert ID (if auto-increment) or true.
     */
    async insert(table, data) {
        const sql = `INSERT INTO ?? SET ?`;
        const result = await this.query(sql, [table, data]);
        return result.insertId || result.affectedRows;
    }

    /**
     * Updates an existing record dynamically.
     * @param {string} table - Table name.
     * @param {Object} data - Columns and values to update.
     * @param {string} identifierField - The column used to identify the row (e.g., 'register_number').
     * @param {any} identifierValue - The value of the identifier.
     * @returns {Promise<number>} Number of affected rows.
     */
    async update(table, data, identifierField, identifierValue) {
        const sql = `UPDATE ?? SET ? WHERE ?? = ?`;
        const result = await this.query(sql, [table, data, identifierField, identifierValue]);
        return result.affectedRows;
    }

    /**
     * Deletes a record from a table.
     * @param {string} table - Table name.
     * @param {string} field - Column name to match.
     * @param {any} value - Value to match.
     * @returns {Promise<number>} Number of affected rows.
     */
    async delete(table, field, value) {
        const sql = `DELETE FROM ?? WHERE ?? = ?`;
        const result = await this.query(sql, [table, field, value]);
        return result.affectedRows;
    }

    // ==============================================================================
    // 7. SYSTEM HEALTH & DIAGNOSTICS
    // ==============================================================================

    /**
     * Retrieves current statistics about the connection pool.
     * Highly useful for creating an Admin Server Status Dashboard.
     * @returns {Object} Pool statistics.
     */
    getPoolStatus() {
        if (!this.pool) return { status: 'offline' };
        
        // Internal pool metrics provided by mysql2
        const poolMetrics = this.pool.pool; 
        
        return {
            status: 'online',
            totalConnections: poolMetrics._allConnections.length,
            freeConnections: poolMetrics._freeConnections.length,
            queuedRequests: poolMetrics._connectionQueue.length,
            configLimit: DB_CONFIG.connectionLimit
        };
    }

    /**
     * Gracefully shuts down the connection pool.
     * Should be called during process termination (SIGINT/SIGTERM).
     * @returns {Promise<void>}
     */
    async close() {
        if (this.pool) {
            console.log('[DB SYSTEM] Closing all database connections...');
            await this.pool.end();
            console.log('[DB SYSTEM] Database pool closed cleanly.');
            this.isInitialized = false;
        }
    }
}

// ==================================================================================
// 8. INSTANTIATION & EXPORT
// ==================================================================================

// Create a singleton instance of the DatabaseManager
const dbManager = new DatabaseManager();

// Automatically run the connection test when this file is imported
dbManager.testConnection();

// Handle Node.js process termination to safely close database connections
process.on('SIGINT', async () => {
    console.log('\n[SERVER STOP] Received SIGINT (Ctrl+C). Shutting down gracefully.');
    await dbManager.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n[SERVER STOP] Received SIGTERM. Shutting down gracefully.');
    await dbManager.close();
    process.exit(0);
});

/**
 * Exporting the core functionality.
 * By exporting `dbManager`, you get access to `.query()`, `.runTransaction()`, 
 * and the CRUD helpers directly in your route files.
 * * Example Usage in server.js:
 * import db from './config/db.js';
 * const alumni = await db.findOne('alumni_data', 'register_number', '232MCS0001');
 */
export default dbManager;