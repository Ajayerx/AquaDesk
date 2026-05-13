-- AquaDesk Customer Portal & Workflow Enhancements
-- Idempotent migration: safe to run multiple times.

-- 1) Add CustomerID to Users (nullable, FK to Customers)
IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE Name = N'CustomerID' AND Object_ID = Object_ID(N'Users')
)
BEGIN
    ALTER TABLE Users ADD CustomerID INT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_Users_Customers'
)
BEGIN
    ALTER TABLE Users
    ADD CONSTRAINT FK_Users_Customers
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID);
END
GO

-- 2) Add ContractValue and RenewalNotes to ServiceContracts (used for renewals)
IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE Name = N'ContractValue' AND Object_ID = Object_ID(N'ServiceContracts')
)
BEGIN
    ALTER TABLE ServiceContracts ADD ContractValue DECIMAL(18,2) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE Name = N'RenewalNotes' AND Object_ID = Object_ID(N'ServiceContracts')
)
BEGIN
    ALTER TABLE ServiceContracts ADD RenewalNotes NVARCHAR(MAX) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE Name = N'LastRenewedAt' AND Object_ID = Object_ID(N'ServiceContracts')
)
BEGIN
    ALTER TABLE ServiceContracts ADD LastRenewedAt DATETIME NULL;
END
GO

-- 3) Create ScheduleRequests table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ScheduleRequests')
BEGIN
    CREATE TABLE ScheduleRequests (
        RequestID INT IDENTITY(1,1) PRIMARY KEY,
        ScheduleID INT NOT NULL FOREIGN KEY REFERENCES Schedule(ScheduleID),
        CustomerID INT NOT NULL FOREIGN KEY REFERENCES Customers(CustomerID),
        PreferredDate DATE NOT NULL,
        PreferredTime NVARCHAR(10) NULL,
        Reason NVARCHAR(500) NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        ProcessedAt DATETIME NULL
    );
END
GO

-- 4) Ensure Complaints.ResolvedDate exists (defensive — already part of original schema)
IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE Name = N'ResolvedDate' AND Object_ID = Object_ID(N'Complaints')
)
BEGIN
    ALTER TABLE Complaints ADD ResolvedDate DATETIME NULL;
END
GO

-- 5) Helpful index for ScheduleRequests lookups
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = N'IX_ScheduleRequests_Status' AND object_id = OBJECT_ID(N'ScheduleRequests')
)
BEGIN
    CREATE INDEX IX_ScheduleRequests_Status ON ScheduleRequests(Status, CreatedAt DESC);
END
GO
