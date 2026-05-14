const fs = require('fs');
const path = require('path');
const { executeNonQuery, closeConnection } = require('../config/database');

function splitBatches(sql) {
  return sql.split(/\bGO\b/i).map(b => b.trim()).filter(b => b.length > 0);
}

async function runFile(label, filePath) {
  console.log(`  Running ${label}...`);
  const sql = fs.readFileSync(filePath, 'utf8');
  const batches = splitBatches(sql);

  for (let i = 0; i < batches.length; i++) {
    try {
      await executeNonQuery(batches[i]);
      console.log(`    Batch ${i + 1}/${batches.length} OK`);
    } catch (err) {
      console.error(`    Batch ${i + 1}/${batches.length} FAILED: ${err.message}`);
      throw err;
    }
  }

  console.log(`  ${label} applied (${batches.length} batch${batches.length !== 1 ? 'es' : ''})`);
}

async function initializeDatabase() {
  try {
    console.log('Connecting to database...');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const seedPath = path.join(__dirname, 'seed.sql');

    await runFile('schema.sql', schemaPath);
    await runFile('seed.sql', seedPath);

    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

initializeDatabase();
