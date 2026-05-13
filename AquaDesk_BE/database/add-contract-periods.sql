-- Add Contract Periods table
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
