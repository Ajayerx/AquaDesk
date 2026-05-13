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

async function runSeed() {
  try {
    console.log(`Connecting to SQL Server: ${process.env.DB_SERVER}, DB: ${process.env.DB_DATABASE}`);
    const pool = await sql.connect(config);
    
    const seedFile = path.join(__dirname, 'seed-data.sql');
    const sqlScript = fs.readFileSync(seedFile, 'utf8');
    
    // Split on GO statements and execute each batch
    const batches = sqlScript.split(/\nGO\n/i).filter(b => b.trim().length > 0);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i].trim();
      if (batch) {
        try {
          await pool.request().query(batch);
        } catch (err) {
          // Some batches may have issues with PRINT or complex syntax
          console.error(`Batch ${i + 1} error: ${err.message}`);
        }
      }
    }
    
    // If no GO statements, try running the whole script as one batch
    if (batches.length <= 1) {
      try {
        // Split by semicolons for individual statements
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
    
    // Verify row counts
    const tables = ['Companies','Users','UserAccess','AreaCodes','ContractCategories','ContractIntervals','ServiceIntervals','Systems','Services','Items','ItemStock','ServiceCost','SystemCost','ItemCost','ServiceHours','ServiceTeams','ServiceEngineers','Customers','CustomerSystems','ServiceContracts','SalesMaster','SalesMasterSystems','SalesMasterServices','SalesMasterItems','Schedule','Complaints','SalesMasterPlan','SalesMasterPlanSystem','SalesMasterPlanService','SalesMasterPlanItem'];
    
    console.log('\n=== Row Counts ===');
    for (const table of tables) {
      try {
        const result = await pool.request().query(`SELECT COUNT(*) AS cnt FROM ${table}`);
        console.log(`  ${table}: ${result.recordset[0].cnt} rows`);
      } catch (err) {
        console.log(`  ${table}: (table not found)`);
      }
    }
    
    await pool.close();
    console.log('\nSeed completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

runSeed();
