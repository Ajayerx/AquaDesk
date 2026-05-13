require('dotenv').config();
const { executeQuery, executeScalar } = require('./config/database');

async function testPlanCounts() {
  try {
    console.log('Testing Sales Master Plan Counts\n');

    // Check SalesPlanDetails data
    console.log('=== SalesPlanDetails Data ===');
    const details = await executeQuery('SELECT * FROM SalesPlanDetails WHERE Status = 1');
    console.log(`Total details: ${details.length}`);
    
    if (details.length > 0) {
      const byPlan = {};
      details.forEach(d => {
        if (!byPlan[d.PlanID]) byPlan[d.PlanID] = { System: 0, Service: 0, Item: 0 };
        byPlan[d.PlanID][d.LineType]++;
      });
      
      console.log('\nDetails by PlanID:');
      Object.keys(byPlan).forEach(planId => {
        console.log(`  Plan ${planId}: Systems=${byPlan[planId].System}, Services=${byPlan[planId].Service}, Items=${byPlan[planId].Item}`);
      });
    }

    // Check the query used in getAllSalesMasterPlans
    console.log('\n=== Testing Count Query ===');
    const plans = await executeQuery(`
      SELECT 
        smp.PlanID,
        smp.CustomerID,
        ISNULL((SELECT COUNT(*) FROM SalesPlanDetails spd WHERE spd.PlanID = smp.PlanID AND spd.LineType = 'System' AND spd.Status = 1), 0) AS SystemsCount,
        ISNULL((SELECT COUNT(*) FROM SalesPlanDetails spd WHERE spd.PlanID = smp.PlanID AND spd.LineType = 'Service' AND spd.Status = 1), 0) AS ServicesCount,
        ISNULL((SELECT COUNT(*) FROM SalesPlanDetails spd WHERE spd.PlanID = smp.PlanID AND spd.LineType = 'Item' AND spd.Status = 1), 0) AS ItemsCount
      FROM SalesMasterPlan smp
      WHERE smp.Status = 1
    `);
    
    console.log('Plans with counts:');
    plans.forEach(plan => {
      console.log(`  Plan ${plan.PlanID}: Systems=${plan.SystemsCount}, Services=${plan.ServicesCount}, Items=${plan.ItemsCount}`);
    });

    // Check if old tables still have data
    console.log('\n=== Checking Old Tables ===');
    const oldSystems = await executeScalar('SELECT COUNT(*) AS cnt FROM SalesMasterPlanSystem');
    const oldServices = await executeScalar('SELECT COUNT(*) AS cnt FROM SalesMasterPlanService');
    const oldItems = await executeScalar('SELECT COUNT(*) AS cnt FROM SalesMasterPlanItem');
    console.log(`Old tables - Systems: ${oldSystems.cnt}, Services: ${oldServices.cnt}, Items: ${oldItems.cnt}`);

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

testPlanCounts();
