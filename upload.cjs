const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');

// Ensure this file is in the 'scripts' folder with this script
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const collectionName = "alumni_data"; 
const csvFilePath = "SJU_ALUMNI.csv"; 

async function uploadData() {
  const results = [];
  console.log("Reading CSV file...");

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`Found ${results.length} records. Starting chunked upload...`);
      
      // Firestore batch limit is 500. We will use chunks of 400 for safety.
      const chunkSize = 400; 
      for (let i = 0; i < results.length; i += chunkSize) {
        const chunk = results.slice(i, i + chunkSize);
        const batch = db.batch();

        chunk.forEach((row, index) => {
          // Using a unique ID based on the loop index + current chunk
          const docId = row.RegistrationNumber || row.RegNo || `alumni_${i + index}`;
          const docRef = db.collection(collectionName).doc(docId);
          batch.set(docRef, row);
        });

        try {
          await batch.commit();
          console.log(`Progress: ${Math.min(i + chunkSize, results.length)} / ${results.length} records uploaded.`);
        } catch (error) {
          console.error(`Batch starting at ${i} failed:`, error.message);
        }
      }

      console.log(`\nSuccess! All ${results.length} SJU Alumni records are now in Firebase.`);
    });
}

uploadData();