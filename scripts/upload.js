import admin from 'firebase-admin';
import fs from 'fs';
import csv from 'csv-parser';
import { getFirestore } from 'firebase-admin/firestore';

const jsonPath = new URL('./serviceAccountKey.json', import.meta.url);
const rawData = fs.readFileSync(jsonPath, 'utf8');

// FIX: Check if JSON is empty before parsing
if (!rawData || rawData.trim() === "") {
  throw new Error("ERROR: serviceAccountKey.json is empty. Please paste your Firebase key into it.");
}

const serviceAccount = JSON.parse(rawData);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

// FIX: Use your explicit 'ainp' database name
const db = getFirestore(admin.app(), 'ainp'); 
const collectionName = 'alumni_data'; 
const csvFilePath = './scripts/SJU_ALUMNI.csv';

// ... (uploadData function logic as provided earlier) ...

async function uploadData() {
  console.log('--- Starting upload to "ainp" Firestore ---');
  const batchArray = [];
  let batch = db.batch();
  let count = 0;

  if (!fs.existsSync(csvFilePath)) {
    console.error(`ERROR: CSV file not found at ${csvFilePath}`);
    return;
  }

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      const docRef = db.collection(collectionName).doc(); 
      batch.set(docRef, row);
      count++;

      if (count % 490 === 0) {
        batchArray.push(batch);
        batch = db.batch();
      }
    })
    .on('end', async () => {
      if (count % 490 !== 0) batchArray.push(batch);

      console.log(`Parsed ${count} records. Committing to Firestore...`);

      try {
        for (const b of batchArray) {
          await b.commit();
        }
        console.log('UPLOAD SUCCESSFUL! Your ainp database is populated.');
      } catch (error) {
        console.error('Firestore Commit Error:', error);
      }
    });
}

uploadData();