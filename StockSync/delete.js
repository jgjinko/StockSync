const fs = require('fs');
const path = require('path');

const srcDir = 'c:\\Users\\User\\Documents\\AI4Devs Holberton\\StockSync\\StockSync\\src';

const filesToDelete = ['App.jsx', 'main.jsx', 'App.css', 'index.css'];

filesToDelete.forEach(file => {
  const filePath = path.join(srcDir, file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${file}`);
    } catch (err) {
      console.error(`Error deleting ${file}:`, err.message);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});
