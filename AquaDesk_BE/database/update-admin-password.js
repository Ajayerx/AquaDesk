const bcrypt = require('bcrypt');

async function generatePasswordHash() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nCopy this hash and replace the placeholder in database/schema.sql');
}

generatePasswordHash();
