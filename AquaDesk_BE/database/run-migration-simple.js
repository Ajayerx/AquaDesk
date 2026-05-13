require('dotenv').config();
const { executeNonQuery, executeQuery } = require('../config/database');

async function runMigration() {
  try {
    console.log('Starting migration...');

    // Add ContractTypeID to SalesMasterPlan
    try {
      await executeNonQuery('ALTER TABLE SalesMasterPlan ADD ContractTypeID INT NULL');
      console.log('Added ContractTypeID column to SalesMasterPlan');
    } catch (err) {
      console.log('ContractTypeID column already exists or error:', err.message);
    }

    // Add foreign key
    try {
      await executeNonQuery('ALTER TABLE SalesMasterPlan ADD CONSTRAINT FK_SalesMasterPlan_ContractCategory FOREIGN KEY (ContractTypeID) REFERENCES ContractCategories(CategoryID)');
      console.log('Added foreign key for ContractTypeID');
    } catch (err) {
      console.log('Foreign key already exists or error:', err.message);
    }

    // Create ContractCategorySystems
    try {
      await executeNonQuery(`
        CREATE TABLE ContractCategorySystems (
          ContractSystemID INT IDENTITY(1,1) PRIMARY KEY,
          CategoryID INT FOREIGN KEY REFERENCES ContractCategories(CategoryID),
          SystemID INT FOREIGN KEY REFERENCES Systems(SystemID),
          Cost DECIMAL(18,2) DEFAULT 0,
          CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
          Status BIT DEFAULT 1,
          CreatedAt DATETIME DEFAULT GETDATE(),
          UNIQUE(CategoryID, SystemID)
        )
      `);
      console.log('Created ContractCategorySystems table');
    } catch (err) {
      console.log('ContractCategorySystems already exists or error:', err.message);
    }

    // Create ContractCategoryServices
    try {
      await executeNonQuery(`
        CREATE TABLE ContractCategoryServices (
          ContractServiceID INT IDENTITY(1,1) PRIMARY KEY,
          CategoryID INT FOREIGN KEY REFERENCES ContractCategories(CategoryID),
          ServiceID INT FOREIGN KEY REFERENCES Services(ServiceID),
          Cost DECIMAL(18,2) DEFAULT 0,
          ServiceTime INT DEFAULT 0,
          CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
          Status BIT DEFAULT 1,
          CreatedAt DATETIME DEFAULT GETDATE(),
          UNIQUE(CategoryID, ServiceID)
        )
      `);
      console.log('Created ContractCategoryServices table');
    } catch (err) {
      console.log('ContractCategoryServices already exists or error:', err.message);
    }

    // Create ContractCategoryItems
    try {
      await executeNonQuery(`
        CREATE TABLE ContractCategoryItems (
          ContractItemID INT IDENTITY(1,1) PRIMARY KEY,
          CategoryID INT FOREIGN KEY REFERENCES ContractCategories(CategoryID),
          ItemID INT FOREIGN KEY REFERENCES Items(ItemID),
          Cost DECIMAL(18,2) DEFAULT 0,
          CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
          Status BIT DEFAULT 1,
          CreatedAt DATETIME DEFAULT GETDATE(),
          UNIQUE(CategoryID, ItemID)
        )
      `);
      console.log('Created ContractCategoryItems table');
    } catch (err) {
      console.log('ContractCategoryItems already exists or error:', err.message);
    }

    // Create SalesPlanDetails
    try {
      await executeNonQuery(`
        CREATE TABLE SalesPlanDetails (
          DetailID INT IDENTITY(1,1) PRIMARY KEY,
          PlanID INT FOREIGN KEY REFERENCES SalesMasterPlan(PlanID) ON DELETE CASCADE,
          LineType NVARCHAR(20) NOT NULL,
          ReferenceID INT NOT NULL,
          Quantity INT DEFAULT 1,
          UnitCost DECIMAL(18,2) DEFAULT 0,
          LineTotal DECIMAL(18,2) DEFAULT 0,
          ServiceTime INT DEFAULT 0,
          QualityParameters NVARCHAR(MAX),
          Notes NVARCHAR(500),
          Status BIT DEFAULT 1,
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME DEFAULT GETDATE()
        )
      `);
      console.log('Created SalesPlanDetails table');
    } catch (err) {
      console.log('SalesPlanDetails already exists or error:', err.message);
    }

    // Migrate existing data
    try {
      await executeNonQuery(`
        INSERT INTO ContractCategorySystems (CategoryID, SystemID, Cost, CompanyID, Status)
        SELECT sc.CategoryID, sc.SystemID, sc.Cost, sc.CompanyID, 1
        FROM SystemCost sc
        WHERE NOT EXISTS (SELECT 1 FROM ContractCategorySystems ccs WHERE ccs.CategoryID = sc.CategoryID AND ccs.SystemID = sc.SystemID)
      `);
      console.log('Migrated SystemCost to ContractCategorySystems');
    } catch (err) {
      console.log('Migration error for ContractCategorySystems:', err.message);
    }

    try {
      await executeNonQuery(`
        INSERT INTO ContractCategoryServices (CategoryID, ServiceID, Cost, ServiceTime, CompanyID, Status)
        SELECT sc.CategoryID, sc.ServiceID, sc.Cost, sc.ServiceTime, sc.CompanyID, 1
        FROM ServiceCost sc
        WHERE NOT EXISTS (SELECT 1 FROM ContractCategoryServices ccs WHERE ccs.CategoryID = sc.CategoryID AND ccs.ServiceID = sc.ServiceID)
      `);
      console.log('Migrated ServiceCost to ContractCategoryServices');
    } catch (err) {
      console.log('Migration error for ContractCategoryServices:', err.message);
    }

    try {
      await executeNonQuery(`
        INSERT INTO ContractCategoryItems (CategoryID, ItemID, Cost, CompanyID, Status)
        SELECT ic.CategoryID, ic.ItemID, ic.Cost, ic.CompanyID, 1
        FROM ItemCost ic
        WHERE NOT EXISTS (SELECT 1 FROM ContractCategoryItems cci WHERE cci.CategoryID = ic.CategoryID AND cci.ItemID = ic.ItemID)
      `);
      console.log('Migrated ItemCost to ContractCategoryItems');
    } catch (err) {
      console.log('Migration error for ContractCategoryItems:', err.message);
    }

    // Update existing SalesMasterPlan with ContractTypeId
    try {
      await executeNonQuery(`
        UPDATE SalesMasterPlan SET ContractTypeID = (SELECT CategoryID FROM ContractCategories WHERE CategoryCode = 'AMC')
        WHERE ContractTypeID IS NULL AND PlanType = 'Plan'
      `);
      console.log('Updated existing SalesMasterPlan with ContractTypeID');
    } catch (err) {
      console.log('Update error for ContractTypeID:', err.message);
    }

    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
