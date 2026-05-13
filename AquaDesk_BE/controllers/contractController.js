const { executeQuery, executeScalar, executeNonQuery } = require('../config/database');

const getAllContracts = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { customerId, status } = req.query;

    let query = `SELECT sc.*, c.CustomerName, c.CustomerCode, cs.SystemName,
                    cc.CategoryName
                 FROM ServiceContracts sc
                 INNER JOIN Customers c ON sc.CustomerID = c.CustomerID
                 LEFT JOIN CustomerSystems cs ON sc.CustomerSystemID = cs.CustomerSystemID
                 INNER JOIN ContractCategories cc ON sc.CategoryID = cc.CategoryID
                 WHERE sc.CompanyID = @CompanyID`;

    const params = { CompanyID: companyId };

    if (customerId) {
      query += ` AND sc.CustomerID = @CustomerID`;
      params.CustomerID = customerId;
    }

    if (status) {
      query += ` AND sc.Status = @Status`;
      params.Status = status === '1' ? 1 : 0;
    }

    query += ' ORDER BY sc.EndDate';

    const contracts = await executeQuery(query, params);
    res.json(contracts);
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
};

const getContractById = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await executeScalar(
      `SELECT sc.*, c.CustomerName, c.CustomerCode, cs.SystemName, cs.SerialNumber,
              cc.CategoryName
       FROM ServiceContracts sc
       INNER JOIN Customers c ON sc.CustomerID = c.CustomerID
       LEFT JOIN CustomerSystems cs ON sc.CustomerSystemID = cs.CustomerSystemID
       INNER JOIN ContractCategories cc ON sc.CategoryID = cc.CategoryID
       WHERE sc.ContractID = @ContractID`,
      { ContractID: id }
    );

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    res.json(contract);
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
};

const createContract = async (req, res) => {
  try {
    const { customerId, customerSystemId, categoryId, contractPeriod, frequency, startDate, endDate, notes } = req.body;

    if (!customerId || !categoryId || !startDate) {
      return res.status(400).json({ error: 'Customer ID, Category ID, and start date are required' });
    }

    const result = await executeNonQuery(
      `INSERT INTO ServiceContracts (CustomerID, CustomerSystemID, CategoryID, ContractPeriod, Frequency, StartDate, EndDate, Notes, CompanyID, Status)
       VALUES (@CustomerID, @CustomerSystemID, @CategoryID, @ContractPeriod, @Frequency, @StartDate, @EndDate, @Notes, @CompanyID, 1)`,
      {
        CustomerID: customerId,
        CustomerSystemID: customerSystemId || null,
        CategoryID: categoryId,
        ContractPeriod: contractPeriod || null,
        Frequency: frequency || null,
        StartDate: startDate,
        EndDate: endDate || null,
        notes,
        CompanyID: req.user.companyId
      }
    );

    res.status(201).json({ message: 'Contract created successfully', contractId: result });
  } catch (error) {
    console.error('Create contract error:', error);
    res.status(500).json({ error: 'Failed to create contract' });
  }
};

const updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerSystemId, categoryId, contractPeriod, frequency, startDate, endDate, notes, status } = req.body;

    await executeNonQuery(
      `UPDATE ServiceContracts 
       SET CustomerSystemID = @CustomerSystemID, CategoryID = @CategoryID, ContractPeriod = @ContractPeriod, 
           Frequency = @Frequency, StartDate = @StartDate, EndDate = @EndDate, Notes = @Notes, Status = @Status, UpdatedAt = GETDATE()
       WHERE ContractID = @ContractID`,
      {
        CustomerSystemID: customerSystemId || null,
        CategoryID: categoryId,
        ContractPeriod: contractPeriod || null,
        Frequency: frequency || null,
        StartDate: startDate,
        EndDate: endDate || null,
        notes,
        Status: status !== undefined ? (status ? 1 : 0) : 1,
        ContractID: id
      }
    );

    res.json({ message: 'Contract updated successfully' });
  } catch (error) {
    console.error('Update contract error:', error);
    res.status(500).json({ error: 'Failed to update contract' });
  }
};

const deleteContract = async (req, res) => {
  try {
    const { id } = req.params;

    await executeNonQuery(
      'UPDATE ServiceContracts SET Status = 0 WHERE ContractID = @ContractID',
      { ContractID: id }
    );

    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Delete contract error:', error);
    res.status(500).json({ error: 'Failed to delete contract' });
  }
};

const renewContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { newEndDate, newContractPeriod, newFrequency, notes } = req.body;

    if (!newEndDate) {
      return res.status(400).json({ error: 'New end date is required' });
    }

    await executeNonQuery(
      `UPDATE ServiceContracts 
       SET EndDate = @NewEndDate, ContractPeriod = @NewContractPeriod, Frequency = @NewFrequency, 
           Notes = @Notes, UpdatedAt = GETDATE()
       WHERE ContractID = @ContractID`,
      {
        NewEndDate: newEndDate,
        NewContractPeriod: newContractPeriod || null,
        NewFrequency: newFrequency || null,
        notes,
        ContractID: id
      }
    );

    res.json({ message: 'Contract renewed successfully' });
  } catch (error) {
    console.error('Renew contract error:', error);
    res.status(500).json({ error: 'Failed to renew contract' });
  }
};

module.exports = {
  getAllContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  renewContract
};
