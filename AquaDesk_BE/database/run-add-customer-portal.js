require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { getConnection, closeConnection } = require('../config/database');

async function runMigration() {
  const filePath = path.join(__dirname, 'add-customer-portal.sql');
  const sql = fs.readFileSync(filePath, 'utf8');

  // mssql supports T-SQL batch separator GO when we split on it.
  const batches = sql
    .split(/^\s*GO\s*$/gim)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  const pool = await getConnection();

  console.log(`Running ${batches.length} migration batches from add-customer-portal.sql...`);
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    try {
      await pool.request().batch(batch);
      console.log(`  [OK] Batch ${i + 1}/${batches.length}`);
    } catch (err) {
      console.error(`  [FAIL] Batch ${i + 1}/${batches.length}:`, err.message);
      console.error('  SQL:', batch.slice(0, 200));
      throw err;
    }
  }

  console.log('Customer portal migration complete.');
}

runMigration()
  .then(() => closeConnection())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    closeConnection().finally(() => process.exit(1));
  });
