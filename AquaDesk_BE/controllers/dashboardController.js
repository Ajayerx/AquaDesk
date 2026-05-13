const { executeScalar } = require('../config/database');
const logger = require('../utils/logger');

// GET /api/dashboard/stats
// Aggregated KPIs for internal Admin/Manager/Engineer dashboards.
const getStats = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const customerCounts = await executeScalar(
      `SELECT COUNT(*) AS Total
       FROM Customers
       WHERE CompanyID = @CompanyID AND Status = 1`,
      { CompanyID: companyId }
    );

    const contractCounts = await executeScalar(
      `SELECT
         SUM(CASE WHEN sc.Status = 1 THEN 1 ELSE 0 END) AS ActiveContracts,
         SUM(CASE WHEN sc.Status = 1 AND sc.EndDate IS NOT NULL
                       AND sc.EndDate <= DATEADD(DAY, 30, GETDATE()) THEN 1 ELSE 0 END) AS ExpiringSoon
       FROM ServiceContracts sc
       WHERE sc.CompanyID = @CompanyID`,
      { CompanyID: companyId }
    );

    const salesCounts = await executeScalar(
      `SELECT
         COUNT(*) AS SalesThisMonth,
         ISNULL(SUM(TotalAmount), 0) AS MonthlyRevenue
       FROM SalesMaster
       WHERE CompanyID = @CompanyID
         AND Status = 1
         AND SalesDate >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
         AND SalesDate < DATEADD(MONTH, 1, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))`,
      { CompanyID: companyId }
    );

    const pendingTotal = await executeScalar(
      `SELECT COUNT(*) AS Total
       FROM Schedule s
       INNER JOIN SalesMaster sm ON s.SalesNo = sm.SalesNo
       WHERE sm.CompanyID = @CompanyID
         AND sm.Status = 1
         AND s.ServiceStatus = 'Pending'`,
      { CompanyID: companyId }
    );

    const today = await executeScalar(
      `SELECT
         SUM(CASE WHEN s.ServiceStatus = 'Pending'   THEN 1 ELSE 0 END) AS PendingToday,
         SUM(CASE WHEN s.ServiceStatus = 'Confirmed' THEN 1 ELSE 0 END) AS ConfirmedToday,
         SUM(CASE WHEN s.ServiceStatus = 'Completed' THEN 1 ELSE 0 END) AS CompletedToday
       FROM Schedule s
       INNER JOIN SalesMaster sm ON s.SalesNo = sm.SalesNo
       WHERE sm.CompanyID = @CompanyID
         AND sm.Status = 1
         AND CAST(s.ScheduleDate AS DATE) = CAST(GETDATE() AS DATE)`,
      { CompanyID: companyId }
    );

    const openComplaints = await executeScalar(
      `SELECT COUNT(*) AS Total
       FROM Complaints comp
       INNER JOIN SalesMaster sm ON comp.SalesNo = sm.SalesNo
       WHERE sm.CompanyID = @CompanyID
         AND comp.Status IN ('Open', 'In Progress')`,
      { CompanyID: companyId }
    );

    res.json({
      totalCustomers: (customerCounts && customerCounts.Total) || 0,
      activeContracts: (contractCounts && contractCounts.ActiveContracts) || 0,
      expiringSoonContracts: (contractCounts && contractCounts.ExpiringSoon) || 0,
      salesThisMonth: (salesCounts && salesCounts.SalesThisMonth) || 0,
      monthlyRevenue: Number((salesCounts && salesCounts.MonthlyRevenue) || 0),
      pendingTasks: (pendingTotal && pendingTotal.Total) || 0,
      openComplaints: (openComplaints && openComplaints.Total) || 0,
      todayTasks: {
        pending: (today && today.PendingToday) || 0,
        confirmed: (today && today.ConfirmedToday) || 0,
        completed: (today && today.CompletedToday) || 0
      }
    });
  } catch (error) {
    logger.error('Dashboard stats error', { error: error.message, userId: req.user && req.user.userId });
    res.status(500).json({ error: 'Failed to load dashboard stats' });
  }
};

module.exports = {
  getStats
};
