const { executeQuery, executeScalar, executeNonQuery } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Ensures the authenticated customer user can only access their own
 * CustomerID. Returns true if access is allowed, otherwise sends a 403
 * response and returns false.
 */
function ensureOwnCustomer(req, res) {
  const requestedId = parseInt(req.params.id, 10);
  if (!Number.isFinite(requestedId)) {
    res.status(400).json({ error: 'Invalid customer id' });
    return false;
  }
  if (!req.user || req.user.role !== 'Customer') {
    res.status(403).json({ error: 'Access denied' });
    return false;
  }
  if (parseInt(req.user.customerId, 10) !== requestedId) {
    logger.warn('Customer attempted to access another customer', {
      userId: req.user.userId,
      ownCustomerId: req.user.customerId,
      requestedId
    });
    res.status(403).json({ error: 'Access denied' });
    return false;
  }
  return true;
}

// GET /api/customer-portal/customers/:id/complaints
const getMyComplaints = async (req, res) => {
  if (!ensureOwnCustomer(req, res)) return;
  try {
    const { id } = req.params;
    const complaints = await executeQuery(
      `SELECT comp.ComplaintID, comp.SalesNo, comp.ComplaintDate, comp.Description,
              comp.Status, comp.Resolution, comp.ResolvedDate,
              sm.CategoryID, cc.CategoryName
       FROM Complaints comp
       INNER JOIN SalesMaster sm ON comp.SalesNo = sm.SalesNo
       LEFT JOIN ContractCategories cc ON sm.CategoryID = cc.CategoryID
       WHERE sm.CustomerID = @CustomerID
       ORDER BY comp.ComplaintDate DESC`,
      { CustomerID: id }
    );
    res.json(complaints);
  } catch (error) {
    logger.error('Customer portal get complaints error', { error: error.message, customerId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

// POST /api/customer-portal/customers/:id/complaints
// Body: { description }
const createMyComplaint = async (req, res) => {
  if (!ensureOwnCustomer(req, res)) return;
  try {
    const { id } = req.params;
    const { description } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required' });
    }

    // Attach the complaint to the most recent active SalesMaster for the customer
    // so existing reporting/joins continue to work.
    const sales = await executeScalar(
      `SELECT TOP 1 SalesNo
       FROM SalesMaster
       WHERE CustomerID = @CustomerID AND Status = 1
       ORDER BY SalesDate DESC`,
      { CustomerID: id }
    );

    if (!sales) {
      return res.status(400).json({
        error: 'No active sales record on file. Please contact support to file a complaint.'
      });
    }

    const inserted = await executeScalar(
      `INSERT INTO Complaints (SalesNo, Description, Status)
       OUTPUT INSERTED.ComplaintID AS complaintId
       VALUES (@SalesNo, @Description, 'Open')`,
      { SalesNo: sales.SalesNo, Description: description.trim() }
    );

    logger.info('Customer filed complaint', {
      customerId: id,
      userId: req.user.userId,
      complaintId: inserted && inserted.complaintId
    });

    res.status(201).json({
      message: 'Complaint created successfully',
      complaintId: inserted && inserted.complaintId
    });
  } catch (error) {
    logger.error('Customer portal create complaint error', { error: error.message, customerId: req.params.id });
    res.status(500).json({ error: 'Failed to create complaint' });
  }
};

// GET /api/customer-portal/customers/:id/schedule/upcoming
const getMyUpcomingSchedule = async (req, res) => {
  if (!ensureOwnCustomer(req, res)) return;
  try {
    const { id } = req.params;
    const schedules = await executeQuery(
      `SELECT s.ScheduleID, s.SalesNo, s.ScheduleDate, s.ServiceTime, s.ServiceStatus, s.Notes,
              sm.PlanType, cc.CategoryName,
              e.EngineerName, e.Phone AS EngineerPhone
       FROM Schedule s
       INNER JOIN SalesMaster sm ON s.SalesNo = sm.SalesNo
       LEFT JOIN ContractCategories cc ON sm.CategoryID = cc.CategoryID
       LEFT JOIN ServiceEngineers e ON s.EngineerID = e.EngineerID
       WHERE sm.CustomerID = @CustomerID
         AND sm.Status = 1
         AND s.ScheduleDate >= CAST(GETDATE() AS DATE)
         AND s.ServiceStatus IN ('Pending', 'Confirmed')
       ORDER BY s.ScheduleDate, s.ServiceTime`,
      { CustomerID: id }
    );
    res.json(schedules);
  } catch (error) {
    logger.error('Customer portal get upcoming schedule error', { error: error.message, customerId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch upcoming schedule' });
  }
};

// POST /api/customer-portal/customers/:id/schedule-requests
// Body: { scheduleId, preferredDate, preferredTime?, reason? }
const createMyScheduleRequest = async (req, res) => {
  if (!ensureOwnCustomer(req, res)) return;
  try {
    const { id } = req.params;
    const { scheduleId, preferredDate, preferredTime, reason } = req.body;

    if (!scheduleId || !preferredDate) {
      return res.status(400).json({ error: 'scheduleId and preferredDate are required' });
    }

    // Validate that this schedule actually belongs to this customer.
    const owned = await executeScalar(
      `SELECT s.ScheduleID
       FROM Schedule s
       INNER JOIN SalesMaster sm ON s.SalesNo = sm.SalesNo
       WHERE s.ScheduleID = @ScheduleID AND sm.CustomerID = @CustomerID`,
      { ScheduleID: scheduleId, CustomerID: id }
    );

    if (!owned) {
      return res.status(403).json({ error: 'Schedule does not belong to this customer' });
    }

    const inserted = await executeScalar(
      `INSERT INTO ScheduleRequests (ScheduleID, CustomerID, PreferredDate, PreferredTime, Reason, Status)
       OUTPUT INSERTED.RequestID AS requestId
       VALUES (@ScheduleID, @CustomerID, @PreferredDate, @PreferredTime, @Reason, 'Pending')`,
      {
        ScheduleID: scheduleId,
        CustomerID: id,
        PreferredDate: preferredDate,
        PreferredTime: preferredTime || null,
        Reason: reason || null
      }
    );

    logger.info('Customer submitted schedule request', {
      customerId: id,
      userId: req.user.userId,
      requestId: inserted && inserted.requestId,
      scheduleId
    });

    res.status(201).json({
      message: 'Schedule request submitted successfully',
      requestId: inserted && inserted.requestId
    });
  } catch (error) {
    logger.error('Customer portal create schedule request error', { error: error.message, customerId: req.params.id });
    res.status(500).json({ error: 'Failed to submit schedule request' });
  }
};

// GET /api/customer-portal/customers/:id/contracts
const getMyContracts = async (req, res) => {
  if (!ensureOwnCustomer(req, res)) return;
  try {
    const { id } = req.params;
    const contracts = await executeQuery(
      `SELECT sc.ContractID, sc.ContractPeriod, sc.Frequency, sc.StartDate, sc.EndDate, sc.Status, sc.Notes,
              sc.ContractValue,
              cc.CategoryName,
              cs.SystemName, csys.SystemName AS InstalledSystemName
       FROM ServiceContracts sc
       INNER JOIN ContractCategories cc ON sc.CategoryID = cc.CategoryID
       LEFT JOIN CustomerSystems cs2 ON sc.CustomerSystemID = cs2.CustomerSystemID
       LEFT JOIN Systems cs ON cs2.SystemID = cs.SystemID
       LEFT JOIN Systems csys ON cs2.SystemID = csys.SystemID
       WHERE sc.CustomerID = @CustomerID
       ORDER BY sc.EndDate DESC`,
      { CustomerID: id }
    );
    res.json(contracts);
  } catch (error) {
    logger.error('Customer portal get contracts error', { error: error.message, customerId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
};

// GET /api/customer-portal/customers/:id/profile
const getMyProfile = async (req, res) => {
  if (!ensureOwnCustomer(req, res)) return;
  try {
    const { id } = req.params;
    const customer = await executeScalar(
      `SELECT c.CustomerID, c.CustomerCode, c.CustomerName, c.Flat, c.Block, c.Road,
              c.City, c.State, c.Country, c.Mobile, c.Email, c.Telephone, c.Fax,
              c.Status, c.Description,
              ac.AreaCode, ac.Description AS AreaDescription
       FROM Customers c
       LEFT JOIN AreaCodes ac ON c.AreaCodeID = ac.AreaCodeID
       WHERE c.CustomerID = @CustomerID`,
      { CustomerID: id }
    );
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    logger.error('Customer portal get profile error', { error: error.message, customerId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// GET /api/customer-portal/customers/:id/dashboard
// Combined summary used by the customer dashboard.
const getMyDashboard = async (req, res) => {
  if (!ensureOwnCustomer(req, res)) return;
  try {
    const { id } = req.params;

    const customer = await executeScalar(
      `SELECT CustomerID, CustomerCode, CustomerName, City, Mobile, Email
       FROM Customers WHERE CustomerID = @CustomerID`,
      { CustomerID: id }
    );

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const nextVisit = await executeScalar(
      `SELECT TOP 1 s.ScheduleID, s.ScheduleDate, s.ServiceTime, s.ServiceStatus,
              cc.CategoryName, e.EngineerName
       FROM Schedule s
       INNER JOIN SalesMaster sm ON s.SalesNo = sm.SalesNo
       LEFT JOIN ContractCategories cc ON sm.CategoryID = cc.CategoryID
       LEFT JOIN ServiceEngineers e ON s.EngineerID = e.EngineerID
       WHERE sm.CustomerID = @CustomerID
         AND sm.Status = 1
         AND s.ScheduleDate >= CAST(GETDATE() AS DATE)
         AND s.ServiceStatus IN ('Pending', 'Confirmed')
       ORDER BY s.ScheduleDate, s.ServiceTime`,
      { CustomerID: id }
    );

    const contractCounts = await executeScalar(
      `SELECT
         SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END) AS ActiveContracts,
         SUM(CASE WHEN Status = 1 AND EndDate IS NOT NULL AND EndDate <= DATEADD(DAY, 60, GETDATE()) THEN 1 ELSE 0 END) AS ExpiringSoon,
         COUNT(*) AS TotalContracts
       FROM ServiceContracts WHERE CustomerID = @CustomerID`,
      { CustomerID: id }
    );

    const complaintCounts = await executeScalar(
      `SELECT
         SUM(CASE WHEN comp.Status IN ('Open','In Progress') THEN 1 ELSE 0 END) AS OpenComplaints,
         COUNT(*) AS TotalComplaints
       FROM Complaints comp
       INNER JOIN SalesMaster sm ON comp.SalesNo = sm.SalesNo
       WHERE sm.CustomerID = @CustomerID`,
      { CustomerID: id }
    );

    res.json({
      customer,
      nextVisit: nextVisit || null,
      activeContracts: (contractCounts && contractCounts.ActiveContracts) || 0,
      expiringSoonContracts: (contractCounts && contractCounts.ExpiringSoon) || 0,
      totalContracts: (contractCounts && contractCounts.TotalContracts) || 0,
      openComplaints: (complaintCounts && complaintCounts.OpenComplaints) || 0,
      totalComplaints: (complaintCounts && complaintCounts.TotalComplaints) || 0
    });
  } catch (error) {
    logger.error('Customer portal dashboard error', { error: error.message, customerId: req.params.id });
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

module.exports = {
  getMyDashboard,
  getMyProfile,
  getMyComplaints,
  createMyComplaint,
  getMyUpcomingSchedule,
  createMyScheduleRequest,
  getMyContracts
};
