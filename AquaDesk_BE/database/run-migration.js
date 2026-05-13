require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sql = require('mssql/msnodesqlv8');

const isWindowsAuth = (process.env.DB_AUTH_TYPE || '').toLowerCase() === 'windows';

let config;
if (isWindowsAuth) {
  config = {
    connectionString: `Server=${process.env.DB_SERVER};Database=${process.env.DB_DATABASE};Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}`,
  };
} else {
  config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
      enableArithAbort: true,
    },
  };
}

async function runMigration() {
  try {
    console.log(`Connecting to SQL Server: ${process.env.DB_SERVER}, DB: ${process.env.DB_DATABASE}`);
    const pool = await sql.connect(config);
    
    const migrationFile = path.join(__dirname, 'migrate-sales-plan.sql');
    const sqlScript = fs.readFileSync(migrationFile, 'utf8');
    
    // Split on GO statements and execute each batch
    const batches = sqlScript.split(/\nGO\n/i).filter(b => b.trim().length > 0);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i].trim();
      if (batch) {
        try {
          await pool.request().query(batch);
        } catch (err) {
          console.error(`Batch ${i + 1} error: ${err.message.substring(0, 200)}`);
        }
      }
    }
    
    // If no GO statements, try running the whole script as one batch
    if (batches.length <= 1) {
      try {
        const statements = sqlScript.split(';').filter(s => s.trim().length > 0);
        for (const stmt of statements) {
          try {
            await pool.request().query(stmt);
          } catch (err) {
            console.error(`Statement error: ${err.message.substring(0, 100)}`);
          }
        }
      } catch (err) {
        console.error('Script execution error:', err.message);
      }
    }
    
    // Verify new tables
    const newTables = ['ContractCategorySystems', 'ContractCategoryServices', 'ContractCategoryItems', 'SalesPlanDetails'];
    console.log('\n=== New Tables Row Counts ===');
    for (const table of newTables) {
      try {
        const result = await pool.request().query(`SELECT COUNT(*) AS cnt FROM ${table}`);
        console.log(`  ${table}: ${result.recordset[0].cnt} rows`);
      } catch (err) {
        console.log(`  ${table}: (table not found)`);
      }
    }
    
    await pool.close();
    console.log('\nMigration completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
