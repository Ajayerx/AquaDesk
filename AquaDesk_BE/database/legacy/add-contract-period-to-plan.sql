-- LEGACY SCRIPT -- Columns now included in schema.sql SalesMasterPlan CREATE TABLE
-- Add ContractPeriodID and ContractStartingDate to SalesMasterPlan
ALTER TABLE SalesMasterPlan ADD ContractPeriodID INT FOREIGN KEY REFERENCES ContractPeriods(PeriodID);
ALTER TABLE SalesMasterPlan ADD ContractStartingDate DATE;
