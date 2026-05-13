const { executeQuery, executeScalar, executeNonQuery } = require('../config/database');

const getAllCompanies = async (req, res) => {
  try {
    const companies = await executeQuery(
      'SELECT CompanyID, CompanyCode, CompanyName, Address, City, State, Country, Phone, Email, Website, GSTIN, Status FROM Companies WHERE Status = 1 ORDER BY CompanyName'
    );
    res.json(companies);
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await executeScalar(
      'SELECT * FROM Companies WHERE CompanyID = @CompanyID',
      { CompanyID: id }
    );

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
};

const createCompany = async (req, res) => {
  try {
    const { companyCode, companyName, address, city, state, country, phone, email, website, gstin } = req.body;

    if (!companyCode || !companyName) {
      return res.status(400).json({ error: 'Company code and name are required' });
    }

    // Check if company code already exists
    const existing = await executeScalar(
      'SELECT CompanyID FROM Companies WHERE CompanyCode = @CompanyCode',
      { CompanyCode: companyCode }
    );

    if (existing) {
      return res.status(400).json({ error: 'Company code already exists' });
    }

    const result = await executeNonQuery(
      `INSERT INTO Companies (CompanyCode, CompanyName, Address, City, State, Country, Phone, Email, Website, GSTIN, Status)
       VALUES (@CompanyCode, @CompanyName, @Address, @City, @State, @Country, @Phone, @Email, @Website, @GSTIN, 1)`,
      { companyCode, companyName, address, city, state, country, phone, email, website, gstin }
    );

    res.status(201).json({ message: 'Company created successfully', companyId: result });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
};

const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyCode, companyName, address, city, state, country, phone, email, website, gstin, status } = req.body;

    await executeNonQuery(
      `UPDATE Companies 
       SET CompanyCode = @CompanyCode, CompanyName = @CompanyName, Address = @Address, City = @City, 
           State = @State, Country = @Country, Phone = @Phone, Email = @Email, Website = @Website, 
           GSTIN = @GSTIN, Status = @Status, UpdatedAt = GETDATE()
       WHERE CompanyID = @CompanyID`,
      { companyCode, companyName, address, city, state, country, phone, email, website, gstin, status: status ? 1 : 0, CompanyID: id }
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

    // Check if company has users
    const users = await executeScalar(
      'SELECT COUNT(*) as Count FROM Users WHERE CompanyID = @CompanyID',
      { CompanyID: id }
    );

    if (users && users.Count > 0) {
      return res.status(400).json({ error: 'Cannot delete company with associated users' });
    }

    await executeNonQuery(
      'UPDATE Companies SET Status = 0 WHERE CompanyID = @CompanyID',
      { CompanyID: id }
    );

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany
};
