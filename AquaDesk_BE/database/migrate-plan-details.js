require('dotenv').config();
const { executeNonQuery, executeQuery } = require('../config/database');

async function migratePlanDetails() {
  try {
    console.log('Migrating existing plan data to SalesPlanDetails...\n');

    // Get all existing plans
    const plans = await executeQuery('SELECT PlanID FROM SalesMasterPlan WHERE Status = 1');
    console.log(`Found ${plans.length} plans to migrate`);

    let migratedCount = 0;

    for (const plan of plans) {
      const planId = plan.PlanID;

      // Migrate Systems
      const systems = await executeQuery(`
        SELECT smps.SystemID, smps.Quantity, ISNULL(ccs.Cost, 0) AS UnitCost
        FROM SalesMasterPlanSystem smps
        LEFT JOIN ContractCategorySystems ccs ON ccs.SystemID = smps.SystemID AND ccs.CategoryID = (SELECT ContractTypeID FROM SalesMasterPlan WHERE PlanID = @PlanID)
        WHERE smps.PlanID = @PlanID
      `, { PlanID: planId });

      for (const sys of systems) {
        const lineTotal = sys.Quantity * sys.UnitCost;
        await executeNonQuery(`
          INSERT INTO SalesPlanDetails (PlanID, LineType, ReferenceID, Quantity, UnitCost, LineTotal, Status)
          VALUES (@PlanID, 'System', @ReferenceID, @Quantity, @UnitCost, @LineTotal, 1)
        `, { PlanID: planId, ReferenceID: sys.SystemID, Quantity: sys.Quantity, UnitCost: sys.UnitCost, LineTotal: lineTotal });
      }

      // Migrate Services
      const services = await executeQuery(`
        SELECT smps.ServiceID, smps.Quantity, ISNULL(ccs.Cost, 0) AS UnitCost, ISNULL(ccs.ServiceTime, 0) AS ServiceTime
        FROM SalesMasterPlanService smps
        LEFT JOIN ContractCategoryServices ccs ON ccs.ServiceID = smps.ServiceID AND ccs.CategoryID = (SELECT ContractTypeID FROM SalesMasterPlan WHERE PlanID = @PlanID)
        WHERE smps.PlanID = @PlanID
      `, { PlanID: planId });

      for (const svc of services) {
        const lineTotal = svc.Quantity * svc.UnitCost;
        await executeNonQuery(`
          INSERT INTO SalesPlanDetails (PlanID, LineType, ReferenceID, Quantity, UnitCost, LineTotal, ServiceTime, Status)
          VALUES (@PlanID, 'Service', @ReferenceID, @Quantity, @UnitCost, @LineTotal, @ServiceTime, 1)
        `, { PlanID: planId, ReferenceID: svc.ServiceID, Quantity: svc.Quantity, UnitCost: svc.UnitCost, LineTotal: lineTotal, ServiceTime: svc.ServiceTime });
      }

      // Migrate Items
      const items = await executeQuery(`
        SELECT smpi.ItemID, smpi.Quantity, ISNULL(cci.Cost, 0) AS UnitCost
        FROM SalesMasterPlanItem smpi
        LEFT JOIN ContractCategoryItems cci ON cci.ItemID = smpi.ItemID AND cci.CategoryID = (SELECT ContractTypeID FROM SalesMasterPlan WHERE PlanID = @PlanID)
        WHERE smpi.PlanID = @PlanID
      `, { PlanID: planId });

      for (const itm of items) {
        const lineTotal = itm.Quantity * itm.UnitCost;
        await executeNonQuery(`
          INSERT INTO SalesPlanDetails (PlanID, LineType, ReferenceID, Quantity, UnitCost, LineTotal, Status)
          VALUES (@PlanID, 'Item', @ReferenceID, @Quantity, @UnitCost, @LineTotal, 1)
        `, { PlanID: planId, ReferenceID: itm.ItemID, Quantity: itm.Quantity, UnitCost: itm.UnitCost, LineTotal: lineTotal });
      }

      migratedCount++;
      console.log(`Migrated plan ${planId}: ${systems.length} systems, ${services.length} services, ${items.length} items`);
    }

    console.log(`\nMigration complete! Migrated ${migratedCount} plans.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
  }
}

migratePlanDetails();
