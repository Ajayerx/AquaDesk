-- Migration for Sales Master Plan System with Contract Type Logic and Traceability
-- Run this to update the schema

-- ==================== ADD ContractTypeId TO SalesMasterPlan ====================
ALTER TABLE SalesMasterPlan ADD ContractTypeID INT NULL;
ALTER TABLE SalesMasterPlan ADD CONSTRAINT FK_SalesMasterPlan_ContractCategory FOREIGN KEY (ContractTypeID) REFERENCES ContractCategories(CategoryID);

-- ==================== CREATE JUNCTION TABLES FOR CONTRACT TYPE FILTERING ====================
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
);

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

-- ==================== CREATE UNIFIED SalesPlanDetails TABLE ====================
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
);
