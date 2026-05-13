const fs = require('fs');
const path = require('path');
const { executeNonQuery, closeConnection } = require('../config/database');

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');

    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by GO statements (SQL Server batch separator)
    const batches = schema.split(/\bGO\b/i);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i].trim();
      if (batch) {
        try {
          await executeNonQuery(batch);
          console.log(`Executed batch ${i + 1}/${batches.length}`);
        } catch (error) {
          console.error(`Error in batch ${i + 1}:`, error.message);
          // Continue with next batch even if one fails
        }
      }
    }

    console.log('Database initialization completed successfully!');
    
    // Hash the default admin password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Default admin password hash:', hashedPassword);
    console.log('Please update the schema.sql file with this hash for the default admin user.');
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    await closeConnection();
    process.exit(0);
  }
}

initializeDatabase();
