-- AquaDesk Database Schema
-- Canonical schema: one CREATE TABLE per entity, all columns, all FK constraints.
-- Does NOT contain seed data (see seed.sql).
-- Legacy tables marked --LEGACY-- are kept for backward compatibility with one-time migration scripts.

-- Companies
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Companies')
BEGIN
    CREATE TABLE Companies (
        CompanyID INT IDENTITY(1,1) PRIMARY KEY,
        CompanyCode NVARCHAR(50) UNIQUE NOT NULL,
        CompanyName NVARCHAR(200) NOT NULL,
        Address NVARCHAR(500),
        City NVARCHAR(100),
        State NVARCHAR(100),
        Country NVARCHAR(100),
        Phone NVARCHAR(20),
        Email NVARCHAR(100),
        Website NVARCHAR(200),
        GSTIN NVARCHAR(50),
        Logo NVARCHAR(MAX),
        Status BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- ContractPeriods
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ContractPeriods')
BEGIN
    CREATE TABLE ContractPeriods (
        PeriodID INT IDENTITY(1,1) PRIMARY KEY,
        PeriodCode NVARCHAR(20) UNIQUE NOT NULL,
        PeriodName NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500),
        DurationMonths INT,
        Status BIT DEFAULT 1,
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- AreaCodes
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AreaCodes')
BEGIN
    CREATE TABLE AreaCodes (
        AreaCodeID INT IDENTITY(1,1) PRIMARY KEY,
        AreaCode NVARCHAR(20) UNIQUE NOT NULL,
        Description NVARCHAR(200),
        Priority INT DEFAULT 0,
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        Status BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- ContractCategories
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ContractCategories')
BEGIN
    CREATE TABLE ContractCategories (
        CategoryID INT IDENTITY(1,1) PRIMARY KEY,
        CategoryCode NVARCHAR(20) UNIQUE NOT NULL,
        CategoryName NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500),
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        Status BIT DEFAULT 1,
        ContractStatus NVARCHAR(20) DEFAULT 'MC',
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- ContractIntervals
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ContractIntervals')
BEGIN
    CREATE TABLE ContractIntervals (
        IntervalID INT IDENTITY(1,1) PRIMARY KEY,
        IntervalDays INT NOT NULL,
        IntervalName NVARCHAR(50) NOT NULL,
        Description NVARCHAR(200),
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        Status BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- ServiceIntervals
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ServiceIntervals')
BEGIN
    CREATE TABLE ServiceIntervals (
        ServiceIntervalID INT IDENTITY(1,1) PRIMARY KEY,
        IntervalDays INT NOT NULL,
        IntervalName NVARCHAR(50) NOT NULL,
        Description NVARCHAR(200),
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        Status BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- Systems (Master Catalog)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Systems')
BEGIN
    CREATE TABLE Systems (
        SystemID INT IDENTITY(1,1) PRIMARY KEY,
        SystemCode NVARCHAR(20) UNIQUE NOT NULL,
        SystemName NVARCHAR(200) NOT NULL,
        Description NVARCHAR(500),
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        Status BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- Services (Master Catalog)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Services')
BEGIN
    CREATE TABLE Services (
        ServiceID INT IDENTITY(1,1) PRIMARY KEY,
        ServiceCode NVARCHAR(20) UNIQUE NOT NULL,
        ServiceName NVARCHAR(200) NOT NULL,
        Description NVARCHAR(500),
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        Status BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- Items (Master Catalog)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Items')
BEGIN
    CREATE TABLE Items (
        ItemID INT IDENTITY(1,1) PRIMARY KEY,
        ItemCode NVARCHAR(20) UNIQUE NOT NULL,
        ItemName NVARCHAR(200) NOT NULL,
        Description NVARCHAR(500),
        Unit NVARCHAR(20),
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        Status BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- ServiceHours
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ServiceHours')
BEGIN
    CREATE TABLE ServiceHours (
        ServiceHoursID INT IDENTITY(1,1) PRIMARY KEY,
        DayOfWeek INT NOT NULL,
        StartTime TIME NOT NULL,
        EndTime TIME NOT NULL,
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- ServiceTeams
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ServiceTeams')
BEGIN
    CREATE TABLE ServiceTeams (
        TeamID INT IDENTITY(1,1) PRIMARY KEY,
        TeamName NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500),
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        Status BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- ServiceEngineers
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ServiceEngineers')
BEGIN
    CREATE TABLE ServiceEngineers (
        EngineerID INT IDENTITY(1,1) PRIMARY KEY,
        EngineerName NVARCHAR(100) NOT NULL,
        Phone NVARCHAR(20),
        Email NVARCHAR(100),
        TeamID INT FOREIGN KEY REFERENCES ServiceTeams(TeamID),
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        Status BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- Customers
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Customers')
BEGIN
    CREATE TABLE Customers (
        CustomerID INT IDENTITY(1,1) PRIMARY KEY,
        CustomerCode NVARCHAR(20) UNIQUE NOT NULL,
        CustomerName NVARCHAR(200) NOT NULL,
        Flat NVARCHAR(50),
        Block NVARCHAR(50),
        Road NVARCHAR(100),
        City NVARCHAR(100),
        State NVARCHAR(100),
        Country NVARCHAR(100),
        Mobile NVARCHAR(20),
        Email NVARCHAR(100),
        Telephone NVARCHAR(20),
        Fax NVARCHAR(20),
        AreaCodeID INT FOREIGN KEY REFERENCES AreaCodes(AreaCodeID),
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        Status BIT DEFAULT 1,
        Description NVARCHAR(500),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- Users
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        UserID INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(50) UNIQUE NOT NULL,
        Password NVARCHAR(255) NOT NULL,
        FullName NVARCHAR(100) NOT NULL,
        Email NVARCHAR(100),
        Phone NVARCHAR(20),
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        Role NVARCHAR(50) DEFAULT 'User',
        Status BIT DEFAULT 1,
        CustomerID INT FOREIGN KEY REFERENCES Customers(CustomerID),
        LastLogin DATETIME,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- UserAccess
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserAccess')
BEGIN
    CREATE TABLE UserAccess (
        AccessID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT FOREIGN KEY REFERENCES Users(UserID),
        FormName NVARCHAR(100) NOT NULL,
        CanView BIT DEFAULT 0,
        CanAdd BIT DEFAULT 0,
        CanEdit BIT DEFAULT 0,
        CanDelete BIT DEFAULT 0,
        CanSearch BIT DEFAULT 0,
        CanPrint BIT DEFAULT 0,
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END

-- CustomerSystems
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CustomerSystems')
BEGIN
    CREATE TABLE CustomerSystems (
        CustomerSystemID INT IDENTITY(1,1) PRIMARY KEY,
        CustomerID INT FOREIGN KEY REFERENCES Customers(CustomerID),
        SystemID INT FOREIGN KEY REFERENCES Systems(SystemID),
        SystemType NVARCHAR(100),
        SerialNumber NVARCHAR(100),
        InstallDate DATETIME,
        Status BIT DEFAULT 1,
        Notes NVARCHAR(500),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- ServiceContracts
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ServiceContracts')
BEGIN
    CREATE TABLE ServiceContracts (
        ContractID INT IDENTITY(1,1) PRIMARY KEY,
        CustomerID INT FOREIGN KEY REFERENCES Customers(CustomerID),
        CustomerSystemID INT FOREIGN KEY REFERENCES CustomerSystems(CustomerSystemID),
        CategoryID INT FOREIGN KEY REFERENCES ContractCategories(CategoryID),
        ContractPeriod INT,
        Frequency INT,
        StartDate DATETIME,
        EndDate DATETIME,
        Status BIT DEFAULT 1,
        Notes NVARCHAR(500),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- ItemStock
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ItemStock')
BEGIN
    CREATE TABLE ItemStock (
        StockID INT IDENTITY(1,1) PRIMARY KEY,
        ItemID INT FOREIGN KEY REFERENCES Items(ItemID),
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        Quantity DECIMAL(18,2) DEFAULT 0,
        Price DECIMAL(18,2) DEFAULT 0,
        ReorderLevel DECIMAL(18,2) DEFAULT 0,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- LEGACY -- ServiceCost (replaced by ContractCategoryServices)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ServiceCost')
BEGIN
    CREATE TABLE ServiceCost (
        ServiceCostID INT IDENTITY(1,1) PRIMARY KEY,
        CategoryID INT FOREIGN KEY REFERENCES ContractCategories(CategoryID),
        ServiceID INT FOREIGN KEY REFERENCES Services(ServiceID),
        Cost DECIMAL(18,2) DEFAULT 0,
        ServiceTime INT DEFAULT 0,
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- LEGACY -- SystemCost (replaced by ContractCategorySystems)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SystemCost')
BEGIN
    CREATE TABLE SystemCost (
        SystemCostID INT IDENTITY(1,1) PRIMARY KEY,
        CategoryID INT FOREIGN KEY REFERENCES ContractCategories(CategoryID),
        SystemID INT FOREIGN KEY REFERENCES Systems(SystemID),
        Cost DECIMAL(18,2) DEFAULT 0,
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- LEGACY -- ItemCost (replaced by ContractCategoryItems)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ItemCost')
BEGIN
    CREATE TABLE ItemCost (
        ItemCostID INT IDENTITY(1,1) PRIMARY KEY,
        CategoryID INT FOREIGN KEY REFERENCES ContractCategories(CategoryID),
        ItemID INT FOREIGN KEY REFERENCES Items(ItemID),
        Cost DECIMAL(18,2) DEFAULT 0,
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- Holidays
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Holidays')
BEGIN
    CREATE TABLE Holidays (
        HolidayID INT IDENTITY(1,1) PRIMARY KEY,
        HolidayName NVARCHAR(200) NOT NULL,
        HolidayDate DATE NOT NULL,
        Description NVARCHAR(500),
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        Status BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- SalesMasterPlan
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SalesMasterPlan')
BEGIN
    CREATE TABLE SalesMasterPlan (
        PlanID INT IDENTITY(1,1) PRIMARY KEY,
        CustomerID INT FOREIGN KEY REFERENCES Customers(CustomerID),
        PlanType NVARCHAR(50) DEFAULT 'Plan',
        Frequency NVARCHAR(50),
        Notes NVARCHAR(MAX),
        CreatedBy INT FOREIGN KEY REFERENCES Users(UserID),
        UpdatedBy INT FOREIGN KEY REFERENCES Users(UserID),
        ContractTypeID INT FOREIGN KEY REFERENCES ContractCategories(CategoryID),
        ContractPeriodID INT FOREIGN KEY REFERENCES ContractPeriods(PeriodID),
        ContractStartingDate DATE,
        Status BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- LEGACY -- SalesMasterPlanSystem (replaced by SalesPlanDetails)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SalesMasterPlanSystem')
BEGIN
    CREATE TABLE SalesMasterPlanSystem (
        PlanSystemID INT IDENTITY(1,1) PRIMARY KEY,
        PlanID INT FOREIGN KEY REFERENCES SalesMasterPlan(PlanID) ON DELETE CASCADE,
        SystemID INT FOREIGN KEY REFERENCES Systems(SystemID),
        Quantity INT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END

-- LEGACY -- SalesMasterPlanService (replaced by SalesPlanDetails)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SalesMasterPlanService')
BEGIN
    CREATE TABLE SalesMasterPlanService (
        PlanServiceID INT IDENTITY(1,1) PRIMARY KEY,
        PlanID INT FOREIGN KEY REFERENCES SalesMasterPlan(PlanID) ON DELETE CASCADE,
        ServiceID INT FOREIGN KEY REFERENCES Services(ServiceID),
        Quantity INT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END

-- LEGACY -- SalesMasterPlanItem (replaced by SalesPlanDetails)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SalesMasterPlanItem')
BEGIN
    CREATE TABLE SalesMasterPlanItem (
        PlanItemID INT IDENTITY(1,1) PRIMARY KEY,
        PlanID INT FOREIGN KEY REFERENCES SalesMasterPlan(PlanID) ON DELETE CASCADE,
        ItemID INT FOREIGN KEY REFERENCES Items(ItemID),
        Quantity INT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END

-- SalesMaster
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SalesMaster')
BEGIN
    CREATE TABLE SalesMaster (
        SalesNo INT IDENTITY(1,1) PRIMARY KEY,
        SalesDate DATETIME DEFAULT GETDATE(),
        CustomerID INT FOREIGN KEY REFERENCES Customers(CustomerID),
        CategoryID INT FOREIGN KEY REFERENCES ContractCategories(CategoryID),
        ContractTypeID INT,
        ServiceIntervalID INT FOREIGN KEY REFERENCES ServiceIntervals(ServiceIntervalID),
        ContractIntervalID INT FOREIGN KEY REFERENCES ContractIntervals(IntervalID),
        ContractStartDate DATETIME,
        PlanType NVARCHAR(20) DEFAULT 'Plan',
        Description NVARCHAR(MAX),
        Notes NVARCHAR(MAX),
        TotalAmount DECIMAL(18,2) DEFAULT 0,
        TotalServiceTime INT DEFAULT 0,
        CompanyID INT FOREIGN KEY REFERENCES Companies(CompanyID),
        Status BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- SalesMasterSystems
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SalesMasterSystems')
BEGIN
    CREATE TABLE SalesMasterSystems (
        SalesSystemID INT IDENTITY(1,1) PRIMARY KEY,
        SalesNo INT FOREIGN KEY REFERENCES SalesMaster(SalesNo),
        SystemID INT FOREIGN KEY REFERENCES Systems(SystemID),
        Quantity INT DEFAULT 1,
        Cost DECIMAL(18,2) DEFAULT 0,
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END

-- SalesMasterServices
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SalesMasterServices')
BEGIN
    CREATE TABLE SalesMasterServices (
        SalesServiceID INT IDENTITY(1,1) PRIMARY KEY,
        SalesNo INT FOREIGN KEY REFERENCES SalesMaster(SalesNo),
        ServiceID INT FOREIGN KEY REFERENCES Services(ServiceID),
        Quantity INT DEFAULT 1,
        Cost DECIMAL(18,2) DEFAULT 0,
        ServiceTime INT DEFAULT 0,
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END

-- SalesMasterItems
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SalesMasterItems')
BEGIN
    CREATE TABLE SalesMasterItems (
        SalesItemID INT IDENTITY(1,1) PRIMARY KEY,
        SalesNo INT FOREIGN KEY REFERENCES SalesMaster(SalesNo),
        ItemID INT FOREIGN KEY REFERENCES Items(ItemID),
        Quantity INT DEFAULT 1,
        Cost DECIMAL(18,2) DEFAULT 0,
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END

-- Schedule
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Schedule')
BEGIN
    CREATE TABLE Schedule (
        ScheduleID INT IDENTITY(1,1) PRIMARY KEY,
        SalesNo INT FOREIGN KEY REFERENCES SalesMaster(SalesNo),
        ScheduleDate DATETIME NOT NULL,
        ServiceTime TIME,
        EngineerID INT FOREIGN KEY REFERENCES ServiceEngineers(EngineerID),
        ServiceStatus NVARCHAR(20) DEFAULT 'Pending',
        IsOverride BIT DEFAULT 0,
        Notes NVARCHAR(500),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- Complaints
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Complaints')
BEGIN
    CREATE TABLE Complaints (
        ComplaintID INT IDENTITY(1,1) PRIMARY KEY,
        SalesNo INT FOREIGN KEY REFERENCES SalesMaster(SalesNo),
        ComplaintDate DATETIME DEFAULT GETDATE(),
        Description NVARCHAR(MAX),
        Status NVARCHAR(20) DEFAULT 'Open',
        Resolution NVARCHAR(MAX),
        ResolvedDate DATETIME,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END

-- ScheduleRequests
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ScheduleRequests')
BEGIN
    CREATE TABLE ScheduleRequests (
        RequestID INT IDENTITY(1,1) PRIMARY KEY,
        ScheduleID INT NOT NULL FOREIGN KEY REFERENCES Schedule(ScheduleID),
        CustomerID INT NOT NULL FOREIGN KEY REFERENCES Customers(CustomerID),
        PreferredDate DATE NOT NULL,
        PreferredTime NVARCHAR(10) NULL,
        Reason NVARCHAR(500) NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        ProcessedAt DATETIME NULL
    );
END

-- ContractCategorySystems (junctions: system availability per contract category)
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

-- ContractCategoryServices (junctions: service availability per contract category)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ContractCategoryServices')
BEGIN
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
END

-- ContractCategoryItems (junctions: item availability per contract category)
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

-- SalesPlanDetails (unified replacement for SalesMasterPlanSystem/Service/Item)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SalesPlanDetails')
BEGIN
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
END

PRINT 'Schema created successfully!';
