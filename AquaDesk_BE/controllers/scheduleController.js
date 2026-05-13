const { executeQuery, executeScalar, executeNonQuery } = require('../config/database');

const getWeekView = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { startDate } = req.query;

    // Calculate week start (Monday) and end (Sunday)
    let weekStart = startDate ? new Date(startDate) : new Date();
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const schedules = await executeQuery(
      `SELECT s.ScheduleID, s.SalesNo, s.ScheduleDate, s.ServiceTime, s.ServiceStatus, s.IsOverride,
              sm.PlanType, sm.TotalAmount,
              c.CustomerName, c.CustomerCode, c.Mobile,
              ac.AreaCode, cc.CategoryName,
              e.EngineerName
       FROM Schedule s
       INNER JOIN SalesMaster sm ON s.SalesNo = sm.SalesNo
       INNER JOIN Customers c ON sm.CustomerID = c.CustomerID
       LEFT JOIN AreaCodes ac ON c.AreaCodeID = ac.AreaCodeID
       INNER JOIN ContractCategories cc ON sm.CategoryID = cc.CategoryID
       LEFT JOIN ServiceEngineers e ON s.EngineerID = e.EngineerID
       WHERE sm.CompanyID = @CompanyID
         AND s.ScheduleDate >= @WeekStart
         AND s.ScheduleDate <= @WeekEnd
         AND sm.Status = 1
       ORDER BY s.ScheduleDate, s.ServiceTime`,
      {
        CompanyID: companyId,
        WeekStart: weekStart,
        WeekEnd: weekEnd
      }
    );

    // Group by day
    const weekData = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      weekData[dateStr] = [];
    }

    schedules.forEach(schedule => {
      const dateStr = new Date(schedule.ScheduleDate).toISOString().split('T')[0];
      if (weekData[dateStr]) {
        weekData[dateStr].push(schedule);
      }
    });

    res.json({
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      schedules: weekData
    });
  } catch (error) {
    console.error('Get week view error:', error);
    res.status(500).json({ error: 'Failed to fetch week view' });
  }
};

const getUpcomingTasks = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const tasks = await executeQuery(
      `SELECT sm.SalesNo, sm.PlanType, sm.ContractStartDate,
              c.CustomerName, c.CustomerCode,
              ac.AreaCode, cc.CategoryName
       FROM SalesMaster sm
       INNER JOIN Customers c ON sm.CustomerID = c.CustomerID
       LEFT JOIN AreaCodes ac ON c.AreaCodeID = ac.AreaCodeID
       INNER JOIN ContractCategories cc ON sm.CategoryID = cc.CategoryID
       WHERE sm.CompanyID = @CompanyID
         AND sm.Status = 1
         AND sm.PlanType = 'Plan'
         AND NOT EXISTS (SELECT 1 FROM Schedule s WHERE s.SalesNo = sm.SalesNo)
       ORDER BY sm.ContractStartDate`,
      { CompanyID: companyId }
    );

    res.json(tasks);
  } catch (error) {
    console.error('Get upcoming tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming tasks' });
  }
};

const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await executeScalar(
      `SELECT s.*, sm.PlanType, sm.Description, sm.Notes as SalesNotes, sm.TotalAmount, sm.TotalServiceTime,
              c.CustomerName, c.CustomerCode, c.Mobile, c.Email, c.Address, c.City,
              cc.CategoryName, si.IntervalName as ServiceIntervalName
       FROM Schedule s
       INNER JOIN SalesMaster sm ON s.SalesNo = sm.SalesNo
       INNER JOIN Customers c ON sm.CustomerID = c.CustomerID
       INNER JOIN ContractCategories cc ON sm.CategoryID = cc.CategoryID
       LEFT JOIN ServiceIntervals si ON sm.ServiceIntervalID = si.ServiceIntervalID
       WHERE s.ScheduleID = @ScheduleID`,
      { ScheduleID: id }
    );

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Get systems
    const systems = await executeQuery(
      `SELECT sms.*, s.SystemName
       FROM SalesMasterSystems sms
       INNER JOIN Systems s ON sms.SystemID = s.SystemID
       WHERE sms.SalesNo = @SalesNo`,
      { SalesNo: schedule.SalesNo }
    );

    // Get services
    const services = await executeQuery(
      `SELECT smsv.*, s.ServiceName
       FROM SalesMasterServices smsv
       INNER JOIN Services s ON smsv.ServiceID = s.ServiceID
       WHERE smsv.SalesNo = @SalesNo`,
      { SalesNo: schedule.SalesNo }
    );

    // Get items
    const items = await executeQuery(
      `SELECT smi.*, i.ItemName
       FROM SalesMasterItems smi
       INNER JOIN Items i ON smi.ItemID = i.ItemID
       WHERE smi.SalesNo = @SalesNo`,
      { SalesNo: schedule.SalesNo }
    );

    // Get available engineers
    const engineers = await executeQuery(
      `SELECT EngineerID, EngineerName, Phone, Email
       FROM ServiceEngineers
       WHERE CompanyID = @CompanyID AND Status = 1
       ORDER BY EngineerName`,
      { CompanyID: req.user.companyId }
    );

    res.json({ ...schedule, systems, services, items, engineers });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
};

const confirmSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { engineerId, serviceTime, notes } = req.body;

    const schedule = await executeScalar(
      'SELECT ServiceStatus FROM Schedule WHERE ScheduleID = @ScheduleID',
      { ScheduleID: id }
    );

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    if (schedule.ServiceStatus === 'Confirmed') {
      return res.status(400).json({ error: 'This task has already been confirmed' });
    }

    await executeNonQuery(
      `UPDATE Schedule 
       SET EngineerID = @EngineerID, ServiceTime = @ServiceTime, ServiceStatus = 'Confirmed', 
           Notes = @Notes, UpdatedAt = GETDATE()
       WHERE ScheduleID = @ScheduleID`,
      { EngineerID: engineerId, ServiceTime: serviceTime || null, Notes: notes || null, ScheduleID: id }
    );

    res.json({ message: 'Schedule confirmed successfully' });
  } catch (error) {
    console.error('Confirm schedule error:', error);
    res.status(500).json({ error: 'Failed to confirm schedule' });
  }
};

const rescheduleTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduleDate, serviceInterval, notes } = req.body;

    if (!scheduleDate) {
      return res.status(400).json({ error: 'Schedule date is required' });
    }

    await executeNonQuery(
      `UPDATE Schedule 
       SET ScheduleDate = @ScheduleDate, ServiceStatus = 'Pending', Notes = @Notes, UpdatedAt = GETDATE()
       WHERE ScheduleID = @ScheduleID`,
      { ScheduleDate: scheduleDate, Notes: notes || null, ScheduleID: id }
    );

    // If service interval is provided, generate next schedule
    if (serviceInterval) {
      const schedule = await executeScalar(
        'SELECT SalesNo FROM Schedule WHERE ScheduleID = @ScheduleID',
        { ScheduleID: id }
      );

      const nextDate = new Date(scheduleDate);
      nextDate.setDate(nextDate.getDate() + parseInt(serviceInterval));

      await executeNonQuery(
        `INSERT INTO Schedule (SalesNo, ScheduleDate, ServiceStatus)
         VALUES (@SalesNo, @ScheduleDate, 'Pending')`,
        { SalesNo: schedule.SalesNo, ScheduleDate: nextDate }
      );
    }

    res.json({ message: 'Task rescheduled successfully' });
  } catch (error) {
    console.error('Reschedule task error:', error);
    res.status(500).json({ error: 'Failed to reschedule task' });
  }
};

const getConfirmedTasks = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { date } = req.query;

    let query = `SELECT s.ScheduleID, s.SalesNo, s.ScheduleDate, s.ServiceTime,
                 sm.PlanType, sm.TotalAmount,
                 c.CustomerName, c.CustomerCode,
                 ac.AreaCode, cc.CategoryName,
                 e.EngineerName
                 FROM Schedule s
                 INNER JOIN SalesMaster sm ON s.SalesNo = sm.SalesNo
                 INNER JOIN Customers c ON sm.CustomerID = c.CustomerID
                 LEFT JOIN AreaCodes ac ON c.AreaCodeID = ac.AreaCodeID
                 INNER JOIN ContractCategories cc ON sm.CategoryID = cc.CategoryID
                 LEFT JOIN ServiceEngineers e ON s.EngineerID = e.EngineerID
                 WHERE sm.CompanyID = @CompanyID
                   AND s.ServiceStatus = 'Confirmed'`;

    const params = { CompanyID: companyId };

    if (date) {
      query += ` AND CAST(s.ScheduleDate AS DATE) = @Date`;
      params.Date = date;
    }

    query += ' ORDER BY s.ScheduleDate, s.ServiceTime';

    const tasks = await executeQuery(query, params);
    res.json(tasks);
  } catch (error) {
    console.error('Get confirmed tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch confirmed tasks' });
  }
};

const markTasksCompleted = async (req, res) => {
  try {
    const { scheduleIds } = req.body;

    if (!scheduleIds || !Array.isArray(scheduleIds) || scheduleIds.length === 0) {
      return res.status(400).json({ error: 'Schedule IDs are required' });
    }

    for (const id of scheduleIds) {
      await executeNonQuery(
        `UPDATE Schedule 
         SET ServiceStatus = 'Completed', UpdatedAt = GETDATE()
         WHERE ScheduleID = @ScheduleID`,
        { ScheduleID: id }
      );
    }

    res.json({ message: 'Tasks marked as completed successfully' });
  } catch (error) {
    console.error('Mark tasks completed error:', error);
    res.status(500).json({ error: 'Failed to mark tasks as completed' });
  }
};

const getCompletedTasks = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { startDate, endDate } = req.query;

    let query = `SELECT s.ScheduleID, s.SalesNo, s.ScheduleDate,
                 sm.PlanType, sm.TotalAmount,
                 c.CustomerName, c.CustomerCode,
                 ac.AreaCode
                 FROM Schedule s
                 INNER JOIN SalesMaster sm ON s.SalesNo = sm.SalesNo
                 INNER JOIN Customers c ON sm.CustomerID = c.CustomerID
                 LEFT JOIN AreaCodes ac ON c.AreaCodeID = ac.AreaCodeID
                 WHERE sm.CompanyID = @CompanyID
                   AND s.ServiceStatus = 'Completed'`;

    const params = { CompanyID: companyId };

    if (startDate) {
      query += ` AND s.ScheduleDate >= @StartDate`;
      params.StartDate = startDate;
    }

    if (endDate) {
      query += ` AND s.ScheduleDate <= @EndDate`;
      params.EndDate = endDate;
    }

    query += ' ORDER BY s.ScheduleDate DESC';

    const tasks = await executeQuery(query, params);
    res.json(tasks);
  } catch (error) {
    console.error('Get completed tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch completed tasks' });
  }
};

const getManualSchedule = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const schedules = await executeQuery(
      `SELECT s.ScheduleID, s.SalesNo, s.ScheduleDate, s.ServiceTime, s.ServiceStatus,
              sm.PlanType, sm.TotalAmount,
              c.CustomerName, c.CustomerCode,
              ac.AreaCode, cc.CategoryName,
              si.IntervalName as ServiceIntervalName
       FROM Schedule s
       INNER JOIN SalesMaster sm ON s.SalesNo = sm.SalesNo
       INNER JOIN Customers c ON sm.CustomerID = c.CustomerID
       LEFT JOIN AreaCodes ac ON c.AreaCodeID = ac.AreaCodeID
       INNER JOIN ContractCategories cc ON sm.CategoryID = cc.CategoryID
       LEFT JOIN ServiceIntervals si ON sm.ServiceIntervalID = si.ServiceIntervalID
       WHERE sm.CompanyID = @CompanyID
         AND CAST(s.ScheduleDate AS DATE) = @Date
         AND sm.Status = 1
       ORDER BY s.ServiceTime`,
      { CompanyID: companyId, Date: date }
    );

    res.json(schedules);
  } catch (error) {
    console.error('Get manual schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch manual schedule' });
  }
};

const insertManualSchedule = async (req, res) => {
  try {
    const { salesNo, scheduleDate, serviceTime } = req.body;

    if (!salesNo || !scheduleDate) {
      return res.status(400).json({ error: 'Sales No and schedule date are required' });
    }

    await executeNonQuery(
      `INSERT INTO Schedule (SalesNo, ScheduleDate, ServiceTime, ServiceStatus)
       VALUES (@SalesNo, @ScheduleDate, @ServiceTime, 'Pending')`,
      { SalesNo: salesNo, ScheduleDate: scheduleDate, ServiceTime: serviceTime || null }
    );

    res.status(201).json({ message: 'Manual schedule inserted successfully' });
  } catch (error) {
    console.error('Insert manual schedule error:', error);
    res.status(500).json({ error: 'Failed to insert manual schedule' });
  }
};

module.exports = {
  getWeekView,
  getUpcomingTasks,
  getScheduleById,
  confirmSchedule,
  rescheduleTask,
  getConfirmedTasks,
  markTasksCompleted,
  getCompletedTasks,
  getManualSchedule,
  insertManualSchedule
};
