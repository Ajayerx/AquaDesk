const { executeQuery, executeScalar, executeNonQuery } = require('../config/database');
const logger = require('../utils/logger');

// GET /api/admin/schedule-requests
const listScheduleRequests = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { status } = req.query;

    let query = `SELECT sr.RequestID, sr.ScheduleID, sr.CustomerID, sr.PreferredDate, sr.PreferredTime,
                        sr.Reason, sr.Status, sr.CreatedAt, sr.ProcessedAt,
                        s.ScheduleDate, s.ServiceStatus AS ScheduleStatus,
                        c.CustomerName, c.CustomerCode, c.Mobile,
                        e.EngineerName, cc.CategoryName
                 FROM ScheduleRequests sr
                 INNER JOIN Schedule s ON sr.ScheduleID = s.ScheduleID
                 INNER JOIN SalesMaster sm ON s.SalesNo = sm.SalesNo
                 INNER JOIN Customers c ON sr.CustomerID = c.CustomerID
                 LEFT JOIN ServiceEngineers e ON s.EngineerID = e.EngineerID
                 LEFT JOIN ContractCategories cc ON sm.CategoryID = cc.CategoryID
                 WHERE sm.CompanyID = @CompanyID`;

    const params = { CompanyID: companyId };
    if (status) {
      query += ' AND sr.Status = @Status';
      params.Status = status;
    }
    query += ' ORDER BY CASE WHEN sr.Status = \'Pending\' THEN 0 ELSE 1 END, sr.CreatedAt DESC';

    const requests = await executeQuery(query, params);
    res.json(requests);
  } catch (error) {
    logger.error('List schedule requests error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch schedule requests' });
  }
};

// PUT /api/admin/schedule-requests/:id
// Body: { status: 'Approved' | 'Rejected', applyReschedule?: boolean }
const updateScheduleRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, applyReschedule } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'status must be Approved or Rejected' });
    }

    const request = await executeScalar(
      `SELECT sr.RequestID, sr.ScheduleID, sr.PreferredDate, sr.PreferredTime, sr.Status
       FROM ScheduleRequests sr
       WHERE sr.RequestID = @RequestID`,
      { RequestID: id }
    );

    if (!request) {
      return res.status(404).json({ error: 'Schedule request not found' });
    }
    if (request.Status !== 'Pending') {
      return res.status(400).json({ error: `Request is already ${request.Status}` });
    }

    if (status === 'Approved' && applyReschedule !== false) {
      // Apply the customer's preferred date/time to the original schedule row.
      await executeNonQuery(
        `UPDATE Schedule
         SET ScheduleDate = @ScheduleDate,
             ServiceTime = COALESCE(@ServiceTime, ServiceTime),
             ServiceStatus = 'Pending',
             UpdatedAt = GETDATE()
         WHERE ScheduleID = @ScheduleID`,
        {
          ScheduleDate: request.PreferredDate,
          ServiceTime: request.PreferredTime || null,
          ScheduleID: request.ScheduleID
        }
      );
    }

    await executeNonQuery(
      `UPDATE ScheduleRequests
       SET Status = @Status, ProcessedAt = GETDATE()
       WHERE RequestID = @RequestID`,
      { Status: status, RequestID: id }
    );

    logger.info('Schedule request processed', {
      requestId: id,
      status,
      userId: req.user && req.user.userId
    });

    res.json({ message: 'Schedule request updated successfully' });
  } catch (error) {
    logger.error('Update schedule request error', { error: error.message });
    res.status(500).json({ error: 'Failed to update schedule request' });
  }
};

module.exports = {
  listScheduleRequests,
  updateScheduleRequest
};
