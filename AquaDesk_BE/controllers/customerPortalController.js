const { executeQuery, executeScalar, executeNonQuery } = require('../config/database');

const checkCustomerAccess = (req, res, next) => {
  const { id } = req.params;
  if (req.user.role !== 'Customer') {
    return res.status(403).json({ error: 'Access denied' });
  }
  if (parseInt(req.user.customerId, 10) !== parseInt(id, 10)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

const getComplaints = async (req, res) => {
  try {
    const { id } = req.params;
    const complaints = await executeQuery(
      `SELECT comp.ComplaintID, comp.ComplaintDate, comp.Description, comp.Status, comp.Resolution, comp.ResolvedDate,
              sm.SalesNo
       FROM Complaints comp
       INNER JOIN SalesMaster sm ON comp.SalesNo = sm.SalesNo
       WHERE sm.CustomerID = @CustomerID
       ORDER BY comp.ComplaintDate DESC`,
      { CustomerID: id }
    );
    res.json(complaints);
  } catch (error) {
    console.error('Get customer complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

const createComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const result = await executeNonQuery(
      `INSERT INTO Complaints (SalesNo, Description, Status, ComplaintDate)
       VALUES (NULL, @Description, 'Open', GETDATE())`,
      { Description: description }
    );

    const newId = await executeScalar('SELECT MAX(ComplaintID) as id FROM Complaints');

    res.status(201).json({ message: 'Complaint created successfully', complaintId: newId ? newId.id : null });
  } catch (error) {
    console.error('Create customer complaint error:', error);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
};

const getUpcomingSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedules = await executeQuery(
      `SELECT s.ScheduleID, s.ScheduleDate, s.ServiceTime, s.ServiceStatus,
              cc.CategoryName, e.EngineerName, sm.PlanType
       FROM Schedule s
       INNER JOIN SalesMaster sm ON s.SalesNo = sm.SalesNo
       INNER JOIN ContractCategories cc ON sm.CategoryID = cc.CategoryID
       LEFT JOIN ServiceEngineers e ON s.EngineerID = e.EngineerID
       WHERE sm.CustomerID = @CustomerID
         AND s.ScheduleDate >= CAST(GETDATE() AS DATE)
         AND s.ServiceStatus IN ('Pending', 'Confirmed')
       ORDER BY s.ScheduleDate, s.ServiceTime`,
      { CustomerID: id }
    );
    res.json(schedules);
  } catch (error) {
    console.error('Get customer schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
};

const createScheduleRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduleId, preferredDate, preferredTime, reason } = req.body;

    if (!scheduleId || !preferredDate) {
      return res.status(400).json({ error: 'Schedule ID and preferred date are required' });
    }

    const result = await executeNonQuery(
      `INSERT INTO ScheduleRequests (ScheduleID, CustomerID, PreferredDate, PreferredTime, Reason, Status)
       VALUES (@ScheduleID, @CustomerID, @PreferredDate, @PreferredTime, @Reason, 'Pending')`,
      {
        ScheduleID: scheduleId,
        CustomerID: id,
        PreferredDate: preferredDate,
        PreferredTime: preferredTime || null,
        Reason: reason || null
      }
    );

    const newId = await executeScalar('SELECT MAX(RequestID) as id FROM ScheduleRequests');

    res.status(201).json({ message: 'Schedule request submitted successfully', requestId: newId ? newId.id : null });
  } catch (error) {
    console.error('Create schedule request error:', error);
    res.status(500).json({ error: 'Failed to create schedule request' });
  }
};

module.exports = {
  checkCustomerAccess,
  getComplaints,
  createComplaint,
  getUpcomingSchedule,
  createScheduleRequest
};
