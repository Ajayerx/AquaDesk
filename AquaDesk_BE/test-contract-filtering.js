require('dotenv').config();
const { executeQuery } = require('./config/database');

async function testContractFiltering() {
  try {
    console.log('Testing contract type filtering...\n');

    // Test ContractCategorySystems
    const systems = await executeQuery(`
      SELECT s.*, ccs.Cost AS UnitCost
      FROM Systems s
      INNER JOIN ContractCategorySystems ccs ON s.SystemID = ccs.SystemID
      WHERE ccs.CategoryID = 1 AND ccs.CompanyID = 1 AND ccs.Status = 1 AND s.Status = 1
      ORDER BY s.SystemName
    `);
    console.log('Systems for CategoryID=1:', systems.length, 'rows');
    console.log(JSON.stringify(systems.slice(0, 2), null, 2));

    // Test ContractCategoryServices
    const services = await executeQuery(`
      SELECT s.*, ccs.Cost AS UnitCost, ccs.ServiceTime
      FROM Services s
      INNER JOIN ContractCategoryServices ccs ON s.ServiceID = ccs.ServiceID
      WHERE ccs.CategoryID = 1 AND ccs.CompanyID = 1 AND ccs.Status = 1 AND s.Status = 1
      ORDER BY s.ServiceName
    `);
    console.log('\nServices for CategoryID=1:', services.length, 'rows');
    console.log(JSON.stringify(services.slice(0, 2), null, 2));

    // Test ContractCategoryItems
    const items = await executeQuery(`
      SELECT i.*, cci.Cost AS UnitCost
      FROM Items i
      INNER JOIN ContractCategoryItems cci ON i.ItemID = cci.ItemID
      WHERE cci.CategoryID = 1 AND cci.CompanyID = 1 AND cci.Status = 1 AND i.Status = 1
      ORDER BY i.ItemName
    `);
    console.log('\nItems for CategoryID=1:', items.length, 'rows');
    console.log(JSON.stringify(items.slice(0, 2), null, 2));

    // Test SalesMasterPlan with ContractTypeID
    const plans = await executeQuery(`
      SELECT smp.*, cc.CategoryName AS ContractTypeName
      FROM SalesMasterPlan smp
      LEFT JOIN ContractCategories cc ON smp.ContractTypeID = cc.CategoryID
      WHERE smp.Status = 1
    `);
    console.log('\nSales Master Plans with ContractTypeID:', plans.length, 'rows');
    console.log(JSON.stringify(plans.slice(0, 2), null, 2));

    // Test SalesPlanDetails
    const details = await executeQuery(`
      SELECT spd.*, 
        CASE spd.LineType
          WHEN 'System' THEN s.SystemName
          WHEN 'Service' THEN sv.ServiceName
          WHEN 'Item' THEN i.ItemName
        END AS Name
      FROM SalesPlanDetails spd
      LEFT JOIN Systems s ON spd.LineType = 'System' AND spd.ReferenceID = s.SystemID
      LEFT JOIN Services sv ON spd.LineType = 'Service' AND spd.ReferenceID = sv.ServiceID
      LEFT JOIN Items i ON spd.LineType = 'Item' AND spd.ReferenceID = i.ItemID
      WHERE spd.Status = 1
    `);
    console.log('\nSalesPlanDetails:', details.length, 'rows');
    console.log(JSON.stringify(details.slice(0, 3), null, 2));

    console.log('\nAll tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testContractFiltering();
