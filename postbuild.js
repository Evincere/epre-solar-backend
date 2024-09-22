const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'dist', 'google-sheets');
const sourceFile = path.join(__dirname, 'src', 'google-sheets', 'credentials.json');
const targetFile = path.join(targetDir, 'credentials.json');

const srcPath = path.join(__dirname, 'src/google-sheets/credentials.json');
const destPath = path.join(__dirname, 'dist/google-sheets/credentials.json');

if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log('Credentials copied successfully.');
} else {
    console.log('No credentials.json file found. Skipping copy.');
}
/* // Crear el directorio si no existe
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copiar el archivo
fs.copyFileSync(sourceFile, targetFile);
 */
console.log('Credentials file copied successfully.');
