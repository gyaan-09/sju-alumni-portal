const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`\n✅ Connected to MongoDB Atlas Cloud!`);
        console.log(`📡 Cluster Node: ${conn.connection.host}`);
        
        // List collections in the database
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name).join(', ');
        console.log(`📂 Attached Database Collections: [${collectionNames || 'None yet'}]`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;