-- Migration for Sales Master Plan System with Contract Type Logic and Traceability
-- Run this to update the schema

-- ==================== ADD ContractTypeId TO SalesMasterPlan ====================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('SalesMasterPlan') AND name = 'ContractTypeID')
BEGIN
    ALTER TABLE SalesMasterPlan ADD ContractTypeID INT FOREIGN KEY REFERENCES ContractCategories(CategoryID);
END

-- ==================== CREATE JUNCTION TABLES FOR CONTRACT TYPE FILTERING ====================
-- These tables define which Systems/Services/Items are available for each Contract Type

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ContractCategorySystems')
BEGIN
    CREATE TABLE ContractCategorySystems (
        ContractSystemID INT IDENTITY(1,1) PRIMARY KEY,
        CategoryID INT FOREIGN KEY REFERENCES ContractCategories(CategoryID),
        SystemID INT FOREIGN KEY REFERENCES Systems(SystemID),
        Cost DECIMAL(18,2) DEFAULT 0,
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        Status BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UNIQUE(CategoryID, SystemID)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ContractCategoryServices')
BEGIN
    CREATE TABLE ContractCategoryServices (
        ContractServiceID INT IDENTITY(1,1) PRIMARY KEY,
        CategoryID INT FOREIGN KEY REFERENCES ContractCategories(CategoryID),
        ServiceID INT FOREIGN KEY REFERENCES Services(ServiceID),
        Cost DECIMAL(18,2) DEFAULT 0,
        ServiceTime INT DEFAULT 0, -- in minutes
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        Status BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UNIQUE(CategoryID, ServiceID)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ContractCategoryItems')
BEGIN
    CREATE TABLE ContractCategoryItems (
        ContractItemID INT IDENTITY(1,1) PRIMARY KEY,
        CategoryID INT FOREIGN KEY REFERENCES ContractCategories(CategoryID),
        ItemID INT FOREIGN KEY REFERENCES Items(ItemID),
        Cost DECIMAL(18,2) DEFAULT 0,
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        Status BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UNIQUE(CategoryID, ItemID)
    );
END

-- ==================== CREATE UNIFIED SalesPlanDetails TABLE ====================
-- This replaces the three separate tables (SalesMasterPlanSystem, SalesMasterPlanService, SalesMasterPlanItem)
-- Provides better traceability and unified cost calculation

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SalesPlanDetails')
BEGIN
    CREATE TABLE SalesPlanDetails (
        DetailID INT IDENTITY(1,1) PRIMARY KEY,
        PlanID INT FOREIGN KEY REFERENCES SalesMasterPlan(PlanID) ON DELETE CASCADE,
        LineType NVARCHAR(20) NOT NULL, -- 'System', 'Service', 'Item'
        ReferenceID INT NOT NULL, -- SystemID, ServiceID, or ItemID based on LineType
        Quantity INT DEFAULT 1,
        UnitCost DECIMAL(18,2) DEFAULT 0,
        LineTotal DECIMAL(18,2) DEFAULT 0, -- Calculated: Quantity * UnitCost
        ServiceTime INT DEFAULT 0, -- For services only (in minutes)
        QualityParameters NVARCHAR(MAX), -- JSON or text for quality specs
        Notes NVARCHAR(500),
        Status BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- ==================== MIGRATE EXISTING DATA TO NEW STRUCTURE ====================
-- Migrate existing SystemCost data to ContractCategorySystems
INSERT INTO ContractCategorySystems (CategoryID, SystemID, Cost, CompanyID, Status)
SELECT sc.CategoryID, sc.SystemID, sc.Cost, sc.CompanyID, 1
FROM SystemCost sc
WHERE NOT EXISTS (SELECT 1 FROM ContractCategorySystems ccs WHERE ccs.CategoryID = sc.CategoryID AND ccs.SystemID = sc.SystemID);

-- Migrate existing ServiceCost data to ContractCategoryServices
INSERT INTO ContractCategoryServices (CategoryID, ServiceID, Cost, ServiceTime, CompanyID, Status)
SELECT sc.CategoryID, sc.ServiceID, sc.Cost, sc.ServiceTime, sc.CompanyID, 1
FROM ServiceCost sc
WHERE NOT EXISTS (SELECT 1 FROM ContractCategoryServices ccs WHERE ccs.CategoryID = sc.CategoryID AND ccs.ServiceID = sc.ServiceID);

-- Migrate existing ItemCost data to ContractCategoryItems
INSERT INTO ContractCategoryItems (CategoryID, ItemID, Cost, CompanyID, Status)
SELECT ic.CategoryID, ic.ItemID, ic.Cost, ic.CompanyID, 1
FROM ItemCost ic
WHERE NOT EXISTS (SELECT 1 FROM ContractCategoryItems cci WHERE cci.CategoryID = ic.CategoryID AND cci.ItemID = ic.ItemID);

-- Migrate existing SalesMasterPlanSystem data to SalesPlanDetails
INSERT INTO SalesPlanDetails (PlanID, LineType, ReferenceID, Quantity, UnitCost, LineTotal, Status)
SELECT smps.PlanID, 'System', smps.SystemID, smps.Quantity, 
       ISNULL(ccs.Cost, 0), ISNULL(smps.Quantity, 1) * ISNULL(ccs.Cost, 0), 1
FROM SalesMasterPlanSystem smps
LEFT JOIN ContractCategorySystems ccs ON ccs.SystemID = smps.SystemID
WHERE NOT EXISTS (SELECT 1 FROM SalesPlanDetails spd WHERE spd.PlanID = smps.PlanID AND spd.LineType = 'System' AND spd.ReferenceID = smps.SystemID);

-- Migrate existing SalesMasterPlanService data to SalesPlanDetails
INSERT INTO SalesPlanDetails (PlanID, LineType, ReferenceID, Quantity, UnitCost, LineTotal, ServiceTime, Status)
SELECT smps.PlanID, 'Service', smps.ServiceID, smps.Quantity, 
       ISNULL(ccs.Cost, 0), ISNULL(smps.Quantity, 1) * ISNULL(ccs.Cost, 0), ISNULL(ccs.ServiceTime, 0), 1
FROM SalesMasterPlanService smps
LEFT JOIN ContractCategoryServices ccs ON ccs.ServiceID = smps.ServiceID
WHERE NOT EXISTS (SELECT 1 FROM SalesPlanDetails spd WHERE spd.PlanID = smps.PlanID AND spd.LineType = 'Service' AND spd.ReferenceID = smps.ServiceID);

-- Migrate existing SalesMasterPlanItem data to SalesPlanDetails
INSERT INTO SalesPlanDetails (PlanID, LineType, ReferenceID, Quantity, UnitCost, LineTotal, Status)
SELECT smpi.PlanID, 'Item', smpi.ItemID, smpi.Quantity, 
       ISNULL(cci.Cost, 0), ISNULL(smpi.Quantity, 1) * ISNULL(cci.Cost, 0), 1
FROM SalesMasterPlanItem smpi
LEFT JOIN ContractCategoryItems cci ON cci.ItemID = smpi.ItemID
WHERE NOT EXISTS (SELECT 1 FROM SalesPlanDetails spd WHERE spd.PlanID = smpi.PlanID AND spd.LineType = 'Item' AND spd.ReferenceID = smpi.ItemID);

-- ==================== UPDATE SalesMasterPlan WITH ContractTypeId ====================
-- Set default ContractTypeId for existing plans (AMC)
UPDATE SalesMasterPlan SET ContractTypeID = (SELECT CategoryID FROM ContractCategories WHERE CategoryCode = 'AMC')
WHERE ContractTypeID IS NULL AND PlanType = 'Plan';

PRINT 'Migration completed successfully!';
