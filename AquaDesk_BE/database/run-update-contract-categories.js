require('dotenv').config();
const { executeNonQuery, executeQuery } = require('../config/database');

async function runMigration() {
  try {
    console.log('Updating ContractCategories table...\n');

    // Add new status column
    try {
      await executeNonQuery("ALTER TABLE ContractCategories ADD ContractStatus NVARCHAR(20) DEFAULT 'MC'");
      console.log('Added ContractStatus column');
    } catch (err) {
      console.log('ContractStatus column already exists or error:', err.message);
    }

    // Update existing records
    try {
      await executeNonQuery("UPDATE ContractCategories SET ContractStatus = 'MC' WHERE ContractStatus IS NULL OR ContractStatus = ''");
      console.log('Updated existing records to MC status');
    } catch (err) {
      console.log('Update error:', err.message);
    }

    // Verify
    const categories = await executeQuery('SELECT * FROM ContractCategories');
    console.log('\nContractCategories after update:');
    categories.forEach(cat => {
      console.log(`  ${cat.CategoryCode}: ${cat.CategoryName} - Status: ${cat.ContractStatus}`);
    });

    console.log('\nMigration completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
