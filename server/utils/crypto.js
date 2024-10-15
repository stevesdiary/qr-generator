// const crypto = require('crypto');

const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

const crypto = require('crypto');

if (!process.env.SECRET_KEY) {
  console.error('Error: SECRET_KEY environment variable is not set');
  process.exit(1);
}
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

// Decryption function
function decrypt(encryptedData, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(Buffer.from(encryptedData, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Usage example
// const secretKey = crypto.randomBytes(32).toString('hex');
// const message = "This is a secret message";

// const encrypted = encrypt(message, secretKey);
// console.log('Encrypted:', encrypted);


module.exports = { encrypt, decrypt };
