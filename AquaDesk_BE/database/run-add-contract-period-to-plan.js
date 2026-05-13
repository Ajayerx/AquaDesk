require('dotenv').config();
const { executeNonQuery, executeQuery } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Adding ContractPeriodID and ContractStartingDate to SalesMasterPlan...\n');

    // Add ContractPeriodID
    try {
      await executeNonQuery('ALTER TABLE SalesMasterPlan ADD ContractPeriodID INT NULL');
      console.log('Added ContractPeriodID column');
    } catch (err) {
      console.log('ContractPeriodID column already exists or error:', err.message);
    }

    // Add ContractStartingDate
    try {
      await executeNonQuery('ALTER TABLE SalesMasterPlan ADD ContractStartingDate DATE NULL');
      console.log('Added ContractStartingDate column');
    } catch (err) {
      console.log('ContractStartingDate column already exists or error:', err.message);
    }

    // Add foreign key constraint for ContractPeriodID
    try {
      await executeNonQuery(`
        ALTER TABLE SalesMasterPlan 
        ADD CONSTRAINT FK_SalesMasterPlan_ContractPeriod 
        FOREIGN KEY (ContractPeriodID) REFERENCES ContractPeriods(PeriodID)
      `);
      console.log('Added foreign key constraint for ContractPeriodID');
    } catch (err) {
      console.log('Foreign key constraint already exists or error:', err.message);
    }

    // Verify
    const plans = await executeQuery('SELECT TOP 2 * FROM SalesMasterPlan');
    console.log('\nSalesMasterPlan columns after update:');
    if (plans.length > 0) {
      console.log('Sample columns:', Object.keys(plans[0]));
    }

    console.log('\nMigration completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
