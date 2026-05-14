require('dotenv').config();
const { executeNonQuery } = require('../config/database');

async function fixCompanyID() {
  try {
    const tables = [
      'ContractCategories',
      'ContractIntervals',
      'ServiceIntervals',
      'Systems',
      'Services',
      'Items',
      'ServiceHours',
      'ServiceTeams',
      'ServiceEngineers',
      'ItemStock',
      'ServiceCost',
      'SystemCost',
      'ItemCost',
      'Customers',
      'CustomerSystems',
      'ServiceContracts',
      'SalesMaster',
      'SalesMasterSystems',
      'SalesMasterServices',
      'SalesMasterItems',
      'Schedule',
      'Complaints',
      'SalesMasterPlan',
      'SalesMasterPlanSystem',
      'SalesMasterPlanService',
      'SalesMasterPlanItem'
    ];

    for (const table of tables) {
      try {
        await executeNonQuery(`UPDATE ${table} SET CompanyID = 1 WHERE CompanyID = 2`);
        console.log(`Updated ${table}`);
      } catch (err) {
        console.log(`Skipped ${table}: ${err.message}`);
      }
    }

    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixCompanyID();
