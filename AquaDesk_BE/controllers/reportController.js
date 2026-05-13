const { executeQuery, executeScalar } = require('../config/database');

const getDaywiseTaskReport = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { taskDate } = req.query;

    if (!taskDate) {
      return res.status(400).json({ error: 'Task date is required' });
    }

    const tasks = await executeQuery(
      `SELECT s.ScheduleID, s.SalesNo, s.ScheduleDate, s.ServiceTime, s.ServiceStatus,
              sm.PlanType, sm.TotalAmount,
              c.CustomerName, c.CustomerCode, c.Mobile, c.Address, c.City,
              ac.AreaCode, cc.CategoryName,
              e.EngineerName,
              sms.Systems, smsv.Services, smi.Items
       FROM Schedule s
       INNER JOIN SalesMaster sm ON s.SalesNo = sm.SalesNo
       INNER JOIN Customers c ON sm.CustomerID = c.CustomerID
       LEFT JOIN AreaCodes ac ON c.AreaCodeID = ac.AreaCodeID
       INNER JOIN ContractCategories cc ON sm.CategoryID = cc.CategoryID
       LEFT JOIN ServiceEngineers e ON s.EngineerID = e.EngineerID
       CROSS APPLY (
         SELECT STRING_AGG(s.SystemName + ' (' + CAST(sms.Quantity AS VARCHAR) + ')', ', ') as Systems
         FROM SalesMasterSystems sms
         INNER JOIN Systems s ON sms.SystemID = s.SystemID
         WHERE sms.SalesNo = sm.SalesNo
       ) sms
       CROSS APPLY (
         SELECT STRING_AGG(s.ServiceName + ' (' + CAST(smsv.Quantity AS VARCHAR) + ')', ', ') as Services
         FROM SalesMasterServices smsv
         INNER JOIN Services s ON smsv.ServiceID = s.ServiceID
         WHERE smsv.SalesNo = sm.SalesNo
       ) smsv
       CROSS APPLY (
         SELECT STRING_AGG(i.ItemName + ' (' + CAST(smi.Quantity AS VARCHAR) + ')', ', ') as Items
         FROM SalesMasterItems smi
         INNER JOIN Items i ON smi.ItemID = i.ItemID
         WHERE smi.SalesNo = sm.SalesNo
       ) smi
       WHERE sm.CompanyID = @CompanyID
         AND CAST(s.ScheduleDate AS DATE) = @TaskDate
         AND sm.Status = 1
       ORDER BY s.ServiceTime`,
      { CompanyID: companyId, TaskDate: taskDate }
    );

    res.json(tasks);
  } catch (error) {
    console.error('Get daywise task report error:', error);
    res.status(500).json({ error: 'Failed to fetch daywise task report' });
  }
};

const getAreawiseTaskReport = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { startDate, endDate, areaCode } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    let query = `SELECT s.ScheduleID, s.SalesNo, s.ScheduleDate, s.ServiceTime, s.ServiceStatus,
                 sm.PlanType, sm.TotalAmount,
                 c.CustomerName, c.CustomerCode, c.Mobile, c.Address, c.City,
                 ac.AreaCode, ac.Description as AreaDescription, cc.CategoryName,
                 e.EngineerName
                 FROM Schedule s
                 INNER JOIN SalesMaster sm ON s.SalesNo = sm.SalesNo
                 INNER JOIN Customers c ON sm.CustomerID = c.CustomerID
                 LEFT JOIN AreaCodes ac ON c.AreaCodeID = ac.AreaCodeID
                 INNER JOIN ContractCategories cc ON sm.CategoryID = cc.CategoryID
                 LEFT JOIN ServiceEngineers e ON s.EngineerID = e.EngineerID
                 WHERE sm.CompanyID = @CompanyID
                   AND s.ScheduleDate >= @StartDate
                   AND s.ScheduleDate <= @EndDate
                   AND sm.Status = 1`;

    const params = { CompanyID: companyId, StartDate: startDate, EndDate: endDate };

    if (areaCode) {
      query += ` AND ac.AreaCode = @AreaCode`;
      params.AreaCode = areaCode;
    }

    query += ' ORDER BY ac.AreaCode, s.ScheduleDate, s.ServiceTime';

    const tasks = await executeQuery(query, params);
    res.json(tasks);
  } catch (error) {
    console.error('Get areawise task report error:', error);
    res.status(500).json({ error: 'Failed to fetch areawise task report' });
  }
};

const getItemRequiredReport = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { startDate, endDate, itemId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    let query = `SELECT s.ScheduleID, s.SalesNo, s.ScheduleDate,
                 sm.PlanType,
                 c.CustomerName, c.CustomerCode,
                 ac.AreaCode,
                 i.ItemCode, i.ItemName, smi.Quantity as RequiredQuantity,
                 is.Quantity as AvailableQuantity
                 FROM Schedule s
                 INNER JOIN SalesMaster sm ON s.SalesNo = sm.SalesNo
                 INNER JOIN Customers c ON sm.CustomerID = c.CustomerID
                 LEFT JOIN AreaCodes ac ON c.AreaCodeID = ac.AreaCodeID
                 INNER JOIN SalesMasterItems smi ON sm.SalesNo = smi.SalesNo
                 INNER JOIN Items i ON smi.ItemID = i.ItemID
                 LEFT JOIN ItemStock is ON i.ItemID = is.ItemID AND is.CompanyID = @CompanyID
                 WHERE sm.CompanyID = @CompanyID
                   AND s.ScheduleDate >= @StartDate
                   AND s.ScheduleDate <= @EndDate
                   AND sm.Status = 1`;

    const params = { CompanyID: companyId, StartDate: startDate, EndDate: endDate };

    if (itemId) {
      query += ` AND i.ItemID = @ItemID`;
      params.ItemID = itemId;
    }

    query += ' ORDER BY i.ItemName, s.ScheduleDate';

    const items = await executeQuery(query, params);
    res.json(items);
  } catch (error) {
    console.error('Get item required report error:', error);
    res.status(500).json({ error: 'Failed to fetch item required report' });
  }
};

const getContractRenewalReport = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { days } = req.query;

    const daysThreshold = days || 30;

    const contracts = await executeQuery(
      `SELECT sc.ContractID, sc.StartDate, sc.EndDate, sc.ContractPeriod, sc.Frequency,
              c.CustomerName, c.CustomerCode, c.Mobile,
              cc.CategoryName,
              DATEDIFF(DAY, GETDATE(), sc.EndDate) as DaysRemaining
       FROM ServiceContracts sc
       INNER JOIN Customers c ON sc.CustomerID = c.CustomerID
       INNER JOIN ContractCategories cc ON sc.CategoryID = cc.CategoryID
       WHERE sc.CompanyID = @CompanyID
         AND sc.Status = 1
         AND sc.EndDate >= GETDATE()
         AND DATEDIFF(DAY, GETDATE(), sc.EndDate) <= @DaysThreshold
       ORDER BY sc.EndDate`,
      { CompanyID: companyId, DaysThreshold: daysThreshold }
    );

    res.json(contracts);
  } catch (error) {
    console.error('Get contract renewal report error:', error);
    res.status(500).json({ error: 'Failed to fetch contract renewal report' });
  }
};

module.exports = {
  getDaywiseTaskReport,
  getAreawiseTaskReport,
  getItemRequiredReport,
  getContractRenewalReport
};
