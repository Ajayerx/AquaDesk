const { executeQuery, executeScalar, executeNonQuery } = require('../config/database');

const getAllSalesMaster = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { filterType, filterValue, planType, startDate, endDate } = req.query;

    let query = `SELECT sm.*, c.CustomerName, c.CustomerCode, cc.CategoryName, ac.AreaCode
                 FROM SalesMaster sm
                 INNER JOIN Customers c ON sm.CustomerID = c.CustomerID
                 INNER JOIN ContractCategories cc ON sm.CategoryID = cc.CategoryID
                 LEFT JOIN AreaCodes ac ON c.AreaCodeID = ac.AreaCodeID
                 WHERE sm.CompanyID = @CompanyID`;
    
    const params = { CompanyID: companyId };

    if (filterType && filterValue) {
      switch (filterType) {
        case 'AreaCode':
          query += ` AND ac.AreaCode LIKE @FilterValue`;
          break;
        case 'CustomerCode':
          query += ` AND c.CustomerCode LIKE @FilterValue`;
          break;
        case 'CustomerName':
          query += ` AND c.CustomerName LIKE @FilterValue`;
          break;
        default:
          query += ` AND (c.CustomerName LIKE @FilterValue OR c.CustomerCode LIKE @FilterValue OR ac.AreaCode LIKE @FilterValue)`;
      }
      params.FilterValue = `%${filterValue}%`;
    }

    if (planType) {
      query += ` AND sm.PlanType = @PlanType`;
      params.PlanType = planType;
    }

    if (startDate) {
      query += ` AND sm.SalesDate >= @StartDate`;
      params.StartDate = startDate;
    }

    if (endDate) {
      query += ` AND sm.SalesDate <= @EndDate`;
      params.EndDate = endDate;
    }

    query += ' ORDER BY sm.SalesDate DESC';

    const sales = await executeQuery(query, params);
    res.json(sales);
  } catch (error) {
    console.error('Get sales master error:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
};

const getSalesMasterById = async (req, res) => {
  try {
    const { id } = req.params;
    const sales = await executeScalar(
      `SELECT sm.*, c.CustomerName, c.CustomerCode, c.Mobile, c.Email, c.Address, c.City,
              cc.CategoryName, si.IntervalName as ServiceIntervalName, ci.IntervalName as ContractIntervalName
       FROM SalesMaster sm
       INNER JOIN Customers c ON sm.CustomerID = c.CustomerID
       INNER JOIN ContractCategories cc ON sm.CategoryID = cc.CategoryID
       LEFT JOIN ServiceIntervals si ON sm.ServiceIntervalID = si.ServiceIntervalID
       LEFT JOIN ContractIntervals ci ON sm.ContractIntervalID = ci.ContractIntervalID
       WHERE sm.SalesNo = @SalesNo`,
      { SalesNo: id }
    );

    if (!sales) {
      return res.status(404).json({ error: 'Sales record not found' });
    }

    // Get systems
    const systems = await executeQuery(
      `SELECT sms.*, s.SystemName
       FROM SalesMasterSystems sms
       INNER JOIN Systems s ON sms.SystemID = s.SystemID
       WHERE sms.SalesNo = @SalesNo`,
      { SalesNo: id }
    );

    // Get services
    const services = await executeQuery(
      `SELECT smsv.*, s.ServiceName
       FROM SalesMasterServices smsv
       INNER JOIN Services s ON smsv.ServiceID = s.ServiceID
       WHERE smsv.SalesNo = @SalesNo`,
      { SalesNo: id }
    );

    // Get items
    const items = await executeQuery(
      `SELECT smi.*, i.ItemName
       FROM SalesMasterItems smi
       INNER JOIN Items i ON smi.ItemID = i.ItemID
       WHERE smi.SalesNo = @SalesNo`,
      { SalesNo: id }
    );

    res.json({ ...sales, systems, services, items });
  } catch (error) {
    console.error('Get sales master error:', error);
    res.status(500).json({ error: 'Failed to fetch sales record' });
  }
};

const createSalesMaster = async (req, res) => {
  const pool = await require('../config/database').getConnection();
  const transaction = pool.transaction();
  await transaction.begin();

  try {
    const { customerId, categoryId, contractTypeId, serviceIntervalId, contractIntervalId, contractStartDate, planType, description, notes, systems, services, items } = req.body;

    if (!customerId || !categoryId) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Customer ID and Category ID are required' });
    }

    // Insert SalesMaster
    const result = await transaction.request()
      .input('CustomerID', customerId)
      .input('CategoryID', categoryId)
      .input('ContractTypeID', contractTypeId || null)
      .input('ServiceIntervalID', serviceIntervalId || null)
      .input('ContractIntervalID', contractIntervalId || null)
      .input('ContractStartDate', contractStartDate || null)
      .input('PlanType', planType || 'Plan')
      .input('Description', description || null)
      .input('Notes', notes || null)
      .input('CompanyID', req.user.companyId)
      .query(`INSERT INTO SalesMaster (CustomerID, CategoryID, ContractTypeID, ServiceIntervalID, ContractIntervalID, ContractStartDate, PlanType, Description, Notes, CompanyID)
              VALUES (@CustomerID, @CategoryID, @ContractTypeID, @ServiceIntervalID, @ContractIntervalID, @ContractStartDate, @PlanType, @Description, @Notes, @CompanyID);
              SELECT SCOPE_IDENTITY() as SalesNo`);

    const salesNo = result.recordset[0].SalesNo;
    let totalAmount = 0;
    let totalServiceTime = 0;

    // Insert systems
    if (systems && Array.isArray(systems)) {
      for (const sys of systems) {
        await transaction.request()
          .input('SalesNo', salesNo)
          .input('SystemID', sys.systemId)
          .input('Quantity', sys.quantity || 1)
          .input('Cost', sys.cost || 0)
          .query(`INSERT INTO SalesMasterSystems (SalesNo, SystemID, Quantity, Cost)
                  VALUES (@SalesNo, @SystemID, @Quantity, @Cost)`);
        totalAmount += (sys.cost || 0) * (sys.quantity || 1);
      }
    }

    // Insert services
    if (services && Array.isArray(services)) {
      for (const srv of services) {
        await transaction.request()
          .input('SalesNo', salesNo)
          .input('ServiceID', srv.serviceId)
          .input('Quantity', srv.quantity || 1)
          .input('Cost', srv.cost || 0)
          .input('ServiceTime', srv.serviceTime || 0)
          .query(`INSERT INTO SalesMasterServices (SalesNo, ServiceID, Quantity, Cost, ServiceTime)
                  VALUES (@SalesNo, @ServiceID, @Quantity, @Cost, @ServiceTime)`);
        totalAmount += (srv.cost || 0) * (srv.quantity || 1);
        totalServiceTime += (srv.serviceTime || 0) * (srv.quantity || 1);
      }
    }

    // Insert items
    if (items && Array.isArray(items)) {
      for (const itm of items) {
        await transaction.request()
          .input('SalesNo', salesNo)
          .input('ItemID', itm.itemId)
          .input('Quantity', itm.quantity || 1)
          .input('Cost', itm.cost || 0)
          .query(`INSERT INTO SalesMasterItems (SalesNo, ItemID, Quantity, Cost)
                  VALUES (@SalesNo, @ItemID, @Quantity, @Cost)`);
        totalAmount += (itm.cost || 0) * (itm.quantity || 1);
      }
    }

    // Update total amount and service time
    await transaction.request()
      .input('SalesNo', salesNo)
      .input('TotalAmount', totalAmount)
      .input('TotalServiceTime', totalServiceTime)
      .query(`UPDATE SalesMaster SET TotalAmount = @TotalAmount, TotalServiceTime = @TotalServiceTime WHERE SalesNo = @SalesNo`);

    // If it's a plan, generate initial schedule
    if (planType === 'Plan' && contractStartDate && serviceIntervalId) {
      await transaction.request()
        .input('SalesNo', salesNo)
        .input('ScheduleDate', contractStartDate)
        .query(`INSERT INTO Schedule (SalesNo, ScheduleDate, ServiceStatus)
                VALUES (@SalesNo, @ScheduleDate, 'Pending')`);
    }

    // If it's a complaint, add to complaints table
    if (planType === 'Complaint' && description) {
      await transaction.request()
        .input('SalesNo', salesNo)
        .input('Description', description)
        .query(`INSERT INTO Complaints (SalesNo, Description, Status)
                VALUES (@SalesNo, @Description, 'Open')`);
    }

    await transaction.commit();

    res.status(201).json({ message: 'Sales record created successfully', salesNo });
  } catch (error) {
    await transaction.rollback();
    console.error('Create sales master error:', error);
    res.status(500).json({ error: 'Failed to create sales record' });
  }
};

const updateSalesMaster = async (req, res) => {
  const pool = await require('../config/database').getConnection();
  const transaction = pool.transaction();
  await transaction.begin();

  try {
    const { id } = req.params;
    const { categoryId, contractTypeId, serviceIntervalId, contractIntervalId, contractStartDate, planType, description, notes, systems, services, items } = req.body;

    // Update SalesMaster
    await transaction.request()
      .input('SalesNo', id)
      .input('CategoryID', categoryId)
      .input('ContractTypeID', contractTypeId || null)
      .input('ServiceIntervalID', serviceIntervalId || null)
      .input('ContractIntervalID', contractIntervalId || null)
      .input('ContractStartDate', contractStartDate || null)
      .input('PlanType', planType)
      .input('Description', description || null)
      .input('Notes', notes || null)
      .query(`UPDATE SalesMaster 
              SET CategoryID = @CategoryID, ContractTypeID = @ContractTypeID, ServiceIntervalID = @ServiceIntervalID, 
                  ContractIntervalID = @ContractIntervalID, ContractStartDate = @ContractStartDate, 
                  PlanType = @PlanType, Description = @Description, Notes = @Notes, UpdatedAt = GETDATE()
              WHERE SalesNo = @SalesNo`);

    // Delete existing systems, services, items
    await transaction.request()
      .input('SalesNo', id)
      .query(`DELETE FROM SalesMasterSystems WHERE SalesNo = @SalesNo;
              DELETE FROM SalesMasterServices WHERE SalesNo = @SalesNo;
              DELETE FROM SalesMasterItems WHERE SalesNo = @SalesNo`);

    let totalAmount = 0;
    let totalServiceTime = 0;

    // Insert systems
    if (systems && Array.isArray(systems)) {
      for (const sys of systems) {
        await transaction.request()
          .input('SalesNo', id)
          .input('SystemID', sys.systemId)
          .input('Quantity', sys.quantity || 1)
          .input('Cost', sys.cost || 0)
          .query(`INSERT INTO SalesMasterSystems (SalesNo, SystemID, Quantity, Cost)
                  VALUES (@SalesNo, @SystemID, @Quantity, @Cost)`);
        totalAmount += (sys.cost || 0) * (sys.quantity || 1);
      }
    }

    // Insert services
    if (services && Array.isArray(services)) {
      for (const srv of services) {
        await transaction.request()
          .input('SalesNo', id)
          .input('ServiceID', srv.serviceId)
          .input('Quantity', srv.quantity || 1)
          .input('Cost', srv.cost || 0)
          .input('ServiceTime', srv.serviceTime || 0)
          .query(`INSERT INTO SalesMasterServices (SalesNo, ServiceID, Quantity, Cost, ServiceTime)
                  VALUES (@SalesNo, @ServiceID, @Quantity, @Cost, @ServiceTime)`);
        totalAmount += (srv.cost || 0) * (srv.quantity || 1);
        totalServiceTime += (srv.serviceTime || 0) * (srv.quantity || 1);
      }
    }

    // Insert items
    if (items && Array.isArray(items)) {
      for (const itm of items) {
        await transaction.request()
          .input('SalesNo', id)
          .input('ItemID', itm.itemId)
          .input('Quantity', itm.quantity || 1)
          .input('Cost', itm.cost || 0)
          .query(`INSERT INTO SalesMasterItems (SalesNo, ItemID, Quantity, Cost)
                  VALUES (@SalesNo, @ItemID, @Quantity, @Cost)`);
        totalAmount += (itm.cost || 0) * (itm.quantity || 1);
      }
    }

    // Update total amount and service time
    await transaction.request()
      .input('SalesNo', id)
      .input('TotalAmount', totalAmount)
      .input('TotalServiceTime', totalServiceTime)
      .query(`UPDATE SalesMaster SET TotalAmount = @TotalAmount, TotalServiceTime = @TotalServiceTime WHERE SalesNo = @SalesNo`);

    await transaction.commit();

    res.json({ message: 'Sales record updated successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Update sales master error:', error);
    res.status(500).json({ error: 'Failed to update sales record' });
  }
};

const deleteSalesMaster = async (req, res) => {
  try {
    const { id } = req.params;

    await executeNonQuery(
      'UPDATE SalesMaster SET Status = 0 WHERE SalesNo = @SalesNo',
      { SalesNo: id }
    );

    res.json({ message: 'Sales record deleted successfully' });
  } catch (error) {
    console.error('Delete sales master error:', error);
    res.status(500).json({ error: 'Failed to delete sales record' });
  }
};

module.exports = {
  getAllSalesMaster,
  getSalesMasterById,
  createSalesMaster,
  updateSalesMaster,
  deleteSalesMaster
};
