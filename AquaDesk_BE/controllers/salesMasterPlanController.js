const { executeQuery, executeScalar, executeNonQuery, getConnection, sql } = require('../config/database');

// Get all sales master plans
const getAllSalesMasterPlans = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const plans = await executeQuery(`
      SELECT 
        smp.*,
        c.CustomerCode,
        c.CustomerName,
        c.Mobile,
        c.City,
        ac.AreaCode,
        cc.CategoryName AS ContractTypeName,
        cc.CategoryCode AS ContractTypeCode,
        cp.PeriodName AS ContractPeriodName,
        cp.DurationMonths,
        ISNULL((SELECT COUNT(*) FROM SalesPlanDetails spd WHERE spd.PlanID = smp.PlanID AND spd.LineType = 'System' AND spd.Status = 1), 0) AS SystemsCount,
        ISNULL((SELECT COUNT(*) FROM SalesPlanDetails spd WHERE spd.PlanID = smp.PlanID AND spd.LineType = 'Service' AND spd.Status = 1), 0) AS ServicesCount,
        ISNULL((SELECT COUNT(*) FROM SalesPlanDetails spd WHERE spd.PlanID = smp.PlanID AND spd.LineType = 'Item' AND spd.Status = 1), 0) AS ItemsCount
      FROM SalesMasterPlan smp
      LEFT JOIN Customers c ON smp.CustomerID = c.CustomerID
      LEFT JOIN AreaCodes ac ON c.AreaCodeID = ac.AreaCodeID
      LEFT JOIN ContractCategories cc ON smp.ContractTypeID = cc.CategoryID
      LEFT JOIN ContractPeriods cp ON smp.ContractPeriodID = cp.PeriodID
      WHERE smp.Status = 1 AND c.CompanyID = @CompanyID
      ORDER BY smp.CreatedAt DESC
    `, { CompanyID: companyId });
    res.json(plans);
  } catch (error) {
    console.error('Error fetching sales master plans:', error);
    res.status(500).json({ error: 'Failed to fetch sales master plans' });
  }
};

// Get sales master plan by ID
const getSalesMasterPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await executeScalar(`
      SELECT 
        smp.*,
        c.CustomerCode,
        c.CustomerName,
        c.Mobile,
        c.Email,
        c.Flat,
        c.Block,
        c.Road,
        c.City,
        c.State,
        c.Country,
        ac.AreaCode,
        cc.CategoryName AS ContractTypeName,
        cc.CategoryCode AS ContractTypeCode,
        cp.PeriodName AS ContractPeriodName,
        cp.DurationMonths
      FROM SalesMasterPlan smp
      LEFT JOIN Customers c ON smp.CustomerID = c.CustomerID
      LEFT JOIN AreaCodes ac ON c.AreaCodeID = ac.AreaCodeID
      LEFT JOIN ContractCategories cc ON smp.ContractTypeID = cc.CategoryID
      LEFT JOIN ContractPeriods cp ON smp.ContractPeriodID = cp.PeriodID
      WHERE smp.PlanID = @PlanID
    `, { PlanID: id });

    if (!plan) {
      return res.status(404).json({ error: 'Sales master plan not found' });
    }

    // Get unified plan details from SalesPlanDetails
    const details = await executeQuery(`
      SELECT 
        spd.*,
        CASE spd.LineType
          WHEN 'System' THEN s.SystemName
          WHEN 'Service' THEN sv.ServiceName
          WHEN 'Item' THEN i.ItemName
        END AS Name,
        CASE spd.LineType
          WHEN 'System' THEN s.SystemCode
          WHEN 'Service' THEN sv.ServiceCode
          WHEN 'Item' THEN i.ItemCode
        END AS Code,
        CASE spd.LineType
          WHEN 'Item' THEN i.Unit
          ELSE NULL
        END AS Unit
      FROM SalesPlanDetails spd
      LEFT JOIN Systems s ON spd.LineType = 'System' AND spd.ReferenceID = s.SystemID
      LEFT JOIN Services sv ON spd.LineType = 'Service' AND spd.ReferenceID = sv.ServiceID
      LEFT JOIN Items i ON spd.LineType = 'Item' AND spd.ReferenceID = i.ItemID
      WHERE spd.PlanID = @PlanID AND spd.Status = 1
      ORDER BY spd.DetailID
    `, { PlanID: id });

    // Group by line type for backward compatibility
    const systems = details.filter(d => d.LineType === 'System');
    const services = details.filter(d => d.LineType === 'Service');
    const items = details.filter(d => d.LineType === 'Item');

    // Calculate totals
    const totalCost = details.reduce((sum, d) => sum + (d.LineTotal || 0), 0);
    const totalServiceTime = details.reduce((sum, d) => sum + (d.ServiceTime || 0), 0);

    res.json({
      ...plan,
      Details: details,
      Systems: systems,
      Services: services,
      Items: items,
      TotalCost: totalCost,
      TotalServiceTime: totalServiceTime
    });
  } catch (error) {
    console.error('Error fetching sales master plan:', error);
    res.status(500).json({ error: 'Failed to fetch sales master plan' });
  }
};

// Create sales master plan
const createSalesMasterPlan = async (req, res) => {
  const { customerInfo, contractTypeId, contractPeriodId, contractStartingDate, details, planType, frequency, notes } = req.body;
  const userId = req.user?.userId;

  const pool = await getConnection();
  const transaction = pool.transaction();
  try {
    await transaction.begin();

    const planResult = await transaction.request()
      .input('CustomerID', customerInfo.customerId)
      .input('ContractTypeID', contractTypeId || null)
      .input('ContractPeriodID', contractPeriodId || null)
      .input('ContractStartingDate', contractStartingDate || null)
      .input('PlanType', planType || 'Plan')
      .input('Frequency', frequency)
      .input('Notes', notes || null)
      .input('CreatedBy', userId)
      .query(`
        INSERT INTO SalesMasterPlan (CustomerID, ContractTypeID, ContractPeriodID, ContractStartingDate, PlanType, Frequency, Notes, CreatedBy, Status)
        OUTPUT INSERTED.PlanID
        VALUES (@CustomerID, @ContractTypeID, @ContractPeriodID, @ContractStartingDate, @PlanType, @Frequency, @Notes, @CreatedBy, 1)
      `);

    const planId = planResult.recordset[0].PlanID;

    if (details && details.length > 0) {
      for (const detail of details) {
        const lineTotal = (detail.quantity || 1) * (detail.unitCost || 0);
        await transaction.request()
          .input('PlanID', planId)
          .input('LineType', detail.lineType)
          .input('ReferenceID', detail.referenceId)
          .input('Quantity', detail.quantity || 1)
          .input('UnitCost', detail.unitCost || 0)
          .input('LineTotal', lineTotal)
          .input('ServiceTime', detail.serviceTime || 0)
          .input('QualityParameters', detail.qualityParameters || null)
          .input('Notes', detail.notes || null)
          .query(`
            INSERT INTO SalesPlanDetails (PlanID, LineType, ReferenceID, Quantity, UnitCost, LineTotal, ServiceTime, QualityParameters, Notes, Status)
            VALUES (@PlanID, @LineType, @ReferenceID, @Quantity, @UnitCost, @LineTotal, @ServiceTime, @QualityParameters, @Notes, 1)
          `);
      }
    }

    await transaction.commit();
    res.status(201).json({ message: 'Sales master plan created successfully', planId });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating sales master plan:', error);
    res.status(500).json({ error: 'Failed to create sales master plan' });
  }
};

// Update sales master plan
const updateSalesMasterPlan = async (req, res) => {
  const { id } = req.params;
  const { customerInfo, contractTypeId, contractPeriodId, contractStartingDate, details, planType, frequency, notes } = req.body;
  const userId = req.user?.userId;

  const pool = await getConnection();
  const transaction = pool.transaction();
  try {
    await transaction.begin();

    await transaction.request()
      .input('PlanID', id)
      .input('CustomerID', customerInfo.customerId)
      .input('ContractTypeID', contractTypeId || null)
      .input('ContractPeriodID', contractPeriodId || null)
      .input('ContractStartingDate', contractStartingDate || null)
      .input('PlanType', planType)
      .input('Frequency', frequency)
      .input('Notes', notes)
      .input('UpdatedBy', userId)
      .query(`
        UPDATE SalesMasterPlan
        SET CustomerID = @CustomerID, ContractTypeID = @ContractTypeID, ContractPeriodID = @ContractPeriodID, ContractStartingDate = @ContractStartingDate,
            PlanType = @PlanType, Frequency = @Frequency, Notes = @Notes, UpdatedBy = @UpdatedBy, UpdatedAt = GETDATE()
        WHERE PlanID = @PlanID
      `);

    await transaction.request()
      .input('PlanID', id)
      .query('DELETE FROM SalesPlanDetails WHERE PlanID = @PlanID');

    if (details && details.length > 0) {
      for (const detail of details) {
        const lineTotal = (detail.quantity || 1) * (detail.unitCost || 0);
        await transaction.request()
          .input('PlanID', id)
          .input('LineType', detail.lineType)
          .input('ReferenceID', detail.referenceId)
          .input('Quantity', detail.quantity || 1)
          .input('UnitCost', detail.unitCost || 0)
          .input('LineTotal', lineTotal)
          .input('ServiceTime', detail.serviceTime || 0)
          .input('QualityParameters', detail.qualityParameters || null)
          .input('Notes', detail.notes || null)
          .query(`
            INSERT INTO SalesPlanDetails (PlanID, LineType, ReferenceID, Quantity, UnitCost, LineTotal, ServiceTime, QualityParameters, Notes, Status)
            VALUES (@PlanID, @LineType, @ReferenceID, @Quantity, @UnitCost, @LineTotal, @ServiceTime, @QualityParameters, @Notes, 1)
          `);
      }
    }

    await transaction.commit();
    res.json({ message: 'Sales master plan updated successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating sales master plan:', error);
    res.status(500).json({ error: 'Failed to update sales master plan' });
  }
};

// Delete sales master plan
const deleteSalesMasterPlan = async (req, res) => {
  try {
    const { id } = req.params;
    await executeNonQuery(
      'UPDATE SalesMasterPlan SET Status = 0 WHERE PlanID = @PlanID',
      { PlanID: id }
    );
    res.json({ message: 'Sales master plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting sales master plan:', error);
    res.status(500).json({ error: 'Failed to delete sales master plan' });
  }
};

// Get plans by frequency (weekly/monthly)
const getPlansByFrequency = async (req, res) => {
  try {
    const { frequency } = req.params;
    const companyId = req.user.companyId;
    const plans = await executeQuery(`
      SELECT 
        smp.*,
        c.CustomerCode,
        c.CustomerName,
        c.Mobile,
        c.City,
        ac.AreaCode
      FROM SalesMasterPlan smp
      LEFT JOIN Customers c ON smp.CustomerID = c.CustomerID
      LEFT JOIN AreaCodes ac ON c.AreaCodeID = ac.AreaCodeID
      WHERE smp.Status = 1 AND smp.Frequency = @Frequency AND c.CompanyID = @CompanyID
      ORDER BY smp.CreatedAt DESC
    `, { Frequency: frequency, CompanyID: companyId });
    res.json(plans);
  } catch (error) {
    console.error('Error fetching plans by frequency:', error);
    res.status(500).json({ error: 'Failed to fetch plans by frequency' });
  }
};

module.exports = {
  getAllSalesMasterPlans,
  getSalesMasterPlanById,
  createSalesMasterPlan,
  updateSalesMasterPlan,
  deleteSalesMasterPlan,
  getPlansByFrequency
};
