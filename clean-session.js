const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning WhatsApp session...');

const authPath = path.join(__dirname, '.wwebjs_auth');
const cachePath = path.join(__dirname, '.wwebjs_cache');

// Remove auth folder
if (fs.existsSync(authPath)) {
  fs.rmSync(authPath, { recursive: true, force: true });
  console.log('✅ Removed .wwebjs_auth folder');
} else {
  console.log('ℹ️  .wwebjs_auth folder not found');
}

// Remove cache folder
if (fs.existsSync(cachePath)) {
  fs.rmSync(cachePath, { recursive: true, force: true });
  console.log('✅ Removed .wwebjs_cache folder');
} else {
  console.log('ℹ️  .wwebjs_cache folder not found');
}

console.log('✅ Session cleaned! You can now restart the bot.');
