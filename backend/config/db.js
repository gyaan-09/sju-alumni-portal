const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('❌ MONGO_URI is not set in environment variables. Retrying in 10s...');
        setTimeout(connectDB, 10000);
        return;
    }

    try {
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000, // 10 second timeout
        });
        console.log(`\n✅ Connected to MongoDB Atlas Cloud!`);
        console.log(`📡 Cluster Node: ${conn.connection.host}`);
        
        // List collections in the database
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name).join(', ');
        console.log(`📂 Attached Database Collections: [${collectionNames || 'None yet'}]`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        console.log('🔁 Retrying MongoDB connection in 5 seconds...');
        setTimeout(connectDB, 5000); // Retry instead of crashing the server
    }
};

module.exports = connectDB;