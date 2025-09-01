const crypto = require('crypto');
const fs = require('fs');

console.log('🔐 RSA Key Pair Generator for SLUDI Integration\n');

// Generate RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'jwk'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'jwk'
    }
});

// Add required fields for SLUDI
publicKey.use = 'sig';
publicKey.alg = 'RS256';
publicKey.kid = 'sludi-key-' + Date.now();

privateKey.use = 'sig';
privateKey.alg = 'RS256';
privateKey.kid = publicKey.kid;

console.log('✅ RSA Key Pair Generated Successfully!\n');

console.log('📤 PUBLIC KEY (Send this to ICTA):');
console.log('=' .repeat(50));
console.log(JSON.stringify(publicKey, null, 2));
console.log('\n');

console.log('🔒 PRIVATE KEY (Keep this secure in your .env file):');
console.log('=' .repeat(50));
console.log(JSON.stringify(privateKey, null, 0)); // Single line for .env
console.log('\n');

// Save to files for easy copying
fs.writeFileSync('sludi-public-key.json', JSON.stringify(publicKey, null, 2));
fs.writeFileSync('sludi-private-key.json', JSON.stringify(privateKey, null, 0));

console.log('💾 Keys saved to files:');
console.log('   - sludi-public-key.json (for ICTA)');
console.log('   - sludi-private-key.json (for your .env)');
console.log('\n');

console.log('📋 Next Steps:');
console.log('1. Copy the PUBLIC KEY above and send to ICTA');
console.log('2. Copy the PRIVATE KEY and add to your .env file as SLUDI_CLIENT_PRIVATE_KEY');
console.log('3. Update redirect URIs list for ICTA (see ICTA_REGISTRATION_REQUIREMENTS.md)');
console.log('4. Wait for ICTA to provide your CLIENT_ID');
console.log('\n');

console.log('⚠️  SECURITY WARNING:');
console.log('   - Only share the PUBLIC key with ICTA');
console.log('   - Keep the PRIVATE key secret and secure');
console.log('   - Delete the key files after copying to .env');
console.log('   - Never commit private keys to version control');

// Create a sample .env entry
console.log('\n📝 .env File Entry (copy this):');
console.log('=' .repeat(50));
console.log(`SLUDI_CLIENT_PRIVATE_KEY=${JSON.stringify(privateKey, null, 0)}`);
