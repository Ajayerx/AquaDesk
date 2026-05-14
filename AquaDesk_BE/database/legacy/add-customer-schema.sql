-- LEGACY SCRIPT -- All DDL now consolidated in schema.sql
-- Migration: Add CustomerID to Users and create ScheduleRequests table
-- Run: node -e "require('./run-migration').run('add-customer-schema.sql')"

-- Add CustomerID column to Users table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'CustomerID')
BEGIN
    ALTER TABLE Users ADD CustomerID INT NULL;
    ALTER TABLE Users ADD CONSTRAINT FK_Users_Customers FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID);
END

-- Create ScheduleRequests table
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
