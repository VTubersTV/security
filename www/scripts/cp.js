import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths for source and destination directories
const contentDir = path.join(__dirname, '../src/content/advisories');
const advisoriesDir = path.join(__dirname, "..", "..", "advisories");

// Files that should not be copied
const FILES_TO_SKIP = [
    'README.md',
    'EXAMPLE-GHSA-XXXX-XXXX-XXXX.md'
];

// Get list of advisory files
const advisories = fs.readdirSync(advisoriesDir)
    .filter(file => !FILES_TO_SKIP.includes(file));

// Ensure destination directory exists
if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
}

// Copy each advisory file to the destination directory
advisories.forEach(file => {
    const sourcePath = path.join(advisoriesDir, file);
    const destinationPath = path.join(contentDir, file);
    fs.copyFileSync(sourcePath, destinationPath);
});

console.log(`Copied ${advisories.length} advisories to ${contentDir}`);