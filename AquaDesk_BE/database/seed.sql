-- AquaDesk Seed Data - Water Treatment Service Provider
-- Run after schema.sql on a clean database.
-- All data references CompanyID=1 (AquaPure Services) unless noted.
-- Uses IF NOT EXISTS guards so it is safe to re-run.
--
-- Demo login credentials:
--   admin / admin123     (SuperAdmin - full access)
--   vikrammgr / pass123 (Manager)
--   priyaeng  / pass123 (Senior Engineer)
--   rahuleng  / pass123 (Junior Engineer)
--   nehaops   / pass123 (Operations)
--   amitacc   / pass123 (Accounts)
--   sachineng / pass123 (Engineer at GreenFlow)

-- ==================== COMPANIES ====================
IF NOT EXISTS (SELECT * FROM Companies WHERE CompanyCode = 'AQUAPURE')
    INSERT INTO Companies (CompanyCode, CompanyName, Address, City, State, Country, Phone, Email, Website, GSTIN, Status)
    VALUES ('AQUAPURE', 'AquaPure Services Pvt Ltd', 'Plot 45, Sector 12, MIDC', 'Mumbai', 'Maharashtra', 'India', '+91-22-67890001', 'info@aquapure.in', 'www.aquapure.in', '27AAHCA1234F1Z5', 1);

IF NOT EXISTS (SELECT * FROM Companies WHERE CompanyCode = 'GREENFLOW')
    INSERT INTO Companies (CompanyCode, CompanyName, Address, City, State, Country, Phone, Email, Website, GSTIN, Status)
    VALUES ('GREENFLOW', 'GreenFlow Water Solutions', 'Survey 89, Baner Road', 'Pune', 'Maharashtra', 'India', '+91-20-56780002', 'contact@greenflow.co.in', 'www.greenflow.co.in', '27BGHCA5678G2H9', 1);

IF NOT EXISTS (SELECT * FROM Companies WHERE CompanyCode = 'CRYSTALCLR')
    INSERT INTO Companies (CompanyCode, CompanyName, Address, City, State, Country, Phone, Email, Website, GSTIN, Status)
    VALUES ('CRYSTALCLR', 'CrystalClear Treatment Services', 'Tower C, Okhla Phase II', 'Delhi', 'Delhi', 'India', '+91-11-45670003', 'info@crystalclear.in', 'www.crystalclear.in', '07CCDCA9012K3L4', 1);

-- ==================== USERS ====================
-- admin / admin123
IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'admin')
    INSERT INTO Users (Username, Password, FullName, Email, Phone, Role, CompanyID, Status)
    VALUES ('admin', '$2b$10$V9dfFWOXKH.lDUOaTWXwHuV2PtptQN5YGyzctQxsh8eiFoHE2.Qcq', 'SuperAdmin', 'admin@aquapure.in', '+91-9820000001', 'Admin', 1, 1);

-- pass123 for all users below
IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'vikrammgr')
    INSERT INTO Users (Username, Password, FullName, Email, Phone, Role, CompanyID, Status)
    VALUES ('vikrammgr', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aOoOv8g.VM9fjL4KSO', 'Vikram Deshmukh', 'vikram@aquapure.in', '+91-9820000010', 'Manager', 1, 1);

IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'priyaeng')
    INSERT INTO Users (Username, Password, FullName, Email, Phone, Role, CompanyID, Status)
    VALUES ('priyaeng', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aOoOv8g.VM9fjL4KSO', 'Priya Joshi', 'priya@aquapure.in', '+91-9820000020', 'Engineer', 1, 1);

IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'rahuleng')
    INSERT INTO Users (Username, Password, FullName, Email, Phone, Role, CompanyID, Status)
    VALUES ('rahuleng', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aOoOv8g.VM9fjL4KSO', 'Rahul Patil', 'rahul@aquapure.in', '+91-9820000030', 'Engineer', 1, 1);

IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'nehaops')
    INSERT INTO Users (Username, Password, FullName, Email, Phone, Role, CompanyID, Status)
    VALUES ('nehaops', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aOoOv8g.VM9fjL4KSO', 'Neha Sharma', 'neha@aquapure.in', '+91-9820000040', 'User', 1, 1);

IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'amitacc')
    INSERT INTO Users (Username, Password, FullName, Email, Phone, Role, CompanyID, Status)
    VALUES ('amitacc', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aOoOv8g.VM9fjL4KSO', 'Amit Verma', 'amit@aquapure.in', '+91-9820000050', 'User', 1, 1);

IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'sachineng')
    INSERT INTO Users (Username, Password, FullName, Email, Phone, Role, CompanyID, Status)
    VALUES ('sachineng', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aOoOv8g.VM9fjL4KSO', 'Sachin Kale', 'sachin@greenflow.co.in', '+91-9820000060', 'Engineer', 2, 1);

GO

-- ==================== USER ACCESS ====================
-- Admin gets full access to all forms
INSERT INTO UserAccess (UserID, FormName, CanView, CanAdd, CanEdit, CanDelete, CanSearch, CanPrint)
SELECT u.UserID, f.FormName, 1, 1, 1, 1, 1, 1
FROM Users u
CROSS JOIN (VALUES ('Dashboard'),('Customer'),('Sales'),('Schedule'),('Report'),('Admin'),('Contract'),('SalesMasterPlan')) AS f(FormName)
WHERE u.Role = 'Admin' AND u.Status = 1
  AND NOT EXISTS (SELECT 1 FROM UserAccess ua WHERE ua.UserID = u.UserID AND ua.FormName = f.FormName);

-- Manager gets view/edit on Customer/Sales/Schedule/Contract/Report but no Admin/User management
INSERT INTO UserAccess (UserID, FormName, CanView, CanAdd, CanEdit, CanDelete, CanSearch, CanPrint)
SELECT u.UserID, f.FormName,
  CASE WHEN f.FormName = 'Admin' THEN 0 ELSE 1 END,
  CASE WHEN f.FormName IN ('Customer','Sales','Schedule','Contract') THEN 1 ELSE 0 END,
  CASE WHEN f.FormName IN ('Customer','Sales','Schedule','Contract') THEN 1 ELSE 0 END,
  0, 1,
  CASE WHEN f.FormName IN ('Customer','Sales','Schedule','Report','Contract') THEN 1 ELSE 0 END
FROM Users u
CROSS JOIN (VALUES ('Dashboard'),('Customer'),('Sales'),('Schedule'),('Report'),('Admin'),('Contract'),('SalesMasterPlan')) AS f(FormName)
WHERE u.Role = 'Manager' AND u.Status = 1
  AND NOT EXISTS (SELECT 1 FROM UserAccess ua WHERE ua.UserID = u.UserID AND ua.FormName = f.FormName);

-- Engineer gets schedule and dashboard only
INSERT INTO UserAccess (UserID, FormName, CanView, CanAdd, CanEdit, CanDelete, CanSearch, CanPrint)
SELECT u.UserID, f.FormName,
  CASE WHEN f.FormName IN ('Dashboard','Schedule') THEN 1 ELSE 0 END,
  CASE WHEN f.FormName = 'Schedule' THEN 1 ELSE 0 END,
  CASE WHEN f.FormName = 'Schedule' THEN 1 ELSE 0 END,
  0, 1, 0
FROM Users u
CROSS JOIN (VALUES ('Dashboard'),('Customer'),('Sales'),('Schedule'),('Report'),('Admin'),('Contract'),('SalesMasterPlan')) AS f(FormName)
WHERE u.Role = 'Engineer' AND u.Status = 1
  AND NOT EXISTS (SELECT 1 FROM UserAccess ua WHERE ua.UserID = u.UserID AND ua.FormName = f.FormName);

-- Other staff (User role) get read-only access to most forms
INSERT INTO UserAccess (UserID, FormName, CanView, CanAdd, CanEdit, CanDelete, CanSearch, CanPrint)
SELECT u.UserID, f.FormName,
  CASE WHEN f.FormName = 'Admin' THEN 0 ELSE 1 END, 0, 0, 0, 1,
  CASE WHEN f.FormName IN ('Dashboard','Report') THEN 1 ELSE 0 END
FROM Users u
CROSS JOIN (VALUES ('Dashboard'),('Customer'),('Sales'),('Schedule'),('Report'),('Admin'),('Contract'),('SalesMasterPlan')) AS f(FormName)
WHERE u.Role = 'User' AND u.Status = 1
  AND NOT EXISTS (SELECT 1 FROM UserAccess ua WHERE ua.UserID = u.UserID AND ua.FormName = f.FormName);

GO
-- ==================== CONTRACT PERIODS ====================
INSERT INTO ContractPeriods (PeriodCode, PeriodName, Description, DurationMonths, CompanyID, Status)
SELECT v.Code, v.Name, v.[Desc], v.Months, 1, 1
FROM (VALUES
  ('1MO', '1 Month', 'Monthly rolling contract', 1),
  ('3MO', '3 Months', 'Quarterly contract', 3),
  ('6MO', '6 Months', 'Half-yearly contract', 6),
  ('1YR', '1 Year', 'Annual AMC contract', 12),
  ('2YR', '2 Years', 'Two-year comprehensive contract', 24),
  ('3YR', '3 Years', 'Three-year long-term contract', 36)
) AS v(Code, Name, [Desc], Months)
WHERE NOT EXISTS (SELECT 1 FROM ContractPeriods WHERE PeriodCode = v.Code);

GO
-- ==================== AREA CODES ====================
INSERT INTO AreaCodes (AreaCode, Description, Priority, CompanyID, Status)
SELECT v.Code, v.[Desc], v.Pri, 1, 1
FROM (VALUES
  ('MUM-INDA', 'Mumbai Industrial MIDC Area', 1),
  ('MUM-WEST', 'Mumbai Western Suburbs', 2),
  ('PUN-IND', 'Pune Industrial Belt (Chinchwad-Bhosari)', 3),
  ('PUN-HINJ', 'Pune Hinjewadi IT Park', 4),
  ('THN-BEL', 'Thane Belapur Road Industrial', 5),
  ('AHM-GIDC', 'Ahmedabad GIDC Estate', 6),
  ('IND-PIT', 'Indore Pithampur Industrial Area', 7),
  ('CHE-GUID', 'Chennai Guindy Industrial Estate', 8)
) AS v(Code, [Desc], Pri)
WHERE NOT EXISTS (SELECT 1 FROM AreaCodes WHERE AreaCode = v.Code);

GO
-- ==================== CONTRACT CATEGORIES ====================
INSERT INTO ContractCategories (CategoryCode, CategoryName, Description, CompanyID, Status)
SELECT v.Code, v.Name, v.[Desc], 1, 1
FROM (VALUES
  ('RO-AMC', 'RO Plant AMC', 'Annual maintenance contract for RO water treatment plants'),
  ('SOFT-AMC', 'Softener AMC', 'Annual maintenance for water softener systems'),
  ('STP-OPS', 'STP Operation & Maintenance', 'Sewage treatment plant operation and maintenance'),
  ('ETP-OPS', 'ETP Operation & Maintenance', 'Effluent treatment plant operation and maintenance')
) AS v(Code, Name, [Desc])
WHERE NOT EXISTS (SELECT 1 FROM ContractCategories WHERE CategoryCode = v.Code);

GO
-- ==================== CONTRACT INTERVALS ====================
INSERT INTO ContractIntervals (IntervalDays, IntervalName, Description, CompanyID, Status)
SELECT v.Days, v.Name, v.[Desc], 1, 1
FROM (VALUES
  (30, 'Monthly', 'Visit every 30 days'),
  (90, 'Quarterly', 'Visit every 90 days'),
  (180, 'Half-Yearly', 'Visit every 180 days'),
  (365, 'Yearly', 'Visit every 365 days')
) AS v(Days, Name, [Desc])
WHERE NOT EXISTS (SELECT 1 FROM ContractIntervals WHERE IntervalName = v.Name AND CompanyID = 1);

GO
-- ==================== SERVICE INTERVALS ====================
INSERT INTO ServiceIntervals (IntervalDays, IntervalName, Description, CompanyID, Status)
SELECT v.Days, v.Name, v.[Desc], 1, 1
FROM (VALUES
  (30, 'Monthly', 'Monthly preventive maintenance'),
  (90, 'Quarterly', 'Quarterly maintenance visit'),
  (180, 'Half-Yearly', 'Half-yearly preventive maintenance'),
  (365, 'Yearly', 'Annual overhaul')
) AS v(Days, Name, [Desc])
WHERE NOT EXISTS (SELECT 1 FROM ServiceIntervals WHERE IntervalName = v.Name AND CompanyID = 1);

GO
-- ==================== SYSTEMS (Water Treatment Equipment) ====================
INSERT INTO Systems (SystemCode, SystemName, Description, CompanyID, Status)
SELECT v.Code, v.Name, v.[Desc], 1, 1
FROM (VALUES
  ('RO-500',  'RO Plant 500 LPH',    'Reverse Osmosis plant, 500 litres per hour capacity'),
  ('RO-2000', 'RO Plant 2000 LPH',   'Reverse Osmosis plant, 2000 litres per hour capacity'),
  ('SOFT-2',  'Softener 2 m3/hr',    'Dual-vessel water softener, 2 cubic metres per hour'),
  ('SOFT-5',  'Softener 5 m3/hr',    'Twin-bed water softener, 5 cubic metres per hour'),
  ('DM-1',    'DM Plant 1 m3/hr',    'De-mineralisation plant, 1 cubic metre per hour'),
  ('STP-100', 'STP 100 KLD',        'Sewage treatment plant, 100 kilolitres per day (MBBR based)'),
  ('ETP-50',  'ETP 50 KLD',         'Effluent treatment plant, 50 kilolitres per day')
) AS v(Code, Name, [Desc])
WHERE NOT EXISTS (SELECT 1 FROM Systems WHERE SystemCode = v.Code);

GO
-- ==================== SERVICES ====================
INSERT INTO Services (ServiceCode, ServiceName, Description, CompanyID, Status)
SELECT v.Code, v.Name, v.[Desc], 1, 1
FROM (VALUES
  ('QPM',       'Quarterly Preventive Maintenance', 'Routine quarterly check of all mechanical and electrical components'),
  ('MEM-CLN',   'RO Membrane Chemical Cleaning',    'Chemical cleaning of RO membranes to restore flux and rejection'),
  ('FLT-REPL',  'Filter Cartridge Replacement',     'Replacement of sediment and carbon filter cartridges'),
  ('RES-REPL',  'Resin Replacement',                'Change of cation/anion resin in softeners and DM plants'),
  ('STP-INS',   'STP/ETP Inspection & O&M',         'Inspection of aeration, blowers, pumps and sludge removal'),
  ('TDS-CHECK', 'Water Quality Analysis',            'TDS, pH, hardness, conductivity and chlorine testing'),
  ('DOS-CALIB', 'Dosing Pump Calibration',           'Calibration and servicing of chemical dosing pumps'),
  ('EMG-REPAIR','Emergency Breakdown Repair',        'Unscheduled breakdown repair for critical water systems')
) AS v(Code, Name, [Desc])
WHERE NOT EXISTS (SELECT 1 FROM Services WHERE ServiceCode = v.Code);

GO
-- ==================== ITEMS (Spare Parts) ====================
INSERT INTO Items (ItemCode, ItemName, Description, Unit, CompanyID, Status)
SELECT v.Code, v.Name, v.[Desc], v.Unit, 1, 1
FROM (VALUES
  ('RO-MEM-40',  'RO Membrane 4040',      'Thin-film composite RO membrane element 4"x40"', 'Pcs'),
  ('FLT-C20',    'Filter Cartridge 20"',   'Melt-blown polypropylene sediment cartridge 20 micron', 'Pcs'),
  ('DOS-PUMP',   'Dosing Pump',            'Electronic dosing pump 5 LPH', 'Pcs'),
  ('RES-CAT',    'Cation Resin',           'Strong acid cation exchange resin (gel type)', 'Ltr'),
  ('RES-AN',     'Anion Resin',            'Strong base anion exchange resin (Type I)', 'Ltr'),
  ('UV-LAMP',    'UV Steriliser Lamp',     'UV-C germicidal lamp 254nm 40W', 'Pcs'),
  ('FLOW-MTR',   'Flow Meter',             'Rotameter-type flow meter 0-2000 LPH', 'Pcs'),
  ('PRS-GAUGE',  'Pressure Gauge',         'Bourdon tube pressure gauge 0-300 PSI', 'Pcs'),
  ('SOL-VALVE',  'Solenoid Valve',         'Plastic solenoid valve 1" NPT 24V AC', 'Pcs'),
  ('MEM-HSG',    'Membrane Housing',       'FRP pressure vessel 4" diameter side-entry', 'Pcs')
) AS v(Code, Name, [Desc], Unit)
WHERE NOT EXISTS (SELECT 1 FROM Items WHERE ItemCode = v.Code);

GO
-- ==================== ITEM STOCK ====================
INSERT INTO ItemStock (ItemID, CompanyID, Quantity, ReorderLevel)
SELECT i.ItemID, 1, v.Qty, v.RoLvl
FROM Items i
JOIN (VALUES
  ('RO-MEM-40', 25, 5),
  ('FLT-C20',   200, 50),
  ('DOS-PUMP',  15, 5),
  ('RES-CAT',   500, 100),
  ('RES-AN',    500, 100),
  ('UV-LAMP',   30, 10),
  ('FLOW-MTR',  20, 5),
  ('PRS-GAUGE', 40, 10),
  ('SOL-VALVE', 25, 8),
  ('MEM-HSG',   10, 3)
) AS v(Code, Qty, RoLvl) ON i.ItemCode = v.Code
WHERE NOT EXISTS (SELECT 1 FROM ItemStock s WHERE s.ItemID = i.ItemID);

GO
-- ==================== SERVICE COSTS ====================
INSERT INTO ServiceCost (CategoryID, ServiceID, Cost, ServiceTime, CompanyID)
SELECT cc.CategoryID, s.ServiceID, v.Cost, v.Time, 1
FROM ContractCategories cc
CROSS JOIN Services s
JOIN (VALUES
  ('QPM',        2500, 120),
  ('MEM-CLN',    6000, 180),
  ('FLT-REPL',   1200, 60),
  ('RES-REPL',   8000, 240),
  ('STP-INS',    4500, 180),
  ('TDS-CHECK',  800,  30),
  ('DOS-CALIB',  2000, 90),
  ('EMG-REPAIR', 3500, 150)
) AS v(Code, Cost, Time) ON s.ServiceCode = v.Code
WHERE s.Status = 1 AND cc.Status = 1 AND cc.CompanyID = 1
  AND NOT EXISTS (SELECT 1 FROM ServiceCost sc WHERE sc.CategoryID = cc.CategoryID AND sc.ServiceID = s.ServiceID);

GO
-- ==================== SYSTEM COSTS ====================
INSERT INTO SystemCost (CategoryID, SystemID, Cost, CompanyID)
SELECT cc.CategoryID, sy.SystemID, v.Cost, 1
FROM ContractCategories cc
CROSS JOIN Systems sy
JOIN (VALUES
  ('RO-500',  18000), ('RO-2000', 35000),
  ('SOFT-2',  10000), ('SOFT-5',  18000),
  ('DM-1',    22000), ('STP-100', 55000),
  ('ETP-50',  65000)
) AS v(Code, Cost) ON sy.SystemCode = v.Code
WHERE sy.Status = 1 AND cc.Status = 1 AND cc.CompanyID = 1
  AND NOT EXISTS (SELECT 1 FROM SystemCost sc WHERE sc.CategoryID = cc.CategoryID AND sc.SystemID = sy.SystemID);

GO
-- ==================== ITEM COSTS ====================
INSERT INTO ItemCost (CategoryID, ItemID, Cost, CompanyID)
SELECT cc.CategoryID, i.ItemID, v.Cost, 1
FROM ContractCategories cc
CROSS JOIN Items i
JOIN (VALUES
  ('RO-MEM-40', 8500), ('FLT-C20',   350),
  ('DOS-PUMP',  4500), ('RES-CAT',   150),
  ('RES-AN',    250),  ('UV-LAMP',   3800),
  ('FLOW-MTR',  2800), ('PRS-GAUGE', 1200),
  ('SOL-VALVE', 2200), ('MEM-HSG',   6500)
) AS v(Code, Cost) ON i.ItemCode = v.Code
WHERE i.Status = 1 AND cc.Status = 1 AND cc.CompanyID = 1
  AND NOT EXISTS (SELECT 1 FROM ItemCost ic WHERE ic.CategoryID = cc.CategoryID AND ic.ItemID = i.ItemID);

GO
-- ==================== SERVICE HOURS ====================
INSERT INTO ServiceHours (DayOfWeek, StartTime, EndTime, CompanyID)
SELECT v.Day, v.Start, v.[End], 1
FROM (VALUES
  (1, '09:00', '18:00'), (2, '09:00', '18:00'), (3, '09:00', '18:00'),
  (4, '09:00', '18:00'), (5, '09:00', '18:00'), (6, '09:00', '14:00')
) AS v(Day, Start, [End])
WHERE NOT EXISTS (SELECT 1 FROM ServiceHours sh WHERE sh.DayOfWeek = v.Day AND sh.CompanyID = 1);

GO
-- ==================== SERVICE TEAMS ====================
INSERT INTO ServiceTeams (TeamName, Description, CompanyID, Status)
SELECT v.Name, v.[Desc], 1, 1
FROM (VALUES
  ('Mumbai RO Team',     'RO & DM plant specialists - Mumbai region'),
  ('Mumbai STP Team',    'STP & ETP operations team - Mumbai & Thane'),
  ('Pune Region Team',   'Combined service team - Pune & Ahmedabad'),
  ('Indore & North Team','Service team covering Indore - Delhi corridor')
) AS v(Name, [Desc])
WHERE NOT EXISTS (SELECT 1 FROM ServiceTeams WHERE TeamName = v.Name AND CompanyID = 1);

GO
-- ==================== SERVICE ENGINEERS ====================
INSERT INTO ServiceEngineers (EngineerName, Phone, Email, TeamID, CompanyID, Status)
SELECT v.Name, v.Phone, v.Email, t.TeamID, 1, 1
FROM (VALUES
  ('Priya Joshi',      '+91-9988770101', 'priya.j@aquapure.in', 'Mumbai RO Team'),
  ('Rahul Patil',      '+91-9988770102', 'rahul.p@aquapure.in', 'Mumbai RO Team'),
  ('Vijay More',       '+91-9988770103', 'vijay.m@aquapure.in', 'Mumbai STP Team'),
  ('Sunita Desai',     '+91-9988770104', 'sunita.d@aquapure.in', 'Mumbai STP Team'),
  ('Vikram Jadhav',    '+91-9988770105', 'vikram.j@aquapure.in', 'Pune Region Team'),
  ('Deepak Joshi',     '+91-9988770106', 'deepak.j@aquapure.in', 'Pune Region Team'),
  ('Kavita Nair',      '+91-9988770107', 'kavita.n@aquapure.in', 'Indore & North Team'),
  ('Suresh Menon',     '+91-9988770108', 'suresh.m@aquapure.in', 'Indore & North Team')
) AS v(Name, Phone, Email, TeamName)
JOIN ServiceTeams t ON t.TeamName = v.TeamName AND t.CompanyID = 1
WHERE NOT EXISTS (SELECT 1 FROM ServiceEngineers WHERE EngineerName = v.Name AND CompanyID = 1);

GO
-- ==================== CUSTOMERS ====================
INSERT INTO Customers (CustomerCode, CustomerName, Flat, Block, Road, City, State, Country, Mobile, Email, AreaCodeID, CompanyID, Status)
SELECT v.Code, v.Name, v.Flat, v.Block, v.Road, v.City, v.State, v.Country, v.Mobile, v.Email, ac.AreaCodeID, 1, 1
FROM (VALUES
  ('CUST_BOT_MUM_01', 'ABC Bottling Plant Pvt Ltd',    'A-101', 'A', 'MIDC Road, Andheri East',          'Mumbai',      'Maharashtra', 'India', '+91-9820010101', 'plant@abcbottling.in',     'MUM-INDA'),
  ('CUST_SOC_PUN_01', 'Sunrise Housing Society',        'B-201', 'B', 'Baner Pashan Link Road',           'Pune',        'Maharashtra', 'India', '+91-9820010102', 'sec@sunrisesociety.org',   'PUN-HINJ'),
  ('CUST_HOS_IND_01', 'CityCare Super Speciality Hosp.', 'C-301', 'C', 'A.B. Road, Pithampur',             'Indore',      'Madhya Pradesh','India','+91-9820010103', 'engg@citycarehospital.in', 'IND-PIT'),
  ('CUST_HOT_MUM_01', 'BlueWave Hotel & Residency',     'D-401', 'D', 'Juhu Tara Road',                   'Mumbai',      'Maharashtra', 'India', '+91-9820010104', 'maintenance@bluewave.in',  'MUM-WEST'),
  ('CUST_MFG_AHM_01', 'MetroTech Manufacturing Ltd',    'E-501', 'E', 'GIDC Estate, Narol',               'Ahmedabad',   'Gujarat',     'India', '+91-9820010105', 'facility@metrotech.co.in', 'AHM-GIDC'),
  ('CUST_SOC_THN_01', 'Green Valley Residency',         'F-601', 'F', 'Pokhran Road No 2',                'Thane',       'Maharashtra', 'India', '+91-9820010106', 'admin@greenvalley.com',    'THN-BEL'),
  ('CUST_PHA_MUM_01', 'Medilife Pharmaceuticals Ltd',   'G-701', 'G', 'MIDC Phase II, Andheri East',      'Mumbai',      'Maharashtra', 'India', '+91-9820010107', 'eng@medilifepharma.in',    'MUM-INDA'),
  ('CUST_CHE_CHE_01', 'Chemfab Industries Ltd',         'H-801', 'H', 'Guindy Industrial Estate',         'Chennai',     'Tamil Nadu',  'India', '+91-9820010108', 'environment@chemfab.in',   'CHE-GUID'),
  ('CUST_HOS_PUN_01', 'Sahyadri Medical Centre',        'I-901', 'I', 'Chinchwad Station Road',           'Pune',        'Maharashtra', 'India', '+91-9820010109', 'hosp.engg@sahyadri.in',    'PUN-IND'),
  ('CUST_HOT_MUM_02', 'Grand Galaxy Hotel & Convention', 'J-1001','J', 'Linking Road, Bandra West',        'Mumbai',      'Maharashtra', 'India', '+91-9820010110', 'facility@grandgalaxy.com', 'MUM-WEST')
) AS v(Code, Name, Flat, Block, Road, City, State, Country, Mobile, Email, AreaCode)
LEFT JOIN AreaCodes ac ON ac.AreaCode = v.AreaCode AND ac.CompanyID = 1
WHERE NOT EXISTS (SELECT 1 FROM Customers WHERE CustomerCode = v.Code);

GO
-- ==================== CUSTOMER PORTAL USERS ====================
-- Customer portal login credentials (all pass123):
--   abccustomer  / pass123 (ABC Bottling Plant)
--   sunriseadmin / pass123 (Sunrise Housing Society)
--   citycareeng  / pass123 (CityCare Hospital)
--   bluewaveuser / pass123 (BlueWave Hotel)
IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'abccustomer')
    INSERT INTO Users (Username, Password, FullName, Email, Phone, Role, CompanyID, CustomerID, Status)
    SELECT 'abccustomer', '$2b$10$ZORbHNz5JEPXzrWD/AMbbeoqfN5QblVafN5JMLvZTo9TiupF.K/De', 'ABC Bottling Admin', 'plant@abcbottling.in', '+91-9820010101', 'Customer', 1, c.CustomerID, 1
    FROM Customers c WHERE c.CustomerCode = 'CUST_BOT_MUM_01';

IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'sunriseadmin')
    INSERT INTO Users (Username, Password, FullName, Email, Phone, Role, CompanyID, CustomerID, Status)
    SELECT 'sunriseadmin', '$2b$10$ZORbHNz5JEPXzrWD/AMbbeoqfN5QblVafN5JMLvZTo9TiupF.K/De', 'Sunrise Society Secretary', 'sec@sunrisesociety.org', '+91-9820010102', 'Customer', 1, c.CustomerID, 1
    FROM Customers c WHERE c.CustomerCode = 'CUST_SOC_PUN_01';

IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'citycareeng')
    INSERT INTO Users (Username, Password, FullName, Email, Phone, Role, CompanyID, CustomerID, Status)
    SELECT 'citycareeng', '$2b$10$ZORbHNz5JEPXzrWD/AMbbeoqfN5QblVafN5JMLvZTo9TiupF.K/De', 'CityCare Hospital Engineer', 'engg@citycarehospital.in', '+91-9820010103', 'Customer', 1, c.CustomerID, 1
    FROM Customers c WHERE c.CustomerCode = 'CUST_HOS_IND_01';

IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'bluewaveuser')
    INSERT INTO Users (Username, Password, FullName, Email, Phone, Role, CompanyID, CustomerID, Status)
    SELECT 'bluewaveuser', '$2b$10$ZORbHNz5JEPXzrWD/AMbbeoqfN5QblVafN5JMLvZTo9TiupF.K/De', 'BlueWave Hotel Maintenance', 'maintenance@bluewave.in', '+91-9820010104', 'Customer', 1, c.CustomerID, 1
    FROM Customers c WHERE c.CustomerCode = 'CUST_HOT_MUM_01';

GO
-- ==================== CUSTOMER SYSTEMS ====================
INSERT INTO CustomerSystems (CustomerID, SystemID, SystemType, SerialNumber, InstallDate, Status, Notes)
SELECT c.CustomerID, sy.SystemID, 'Contracted', v.Serial, v.Install, 1, 'Installed under service agreement'
FROM (VALUES
  ('CUST_BOT_MUM_01', 'RO-2000', 'SN-RO2K-001', '2024-06-15'),
  ('CUST_BOT_MUM_01', 'SOFT-5',  'SN-SFT5-012', '2024-06-15'),
  ('CUST_SOC_PUN_01', 'SOFT-2',  'SN-SFT2-045', '2025-01-20'),
  ('CUST_HOS_IND_01', 'RO-500',  'SN-RO5H-023', '2024-11-01'),
  ('CUST_HOS_IND_01', 'STP-100', 'SN-STP1-008', '2025-03-10'),
  ('CUST_HOT_MUM_01', 'SOFT-5',  'SN-SFT5-018', '2024-09-01'),
  ('CUST_HOT_MUM_01', 'STP-100', 'SN-STP1-011', '2024-09-01'),
  ('CUST_MFG_AHM_01', 'DM-1',    'SN-DM1-005',  '2025-02-01'),
  ('CUST_SOC_THN_01', 'SOFT-2',  'SN-SFT2-052', '2025-04-10'),
  ('CUST_PHA_MUM_01', 'RO-2000', 'SN-RO2K-007', '2023-08-01'),
  ('CUST_PHA_MUM_01', 'DM-1',    'SN-DM1-009',  '2023-08-01'),
  ('CUST_CHE_CHE_01', 'ETP-50',  'SN-ETP5-003', '2024-12-01'),
  ('CUST_HOS_PUN_01', 'RO-500',  'SN-RO5H-031', '2025-06-01'),
  ('CUST_HOS_PUN_01', 'STP-100', 'SN-STP1-015', '2025-06-01'),
  ('CUST_HOT_MUM_02', 'RO-500',  'SN-RO5H-035', '2025-09-15'),
  ('CUST_HOT_MUM_02', 'SOFT-5',  'SN-SFT5-022', '2025-09-15')
) AS v(CustCode, SysCode, Serial, Install)
JOIN Customers c ON c.CustomerCode = v.CustCode
JOIN Systems sy ON sy.SystemCode = v.SysCode
WHERE NOT EXISTS (SELECT 1 FROM CustomerSystems cs WHERE cs.SerialNumber = v.Serial);

GO
-- ==================== SERVICE CONTRACTS ====================
INSERT INTO ServiceContracts (CustomerID, CustomerSystemID, CategoryID, ContractPeriod, Frequency, StartDate, EndDate, Notes, Status)
SELECT c.CustomerID, cs.CustomerSystemID, cat.CategoryID, v.PeriodMonths, v.FreqMonths, v.StartDate, v.EndDate, v.Notes, 1
FROM (VALUES
  ('CUST_BOT_MUM_01', 'RO-2000', 'RO-AMC',   12, 1, '2025-01-01', '2025-12-31', 'Annual RO AMC - monthly visit'),
  ('CUST_BOT_MUM_01', 'SOFT-5',  'SOFT-AMC', 12, 3, '2025-01-01', '2025-12-31', 'Annual softener AMC - quarterly visit'),
  ('CUST_SOC_PUN_01', 'SOFT-2',  'SOFT-AMC', 12, 3, '2025-04-01', '2026-03-31', 'Society softener annual contract'),
  ('CUST_HOS_IND_01', 'RO-500',  'RO-AMC',   12, 1, '2025-02-01', '2026-01-31', 'Hospital RO - monthly PM'),
  ('CUST_HOS_IND_01', 'STP-100', 'STP-OPS',  12, 1, '2025-04-01', '2026-03-31', 'STP O&M - monthly visit'),
  ('CUST_HOT_MUM_01', 'SOFT-5',  'SOFT-AMC', 12, 3, '2025-01-01', '2025-12-31', 'Hotel softener annual AMC'),
  ('CUST_HOT_MUM_01', 'STP-100', 'STP-OPS',  12, 1, '2025-01-01', '2025-12-31', 'STP O&M contract'),
  ('CUST_MFG_AHM_01', 'DM-1',    'SOFT-AMC', 12, 3, '2025-03-01', '2026-02-28', 'DM plant maintenance contract'),
  ('CUST_SOC_THN_01', 'SOFT-2',  'SOFT-AMC', 12, 3, '2025-05-01', '2026-04-30', 'Residential softener AMC'),
  ('CUST_PHA_MUM_01', 'RO-2000', 'RO-AMC',   24, 1, '2025-01-01', '2026-12-31', 'Pharma RO - 2 year AMC with monthly visits'),
  ('CUST_PHA_MUM_01', 'DM-1',    'SOFT-AMC', 24, 3, '2025-01-01', '2026-12-31', 'Pharma DM plant - 2 year resin replacement'),
  ('CUST_CHE_CHE_01', 'ETP-50',  'ETP-OPS',  12, 1, '2025-01-01', '2025-12-31', 'ETP O&M monthly contract'),
  ('CUST_HOS_PUN_01', 'RO-500',  'RO-AMC',   12, 1, '2025-07-01', '2026-06-30', 'New hospital RO AMC'),
  ('CUST_HOS_PUN_01', 'STP-100', 'STP-OPS',  12, 1, '2025-07-01', '2026-06-30', 'New hospital STP O&M'),
  ('CUST_HOT_MUM_02', 'RO-500',  'RO-AMC',   12, 3, '2025-10-01', '2026-09-30', 'Hotel RO quarterly AMC'),
  ('CUST_HOT_MUM_02', 'SOFT-5',  'SOFT-AMC', 12, 3, '2025-10-01', '2026-09-30', 'Hotel softener quarterly AMC')
) AS v(CustCode, SysCode, CatCode, PeriodMonths, FreqMonths, StartDate, EndDate, Notes)
JOIN Customers c ON c.CustomerCode = v.CustCode
JOIN CustomerSystems cs ON cs.CustomerID = c.CustomerID
JOIN Systems sy ON sy.SystemCode = v.SysCode AND cs.SystemID = sy.SystemID
JOIN ContractCategories cat ON cat.CategoryCode = v.CatCode
WHERE NOT EXISTS (
  SELECT 1 FROM ServiceContracts sc
  WHERE sc.CustomerID = c.CustomerID AND sc.CustomerSystemID = cs.CustomerSystemID AND sc.CategoryID = cat.CategoryID
);

GO
-- ==================== SALES MASTER (Plans + one Complaint) ====================
INSERT INTO SalesMaster (SalesDate, CustomerID, CategoryID, ServiceIntervalID, ContractIntervalID, ContractStartDate, PlanType, Description, Notes, TotalAmount, TotalServiceTime, CompanyID, Status)
SELECT '2025-01-01', c.CustomerID, cat.CategoryID, si.ServiceIntervalID,
  ci.IntervalID, '2025-01-01', 'Plan', v.[Desc], v.Notes, v.Amount, v.SvcTime, 1, 1
FROM (VALUES
  ('CUST_BOT_MUM_01', 'RO-AMC',   'RO plant annual maintenance plan', 'Bottling plant - monthly RO service',   36000, 1440),
  ('CUST_SOC_PUN_01', 'SOFT-AMC', 'Softener maintenance plan',        'Society - quarterly softener service',  12000, 480),
  ('CUST_HOS_IND_01', 'RO-AMC',   'Hospital RO maintenance plan',     'RO + STP combined hospital contract',   55000, 2400),
  ('CUST_HOT_MUM_01', 'SOFT-AMC', 'Hotel water treatment plan',       'Softener + STP for hotel',              65000, 2880),
  ('CUST_MFG_AHM_01', 'SOFT-AMC', 'DM plant maintenance plan',        'Manufacturing DM water contract',       25000, 960),
  ('CUST_PHA_MUM_01', 'RO-AMC',   'Pharma RO + DM plan',              'Dual plant service - 2 year term',      120000, 4800),
  ('CUST_CHE_CHE_01', 'ETP-OPS',  'ETP O&M plan',                     'Chemical plant effluent treatment',     55000, 2160),
  ('CUST_HOS_PUN_01', 'RO-AMC',   'Hospital water treatment plan',   'RO + STP for new hospital client',      60000, 2400),
  ('CUST_HOT_MUM_02', 'RO-AMC',   'Hotel RO maintenance plan',        'RO + softener for grand hotel',         36000, 1440)
) AS v(CustCode, CatCode, [Desc], Notes, Amount, SvcTime)
JOIN Customers c ON c.CustomerCode = v.CustCode
JOIN ContractCategories cat ON cat.CategoryCode = v.CatCode AND cat.CompanyID = 1
JOIN ServiceIntervals si ON si.IntervalName = 'Monthly' AND si.CompanyID = 1
JOIN ContractIntervals ci ON ci.IntervalName = 'Yearly' AND ci.CompanyID = 1
WHERE NOT EXISTS (SELECT 1 FROM SalesMaster sm WHERE sm.CustomerID = c.CustomerID AND sm.PlanType = 'Plan' AND sm.CompanyID = 1);

-- Complaint SalesMaster
IF NOT EXISTS (SELECT 1 FROM SalesMaster WHERE PlanType = 'Complaint' AND CompanyID = 1)
INSERT INTO SalesMaster (SalesDate, CustomerID, CategoryID, PlanType, Description, Notes, TotalAmount, TotalServiceTime, CompanyID, Status)
SELECT '2026-04-20', c.CustomerID, cat.CategoryID, 'Complaint', 'Emergency breakdown', 'Low RO pressure - urgent visit needed', 3500, 120, 1, 1
FROM Customers c
JOIN ContractCategories cat ON cat.CategoryCode = 'RO-AMC' AND cat.CompanyID = 1
WHERE c.CustomerCode = 'CUST_HOS_IND_01' AND c.CompanyID = 1;

GO
-- ==================== SALES MASTER SYSTEMS / SERVICES / ITEMS ====================
INSERT INTO SalesMasterSystems (SalesNo, SystemID, Quantity, Cost)
SELECT sm.SalesNo, sy.SystemID, 1, v.Cost
FROM SalesMaster sm
CROSS JOIN (VALUES
  ('CUST_BOT_MUM_01', 'RO-2000', 35000),
  ('CUST_SOC_PUN_01', 'SOFT-2',  10000),
  ('CUST_HOS_IND_01', 'RO-500',  18000),
  ('CUST_HOT_MUM_01', 'SOFT-5',  18000),
  ('CUST_MFG_AHM_01', 'DM-1',    22000),
  ('CUST_PHA_MUM_01', 'RO-2000', 35000),
  ('CUST_CHE_CHE_01', 'ETP-50',  65000),
  ('CUST_HOS_PUN_01', 'RO-500',  18000),
  ('CUST_HOT_MUM_02', 'RO-500',  18000)
) AS v(CustCode, SysCode, Cost)
JOIN Customers c ON c.CustomerCode = v.CustCode
JOIN Systems sy ON sy.SystemCode = v.SysCode
WHERE sm.CustomerID = c.CustomerID AND sm.PlanType = 'Plan' AND sm.CompanyID = 1
  AND NOT EXISTS (SELECT 1 FROM SalesMasterSystems sms WHERE sms.SalesNo = sm.SalesNo);

INSERT INTO SalesMasterServices (SalesNo, ServiceID, Quantity, Cost, ServiceTime)
SELECT sm.SalesNo, s.ServiceID, v.Qty, v.Cost, v.SvcTime
FROM SalesMaster sm
CROSS JOIN (VALUES
  ('CUST_BOT_MUM_01', 'QPM',    12, 2500, 120),
  ('CUST_SOC_PUN_01', 'QPM',    4,  2500, 120),
  ('CUST_HOS_IND_01', 'QPM',    12, 2500, 120),
  ('CUST_HOT_MUM_01', 'QPM',    4,  2500, 120),
  ('CUST_MFG_AHM_01', 'RES-REPL', 2, 8000, 240),
  ('CUST_PHA_MUM_01', 'MEM-CLN',  6, 6000, 180),
  ('CUST_CHE_CHE_01', 'STP-INS', 12, 4500, 180),
  ('CUST_HOS_PUN_01', 'QPM',    12, 2500, 120),
  ('CUST_HOT_MUM_02', 'QPM',    4,  2500, 120)
) AS v(CustCode, SvcCode, Qty, Cost, SvcTime)
JOIN Customers c ON c.CustomerCode = v.CustCode
JOIN Services s ON s.ServiceCode = v.SvcCode
WHERE sm.CustomerID = c.CustomerID AND sm.PlanType = 'Plan' AND sm.CompanyID = 1
  AND NOT EXISTS (SELECT 1 FROM SalesMasterServices sms WHERE sms.SalesNo = sm.SalesNo);

INSERT INTO SalesMasterItems (SalesNo, ItemID, Quantity, Cost)
SELECT sm.SalesNo, i.ItemID, v.Qty, v.Cost
FROM SalesMaster sm
CROSS JOIN (VALUES
  ('CUST_BOT_MUM_01', 'RO-MEM-40', 6, 8500),
  ('CUST_SOC_PUN_01', 'RES-CAT',   50, 150),
  ('CUST_HOS_IND_01', 'FLT-C20',   12, 350),
  ('CUST_HOT_MUM_01', 'RES-CAT',   50, 150),
  ('CUST_MFG_AHM_01', 'RES-AN',    100, 250),
  ('CUST_PHA_MUM_01', 'RO-MEM-40', 12, 8500),
  ('CUST_CHE_CHE_01', 'DOS-PUMP',  2,  4500),
  ('CUST_HOS_PUN_01', 'FLT-C20',   12, 350),
  ('CUST_HOT_MUM_02', 'FLT-C20',   8,  350)
) AS v(CustCode, ItemCode, Qty, Cost)
JOIN Customers c ON c.CustomerCode = v.CustCode
JOIN Items i ON i.ItemCode = v.ItemCode
WHERE sm.CustomerID = c.CustomerID AND sm.PlanType = 'Plan' AND sm.CompanyID = 1
  AND NOT EXISTS (SELECT 1 FROM SalesMasterItems smi WHERE smi.SalesNo = sm.SalesNo);

GO
-- ==================== SCHEDULE ====================
-- Past completed visits
INSERT INTO Schedule (SalesNo, ScheduleDate, ServiceTime, EngineerID, ServiceStatus, Notes)
SELECT sm.SalesNo, v.SchDate, v.SvcTime, e.EngineerID, 'Completed', v.Notes
FROM SalesMaster sm
CROSS JOIN (VALUES
  ('CUST_BOT_MUM_01', '2026-01-15', '10:00', 'Priya Joshi', 'Jan PM complete - membrane pressure OK'),
  ('CUST_BOT_MUM_01', '2026-02-15', '10:00', 'Rahul Patil',  'Feb PM - filter changed, dosing pump calibrated'),
  ('CUST_SOC_PUN_01', '2026-01-20', '14:00', 'Vikram Jadhav','Q1 softener service - brine tank cleaned'),
  ('CUST_HOS_IND_01', '2026-01-05', '09:00', 'Kavita Nair',  'Monthly RO PM - TDS 12 ppm, membrance OK'),
  ('CUST_HOS_IND_01', '2026-02-02', '09:00', 'Kavita Nair',  'STP inspection - aeration blower serviced'),
  ('CUST_HOT_MUM_01', '2026-01-10', '11:00', 'Sunita Desai', 'Quarterly - softener resin checked, STP sludge removed'),
  ('CUST_MFG_AHM_01', '2026-02-05', '13:00', 'Suresh Menon', 'DM plant service - resin conductivity check'),
  ('CUST_SOC_THN_01', '2026-01-18', '15:00', 'Vijay More',   'Softener service - salt refill, valve check OK'),
  ('CUST_PHA_MUM_01', '2026-01-12', '08:00', 'Priya Joshi',  'Pharma RO chemical cleaning done'),
  ('CUST_PHA_MUM_01', '2026-02-09', '08:00', 'Rahul Patil',  'DM plant resin regeneration completed'),
  ('CUST_CHE_CHE_01', '2026-01-22', '10:30', 'Vijay More',   'ETP inspection - pH dosing adjusted, sludge settled'),
  ('CUST_HOS_PUN_01', '2026-01-25', '09:30', 'Deepak Joshi', 'New RO system inspection - commissioning verified'),
  ('CUST_HOT_MUM_02', '2026-02-01', '14:00', 'Sunita Desai', 'First quarterly visit - RO pre-filter changed, softener OK')
) AS v(CustCode, SchDate, SvcTime, EngName, Notes)
JOIN Customers c ON c.CustomerCode = v.CustCode
JOIN ServiceEngineers e ON e.EngineerName = v.EngName AND e.CompanyID = 1
WHERE sm.CustomerID = c.CustomerID AND sm.PlanType = 'Plan' AND sm.CompanyID = 1
  AND NOT EXISTS (SELECT 1 FROM Schedule sch WHERE sch.SalesNo = sm.SalesNo AND sch.ScheduleDate = v.SchDate);

-- Upcoming / pending visits
INSERT INTO Schedule (SalesNo, ScheduleDate, ServiceTime, EngineerID, ServiceStatus, Notes)
SELECT sm.SalesNo, v.SchDate, v.SvcTime, e.EngineerID, 'Pending', v.Notes
FROM SalesMaster sm
CROSS JOIN (VALUES
  ('CUST_BOT_MUM_01', '2026-05-15', '10:00', 'Priya Joshi', 'May PM - RO membrane pressure check'),
  ('CUST_BOT_MUM_01', '2026-06-15', '10:00', 'Rahul Patil',  'June PM - quarterly membrane cleaning due'),
  ('CUST_SOC_PUN_01', '2026-05-20', '14:00', 'Vikram Jadhav','Q2 softener service - resin check'),
  ('CUST_HOS_IND_01', '2026-05-05', '09:00', 'Kavita Nair',  'Monthly RO + STP combined visit'),
  ('CUST_HOT_MUM_01', '2026-05-10', '11:00', 'Sunita Desai', 'Q2 softener + STP sludge removal'),
  ('CUST_MFG_AHM_01', '2026-05-25', '13:00', 'Suresh Menon', 'DM plant quarterly resin check'),
  ('CUST_SOC_THN_01', '2026-05-18', '15:00', 'Vijay More',   'Softener quarterly - salt level check'),
  ('CUST_PHA_MUM_01', '2026-05-12', '08:00', 'Priya Joshi',  'Pharma RO monthly PM - pre-filter change'),
  ('CUST_PHA_MUM_01', '2026-05-26', '08:00', 'Rahul Patil',  'DM plant monthly regeneration'),
  ('CUST_CHE_CHE_01', '2026-05-08', '10:30', 'Vijay More',   'ETP monthly inspection & chemical dosing'),
  ('CUST_HOS_PUN_01', '2026-05-04', '09:30', 'Deepak Joshi', 'RO monthly PM - TDS and flow check'),
  ('CUST_HOS_PUN_01', '2026-05-18', '09:30', 'Deepak Joshi', 'STP fortnightly inspection'),
  ('CUST_HOT_MUM_02', '2026-05-02', '14:00', 'Sunita Desai', 'Quarterly visit - pre-filter change, softener regen')
) AS v(CustCode, SchDate, SvcTime, EngName, Notes)
JOIN Customers c ON c.CustomerCode = v.CustCode
JOIN ServiceEngineers e ON e.EngineerName = v.EngName AND e.CompanyID = 1
WHERE sm.CustomerID = c.CustomerID AND sm.PlanType = 'Plan' AND sm.CompanyID = 1
  AND NOT EXISTS (SELECT 1 FROM Schedule sch WHERE sch.SalesNo = sm.SalesNo AND sch.ScheduleDate = v.SchDate);

GO
-- ==================== COMPLAINTS ====================
IF NOT EXISTS (SELECT 1 FROM Complaints)
BEGIN
  INSERT INTO Complaints (SalesNo, ComplaintDate, Description, Status, Resolution, ResolvedDate)
  SELECT sm.SalesNo, '2026-04-20', 'Low outlet pressure on RO plant - pressure dropped to 4 bar from 8 bar', 'Resolved', 'Cleaned RO membranes and replaced pre-filter - pressure restored to 7.5 bar', '2026-04-22'
  FROM SalesMaster sm
  WHERE sm.PlanType = 'Complaint' AND sm.CompanyID = 1;

  -- Additional complaints for other customers (non-complaint SalesMaster records)
  INSERT INTO Complaints (SalesNo, ComplaintDate, Description, Status)
  SELECT sm.SalesNo, '2026-03-15', 'Product water has foul odour - possible algal growth in storage tank', 'Open'
  FROM SalesMaster sm
  JOIN Customers c ON c.CustomerID = sm.CustomerID
  WHERE c.CustomerCode = 'CUST_HOT_MUM_01' AND sm.CompanyID = 1;

  INSERT INTO Complaints (SalesNo, ComplaintDate, Description, Status, Resolution, ResolvedDate)
  SELECT sm.SalesNo, '2026-04-28', 'High hardness in softened water - reading 80 ppm instead of 10 ppm', 'In Progress', 'Scheduled resin replacement on 6 May', NULL
  FROM SalesMaster sm
  JOIN Customers c ON c.CustomerID = sm.CustomerID
  WHERE c.CustomerCode = 'CUST_SOC_PUN_01' AND sm.CompanyID = 1;
END;

GO
-- ==================== SALES MASTER PLANS ====================
-- Monthly plans for intensive-maintenance customers
INSERT INTO SalesMasterPlan (CustomerID, PlanType, Frequency, Notes, CreatedBy, UpdatedBy, Status)
SELECT c.CustomerID, 'Plan', 'Monthly', 'Monthly RO plant service - membrane cleaning & water analysis', 1, 1, 1
FROM Customers c
WHERE c.CustomerCode IN ('CUST_BOT_MUM_01', 'CUST_HOS_IND_01', 'CUST_PHA_MUM_01') AND c.CompanyID = 1
  AND NOT EXISTS (SELECT 1 FROM SalesMasterPlan smp WHERE smp.CustomerID = c.CustomerID AND smp.Frequency = 'Monthly');

-- Quarterly plans for less intensive customers
INSERT INTO SalesMasterPlan (CustomerID, PlanType, Frequency, Notes, CreatedBy, UpdatedBy, Status)
SELECT c.CustomerID, 'Plan', 'Quarterly', 'Quarterly water treatment system inspection and maintenance', 1, 1, 1
FROM Customers c
WHERE c.CustomerCode IN ('CUST_SOC_PUN_01', 'CUST_HOT_MUM_01', 'CUST_MFG_AHM_01', 'CUST_SOC_THN_01', 'CUST_CHE_CHE_01', 'CUST_HOT_MUM_02') AND c.CompanyID = 1
  AND NOT EXISTS (SELECT 1 FROM SalesMasterPlan smp WHERE smp.CustomerID = c.CustomerID AND smp.Frequency = 'Quarterly');

GO
-- ==================== SALES MASTER PLAN SYSTEMS ====================
INSERT INTO SalesMasterPlanSystem (PlanID, SystemID, Quantity)
SELECT smp.PlanID, sy.SystemID, 1
FROM SalesMasterPlan smp
JOIN Customers c ON c.CustomerID = smp.CustomerID
JOIN CustomerSystems cs ON cs.CustomerID = c.CustomerID
JOIN Systems sy ON sy.SystemID = cs.SystemID
WHERE smp.Status = 1
  AND NOT EXISTS (SELECT 1 FROM SalesMasterPlanSystem smps WHERE smps.PlanID = smp.PlanID AND smps.SystemID = sy.SystemID);

GO
-- ==================== SALES MASTER PLAN SERVICES ====================
INSERT INTO SalesMasterPlanService (PlanID, ServiceID, Quantity)
SELECT smp.PlanID, s.ServiceID, 1
FROM SalesMasterPlan smp
JOIN Customers c ON c.CustomerID = smp.CustomerID
JOIN Services s ON s.ServiceCode = 'QPM'
WHERE smp.Status = 1 AND c.CompanyID = 1
  AND NOT EXISTS (SELECT 1 FROM SalesMasterPlanService smps WHERE smps.PlanID = smp.PlanID);

GO
-- ==================== SALES MASTER PLAN ITEMS ====================
INSERT INTO SalesMasterPlanItem (PlanID, ItemID, Quantity)
SELECT smp.PlanID, i.ItemID, v.Qty
FROM SalesMasterPlan smp
CROSS JOIN (VALUES
  ('CUST_BOT_MUM_01', 'RO-MEM-40', 2),
  ('CUST_BOT_MUM_01', 'FLT-C20',   4),
  ('CUST_SOC_PUN_01', 'RES-CAT',   25),
  ('CUST_HOS_IND_01', 'FLT-C20',   2),
  ('CUST_PHA_MUM_01', 'RO-MEM-40', 4),
  ('CUST_PHA_MUM_01', 'FLT-C20',   6)
) AS v(CustCode, ItemCode, Qty)
JOIN Customers c ON c.CustomerCode = v.CustCode
JOIN Items i ON i.ItemCode = v.ItemCode
WHERE smp.CustomerID = c.CustomerID AND smp.Status = 1
  AND NOT EXISTS (SELECT 1 FROM SalesMasterPlanItem smpi WHERE smpi.PlanID = smp.PlanID AND smpi.ItemID = i.ItemID);

GO

PRINT 'Seed data inserted successfully!';
