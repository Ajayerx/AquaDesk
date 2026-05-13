const { executeQuery, executeScalar, executeNonQuery } = require('../config/database');

const getAllCustomers = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { search, areaCode } = req.query;

    let query = `SELECT c.CustomerID, c.CustomerCode, c.CustomerName, c.Mobile, c.Email, c.City, c.Status,
                        ac.AreaCode, ac.Description as AreaDescription
                 FROM Customers c
                 LEFT JOIN AreaCodes ac ON c.AreaCodeID = ac.AreaCodeID
                 WHERE c.CompanyID = @CompanyID`;
    
    const params = { CompanyID: companyId };

    if (search) {
      query += ` AND (c.CustomerName LIKE @Search OR c.CustomerCode LIKE @Search OR c.Mobile LIKE @Search)`;
      params.Search = `%${search}%`;
    }

    if (areaCode) {
      query += ` AND ac.AreaCode = @AreaCode`;
      params.AreaCode = areaCode;
    }

    query += ' ORDER BY c.CustomerName';

    const customers = await executeQuery(query, params);
    res.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await executeScalar(
      `SELECT c.*, ac.AreaCode, ac.Description as AreaDescription
       FROM Customers c
       LEFT JOIN AreaCodes ac ON c.AreaCodeID = ac.AreaCodeID
       WHERE c.CustomerID = @CustomerID`,
      { CustomerID: id }
    );

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get customer systems
    const systems = await executeQuery(
      `SELECT cs.*, s.SystemName
       FROM CustomerSystems cs
       INNER JOIN Systems s ON cs.SystemID = s.SystemID
       WHERE cs.CustomerID = @CustomerID AND cs.Status = 1`,
      { CustomerID: id }
    );

    // Get customer contracts
    const contracts = await executeQuery(
      `SELECT sc.*, cc.CategoryName
       FROM ServiceContracts sc
       INNER JOIN ContractCategories cc ON sc.CategoryID = cc.CategoryID
       WHERE sc.CustomerID = @CustomerID AND sc.Status = 1`,
      { CustomerID: id }
    );

    // Get customer sales
    const sales = await executeQuery(
      `SELECT sm.*, cc.CategoryName
       FROM SalesMaster sm
       INNER JOIN ContractCategories cc ON sm.CategoryID = cc.CategoryID
       WHERE sm.CustomerID = @CustomerID AND sm.Status = 1
       ORDER BY sm.SalesDate DESC`,
      { CustomerID: id }
    );

    res.json({ ...customer, systems, contracts, sales });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { customerCode, customerName, flat, block, road, city, state, country, mobile, email, telephone, fax, areaCodeId, description, status } = req.body;

    if (!customerCode || !customerName) {
      return res.status(400).json({ error: 'Customer code and name are required' });
    }

    // Check if customer code already exists
    const existing = await executeScalar(
      'SELECT CustomerID FROM Customers WHERE CustomerCode = @CustomerCode',
      { CustomerCode: customerCode }
    );

    if (existing) {
      return res.status(400).json({ error: 'Customer code already exists' });
    }

    const result = await executeNonQuery(
      `INSERT INTO Customers (CustomerCode, CustomerName, Flat, Block, Road, City, State, Country, Mobile, Email, Telephone, Fax, AreaCodeID, CompanyID, Description, Status)
       VALUES (@CustomerCode, @CustomerName, @Flat, @Block, @Road, @City, @State, @Country, @Mobile, @Email, @Telephone, @Fax, @AreaCodeID, @CompanyID, @Description, @Status)`,
      {
        customerCode, customerName, flat, block, road, city, state, country, mobile, email, telephone, fax,
        AreaCodeID: areaCodeId || null,
        CompanyID: req.user.companyId,
        description,
        Status: status !== undefined ? (status ? 1 : 0) : 1
      }
    );

    res.status(201).json({ message: 'Customer created successfully', customerId: result });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerCode, customerName, flat, block, road, city, state, country, mobile, email, telephone, fax, areaCodeId, description, status } = req.body;

    await executeNonQuery(
      `UPDATE Customers 
       SET CustomerCode = @CustomerCode, CustomerName = @CustomerName, Flat = @Flat, Block = @Block, Road = @Road, 
           City = @City, State = @State, Country = @Country, Mobile = @Mobile, Email = @Email, Telephone = @Telephone, 
           Fax = @Fax, AreaCodeID = @AreaCodeID, Description = @Description, Status = @Status, UpdatedAt = GETDATE()
       WHERE CustomerID = @CustomerID`,
      {
        customerCode, customerName, flat, block, road, city, state, country, mobile, email, telephone, fax,
        AreaCodeID: areaCodeId || null,
        description,
        Status: status !== undefined ? (status ? 1 : 0) : 1,
        CustomerID: id
      }
    );

    res.json({ message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if customer has sales
    const sales = await executeScalar(
      'SELECT COUNT(*) as Count FROM SalesMaster WHERE CustomerID = @CustomerID',
      { CustomerID: id }
    );

    if (sales && sales.Count > 0) {
      return res.status(400).json({ error: 'Cannot delete customer with associated sales' });
    }

    await executeNonQuery(
      'UPDATE Customers SET Status = 0 WHERE CustomerID = @CustomerID',
      { CustomerID: id }
    );

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};

const getCustomerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Customer info
    const customer = await executeScalar(
      `SELECT c.*, ac.AreaCode, ac.Description as AreaDescription
       FROM Customers c
       LEFT JOIN AreaCodes ac ON c.AreaCodeID = ac.AreaCodeID
       WHERE c.CustomerID = @CustomerID`,
      { CustomerID: id }
    );
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    // Installed systems
    const systems = await executeQuery(
      `SELECT cs.CustomerSystemID, cs.SystemType, cs.SerialNumber, cs.InstallDate, cs.Status, cs.Notes,
              s.SystemCode, s.SystemName
       FROM CustomerSystems cs
       INNER JOIN Systems s ON cs.SystemID = s.SystemID
       WHERE cs.CustomerID = @CustomerID`,
      { CustomerID: id }
    );

    // Service contracts with status counts
    const contracts = await executeQuery(
      `SELECT sc.ContractID, sc.ContractPeriod, sc.Frequency, sc.StartDate, sc.EndDate, sc.Status, sc.Notes,
              cc.CategoryName, cs.SystemName
       FROM ServiceContracts sc
       INNER JOIN ContractCategories cc ON sc.CategoryID = cc.CategoryID
       LEFT JOIN CustomerSystems cs ON sc.CustomerSystemID = cs.CustomerSystemID
       WHERE sc.CustomerID = @CustomerID
       ORDER BY sc.StartDate DESC`,
      { CustomerID: id }
    );

    // Sales / payment transactions
    const transactions = await executeQuery(
      `SELECT sm.SalesNo, sm.SalesDate, sm.TotalAmount, sm.PlanType, sm.Description, sm.Status,
              cc.CategoryName
       FROM SalesMaster sm
       INNER JOIN ContractCategories cc ON sm.CategoryID = cc.CategoryID
       WHERE sm.CustomerID = @CustomerID
       ORDER BY sm.SalesDate DESC`,
      { CustomerID: id }
    );

    // Complaints
    const complaints = await executeQuery(
      `SELECT comp.ComplaintID, comp.ComplaintDate, comp.Description, comp.Status, comp.Resolution, comp.ResolvedDate,
              sm.SalesNo
       FROM Complaints comp
       INNER JOIN SalesMaster sm ON comp.SalesNo = sm.SalesNo
       WHERE sm.CustomerID = @CustomerID
       ORDER BY comp.ComplaintDate DESC`,
      { CustomerID: id }
    );

    // Summary counts
    const systemCount = systems.length;
    const activeContracts = contracts.filter(c => c.Status).length;
    const totalSpent = transactions.reduce((sum, t) => sum + (t.TotalAmount || 0), 0);
    const openComplaints = complaints.filter(c => c.Status === 'Open' || c.Status === 'In Progress').length;

    res.json({
      customer,
      systems,
      contracts,
      transactions,
      complaints,
      summary: { systemCount, activeContracts, totalSpent, openComplaints }
    });
  } catch (error) {
    console.error('Get customer details error:', error);
    res.status(500).json({ error: 'Failed to fetch customer details' });
  }
};

const addCustomerSystem = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { systemId, systemType, serialNumber, installDate, notes } = req.body;

    if (!systemId) {
      return res.status(400).json({ error: 'System ID is required' });
    }

    const result = await executeNonQuery(
      `INSERT INTO CustomerSystems (CustomerID, SystemID, SystemType, SerialNumber, InstallDate, Notes, Status)
       VALUES (@CustomerID, @SystemID, @SystemType, @SerialNumber, @InstallDate, @Notes, 1)`,
      { CustomerID: customerId, SystemID: systemId, systemType, serialNumber, InstallDate: installDate || null, notes }
    );

    res.status(201).json({ message: 'Customer system added successfully', customerSystemId: result });
  } catch (error) {
    console.error('Add customer system error:', error);
    res.status(500).json({ error: 'Failed to add customer system' });
  }
};

const addCustomerContract = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { customerSystemId, categoryId, contractPeriod, frequency, startDate, endDate, notes } = req.body;

    if (!categoryId || !startDate) {
      return res.status(400).json({ error: 'Category ID and start date are required' });
    }

    const result = await executeNonQuery(
      `INSERT INTO ServiceContracts (CustomerID, CustomerSystemID, CategoryID, ContractPeriod, Frequency, StartDate, EndDate, Notes, Status)
       VALUES (@CustomerID, @CustomerSystemID, @CategoryID, @ContractPeriod, @Frequency, @StartDate, @EndDate, @Notes, 1)`,
      {
        CustomerID: customerId,
        CustomerSystemID: customerSystemId || null,
        CategoryID: categoryId,
        ContractPeriod: contractPeriod || null,
        Frequency: frequency || null,
        StartDate: startDate,
        EndDate: endDate || null,
        notes
      }
    );

    res.status(201).json({ message: 'Customer contract added successfully', contractId: result });
  } catch (error) {
    console.error('Add customer contract error:', error);
    res.status(500).json({ error: 'Failed to add customer contract' });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  getCustomerDetails,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addCustomerSystem,
  addCustomerContract
};
