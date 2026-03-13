const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const CSV_FILE_PATH = path.join(__dirname, '../SJU_ALUMNI.csv');

let count = 0;
fs.createReadStream(CSV_FILE_PATH)
    .pipe(csv({
        mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '')
    }))
    .on('data', (data) => {
        if (!data['Register number'] || data['Register number'].trim() === '') return;
        
        if (count < 1) {
            console.log("Headers:", Object.keys(data));
            console.log("First row registerNumber:", data['Register number']);
        }
        count++;
    })
    .on('end', () => {
        console.log(`Total valid rows processed: ${count}`);
    });
