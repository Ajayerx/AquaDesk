const { executeQuery, executeScalar, executeNonQuery } = require('../config/database');

// Service Engineers
const getAllEngineers = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const engineers = await executeQuery(
      `SELECT e.*, t.TeamName
       FROM ServiceEngineers e
       LEFT JOIN ServiceTeams t ON e.TeamID = t.TeamID
       WHERE e.CompanyID = @CompanyID
       ORDER BY e.EngineerName`,
      { CompanyID: companyId }
    );
    res.json(engineers);
  } catch (error) {
    console.error('Get engineers error:', error);
    res.status(500).json({ error: 'Failed to fetch engineers' });
  }
};

const createEngineer = async (req, res) => {
  try {
    const { engineerName, phone, email, teamId } = req.body;

    if (!engineerName) {
      return res.status(400).json({ error: 'Engineer name is required' });
    }

    const result = await executeNonQuery(
      `INSERT INTO ServiceEngineers (EngineerName, Phone, Email, TeamID, CompanyID, Status)
       VALUES (@EngineerName, @Phone, @Email, @TeamID, @CompanyID, 1)`,
      { engineerName, phone, email, TeamID: teamId || null, CompanyID: req.user.companyId }
    );

    res.status(201).json({ message: 'Engineer created successfully', engineerId: result });
  } catch (error) {
    console.error('Create engineer error:', error);
    res.status(500).json({ error: 'Failed to create engineer' });
  }
};

const updateEngineer = async (req, res) => {
  try {
    const { id } = req.params;
    const { engineerName, phone, email, teamId, status } = req.body;

    await executeNonQuery(
      `UPDATE ServiceEngineers 
       SET EngineerName = @EngineerName, Phone = @Phone, Email = @Email, TeamID = @TeamID, Status = @Status, UpdatedAt = GETDATE()
       WHERE EngineerID = @EngineerID`,
      { engineerName, phone, email, TeamID: teamId || null, Status: status ? 1 : 0, EngineerID: id }
    );

    res.json({ message: 'Engineer updated successfully' });
  } catch (error) {
    console.error('Update engineer error:', error);
    res.status(500).json({ error: 'Failed to update engineer' });
  }
};

const deleteEngineer = async (req, res) => {
  try {
    const { id } = req.params;

    await executeNonQuery(
      'UPDATE ServiceEngineers SET Status = 0 WHERE EngineerID = @EngineerID',
      { EngineerID: id }
    );

    res.json({ message: 'Engineer deleted successfully' });
  } catch (error) {
    console.error('Delete engineer error:', error);
    res.status(500).json({ error: 'Failed to delete engineer' });
  }
};

// Service Teams
const getAllTeams = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const teams = await executeQuery(
      'SELECT * FROM ServiceTeams WHERE CompanyID = @CompanyID ORDER BY TeamName',
      { CompanyID: companyId }
    );
    res.json(teams);
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};

const createTeam = async (req, res) => {
  try {
    const { teamName, description } = req.body;

    if (!teamName) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const result = await executeNonQuery(
      `INSERT INTO ServiceTeams (TeamName, Description, CompanyID, Status)
       VALUES (@TeamName, @Description, @CompanyID, 1)`,
      { teamName, description, CompanyID: req.user.companyId }
    );

    res.status(201).json({ message: 'Team created successfully', teamId: result });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { teamName, description, status } = req.body;

    await executeNonQuery(
      `UPDATE ServiceTeams 
       SET TeamName = @TeamName, Description = @Description, Status = @Status, UpdatedAt = GETDATE()
       WHERE TeamID = @TeamID`,
      { teamName, description, Status: status ? 1 : 0, TeamID: id }
    );

    res.json({ message: 'Team updated successfully' });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    await executeNonQuery(
      'UPDATE ServiceTeams SET Status = 0 WHERE TeamID = @TeamID',
      { TeamID: id }
    );

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
};

// Systems (Master Catalog)
const getAllSystems = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const systems = await executeQuery(
      'SELECT * FROM Systems WHERE CompanyID = @CompanyID ORDER BY SystemName',
      { CompanyID: companyId }
    );
    res.json(systems);
  } catch (error) {
    console.error('Get systems error:', error);
    res.status(500).json({ error: 'Failed to fetch systems' });
  }
};

const createSystem = async (req, res) => {
  try {
    const { systemCode, systemName, description } = req.body;

    if (!systemCode || !systemName) {
      return res.status(400).json({ error: 'System code and name are required' });
    }

    const result = await executeNonQuery(
      `INSERT INTO Systems (SystemCode, SystemName, Description, CompanyID, Status)
       VALUES (@SystemCode, @SystemName, @Description, @CompanyID, 1)`,
      { systemCode, systemName, description, CompanyID: req.user.companyId }
    );

    res.status(201).json({ message: 'System created successfully', systemId: result });
  } catch (error) {
    console.error('Create system error:', error);
    res.status(500).json({ error: 'Failed to create system' });
  }
};

const updateSystem = async (req, res) => {
  try {
    const { id } = req.params;
    const { systemCode, systemName, description, status } = req.body;

    await executeNonQuery(
      `UPDATE Systems 
       SET SystemCode = @SystemCode, SystemName = @SystemName, Description = @Description, Status = @Status, UpdatedAt = GETDATE()
       WHERE SystemID = @SystemID`,
      { systemCode, systemName, description, Status: status ? 1 : 0, SystemID: id }
    );

    res.json({ message: 'System updated successfully' });
  } catch (error) {
    console.error('Update system error:', error);
    res.status(500).json({ error: 'Failed to update system' });
  }
};

const deleteSystem = async (req, res) => {
  try {
    const { id } = req.params;

    await executeNonQuery(
      'UPDATE Systems SET Status = 0 WHERE SystemID = @SystemID',
      { SystemID: id }
    );

    res.json({ message: 'System deleted successfully' });
  } catch (error) {
    console.error('Delete system error:', error);
    res.status(500).json({ error: 'Failed to delete system' });
  }
};

// Services (Master Catalog)
const getAllServices = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const services = await executeQuery(
      'SELECT * FROM Services WHERE CompanyID = @CompanyID ORDER BY ServiceName',
      { CompanyID: companyId }
    );
    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

const createService = async (req, res) => {
  try {
    const { serviceCode, serviceName, description } = req.body;

    if (!serviceCode || !serviceName) {
      return res.status(400).json({ error: 'Service code and name are required' });
    }

    const result = await executeNonQuery(
      `INSERT INTO Services (ServiceCode, ServiceName, Description, CompanyID, Status)
       VALUES (@ServiceCode, @ServiceName, @Description, @CompanyID, 1)`,
      { serviceCode, serviceName, description, CompanyID: req.user.companyId }
    );

    res.status(201).json({ message: 'Service created successfully', serviceId: result });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceCode, serviceName, description, status } = req.body;

    await executeNonQuery(
      `UPDATE Services 
       SET ServiceCode = @ServiceCode, ServiceName = @ServiceName, Description = @Description, Status = @Status, UpdatedAt = GETDATE()
       WHERE ServiceID = @ServiceID`,
      { serviceCode, serviceName, description, Status: status ? 1 : 0, ServiceID: id }
    );

    res.json({ message: 'Service updated successfully' });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    await executeNonQuery(
      'UPDATE Services SET Status = 0 WHERE ServiceID = @ServiceID',
      { ServiceID: id }
    );

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
};

// Items (Master Catalog)
const getAllItems = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const items = await executeQuery(
      'SELECT * FROM Items WHERE CompanyID = @CompanyID ORDER BY ItemName',
      { CompanyID: companyId }
    );
    res.json(items);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

const createItem = async (req, res) => {
  try {
    const { itemCode, itemName, description, unit } = req.body;

    if (!itemCode || !itemName) {
      return res.status(400).json({ error: 'Item code and name are required' });
    }

    const result = await executeNonQuery(
      `INSERT INTO Items (ItemCode, ItemName, Description, Unit, CompanyID, Status)
       VALUES (@ItemCode, @ItemName, @Description, @Unit, @CompanyID, 1)`,
      { itemCode, itemName, description, unit, CompanyID: req.user.companyId }
    );

    res.status(201).json({ message: 'Item created successfully', itemId: result });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
};

const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemCode, itemName, description, unit, status } = req.body;

    await executeNonQuery(
      `UPDATE Items 
       SET ItemCode = @ItemCode, ItemName = @ItemName, Description = @Description, Unit = @Unit, Status = @Status, UpdatedAt = GETDATE()
       WHERE ItemID = @ItemID`,
      { itemCode, itemName, description, unit, Status: status ? 1 : 0, ItemID: id }
    );

    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    await executeNonQuery(
      'UPDATE Items SET Status = 0 WHERE ItemID = @ItemID',
      { ItemID: id }
    );

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

// Item Stock
const getItemStock = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const stock = await executeQuery(
      `SELECT istk.*, i.ItemName, i.ItemCode
       FROM ItemStock istk
       INNER JOIN Items i ON istk.ItemID = i.ItemID
       WHERE istk.CompanyID = @CompanyID
       ORDER BY i.ItemName`,
      { CompanyID: companyId }
    );
    res.json(stock);
  } catch (error) {
    console.error('Get item stock error:', error);
    res.status(500).json({ error: 'Failed to fetch item stock' });
  }
};

const updateItemStock = async (req, res) => {
  try {
    const { itemId, quantity, price, reorderLevel } = req.body;

    if (!itemId) {
      return res.status(400).json({ error: 'Item ID is required' });
    }

    const existing = await executeScalar(
      'SELECT StockID FROM ItemStock WHERE ItemID = @ItemID AND CompanyID = @CompanyID',
      { ItemID: itemId, CompanyID: req.user.companyId }
    );

    if (existing) {
      await executeNonQuery(
        `UPDATE ItemStock 
         SET Quantity = @Quantity, Price = @Price, ReorderLevel = @ReorderLevel, UpdatedAt = GETDATE()
         WHERE ItemID = @ItemID AND CompanyID = @CompanyID`,
        { Quantity: quantity || 0, Price: price || 0, ReorderLevel: reorderLevel || 0, ItemID: itemId, CompanyID: req.user.companyId }
      );
    } else {
      await executeNonQuery(
        `INSERT INTO ItemStock (ItemID, CompanyID, Quantity, Price, ReorderLevel)
         VALUES (@ItemID, @CompanyID, @Quantity, @Price, @ReorderLevel)`,
        { ItemID: itemId, CompanyID: req.user.companyId, Quantity: quantity || 0, Price: price || 0, ReorderLevel: reorderLevel || 0 }
      );
    }

    res.json({ message: 'Item stock updated successfully' });
  } catch (error) {
    console.error('Update item stock error:', error);
    res.status(500).json({ error: 'Failed to update item stock' });
  }
};

// Area Codes
const getAllAreaCodes = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const areaCodes = await executeQuery(
      'SELECT * FROM AreaCodes WHERE CompanyID = @CompanyID ORDER BY Priority DESC, AreaCode',
      { CompanyID: companyId }
    );
    res.json(areaCodes);
  } catch (error) {
    console.error('Get area codes error:', error);
    res.status(500).json({ error: 'Failed to fetch area codes' });
  }
};

const createAreaCode = async (req, res) => {
  try {
    const { areaCode, description, priority } = req.body;

    if (!areaCode) {
      return res.status(400).json({ error: 'Area code is required' });
    }

    const result = await executeNonQuery(
      `INSERT INTO AreaCodes (AreaCode, Description, Priority, CompanyID, Status)
       VALUES (@AreaCode, @Description, @Priority, @CompanyID, 1)`,
      { areaCode, description, Priority: priority || 0, CompanyID: req.user.companyId }
    );

    res.status(201).json({ message: 'Area code created successfully', areaCodeId: result });
  } catch (error) {
    console.error('Create area code error:', error);
    res.status(500).json({ error: 'Failed to create area code' });
  }
};

const updateAreaCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { areaCode, description, priority, status } = req.body;

    await executeNonQuery(
      `UPDATE AreaCodes 
       SET AreaCode = @AreaCode, Description = @Description, Priority = @Priority, Status = @Status, UpdatedAt = GETDATE()
       WHERE AreaCodeID = @AreaCodeID`,
      { areaCode, description, Priority: priority || 0, Status: status ? 1 : 0, AreaCodeID: id }
    );

    res.json({ message: 'Area code updated successfully' });
  } catch (error) {
    console.error('Update area code error:', error);
    res.status(500).json({ error: 'Failed to update area code' });
  }
};

const deleteAreaCode = async (req, res) => {
  try {
    const { id } = req.params;

    await executeNonQuery(
      'UPDATE AreaCodes SET Status = 0 WHERE AreaCodeID = @AreaCodeID',
      { AreaCodeID: id }
    );

    res.json({ message: 'Area code deleted successfully' });
  } catch (error) {
    console.error('Delete area code error:', error);
    res.status(500).json({ error: 'Failed to delete area code' });
  }
};

// Contract Categories
const getAllContractCategories = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const categories = await executeQuery(
      'SELECT * FROM ContractCategories WHERE CompanyID = @CompanyID ORDER BY CategoryName',
      { CompanyID: companyId }
    );
    res.json(categories);
  } catch (error) {
    console.error('Get contract categories error:', error);
    res.status(500).json({ error: 'Failed to fetch contract categories' });
  }
};

const createContractCategory = async (req, res) => {
  try {
    const { categoryCode, categoryName, description, contractStatus } = req.body;

    if (!categoryCode || !categoryName) {
      return res.status(400).json({ error: 'Category code and name are required' });
    }

    await executeNonQuery(
      `INSERT INTO ContractCategories (CategoryCode, CategoryName, Description, ContractStatus, CompanyID, Status)
       VALUES (@CategoryCode, @CategoryName, @Description, @ContractStatus, @CompanyID, 1)`,
      { categoryCode, categoryName, description, contractStatus: contractStatus || 'MC', CompanyID: req.user.companyId }
    );

    res.status(201).json({ message: 'Contract category created successfully' });
  } catch (error) {
    console.error('Create contract category error:', error);
    res.status(500).json({ error: 'Failed to create contract category' });
  }
};

const updateContractCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryCode, categoryName, description, contractStatus, status } = req.body;

    await executeNonQuery(
      `UPDATE ContractCategories 
       SET CategoryCode = @CategoryCode, CategoryName = @CategoryName, Description = @Description, ContractStatus = @ContractStatus, Status = @Status, UpdatedAt = GETDATE()
       WHERE CategoryID = @CategoryID`,
      { categoryCode, categoryName, description, contractStatus: contractStatus || 'MC', Status: status ? 1 : 0, CategoryID: id }
    );

    res.json({ message: 'Contract category updated successfully' });
  } catch (error) {
    console.error('Update contract category error:', error);
    res.status(500).json({ error: 'Failed to update contract category' });
  }
};

const deleteContractCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await executeNonQuery(
      'UPDATE ContractCategories SET Status = 0 WHERE CategoryID = @CategoryID',
      { CategoryID: id }
    );

    res.json({ message: 'Contract category deleted successfully' });
  } catch (error) {
    console.error('Delete contract category error:', error);
    res.status(500).json({ error: 'Failed to delete contract category' });
  }
};

// Contract Periods CRUD
const getAllContractPeriods = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const periods = await executeQuery(
      'SELECT * FROM ContractPeriods WHERE CompanyID = @CompanyID ORDER BY DurationMonths',
      { CompanyID: companyId }
    );
    res.json(periods);
  } catch (error) {
    console.error('Get contract periods error:', error);
    res.status(500).json({ error: 'Failed to fetch contract periods' });
  }
};

const createContractPeriod = async (req, res) => {
  try {
    const { periodCode, periodName, description, durationMonths } = req.body;

    if (!periodCode || !periodName || !durationMonths) {
      return res.status(400).json({ error: 'Period code, name, and duration are required' });
    }

    await executeNonQuery(
      `INSERT INTO ContractPeriods (PeriodCode, PeriodName, Description, DurationMonths, CompanyID, Status)
       VALUES (@PeriodCode, @PeriodName, @Description, @DurationMonths, @CompanyID, 1)`,
      { periodCode, periodName, description, durationMonths, CompanyID: req.user.companyId }
    );

    res.status(201).json({ message: 'Contract period created successfully' });
  } catch (error) {
    console.error('Create contract period error:', error);
    res.status(500).json({ error: 'Failed to create contract period' });
  }
};

const updateContractPeriod = async (req, res) => {
  try {
    const { id } = req.params;
    const { periodCode, periodName, description, durationMonths, status } = req.body;

    await executeNonQuery(
      `UPDATE ContractPeriods 
       SET PeriodCode = @PeriodCode, PeriodName = @PeriodName, Description = @Description, DurationMonths = @DurationMonths, Status = @Status, UpdatedAt = GETDATE()
       WHERE PeriodID = @PeriodID`,
      { periodCode, periodName, description, durationMonths, Status: status ? 1 : 0, PeriodID: id }
    );

    res.json({ message: 'Contract period updated successfully' });
  } catch (error) {
    console.error('Update contract period error:', error);
    res.status(500).json({ error: 'Failed to update contract period' });
  }
};

const deleteContractPeriod = async (req, res) => {
  try {
    const { id } = req.params;

    await executeNonQuery(
      'UPDATE ContractPeriods SET Status = 0 WHERE PeriodID = @PeriodID',
      { PeriodID: id }
    );

    res.json({ message: 'Contract period deleted successfully' });
  } catch (error) {
    console.error('Delete contract period error:', error);
    res.status(500).json({ error: 'Failed to delete contract period' });
  }
};

// Companies CRUD
const getAllCompanies = async (req, res) => {
  try {
    const companies = await executeQuery('SELECT * FROM Companies ORDER BY CompanyName');
    res.json(companies);
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

const createCompany = async (req, res) => {
  try {
    const { companyCode, companyName, address, city } = req.body;
    if (!companyCode || !companyName) {
      return res.status(400).json({ error: 'Company code and name are required' });
    }
    await executeNonQuery(
      `INSERT INTO Companies (CompanyCode, CompanyName, Address, City)
       VALUES (@CompanyCode, @CompanyName, @Address, @City)`,
      { companyCode, companyName, address, city }
    );
    res.status(201).json({ message: 'Company created successfully' });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
};

const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyCode, companyName, address, city } = req.body;
    await executeNonQuery(
      `UPDATE Companies SET CompanyCode = @CompanyCode, CompanyName = @CompanyName, Address = @Address, City = @City
       WHERE CompanyID = @CompanyID`,
      { companyCode, companyName, address, city, CompanyID: id }
    );
    res.json({ message: 'Company updated successfully' });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    await executeNonQuery('DELETE FROM Companies WHERE CompanyID = @CompanyID', { CompanyID: id });
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
};

// Users CRUD
const getAllUsers = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const users = await executeQuery(
      `SELECT UserID, Username, FullName, Email, Phone, Role, Status, CreatedAt 
       FROM Users WHERE CompanyID = @CompanyID ORDER BY FullName`,
      { CompanyID: companyId }
    );
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, password, fullName, email, phone, role } = req.body;
    if (!username || !password || !fullName || !role) {
      return res.status(400).json({ error: 'Username, password, full name, and role are required' });
    }
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);
    await executeNonQuery(
      `INSERT INTO Users (Username, Password, FullName, Email, Phone, Role, CompanyID, Status)
       VALUES (@Username, @Password, @FullName, @Email, @Phone, @Role, @CompanyID, 1)`,
      { username, Password: hashedPassword, fullName, email, phone, role, CompanyID: req.user.companyId }
    );
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, fullName, email, phone, role, status, password } = req.body;
    let query = `UPDATE Users SET Username = @Username, FullName = @FullName, Email = @Email, Phone = @Phone, Role = @Role, Status = @Status`;
    let params = { username, fullName, email, phone, role, Status: status ? 1 : 0, UserID: id };
    
    if (password) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', Password = @Password';
      params.Password = hashedPassword;
    }
    
    query += ' WHERE UserID = @UserID';
    await executeNonQuery(query, params);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await executeNonQuery('UPDATE Users SET Status = 0 WHERE UserID = @UserID', { UserID: id });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Service Hours CRUD
const getAllServiceHours = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const hours = await executeQuery(
      'SELECT * FROM ServiceHours WHERE CompanyID = @CompanyID ORDER BY DayOfWeek',
      { CompanyID: companyId }
    );
    res.json(hours);
  } catch (error) {
    console.error('Get service hours error:', error);
    res.status(500).json({ error: 'Failed to fetch service hours' });
  }
};

const createServiceHours = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime } = req.body;
    if (!dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({ error: 'Day of week, start time, and end time are required' });
    }
    await executeNonQuery(
      `INSERT INTO ServiceHours (DayOfWeek, StartTime, EndTime, CompanyID)
       VALUES (@DayOfWeek, @StartTime, @EndTime, @CompanyID)`,
      { dayOfWeek, startTime, endTime, CompanyID: req.user.companyId }
    );
    res.status(201).json({ message: 'Service hours created successfully' });
  } catch (error) {
    console.error('Create service hours error:', error);
    res.status(500).json({ error: 'Failed to create service hours' });
  }
};

const updateServiceHours = async (req, res) => {
  try {
    const { id } = req.params;
    const { dayOfWeek, startTime, endTime } = req.body;
    await executeNonQuery(
      `UPDATE ServiceHours SET DayOfWeek = @DayOfWeek, StartTime = @StartTime, EndTime = @EndTime
       WHERE ServiceHoursID = @ServiceHoursID`,
      { dayOfWeek, startTime, endTime, ServiceHoursID: id }
    );
    res.json({ message: 'Service hours updated successfully' });
  } catch (error) {
    console.error('Update service hours error:', error);
    res.status(500).json({ error: 'Failed to update service hours' });
  }
};

const deleteServiceHours = async (req, res) => {
  try {
    const { id } = req.params;
    await executeNonQuery('DELETE FROM ServiceHours WHERE ServiceHoursID = @ServiceHoursID', { ServiceHoursID: id });
    res.json({ message: 'Service hours deleted successfully' });
  } catch (error) {
    console.error('Delete service hours error:', error);
    res.status(500).json({ error: 'Failed to delete service hours' });
  }
};

// UserAccess CRUD
const getAllUserAccess = async (req, res) => {
  try {
    const access = await executeQuery(
      `SELECT ua.*, u.FullName, u.Username 
       FROM UserAccess ua 
       INNER JOIN Users u ON ua.UserID = u.UserID 
       ORDER BY u.FullName, ua.FormName`
    );
    res.json(access);
  } catch (error) {
    console.error('Get user access error:', error);
    res.status(500).json({ error: 'Failed to fetch user access' });
  }
};

const createUserAccess = async (req, res) => {
  try {
    const { userId, formName, canView, canAdd, canEdit, canDelete } = req.body;
    if (!userId || !formName) {
      return res.status(400).json({ error: 'User ID and form name are required' });
    }
    await executeNonQuery(
      `INSERT INTO UserAccess (UserID, FormName, CanView, CanAdd, CanEdit, CanDelete)
       VALUES (@UserID, @FormName, @CanView, @CanAdd, @CanEdit, @CanDelete)`,
      { userId, formName, CanView: canView ? 1 : 0, CanAdd: canAdd ? 1 : 0, CanEdit: canEdit ? 1 : 0, CanDelete: canDelete ? 1 : 0 }
    );
    res.status(201).json({ message: 'User access created successfully' });
  } catch (error) {
    console.error('Create user access error:', error);
    res.status(500).json({ error: 'Failed to create user access' });
  }
};

const updateUserAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { formName, canView, canAdd, canEdit, canDelete } = req.body;
    await executeNonQuery(
      `UPDATE UserAccess SET FormName = @FormName, CanView = @CanView, CanAdd = @CanAdd, CanEdit = @CanEdit, CanDelete = @CanDelete
       WHERE AccessID = @AccessID`,
      { formName, CanView: canView ? 1 : 0, CanAdd: canAdd ? 1 : 0, CanEdit: canEdit ? 1 : 0, CanDelete: canDelete ? 1 : 0, AccessID: id }
    );
    res.json({ message: 'User access updated successfully' });
  } catch (error) {
    console.error('Update user access error:', error);
    res.status(500).json({ error: 'Failed to update user access' });
  }
};

const deleteUserAccess = async (req, res) => {
  try {
    const { id } = req.params;
    await executeNonQuery('DELETE FROM UserAccess WHERE AccessID = @AccessID', { AccessID: id });
    res.json({ message: 'User access deleted successfully' });
  } catch (error) {
    console.error('Delete user access error:', error);
    res.status(500).json({ error: 'Failed to delete user access' });
  }
};

// CustomerSystems CRUD
const getAllCustomerSystems = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const systems = await executeQuery(
      `SELECT cs.*, c.CustomerName, c.CustomerCode, s.SystemName, s.SystemCode
       FROM CustomerSystems cs
       INNER JOIN Customers c ON cs.CustomerID = c.CustomerID
       INNER JOIN Systems s ON cs.SystemID = s.SystemID
       WHERE c.CompanyID = @CompanyID
       ORDER BY c.CustomerName, s.SystemName`,
      { CompanyID: companyId }
    );
    res.json(systems);
  } catch (error) {
    console.error('Get customer systems error:', error);
    res.status(500).json({ error: 'Failed to fetch customer systems' });
  }
};

const createCustomerSystem = async (req, res) => {
  try {
    const { customerId, systemId, systemType, serialNumber, installationDate } = req.body;
    if (!customerId || !systemId) {
      return res.status(400).json({ error: 'Customer ID and system ID are required' });
    }
    await executeNonQuery(
      `INSERT INTO CustomerSystems (CustomerID, SystemID, SystemType, SerialNumber, InstallationDate)
       VALUES (@CustomerID, @SystemID, @SystemType, @SerialNumber, @InstallationDate)`,
      { customerId, systemId, systemType, serialNumber, installationDate }
    );
    res.status(201).json({ message: 'Customer system created successfully' });
  } catch (error) {
    console.error('Create customer system error:', error);
    res.status(500).json({ error: 'Failed to create customer system' });
  }
};

const updateCustomerSystem = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, systemId, systemType, serialNumber, installationDate } = req.body;
    await executeNonQuery(
      `UPDATE CustomerSystems SET CustomerID = @CustomerID, SystemID = @SystemID, SystemType = @SystemType, SerialNumber = @SerialNumber, InstallationDate = @InstallationDate
       WHERE CustomerSystemID = @CustomerSystemID`,
      { customerId, systemId, systemType, serialNumber, installationDate, CustomerSystemID: id }
    );
    res.json({ message: 'Customer system updated successfully' });
  } catch (error) {
    console.error('Update customer system error:', error);
    res.status(500).json({ error: 'Failed to update customer system' });
  }
};

const deleteCustomerSystem = async (req, res) => {
  try {
    const { id } = req.params;
    await executeNonQuery('DELETE FROM CustomerSystems WHERE CustomerSystemID = @CustomerSystemID', { CustomerSystemID: id });
    res.json({ message: 'Customer system deleted successfully' });
  } catch (error) {
    console.error('Delete customer system error:', error);
    res.status(500).json({ error: 'Failed to delete customer system' });
  }
};

// ServiceContracts CRUD
const getAllServiceContracts = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const contracts = await executeQuery(
      `SELECT sc.*, c.CustomerName, c.CustomerCode, cc.CategoryName, cs.SystemType
       FROM ServiceContracts sc
       INNER JOIN Customers c ON sc.CustomerID = c.CustomerID
       LEFT JOIN CustomerSystems cs ON sc.CustomerSystemID = cs.CustomerSystemID
       LEFT JOIN ContractCategories cc ON sc.CategoryID = cc.CategoryID
       WHERE c.CompanyID = @CompanyID
       ORDER BY sc.ContractDate DESC`,
      { CompanyID: companyId }
    );
    res.json(contracts);
  } catch (error) {
    console.error('Get service contracts error:', error);
    res.status(500).json({ error: 'Failed to fetch service contracts' });
  }
};

const createServiceContract = async (req, res) => {
  try {
    const { customerId, customerSystemId, categoryId, contractPeriod, contractDate, status } = req.body;
    if (!customerId || !categoryId) {
      return res.status(400).json({ error: 'Customer ID and category ID are required' });
    }
    await executeNonQuery(
      `INSERT INTO ServiceContracts (CustomerID, CustomerSystemID, CategoryID, ContractPeriod, ContractDate, Status)
       VALUES (@CustomerID, @CustomerSystemID, @CategoryID, @ContractPeriod, @ContractDate, @Status)`,
      { customerId, customerSystemId, categoryId, contractPeriod, contractDate, Status: status || 'Active' }
    );
    res.status(201).json({ message: 'Service contract created successfully' });
  } catch (error) {
    console.error('Create service contract error:', error);
    res.status(500).json({ error: 'Failed to create service contract' });
  }
};

const updateServiceContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, customerSystemId, categoryId, contractPeriod, contractDate, status } = req.body;
    await executeNonQuery(
      `UPDATE ServiceContracts SET CustomerID = @CustomerID, CustomerSystemID = @CustomerSystemID, CategoryID = @CategoryID, ContractPeriod = @ContractPeriod, ContractDate = @ContractDate, Status = @Status
       WHERE ContractID = @ContractID`,
      { customerId, customerSystemId, categoryId, contractPeriod, contractDate, Status: status, ContractID: id }
    );
    res.json({ message: 'Service contract updated successfully' });
  } catch (error) {
    console.error('Update service contract error:', error);
    res.status(500).json({ error: 'Failed to update service contract' });
  }
};

const deleteServiceContract = async (req, res) => {
  try {
    const { id } = req.params;
    await executeNonQuery('DELETE FROM ServiceContracts WHERE ContractID = @ContractID', { ContractID: id });
    res.json({ message: 'Service contract deleted successfully' });
  } catch (error) {
    console.error('Delete service contract error:', error);
    res.status(500).json({ error: 'Failed to delete service contract' });
  }
};

// Schedule CRUD
const getAllSchedules = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const schedules = await executeQuery(
      `SELECT s.*, c.CustomerName, se.EngineerName, sm.SalesNo
       FROM Schedule s
       INNER JOIN SalesMaster sm ON s.SalesNo = sm.SalesNo
       INNER JOIN Customers c ON sm.CustomerID = c.CustomerID
       LEFT JOIN ServiceEngineers se ON s.EngineerID = se.EngineerID
       WHERE c.CompanyID = @CompanyID
       ORDER BY s.ScheduleDate DESC`,
      { CompanyID: companyId }
    );
    res.json(schedules);
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
};

const createSchedule = async (req, res) => {
  try {
    const { salesNo, scheduleDate, serviceTime, engineerId, status } = req.body;
    if (!salesNo || !scheduleDate) {
      return res.status(400).json({ error: 'Sales number and schedule date are required' });
    }
    await executeNonQuery(
      `INSERT INTO Schedule (SalesNo, ScheduleDate, ServiceTime, EngineerID, Status)
       VALUES (@SalesNo, @ScheduleDate, @ServiceTime, @EngineerID, @Status)`,
      { salesNo, scheduleDate, serviceTime, engineerId, Status: status || 'Pending' }
    );
    res.status(201).json({ message: 'Schedule created successfully' });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { salesNo, scheduleDate, serviceTime, engineerId, status } = req.body;
    await executeNonQuery(
      `UPDATE Schedule SET SalesNo = @SalesNo, ScheduleDate = @ScheduleDate, ServiceTime = @ServiceTime, EngineerID = @EngineerID, Status = @Status
       WHERE ScheduleID = @ScheduleID`,
      { salesNo, scheduleDate, serviceTime, engineerId, Status: status, ScheduleID: id }
    );
    res.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    await executeNonQuery('DELETE FROM Schedule WHERE ScheduleID = @ScheduleID', { ScheduleID: id });
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
};

// Complaints CRUD
const getAllComplaints = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const complaints = await executeQuery(
      `SELECT comp.*, c.CustomerName, sm.SalesNo
       FROM Complaints comp
       INNER JOIN SalesMaster sm ON comp.SalesNo = sm.SalesNo
       INNER JOIN Customers c ON sm.CustomerID = c.CustomerID
       WHERE c.CompanyID = @CompanyID
       ORDER BY comp.ComplaintDate DESC`,
      { CompanyID: companyId }
    );
    res.json(complaints);
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

const createComplaint = async (req, res) => {
  try {
    const { salesNo, description, status } = req.body;
    if (!salesNo || !description) {
      return res.status(400).json({ error: 'Sales number and description are required' });
    }
    await executeNonQuery(
      `INSERT INTO Complaints (SalesNo, Description, Status)
       VALUES (@SalesNo, @Description, @Status)`,
      { salesNo, description, Status: status || 'Open' }
    );
    res.status(201).json({ message: 'Complaint created successfully' });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
};

const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { salesNo, description, status } = req.body;
    await executeNonQuery(
      `UPDATE Complaints SET SalesNo = @SalesNo, Description = @Description, Status = @Status
       WHERE ComplaintID = @ComplaintID`,
      { salesNo, description, Status: status, ComplaintID: id }
    );
    res.json({ message: 'Complaint updated successfully' });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ error: 'Failed to update complaint' });
  }
};

const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    await executeNonQuery('DELETE FROM Complaints WHERE ComplaintID = @ComplaintID', { ComplaintID: id });
    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
};

// Contract Category Systems/Services/Items CRUD
const getAllContractCategorySystems = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const mappings = await executeQuery(
      `SELECT ccs.*, s.SystemName, s.SystemCode, cc.CategoryName
       FROM ContractCategorySystems ccs
       INNER JOIN Systems s ON ccs.SystemID = s.SystemID
       INNER JOIN ContractCategories cc ON ccs.CategoryID = cc.CategoryID
       WHERE ccs.CompanyID = @CompanyID AND ccs.Status = 1
       ORDER BY cc.CategoryName, s.SystemName`,
      { CompanyID: companyId }
    );
    res.json(mappings);
  } catch (error) {
    console.error('Get contract category systems error:', error);
    res.status(500).json({ error: 'Failed to fetch contract category systems' });
  }
};

const createContractCategorySystem = async (req, res) => {
  try {
    const { categoryId, systemId, cost } = req.body;
    if (!categoryId || !systemId) {
      return res.status(400).json({ error: 'Category ID and system ID are required' });
    }
    await executeNonQuery(
      `INSERT INTO ContractCategorySystems (CategoryID, SystemID, Cost, CompanyID, Status)
       VALUES (@CategoryID, @SystemID, @Cost, @CompanyID, 1)`,
      { categoryId, systemId, cost: cost || 0, CompanyID: req.user.companyId }
    );
    res.status(201).json({ message: 'Contract category system created successfully' });
  } catch (error) {
    console.error('Create contract category system error:', error);
    res.status(500).json({ error: 'Failed to create contract category system' });
  }
};

const updateContractCategorySystem = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, systemId, cost, status } = req.body;
    await executeNonQuery(
      `UPDATE ContractCategorySystems SET CategoryID = @CategoryID, SystemID = @SystemID, Cost = @Cost, Status = @Status
       WHERE MappingID = @MappingID`,
      { categoryId, systemId, cost, Status: status ? 1 : 0, MappingID: id }
    );
    res.json({ message: 'Contract category system updated successfully' });
  } catch (error) {
    console.error('Update contract category system error:', error);
    res.status(500).json({ error: 'Failed to update contract category system' });
  }
};

const deleteContractCategorySystem = async (req, res) => {
  try {
    const { id } = req.params;
    await executeNonQuery('UPDATE ContractCategorySystems SET Status = 0 WHERE MappingID = @MappingID', { MappingID: id });
    res.json({ message: 'Contract category system deleted successfully' });
  } catch (error) {
    console.error('Delete contract category system error:', error);
    res.status(500).json({ error: 'Failed to delete contract category system' });
  }
};

const getAllContractCategoryServices = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const mappings = await executeQuery(
      `SELECT ccs.*, s.ServiceName, s.ServiceCode, cc.CategoryName
       FROM ContractCategoryServices ccs
       INNER JOIN Services s ON ccs.ServiceID = s.ServiceID
       INNER JOIN ContractCategories cc ON ccs.CategoryID = cc.CategoryID
       WHERE ccs.CompanyID = @CompanyID AND ccs.Status = 1
       ORDER BY cc.CategoryName, s.ServiceName`,
      { CompanyID: companyId }
    );
    res.json(mappings);
  } catch (error) {
    console.error('Get contract category services error:', error);
    res.status(500).json({ error: 'Failed to fetch contract category services' });
  }
};

const createContractCategoryService = async (req, res) => {
  try {
    const { categoryId, serviceId, cost, serviceTime } = req.body;
    if (!categoryId || !serviceId) {
      return res.status(400).json({ error: 'Category ID and service ID are required' });
    }
    await executeNonQuery(
      `INSERT INTO ContractCategoryServices (CategoryID, ServiceID, Cost, ServiceTime, CompanyID, Status)
       VALUES (@CategoryID, @ServiceID, @Cost, @ServiceTime, @CompanyID, 1)`,
      { categoryId, serviceId, cost: cost || 0, serviceTime: serviceTime || 0, CompanyID: req.user.companyId }
    );
    res.status(201).json({ message: 'Contract category service created successfully' });
  } catch (error) {
    console.error('Create contract category service error:', error);
    res.status(500).json({ error: 'Failed to create contract category service' });
  }
};

const updateContractCategoryService = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, serviceId, cost, serviceTime, status } = req.body;
    await executeNonQuery(
      `UPDATE ContractCategoryServices SET CategoryID = @CategoryID, ServiceID = @ServiceID, Cost = @Cost, ServiceTime = @ServiceTime, Status = @Status
       WHERE MappingID = @MappingID`,
      { categoryId, serviceId, cost, serviceTime, Status: status ? 1 : 0, MappingID: id }
    );
    res.json({ message: 'Contract category service updated successfully' });
  } catch (error) {
    console.error('Update contract category service error:', error);
    res.status(500).json({ error: 'Failed to update contract category service' });
  }
};

const deleteContractCategoryService = async (req, res) => {
  try {
    const { id } = req.params;
    await executeNonQuery('UPDATE ContractCategoryServices SET Status = 0 WHERE MappingID = @MappingID', { MappingID: id });
    res.json({ message: 'Contract category service deleted successfully' });
  } catch (error) {
    console.error('Delete contract category service error:', error);
    res.status(500).json({ error: 'Failed to delete contract category service' });
  }
};

const getAllContractCategoryItems = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const mappings = await executeQuery(
      `SELECT cci.*, i.ItemName, i.ItemCode, cc.CategoryName
       FROM ContractCategoryItems cci
       INNER JOIN Items i ON cci.ItemID = i.ItemID
       INNER JOIN ContractCategories cc ON cci.CategoryID = cc.CategoryID
       WHERE cci.CompanyID = @CompanyID AND cci.Status = 1
       ORDER BY cc.CategoryName, i.ItemName`,
      { CompanyID: companyId }
    );
    res.json(mappings);
  } catch (error) {
    console.error('Get contract category items error:', error);
    res.status(500).json({ error: 'Failed to fetch contract category items' });
  }
};

const createContractCategoryItem = async (req, res) => {
  try {
    const { categoryId, itemId, cost } = req.body;
    if (!categoryId || !itemId) {
      return res.status(400).json({ error: 'Category ID and item ID are required' });
    }
    await executeNonQuery(
      `INSERT INTO ContractCategoryItems (CategoryID, ItemID, Cost, CompanyID, Status)
       VALUES (@CategoryID, @ItemID, @Cost, @CompanyID, 1)`,
      { categoryId, itemId, cost: cost || 0, CompanyID: req.user.companyId }
    );
    res.status(201).json({ message: 'Contract category item created successfully' });
  } catch (error) {
    console.error('Create contract category item error:', error);
    res.status(500).json({ error: 'Failed to create contract category item' });
  }
};

const updateContractCategoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, itemId, cost, status } = req.body;
    await executeNonQuery(
      `UPDATE ContractCategoryItems SET CategoryID = @CategoryID, ItemID = @ItemID, Cost = @Cost, Status = @Status
       WHERE MappingID = @MappingID`,
      { categoryId, itemId, cost, Status: status ? 1 : 0, MappingID: id }
    );
    res.json({ message: 'Contract category item updated successfully' });
  } catch (error) {
    console.error('Update contract category item error:', error);
    res.status(500).json({ error: 'Failed to update contract category item' });
  }
};

const deleteContractCategoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    await executeNonQuery('UPDATE ContractCategoryItems SET Status = 0 WHERE MappingID = @MappingID', { MappingID: id });
    res.json({ message: 'Contract category item deleted successfully' });
  } catch (error) {
    console.error('Delete contract category item error:', error);
    res.status(500).json({ error: 'Failed to delete contract category item' });
  }
};

// Contract Intervals
const getAllContractIntervals = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const intervals = await executeQuery(
      'SELECT * FROM ContractIntervals WHERE CompanyID = @CompanyID ORDER BY IntervalDays',
      { CompanyID: companyId }
    );
    res.json(intervals);
  } catch (error) {
    console.error('Get contract intervals error:', error);
    res.status(500).json({ error: 'Failed to fetch contract intervals' });
  }
};

const createContractInterval = async (req, res) => {
  try {
    const { intervalDays, intervalName, description } = req.body;

    if (!intervalDays || !intervalName) {
      return res.status(400).json({ error: 'Interval days and name are required' });
    }

    const result = await executeNonQuery(
      `INSERT INTO ContractIntervals (IntervalDays, IntervalName, Description, CompanyID, Status)
       VALUES (@IntervalDays, @IntervalName, @Description, @CompanyID, 1)`,
      { intervalDays, intervalName, description, CompanyID: req.user.companyId }
    );

    res.status(201).json({ message: 'Contract interval created successfully', intervalId: result });
  } catch (error) {
    console.error('Create contract interval error:', error);
    res.status(500).json({ error: 'Failed to create contract interval' });
  }
};

const updateContractInterval = async (req, res) => {
  try {
    const { id } = req.params;
    const { intervalDays, intervalName, description, status } = req.body;

    await executeNonQuery(
      `UPDATE ContractIntervals 
       SET IntervalDays = @IntervalDays, IntervalName = @IntervalName, Description = @Description, Status = @Status, UpdatedAt = GETDATE()
       WHERE IntervalID = @IntervalID`,
      { intervalDays, intervalName, description, Status: status ? 1 : 0, IntervalID: id }
    );

    res.json({ message: 'Contract interval updated successfully' });
  } catch (error) {
    console.error('Update contract interval error:', error);
    res.status(500).json({ error: 'Failed to update contract interval' });
  }
};

const deleteContractInterval = async (req, res) => {
  try {
    const { id } = req.params;

    await executeNonQuery(
      'UPDATE ContractIntervals SET Status = 0 WHERE IntervalID = @IntervalID',
      { IntervalID: id }
    );

    res.json({ message: 'Contract interval deleted successfully' });
  } catch (error) {
    console.error('Delete contract interval error:', error);
    res.status(500).json({ error: 'Failed to delete contract interval' });
  }
};

// Service Intervals
const getAllServiceIntervals = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const intervals = await executeQuery(
      'SELECT * FROM ServiceIntervals WHERE CompanyID = @CompanyID ORDER BY IntervalDays',
      { CompanyID: companyId }
    );
    res.json(intervals);
  } catch (error) {
    console.error('Get service intervals error:', error);
    res.status(500).json({ error: 'Failed to fetch service intervals' });
  }
};

const createServiceInterval = async (req, res) => {
  try {
    const { intervalDays, intervalName, description } = req.body;

    if (!intervalDays || !intervalName) {
      return res.status(400).json({ error: 'Interval days and name are required' });
    }

    const result = await executeNonQuery(
      `INSERT INTO ServiceIntervals (IntervalDays, IntervalName, Description, CompanyID, Status)
       VALUES (@IntervalDays, @IntervalName, @Description, @CompanyID, 1)`,
      { intervalDays, intervalName, description, CompanyID: req.user.companyId }
    );

    res.status(201).json({ message: 'Service interval created successfully', intervalId: result });
  } catch (error) {
    console.error('Create service interval error:', error);
    res.status(500).json({ error: 'Failed to create service interval' });
  }
};

const updateServiceInterval = async (req, res) => {
  try {
    const { id } = req.params;
    const { intervalDays, intervalName, description, status } = req.body;

    await executeNonQuery(
      `UPDATE ServiceIntervals 
       SET IntervalDays = @IntervalDays, IntervalName = @IntervalName, Description = @Description, Status = @Status, UpdatedAt = GETDATE()
       WHERE ServiceIntervalID = @ServiceIntervalID`,
      { intervalDays, intervalName, description, Status: status ? 1 : 0, ServiceIntervalID: id }
    );

    res.json({ message: 'Service interval updated successfully' });
  } catch (error) {
    console.error('Update service interval error:', error);
    res.status(500).json({ error: 'Failed to update service interval' });
  }
};

const deleteServiceInterval = async (req, res) => {
  try {
    const { id } = req.params;

    await executeNonQuery(
      'UPDATE ServiceIntervals SET Status = 0 WHERE ServiceIntervalID = @ServiceIntervalID',
      { ServiceIntervalID: id }
    );

    res.json({ message: 'Service interval deleted successfully' });
  } catch (error) {
    console.error('Delete service interval error:', error);
    res.status(500).json({ error: 'Failed to delete service interval' });
  }
};

// Service Cost
const getServiceCost = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const costs = await executeQuery(
      `SELECT sc.*, cc.CategoryName, s.ServiceName
       FROM ServiceCost sc
       INNER JOIN ContractCategories cc ON sc.CategoryID = cc.CategoryID
       INNER JOIN Services s ON sc.ServiceID = s.ServiceID
       WHERE sc.CompanyID = @CompanyID
       ORDER BY cc.CategoryName, s.ServiceName`,
      { CompanyID: companyId }
    );
    res.json(costs);
  } catch (error) {
    console.error('Get service cost error:', error);
    res.status(500).json({ error: 'Failed to fetch service cost' });
  }
};

const updateServiceCost = async (req, res) => {
  try {
    const { categoryId, serviceId, cost, serviceTime } = req.body;

    if (!categoryId || !serviceId) {
      return res.status(400).json({ error: 'Category ID and Service ID are required' });
    }

    const existing = await executeScalar(
      'SELECT ServiceCostID FROM ServiceCost WHERE CategoryID = @CategoryID AND ServiceID = @ServiceID AND CompanyID = @CompanyID',
      { CategoryID: categoryId, ServiceID: serviceId, CompanyID: req.user.companyId }
    );

    if (existing) {
      await executeNonQuery(
        `UPDATE ServiceCost 
         SET Cost = @Cost, ServiceTime = @ServiceTime, UpdatedAt = GETDATE()
         WHERE CategoryID = @CategoryID AND ServiceID = @ServiceID AND CompanyID = @CompanyID`,
        { Cost: cost || 0, ServiceTime: serviceTime || 0, CategoryID: categoryId, ServiceID: serviceId, CompanyID: req.user.companyId }
      );
    } else {
      await executeNonQuery(
        `INSERT INTO ServiceCost (CategoryID, ServiceID, Cost, ServiceTime, CompanyID)
         VALUES (@CategoryID, @ServiceID, @Cost, @ServiceTime, @CompanyID)`,
        { CategoryID: categoryId, ServiceID: serviceId, Cost: cost || 0, ServiceTime: serviceTime || 0, CompanyID: req.user.companyId }
      );
    }

    res.json({ message: 'Service cost updated successfully' });
  } catch (error) {
    console.error('Update service cost error:', error);
    res.status(500).json({ error: 'Failed to update service cost' });
  }
};

// System Cost
const getSystemCost = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const costs = await executeQuery(
      `SELECT sc.*, cc.CategoryName, s.SystemName
       FROM SystemCost sc
       INNER JOIN ContractCategories cc ON sc.CategoryID = cc.CategoryID
       INNER JOIN Systems s ON sc.SystemID = s.SystemID
       WHERE sc.CompanyID = @CompanyID
       ORDER BY cc.CategoryName, s.SystemName`,
      { CompanyID: companyId }
    );
    res.json(costs);
  } catch (error) {
    console.error('Get system cost error:', error);
    res.status(500).json({ error: 'Failed to fetch system cost' });
  }
};

const updateSystemCost = async (req, res) => {
  try {
    const { categoryId, systemId, cost } = req.body;

    if (!categoryId || !systemId) {
      return res.status(400).json({ error: 'Category ID and System ID are required' });
    }

    const existing = await executeScalar(
      'SELECT SystemCostID FROM SystemCost WHERE CategoryID = @CategoryID AND SystemID = @SystemID AND CompanyID = @CompanyID',
      { CategoryID: categoryId, SystemID: systemId, CompanyID: req.user.companyId }
    );

    if (existing) {
      await executeNonQuery(
        `UPDATE SystemCost 
         SET Cost = @Cost, UpdatedAt = GETDATE()
         WHERE CategoryID = @CategoryID AND SystemID = @SystemID AND CompanyID = @CompanyID`,
        { Cost: cost || 0, CategoryID: categoryId, SystemID: systemId, CompanyID: req.user.companyId }
      );
    } else {
      await executeNonQuery(
        `INSERT INTO SystemCost (CategoryID, SystemID, Cost, CompanyID)
         VALUES (@CategoryID, @SystemID, @Cost, @CompanyID)`,
        { CategoryID: categoryId, SystemID: systemId, Cost: cost || 0, CompanyID: req.user.companyId }
      );
    }

    res.json({ message: 'System cost updated successfully' });
  } catch (error) {
    console.error('Update system cost error:', error);
    res.status(500).json({ error: 'Failed to update system cost' });
  }
};

// Item Cost
const getItemCost = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const costs = await executeQuery(
      `SELECT ic.*, cc.CategoryName, i.ItemName
       FROM ItemCost ic
       INNER JOIN ContractCategories cc ON ic.CategoryID = cc.CategoryID
       INNER JOIN Items i ON ic.ItemID = i.ItemID
       WHERE ic.CompanyID = @CompanyID
       ORDER BY cc.CategoryName, i.ItemName`,
      { CompanyID: companyId }
    );
    res.json(costs);
  } catch (error) {
    console.error('Get item cost error:', error);
    res.status(500).json({ error: 'Failed to fetch item cost' });
  }
};

const updateItemCost = async (req, res) => {
  try {
    const { categoryId, itemId, cost } = req.body;

    if (!categoryId || !itemId) {
      return res.status(400).json({ error: 'Category ID and Item ID are required' });
    }

    const existing = await executeScalar(
      'SELECT ItemCostID FROM ItemCost WHERE CategoryID = @CategoryID AND ItemID = @ItemID AND CompanyID = @CompanyID',
      { CategoryID: categoryId, ItemID: itemId, CompanyID: req.user.companyId }
    );

    if (existing) {
      await executeNonQuery(
        `UPDATE ItemCost 
         SET Cost = @Cost, UpdatedAt = GETDATE()
         WHERE CategoryID = @CategoryID AND ItemID = @ItemID AND CompanyID = @CompanyID`,
        { Cost: cost || 0, CategoryID: categoryId, ItemID: itemId, CompanyID: req.user.companyId }
      );
    } else {
      await executeNonQuery(
        `INSERT INTO ItemCost (CategoryID, ItemID, Cost, CompanyID)
         VALUES (@CategoryID, @ItemID, @Cost, @CompanyID)`,
        { CategoryID: categoryId, ItemID: itemId, Cost: cost || 0, CompanyID: req.user.companyId }
      );
    }

    res.json({ message: 'Item cost updated successfully' });
  } catch (error) {
    console.error('Update item cost error:', error);
    res.status(500).json({ error: 'Failed to update item cost' });
  }
};

// Holidays
const getAllHolidays = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const holidays = await executeQuery(
      `SELECT * FROM Holidays WHERE CompanyID = @CompanyID ORDER BY HolidayDate DESC`,
      { CompanyID: companyId }
    );
    res.json(holidays);
  } catch (error) {
    console.error('Get holidays error:', error);
    res.status(500).json({ error: 'Failed to fetch holidays' });
  }
};

const createHoliday = async (req, res) => {
  try {
    const { holidayName, holidayDate, description } = req.body;
    if (!holidayName || !holidayDate) {
      return res.status(400).json({ error: 'Holiday name and date are required' });
    }
    const result = await executeNonQuery(
      `INSERT INTO Holidays (HolidayName, HolidayDate, Description, CompanyID, Status)
       VALUES (@HolidayName, @HolidayDate, @Description, @CompanyID, 1)`,
      { holidayName, holidayDate, description, CompanyID: req.user.companyId }
    );
    res.status(201).json({ message: 'Holiday created successfully', holidayId: result });
  } catch (error) {
    console.error('Create holiday error:', error);
    res.status(500).json({ error: 'Failed to create holiday' });
  }
};

const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { holidayName, holidayDate, description, status } = req.body;
    await executeNonQuery(
      `UPDATE Holidays SET HolidayName = @HolidayName, HolidayDate = @HolidayDate, Description = @Description, Status = @Status, UpdatedAt = GETDATE()
       WHERE HolidayID = @HolidayID`,
      { holidayName, holidayDate, description, Status: status ? 1 : 0, HolidayID: id }
    );
    res.json({ message: 'Holiday updated successfully' });
  } catch (error) {
    console.error('Update holiday error:', error);
    res.status(500).json({ error: 'Failed to update holiday' });
  }
};

const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    await executeNonQuery(
      'UPDATE Holidays SET Status = 0 WHERE HolidayID = @HolidayID',
      { HolidayID: id }
    );
    res.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error('Delete holiday error:', error);
    res.status(500).json({ error: 'Failed to delete holiday' });
  }
};

module.exports = {
  // Engineers
  getAllEngineers,
  createEngineer,
  updateEngineer,
  deleteEngineer,
  // Teams
  getAllTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  // Systems
  getAllSystems,
  createSystem,
  updateSystem,
  deleteSystem,
  // Services
  getAllServices,
  createService,
  updateService,
  deleteService,
  // Items
  getAllItems,
  createItem,
  updateItem,
  deleteItem,
  // Item Stock
  getItemStock,
  updateItemStock,
  // Area Codes
  getAllAreaCodes,
  createAreaCode,
  updateAreaCode,
  deleteAreaCode,
  // Contract Categories
  getAllContractCategories,
  createContractCategory,
  updateContractCategory,
  deleteContractCategory,
  // Contract Intervals
  getAllContractIntervals,
  createContractInterval,
  updateContractInterval,
  deleteContractInterval,
  // Service Intervals
  getAllServiceIntervals,
  createServiceInterval,
  updateServiceInterval,
  deleteServiceInterval,
  // Costs
  getServiceCost,
  updateServiceCost,
  getSystemCost,
  updateSystemCost,
  getItemCost,
  updateItemCost,
  // Holidays
  getAllHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday
};

// Get systems by contract type (for dynamic filtering in Sales Master Plan)
const getSystemsByContractType = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const companyId = req.user.companyId;
    const systems = await executeQuery(
      `SELECT s.*, ccs.Cost AS UnitCost
       FROM Systems s
       INNER JOIN ContractCategorySystems ccs ON s.SystemID = ccs.SystemID
       WHERE ccs.CategoryID = @CategoryID AND ccs.CompanyID = @CompanyID AND ccs.Status = 1 AND s.Status = 1
       ORDER BY s.SystemName`,
      { CategoryID: categoryId, CompanyID: companyId }
    );
    res.json(systems);
  } catch (error) {
    console.error('Get systems by contract type error:', error);
    res.status(500).json({ error: 'Failed to fetch systems' });
  }
};

// Get services by contract type (for dynamic filtering in Sales Master Plan)
const getServicesByContractType = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const companyId = req.user.companyId;
    const services = await executeQuery(
      `SELECT s.*, ccs.Cost AS UnitCost, ccs.ServiceTime
       FROM Services s
       INNER JOIN ContractCategoryServices ccs ON s.ServiceID = ccs.ServiceID
       WHERE ccs.CategoryID = @CategoryID AND ccs.CompanyID = @CompanyID AND ccs.Status = 1 AND s.Status = 1
       ORDER BY s.ServiceName`,
      { CategoryID: categoryId, CompanyID: companyId }
    );
    res.json(services);
  } catch (error) {
    console.error('Get services by contract type error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

// Get items by contract type (for dynamic filtering in Sales Master Plan)
const getItemsByContractType = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const companyId = req.user.companyId;
    const items = await executeQuery(
      `SELECT i.*, cci.Cost AS UnitCost
       FROM Items i
       INNER JOIN ContractCategoryItems cci ON i.ItemID = cci.ItemID
       WHERE cci.CategoryID = @CategoryID AND cci.CompanyID = @CompanyID AND cci.Status = 1 AND i.Status = 1
       ORDER BY i.ItemName`,
      { CategoryID: categoryId, CompanyID: companyId }
    );
    res.json(items);
  } catch (error) {
    console.error('Get items by contract type error:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

module.exports = {
  // Engineers
  getAllEngineers,
  createEngineer,
  updateEngineer,
  deleteEngineer,
  // Teams
  getAllTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  // Systems
  getAllSystems,
  createSystem,
  updateSystem,
  deleteSystem,
  // Services
  getAllServices,
  createService,
  updateService,
  deleteService,
  // Items
  getAllItems,
  createItem,
  updateItem,
  deleteItem,
  // Item Stock
  getItemStock,
  updateItemStock,
  // Area Codes
  getAllAreaCodes,
  createAreaCode,
  updateAreaCode,
  deleteAreaCode,
  // Contract Categories
  getAllContractCategories,
  createContractCategory,
  updateContractCategory,
  deleteContractCategory,
  // Contract Periods
  getAllContractPeriods,
  createContractPeriod,
  updateContractPeriod,
  deleteContractPeriod,
  // Companies
  getAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  // Users
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  // Service Hours
  getAllServiceHours,
  createServiceHours,
  updateServiceHours,
  deleteServiceHours,
  // UserAccess
  getAllUserAccess,
  createUserAccess,
  updateUserAccess,
  deleteUserAccess,
  // CustomerSystems
  getAllCustomerSystems,
  createCustomerSystem,
  updateCustomerSystem,
  deleteCustomerSystem,
  // ServiceContracts
  getAllServiceContracts,
  createServiceContract,
  updateServiceContract,
  deleteServiceContract,
  // Schedule
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  // Complaints
  getAllComplaints,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  // Contract Category Systems
  getAllContractCategorySystems,
  createContractCategorySystem,
  updateContractCategorySystem,
  deleteContractCategorySystem,
  // Contract Category Services
  getAllContractCategoryServices,
  createContractCategoryService,
  updateContractCategoryService,
  deleteContractCategoryService,
  // Contract Category Items
  getAllContractCategoryItems,
  createContractCategoryItem,
  updateContractCategoryItem,
  deleteContractCategoryItem,
  // Contract Intervals
  getAllContractIntervals,
  createContractInterval,
  updateContractInterval,
  deleteContractInterval,
  // Service Intervals
  getAllServiceIntervals,
  createServiceInterval,
  updateServiceInterval,
  deleteServiceInterval,
  // Costs
  getServiceCost,
  updateServiceCost,
  getSystemCost,
  updateSystemCost,
  getItemCost,
  updateItemCost,
  // Holidays
  getAllHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  // Contract Type Filtering for Sales Master Plan
  getSystemsByContractType,
  getServicesByContractType,
  getItemsByContractType
};
