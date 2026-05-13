-- Seed Data for Qsystech Service Management System
-- Run after schema.sql. Uses IDENTITY_INSERT OFF (auto-increment).
-- All inserts use IF NOT EXISTS to avoid conflicts.
-- All data uses CompanyID=1 (DEFAULT company)

-- ==================== COMPANIES ====================
IF NOT EXISTS (SELECT * FROM Companies WHERE CompanyCode = 'QSYS')
INSERT INTO Companies (CompanyCode, CompanyName, Address, City, State, Country, Phone, Email, Website, GSTIN, Status)
VALUES ('QSYS', 'Qsystech Solutions', '123 Tech Park', 'Mumbai', 'Maharashtra', 'India', '+91-22-12345678', 'info@qsystech.com', 'www.qsystech.com', '27AABCQ1234F1Z5', 1);

IF NOT EXISTS (SELECT * FROM Companies WHERE CompanyCode = 'ACME')
INSERT INTO Companies (CompanyCode, CompanyName, Address, City, State, Country, Phone, Email, Website, GSTIN, Status)
VALUES ('ACME', 'Acme Services Ltd', '456 Business Hub', 'Delhi', 'Delhi', 'India', '+91-11-98765432', 'contact@acme.com', 'www.acme.com', '07AABCA5678G2H9', 1);

-- ==================== USERS ====================
-- Password for all: password123
IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'johnmgr')
INSERT INTO Users (Username, Password, FullName, Email, Phone, Role, CompanyID, Status)
VALUES ('johnmgr', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aOoOv8g.VM9fjL4KSO', 'John Manager', 'john@qsystech.com', '+91-9876543210', 'Manager', 1, 1);

IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'priyaeng')
INSERT INTO Users (Username, Password, FullName, Email, Phone, Role, CompanyID, Status)
VALUES ('priyaeng', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aOoOv8g.VM9fjL4KSO', 'Priya Engineer', 'priya@qsystech.com', '+91-9876543211', 'Engineer', 1, 1);

IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'rahuluser')
INSERT INTO Users (Username, Password, FullName, Email, Phone, Role, CompanyID, Status)
VALUES ('rahuluser', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aOoOv8g.VM9fjL4KSO', 'Rahul User', 'rahul@acme.com', '+91-9876543212', 'User', 1, 1);

IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'saraadmin')
INSERT INTO Users (Username, Password, FullName, Email, Phone, Role, CompanyID, Status)
VALUES ('saraadmin', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aOoOv8g.VM9fjL4KSO', 'Sara Admin', 'sara@qsystech.com', '+91-9876543213', 'Admin', 1, 1);

-- ==================== USER ACCESS ====================
INSERT INTO UserAccess (UserID, FormName, CanView, CanAdd, CanEdit, CanDelete, CanSearch, CanPrint)
SELECT u.UserID, f.FormName,
  CASE WHEN u.Role IN ('Admin','Manager') THEN 1 ELSE 1 END,
  CASE WHEN u.Role IN ('Admin','Manager') THEN 1 ELSE 0 END,
  CASE WHEN u.Role IN ('Admin','Manager') THEN 1 ELSE 0 END,
  CASE WHEN u.Role = 'Admin' THEN 1 ELSE 0 END,
  1,
  CASE WHEN u.Role IN ('Admin','Manager') THEN 1 ELSE 0 END
FROM Users u
CROSS JOIN (VALUES ('Dashboard'),('Customer'),('Sales'),('Schedule'),('Report'),('Admin'),('Contract'),('SalesMasterPlan')) AS f(FormName)
WHERE u.Status = 1
AND NOT EXISTS (SELECT 1 FROM UserAccess ua WHERE ua.UserID = u.UserID AND ua.FormName = f.FormName);

-- ==================== AREA CODES (CompanyID=1) ====================
INSERT INTO AreaCodes (AreaCode, Description, Priority, CompanyID, Status)
SELECT v.Code, v.[Desc], v.Pri, 1, 1
FROM (VALUES ('ANDHERI','Andheri West',1),('BORIVALI','Borivali',2),('DADAR','Dadar',3),('THANE','Thane City',4),('NAVI-MUM','Navi Mumbai',5),('PUNE','Pune Central',6),('DELHI-CT','Delhi Central',7),('GURGAON','Gurgaon',8)) AS v(Code,[Desc],Pri)
WHERE NOT EXISTS (SELECT 1 FROM AreaCodes WHERE AreaCode = v.Code);

-- ==================== CONTRACT CATEGORIES ====================
INSERT INTO ContractCategories (CategoryCode, CategoryName, Description, CompanyID, Status)
SELECT v.Code, v.Name, v.[Desc], 1, 1
FROM (VALUES ('AMC','Annual Maintenance Contract','Yearly service contract'),('QTR','Quarterly Service','Quarterly maintenance'),('ONE-TIME','One Time Service','Single service visit'),('WARRANTY','Warranty Service','Under warranty service')) AS v(Code,Name,[Desc])
WHERE NOT EXISTS (SELECT 1 FROM ContractCategories WHERE CategoryCode = v.Code);

-- ==================== CONTRACT INTERVALS ====================
INSERT INTO ContractIntervals (IntervalDays, IntervalName, Description, CompanyID, Status)
SELECT v.Days, v.Name, v.[Desc], 1, 1
FROM (VALUES (30,'Monthly','Every 30 days'),(90,'Quarterly','Every 90 days'),(180,'Half-Yearly','Every 180 days'),(365,'Yearly','Every 365 days')) AS v(Days,Name,[Desc])
WHERE NOT EXISTS (SELECT 1 FROM ContractIntervals WHERE IntervalName = v.Name AND CompanyID = 1);

-- ==================== SERVICE INTERVALS ====================
INSERT INTO ServiceIntervals (IntervalDays, IntervalName, Description, CompanyID, Status)
SELECT v.Days, v.Name, v.[Desc], 1, 1
FROM (VALUES (7,'Weekly','Every 7 days'),(14,'Bi-Weekly','Every 14 days'),(30,'Monthly','Every 30 days'),(90,'Quarterly','Every 90 days')) AS v(Days,Name,[Desc])
WHERE NOT EXISTS (SELECT 1 FROM ServiceIntervals WHERE IntervalName = v.Name AND CompanyID = 1);

-- ==================== SYSTEMS ====================
INSERT INTO Systems (SystemCode, SystemName, Description, CompanyID, Status)
SELECT v.Code, v.Name, v.[Desc], 1, 1
FROM (VALUES ('FIRE-ALRM','Fire Alarm System','Commercial fire alarm panel'),('CCTV-STD','CCTV Standard','4-camera CCTV system'),('CCTV-PRO','CCTV Pro','8-camera CCTV with NVR'),('ACCESS-CTL','Access Control','Biometric access control'),('INTRUSION','Intrusion Detection','Perimeter intrusion system'),('PA-SYS','PA System','Public address system')) AS v(Code,Name,[Desc])
WHERE NOT EXISTS (SELECT 1 FROM Systems WHERE SystemCode = v.Code);

-- ==================== SERVICES ====================
INSERT INTO Services (ServiceCode, ServiceName, Description, CompanyID, Status)
SELECT v.Code, v.Name, v.[Desc], 1, 1
FROM (VALUES ('INSPECT','Inspection','System inspection'),('MAINT','Preventive Maintenance','Scheduled maintenance'),('REPAIR','Repair Service','Breakdown repair'),('INSTALL','Installation','New system installation'),('DEINST','De-Installation','System removal'),('TESTING','Testing & Commissioning','System testing')) AS v(Code,Name,[Desc])
WHERE NOT EXISTS (SELECT 1 FROM Services WHERE ServiceCode = v.Code);

-- ==================== ITEMS ====================
INSERT INTO Items (ItemCode, ItemName, Description, Unit, CompanyID, Status)
SELECT v.Code, v.Name, v.[Desc], v.Unit, 1, 1
FROM (VALUES ('SMOKE-DET','Smoke Detector','Photoelectric smoke detector','Pcs'),('HEAT-DET','Heat Detector','Rate-of-rise heat detector','Pcs'),('MAN-STN','Manual Call Point','Fire alarm manual station','Pcs'),('SIREN','Siren/Hooter','Electronic siren','Pcs'),('CABLE-FR','Fire Rated Cable','2-core fire rated cable','Mtr'),('CAM-IP','IP Camera','2MP IP camera','Pcs'),('NVR-8CH','8-Channel NVR','Network video recorder','Pcs'),('HDD-2TB','2TB Surveillance HDD','Surveillance grade hard disk','Pcs'),('BATT-12V','12V 7Ah Battery','Backup battery','Pcs')) AS v(Code,Name,[Desc],Unit)
WHERE NOT EXISTS (SELECT 1 FROM Items WHERE ItemCode = v.Code);

-- ==================== ITEM STOCK ====================
INSERT INTO ItemStock (ItemID, CompanyID, Quantity, ReorderLevel)
SELECT i.ItemID, 1, 100, 20
FROM Items i
WHERE i.Status = 1 AND i.CompanyID = 1
AND NOT EXISTS (SELECT 1 FROM ItemStock s WHERE s.ItemID = i.ItemID);

-- ==================== SERVICE COSTS ====================
INSERT INTO ServiceCost (CategoryID, ServiceID, Cost, ServiceTime, CompanyID)
SELECT cc.CategoryID, s.ServiceID, 500 + ABS(CHECKSUM(NEWID())) % 2000, 30 + ABS(CHECKSUM(NEWID())) % 120, 1
FROM ContractCategories cc CROSS JOIN Services s
WHERE cc.Status = 1 AND s.Status = 1 AND cc.CompanyID = 1
AND NOT EXISTS (SELECT 1 FROM ServiceCost sc WHERE sc.CategoryID = cc.CategoryID AND sc.ServiceID = s.ServiceID);

-- ==================== SYSTEM COSTS ====================
INSERT INTO SystemCost (CategoryID, SystemID, Cost, CompanyID)
SELECT cc.CategoryID, sy.SystemID, 1000 + ABS(CHECKSUM(NEWID())) % 5000, 1
FROM ContractCategories cc CROSS JOIN Systems sy
WHERE cc.Status = 1 AND sy.Status = 1 AND cc.CompanyID = 1
AND NOT EXISTS (SELECT 1 FROM SystemCost sc WHERE sc.CategoryID = cc.CategoryID AND sc.SystemID = sy.SystemID);

-- ==================== ITEM COSTS ====================
INSERT INTO ItemCost (CategoryID, ItemID, Cost, CompanyID)
SELECT cc.CategoryID, i.ItemID, 200 + ABS(CHECKSUM(NEWID())) % 2000, 1
FROM ContractCategories cc CROSS JOIN Items i
WHERE cc.Status = 1 AND i.Status = 1 AND cc.CompanyID = 1
AND NOT EXISTS (SELECT 1 FROM ItemCost ic WHERE ic.CategoryID = cc.CategoryID AND ic.ItemID = i.ItemID);

-- ==================== SERVICE HOURS ====================
INSERT INTO ServiceHours (DayOfWeek, StartTime, EndTime, CompanyID)
SELECT v.Day, v.Start, v.[End], 1
FROM (VALUES (1,'09:00','18:00'),(2,'09:00','18:00'),(3,'09:00','18:00'),(4,'09:00','18:00'),(5,'09:00','18:00'),(6,'09:00','13:00')) AS v(Day,Start,[End])
WHERE NOT EXISTS (SELECT 1 FROM ServiceHours sh WHERE sh.DayOfWeek = v.Day AND sh.CompanyID = 1);

-- ==================== SERVICE TEAMS ====================
INSERT INTO ServiceTeams (TeamName, Description, CompanyID, Status)
SELECT v.Name, v.[Desc], 1, 1
FROM (VALUES ('Team Alpha','North Mumbai zone'),('Team Beta','South Mumbai zone'),('Team Gamma','Navi Mumbai & Thane'),('Team Delta','Pune zone')) AS v(Name,[Desc])
WHERE NOT EXISTS (SELECT 1 FROM ServiceTeams WHERE TeamName = v.Name AND CompanyID = 1);

-- ==================== SERVICE ENGINEERS ====================
INSERT INTO ServiceEngineers (EngineerName, Phone, Email, TeamID, CompanyID, Status)
SELECT v.Name, v.Phone, v.Email, t.TeamID, 1, 1
FROM (VALUES ('Amit Sharma','+91-9988776601','amit@qsystech.com','Team Alpha'),('Vikram Patel','+91-9988776602','vikram@qsystech.com','Team Alpha'),('Neha Singh','+91-9988776603','neha@qsystech.com','Team Beta'),('Rajesh Kumar','+91-9988776604','rajesh@qsystech.com','Team Beta'),('Sunita Desai','+91-9988776605','sunita@qsystech.com','Team Gamma'),('Deepak Joshi','+91-9988776606','deepak@qsystech.com','Team Gamma'),('Kavita Nair','+91-9988776607','kavita@qsystech.com','Team Delta'),('Suresh Menon','+91-9988776608','suresh@qsystech.com','Team Delta')) AS v(Name,Phone,Email,TeamName)
JOIN ServiceTeams t ON t.TeamName = v.TeamName AND t.CompanyID = 1
WHERE NOT EXISTS (SELECT 1 FROM ServiceEngineers WHERE EngineerName = v.Name AND CompanyID = 1);

-- ==================== CUSTOMERS ====================
INSERT INTO Customers (CustomerCode, CustomerName, Flat, Block, Road, City, State, Country, Mobile, Email, AreaCodeID, CompanyID, Status)
SELECT v.Code, v.Name, v.Flat, v.Block, v.Road, v.City, v.State, v.Country, v.Mobile, v.Email, ac.AreaCodeID, 1, 1
FROM (VALUES
  ('CUST001','Sunrise Apartments','A-101','A','SV Road','Mumbai','Maharashtra','India','+91-9820010001','mgr@sunrise.com','ANDHERI'),
  ('CUST002','Metro Mall Corp','B-201','B','Link Road','Mumbai','Maharashtra','India','+91-9820010002','ops@metromall.com','BORIVALI'),
  ('CUST003','Shivaji Tower Society','C-301','C','Tulsi Pipe Rd','Mumbai','Maharashtra','India','+91-9820010003','sec@shivajitower.com','DADAR'),
  ('CUST004','Green Valley Residency','D-401','D','Ghodbunder Rd','Thane','Maharashtra','India','+91-9820010004','admin@greenvalley.com','THANE'),
  ('CUST005','Vashi Business Park','E-501','E','Palm Beach Rd','Navi Mumbai','Maharashtra','India','+91-9820010005','info@vashibiz.com','NAVI-MUM'),
  ('CUST006','Pune Tech Hub','F-601','F','Hinjewadi Rd','Pune','Maharashtra','India','+91-9820010006','facilities@punetech.com','PUNE'),
  ('CUST007','Connaught Place Corp','G-701','G','Connaught Circus','Delhi','Delhi','India','+91-9820010007','mgr@cpplaza.com','DELHI-CT'),
  ('CUST008','Cyber Hub Office','H-801','H','DLF Cyber City','Gurgaon','Haryana','India','+91-9820010008','admin@cyberhub.com','GURGAON'),
  ('CUST009','Lotus Business Park','I-901','I','New Link Road','Mumbai','Maharashtra','India','+91-9820010009','ops@lotuspark.com','ANDHERI'),
  ('CUST010','Hiranandani Estate','J-1001','J','Pokhran Road','Thane','Maharashtra','India','+91-9820010010','security@hiranandani.com','THANE')
) AS v(Code,Name,Flat,Block,Road,City,State,Country,Mobile,Email,AreaCode)
LEFT JOIN AreaCodes ac ON ac.AreaCode = v.AreaCode AND ac.CompanyID = 1
WHERE NOT EXISTS (SELECT 1 FROM Customers WHERE CustomerCode = v.Code);

-- ==================== CUSTOMER SYSTEMS ====================
INSERT INTO CustomerSystems (CustomerID, SystemID, SystemType, SerialNumber, InstallDate, Status, Notes)
SELECT c.CustomerID, sy.SystemID, 'Contracted', CONCAT('SN-', c.CustomerCode, '-', sy.SystemCode), '2024-01-15', 1, 'Installed during initial setup'
FROM Customers c
CROSS JOIN Systems sy
WHERE c.Status = 1 AND c.CompanyID = 1 AND sy.Status = 1 AND sy.CompanyID = 1
AND sy.SystemCode IN ('FIRE-ALRM','CCTV-STD','ACCESS-CTL')
AND NOT EXISTS (SELECT 1 FROM CustomerSystems cs WHERE cs.CustomerID = c.CustomerID AND cs.SystemID = sy.SystemID);

-- ==================== SERVICE CONTRACTS ====================
INSERT INTO ServiceContracts (CustomerID, CustomerSystemID, CategoryID, ContractPeriod, Frequency, StartDate, EndDate, Notes, Status)
SELECT c.CustomerID, cs.CustomerSystemID, cat.CategoryID, 12, 3, '2024-01-01', '2024-12-31', 'Annual AMC contract', 1
FROM Customers c
JOIN CustomerSystems cs ON cs.CustomerID = c.CustomerID AND cs.Status = 1
JOIN ContractCategories cat ON cat.CategoryCode = 'AMC' AND cat.CompanyID = 1
WHERE c.Status = 1 AND c.CompanyID = 1
AND NOT EXISTS (SELECT 1 FROM ServiceContracts sc WHERE sc.CustomerID = c.CustomerID AND sc.CategoryID = cat.CategoryID);

-- ==================== SALES MASTER ====================
INSERT INTO SalesMaster (SalesDate, CustomerID, CategoryID, ServiceIntervalID, ContractIntervalID, ContractStartDate, PlanType, Description, Notes, TotalAmount, TotalServiceTime, CompanyID, Status)
SELECT '2024-06-15', c.CustomerID, cat.CategoryID, si.ServiceIntervalID, ci.IntervalID, '2024-06-15', 'Plan', 'Scheduled maintenance plan', 'Regular quarterly service', 5000, 180, 1, 1
FROM Customers c
JOIN ContractCategories cat ON cat.CategoryCode = 'AMC' AND cat.CompanyID = 1
JOIN ServiceIntervals si ON si.IntervalName = 'Quarterly' AND si.CompanyID = 1
JOIN ContractIntervals ci ON ci.IntervalName = 'Quarterly' AND ci.CompanyID = 1
WHERE c.Status = 1 AND c.CompanyID = 1
AND NOT EXISTS (SELECT 1 FROM SalesMaster sm WHERE sm.CustomerID = c.CustomerID AND sm.PlanType = 'Plan' AND sm.CompanyID = 1);

-- Add a complaint
IF NOT EXISTS (SELECT 1 FROM SalesMaster WHERE PlanType = 'Complaint' AND CompanyID = 1)
INSERT INTO SalesMaster (SalesDate, CustomerID, CategoryID, PlanType, Description, Notes, TotalAmount, TotalServiceTime, CompanyID, Status)
SELECT GETDATE(), c.CustomerID, cat.CategoryID, 'Complaint', 'Fire alarm not sounding', 'Urgent - safety issue', 1500, 60, 1, 1
FROM Customers c
JOIN ContractCategories cat ON cat.CategoryCode = 'ONE-TIME' AND cat.CompanyID = 1
WHERE c.CustomerCode = 'CUST001' AND c.CompanyID = 1;

-- ==================== SALES MASTER SYSTEMS/SERVICES/ITEMS ====================
INSERT INTO SalesMasterSystems (SalesNo, SystemID, Quantity, Cost)
SELECT sm.SalesNo, sy.SystemID, 1, 1000
FROM SalesMaster sm
JOIN Systems sy ON sy.SystemCode = 'FIRE-ALRM' AND sy.CompanyID = 1
WHERE sm.CompanyID = 1 AND sm.PlanType = 'Plan'
AND NOT EXISTS (SELECT 1 FROM SalesMasterSystems sms WHERE sms.SalesNo = sm.SalesNo);

INSERT INTO SalesMasterServices (SalesNo, ServiceID, Quantity, Cost, ServiceTime)
SELECT sm.SalesNo, s.ServiceID, 1, 2500, 120
FROM SalesMaster sm
JOIN Services s ON s.ServiceCode = 'MAINT' AND s.CompanyID = 1
WHERE sm.CompanyID = 1 AND sm.PlanType = 'Plan'
AND NOT EXISTS (SELECT 1 FROM SalesMasterServices sms WHERE sms.SalesNo = sm.SalesNo);

INSERT INTO SalesMasterItems (SalesNo, ItemID, Quantity, Cost)
SELECT sm.SalesNo, i.ItemID, 2, 500
FROM SalesMaster sm
JOIN Items i ON i.ItemCode = 'SMOKE-DET' AND i.CompanyID = 1
WHERE sm.CompanyID = 1 AND sm.PlanType = 'Plan'
AND NOT EXISTS (SELECT 1 FROM SalesMasterItems smi WHERE smi.SalesNo = sm.SalesNo);

-- ==================== SCHEDULE ====================
INSERT INTO Schedule (SalesNo, ScheduleDate, ServiceTime, EngineerID, ServiceStatus, Notes)
SELECT sm.SalesNo, '2024-07-15', '10:00', e.EngineerID, 'Pending', 'Quarterly maintenance visit'
FROM SalesMaster sm
JOIN ServiceEngineers e ON e.EngineerName = 'Amit Sharma' AND e.CompanyID = 1
WHERE sm.CompanyID = 1 AND sm.PlanType = 'Plan'
AND NOT EXISTS (SELECT 1 FROM Schedule sch WHERE sch.SalesNo = sm.SalesNo);

-- Add a completed schedule
INSERT INTO Schedule (SalesNo, ScheduleDate, ServiceTime, EngineerID, ServiceStatus, Notes)
SELECT sm.SalesNo, '2024-04-15', '14:00', e.EngineerID, 'Completed', 'Q1 maintenance completed'
FROM SalesMaster sm
JOIN ServiceEngineers e ON e.EngineerName = 'Neha Singh' AND e.CompanyID = 1
WHERE sm.CompanyID = 1 AND sm.PlanType = 'Plan'
AND NOT EXISTS (SELECT 1 FROM Schedule sch WHERE sch.SalesNo = sm.SalesNo AND sch.ServiceStatus = 'Completed');

-- ==================== COMPLAINTS ====================
IF NOT EXISTS (SELECT 1 FROM Complaints)
INSERT INTO Complaints (SalesNo, ComplaintDate, Description, Status)
SELECT sm.SalesNo, GETDATE(), 'Customer reports fire alarm not activating during test', 'Open'
FROM SalesMaster sm
WHERE sm.PlanType = 'Complaint' AND sm.CompanyID = 1;

-- ==================== SALES MASTER PLANS ====================
INSERT INTO SalesMasterPlan (CustomerID, PlanType, Frequency, Notes, CreatedBy, UpdatedBy, Status)
SELECT c.CustomerID, 'Plan', 'Monthly', 'Monthly fire safety inspection plan', 1, 1, 1
FROM Customers c
WHERE c.CustomerCode IN ('CUST001','CUST002','CUST003') AND c.CompanyID = 1
AND NOT EXISTS (SELECT 1 FROM SalesMasterPlan smp WHERE smp.CustomerID = c.CustomerID AND smp.Frequency = 'Monthly');

INSERT INTO SalesMasterPlan (CustomerID, PlanType, Frequency, Notes, CreatedBy, UpdatedBy, Status)
SELECT c.CustomerID, 'Plan', 'Quarterly', 'Quarterly comprehensive service plan', 1, 1, 1
FROM Customers c
WHERE c.CustomerCode IN ('CUST004','CUST005','CUST006') AND c.CompanyID = 1
AND NOT EXISTS (SELECT 1 FROM SalesMasterPlan smp WHERE smp.CustomerID = c.CustomerID AND smp.Frequency = 'Quarterly');

-- ==================== SALES MASTER PLAN SYSTEMS ====================
INSERT INTO SalesMasterPlanSystem (PlanID, SystemID, Quantity)
SELECT smp.PlanID, sy.SystemID, 1
FROM SalesMasterPlan smp
JOIN Systems sy ON sy.SystemCode = 'FIRE-ALRM' AND sy.CompanyID = 1
WHERE smp.Status = 1
AND NOT EXISTS (SELECT 1 FROM SalesMasterPlanSystem smps WHERE smps.PlanID = smp.PlanID AND smps.SystemID = sy.SystemID);

INSERT INTO SalesMasterPlanSystem (PlanID, SystemID, Quantity)
SELECT smp.PlanID, sy.SystemID, 1
FROM SalesMasterPlan smp
JOIN Systems sy ON sy.SystemCode = 'CCTV-STD' AND sy.CompanyID = 1
WHERE smp.Status = 1 AND smp.Frequency = 'Quarterly'
AND NOT EXISTS (SELECT 1 FROM SalesMasterPlanSystem smps WHERE smps.PlanID = smp.PlanID AND smps.SystemID = sy.SystemID);

-- ==================== SALES MASTER PLAN SERVICES ====================
INSERT INTO SalesMasterPlanService (PlanID, ServiceID, Quantity)
SELECT smp.PlanID, s.ServiceID, 1
FROM SalesMasterPlan smp
JOIN Services s ON s.ServiceCode = 'MAINT' AND s.CompanyID = 1
WHERE smp.Status = 1
AND NOT EXISTS (SELECT 1 FROM SalesMasterPlanService smps WHERE smps.PlanID = smp.PlanID AND smps.ServiceID = s.ServiceID);

INSERT INTO SalesMasterPlanService (PlanID, ServiceID, Quantity)
SELECT smp.PlanID, s.ServiceID, 1
FROM SalesMasterPlan smp
JOIN Services s ON s.ServiceCode = 'INSPECT' AND s.CompanyID = 1
WHERE smp.Status = 1 AND smp.Frequency = 'Monthly'
AND NOT EXISTS (SELECT 1 FROM SalesMasterPlanService smps WHERE smps.PlanID = smp.PlanID AND smps.ServiceID = s.ServiceID);

-- ==================== SALES MASTER PLAN ITEMS ====================
INSERT INTO SalesMasterPlanItem (PlanID, ItemID, Quantity)
SELECT smp.PlanID, i.ItemID, 2
FROM SalesMasterPlan smp
JOIN Items i ON i.ItemCode = 'SMOKE-DET' AND i.CompanyID = 1
WHERE smp.Status = 1
AND NOT EXISTS (SELECT 1 FROM SalesMasterPlanItem smpi WHERE smpi.PlanID = smp.PlanID AND smpi.ItemID = i.ItemID);

INSERT INTO SalesMasterPlanItem (PlanID, ItemID, Quantity)
SELECT smp.PlanID, i.ItemID, 1
FROM SalesMasterPlan smp
JOIN Items i ON i.ItemCode = 'BATT-12V' AND i.CompanyID = 1
WHERE smp.Status = 1 AND smp.Frequency = 'Quarterly'
AND NOT EXISTS (SELECT 1 FROM SalesMasterPlanItem smpi WHERE smpi.PlanID = smp.PlanID AND smpi.ItemID = i.ItemID);

PRINT 'Seed data inserted successfully!';
