#!/usr/bin/env node

/**
 * Generate a secure random token for GitHub Actions cron jobs
 * 
 * Usage:
 * node scripts/generate-cron-token.js
 * 
 * Or make it executable:
 * chmod +x scripts/generate-cron-token.js
 * ./scripts/generate-cron-token.js
 */

const crypto = require('crypto');

function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateUUID() {
  return crypto.randomUUID();
}

function generateBase64Token(length = 32) {
  return crypto.randomBytes(length).toString('base64url');
}

console.log('🔐 Secure Token Generator for GitHub Actions\n');

console.log('Choose your token type:');
console.log('1. Hex token (32 bytes) - Recommended');
console.log('2. UUID v4');
console.log('3. Base64 URL-safe token');
console.log('4. All types\n');

const tokenType = process.argv[2] || '1';

switch (tokenType) {
  case '1':
  case 'hex':
    console.log('🔑 Hex Token (32 bytes):');
    console.log(generateSecureToken());
    break;
    
  case '2':
  case 'uuid':
    console.log('🔑 UUID v4:');
    console.log(generateUUID());
    break;
    
  case '3':
  case 'base64':
    console.log('🔑 Base64 URL-safe Token:');
    console.log(generateBase64Token());
    break;
    
  case '4':
  case 'all':
    console.log('🔑 All Token Types:\n');
    console.log('Hex Token (32 bytes):');
    console.log(generateSecureToken());
    console.log('\nUUID v4:');
    console.log(generateUUID());
    console.log('\nBase64 URL-safe Token:');
    console.log(generateBase64Token());
    break;
    
  default:
    console.log('❌ Invalid option. Use: 1, 2, 3, or 4');
    process.exit(1);
}

console.log('\n📋 Next Steps:');
console.log('1. Copy the token above');
console.log('2. Go to your GitHub repository');
console.log('3. Navigate to Settings → Secrets and variables → Actions');
console.log('4. Click "New repository secret"');
console.log('5. Name: CRON_SECRET_TOKEN');
console.log('6. Value: [paste the token above]');
console.log('7. Click "Add secret"');
console.log('\n✅ Your GitHub Actions workflow will now be able to authenticate with your API!');
