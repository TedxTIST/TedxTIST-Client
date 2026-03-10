import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 1. Create __dirname FIRST
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. THEN use it to load your .env file
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const teamNames = [
  "Ealiyas Shaji", "John Savio Romy", "Anirudh K", "Anjali Biju", 
  "Sanjana Vijay", "Christene Sara John", "Mary Ann", "Gayathri J S", 
  "Cyrus Babu", "Aadhil Kassim", "Aakash Rajeev", "Leanne George", 
  "Joyel Sebastian", "Ganga Gireesh", "Sruthika", "Devi Anjana", 
  "Aswin Philip Raju", "Calvin Binu", "Ram Uday", "Abhishek Sivadasan", 
  "Eldho G Blayil", "Vignesh Nair"
];

const customAliases = {
  "shruthika": "Sruthika",
  "sanjana": "Sanjana Vijay",
  "vighnesh": "Vignesh Nair",
  "Mary": "Mary Ann",
  "John Savio": "John Savio Romy",
};

const normalizeString = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

const FOLDER_ID = process.env.GDRIVE_FOLDER_ID || '';
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const TARGET_DIR = path.join(__dirname, '..', 'public', 'team');

async function downloadImages() {
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  const credentialsJson = process.env.GDRIVE_CREDENTIALS_JSON;
  if (!credentialsJson) {
    throw new Error('GDRIVE_CREDENTIALS_JSON is not set in the environment.');
  }
  
  // Parse the JSON string from your .env file
  const credentials = JSON.parse(credentialsJson);
  
  // Pass the parsed object directly using the 'credentials' property
  const auth = new google.auth.GoogleAuth({
    credentials, 
    scopes: SCOPES,
  });
  
  const drive = google.drive({ version: 'v3', auth });

  try {
    console.log('Fetching file list from Google Drive...');
    const res = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType)',
    });

    const files = res.data.files;
    
    if (!files || files.length === 0) {
      console.log('No files found in the Google Drive folder.');
      return;
    }

    for (const file of files) {
      if (!file.mimeType.startsWith('image/')) continue;

      const driveFileName = normalizeString(file.name);
      let matchedName = null;

      // 1. Check our custom aliases
      for (const [alias, realName] of Object.entries(customAliases)) {
        if (driveFileName.includes(normalizeString(alias))) {
          matchedName = realName;
          break;
        }
      }

      // 2. Check the official team names
      if (!matchedName) {
        matchedName = teamNames.find(teamName => {
          return driveFileName.includes(normalizeString(teamName));
        });
      }

      if (matchedName) {
        const ext = path.extname(file.name).toLowerCase() || '.jpg'; 
        const destinationPath = path.join(TARGET_DIR, `${matchedName}${ext}`);
        
        // --- Check if file already exists ---
        if (fs.existsSync(destinationPath)) {
          console.log(`⏭️  Skipped: "${matchedName}${ext}" already exists.`);
          continue; 
        }

        console.log(`✅ Match found: "${file.name}" -> ${matchedName}`);
        const dest = fs.createWriteStream(destinationPath);

        const response = await drive.files.get(
          { fileId: file.id, alt: 'media' },
          { responseType: 'stream' }
        );

        response.data
          .on('end', () => {
             console.log(`   Saved as: ${matchedName}${ext}`);
             if (ext === '.heic' || ext === '.heif') {
                 console.log(`   ⚠️ WARNING: Web browsers cannot display ${ext} files! Please convert to .jpg in Drive.`);
             }
          })
          .on('error', err => console.error('Error downloading file:', err))
          .pipe(dest);
          
      } else {
        console.log(`❌ No match found for Drive file: "${file.name}"`);
      }
    }
  } catch (error) {
    console.error('Error accessing Google Drive:', error);
  }
}

downloadImages();