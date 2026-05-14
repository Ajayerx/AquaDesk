const { executeScalar } = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const totalCustomers = await executeScalar(
      'SELECT COUNT(*) as val FROM Customers WHERE CompanyID = @CompanyID AND Status = 1',
      { CompanyID: companyId }
    );

    const activeContracts = await executeScalar(
      `SELECT COUNT(*) as val FROM ServiceContracts sc
       INNER JOIN Customers c ON sc.CustomerID = c.CustomerID
       WHERE c.CompanyID = @CompanyID AND sc.Status = 1`,
      { CompanyID: companyId }
    );

    const salesThisMonth = await executeScalar(
      `SELECT COUNT(*) as val FROM SalesMaster 
       WHERE CompanyID = @CompanyID AND Status = 1 
         AND MONTH(SalesDate) = MONTH(GETDATE()) 
         AND YEAR(SalesDate) = YEAR(GETDATE())`,
      { CompanyID: companyId }
    );

    const monthlyRevenue = await executeScalar(
      `SELECT ISNULL(SUM(TotalAmount), 0) as val FROM SalesMaster 
       WHERE CompanyID = @CompanyID AND Status = 1 
         AND MONTH(SalesDate) = MONTH(GETDATE()) 
         AND YEAR(SalesDate) = YEAR(GETDATE())`,
      { CompanyID: companyId }
    );

    const pendingTasks = await executeScalar(
      `SELECT COUNT(*) as val FROM Schedule s
       INNER JOIN SalesMaster sm ON s.SalesNo = sm.SalesNo
       WHERE sm.CompanyID = @CompanyID AND sm.Status = 1
         AND s.ServiceStatus = 'Pending'`,
      { CompanyID: companyId }
    );

    const todayPending = await executeScalar(
      `SELECT COUNT(*) as val FROM Schedule s
       INNER JOIN SalesMaster sm ON s.SalesNo = sm.SalesNo
       WHERE sm.CompanyID = @CompanyID AND sm.Status = 1
         AND CAST(s.ScheduleDate AS DATE) = CAST(GETDATE() AS DATE)
         AND s.ServiceStatus = 'Pending'`,
      { CompanyID: companyId }
    );

    const todayConfirmed = await executeScalar(
      `SELECT COUNT(*) as val FROM Schedule s
       INNER JOIN SalesMaster sm ON s.SalesNo = sm.SalesNo
       WHERE sm.CompanyID = @CompanyID AND sm.Status = 1
         AND CAST(s.ScheduleDate AS DATE) = CAST(GETDATE() AS DATE)
         AND s.ServiceStatus = 'Confirmed'`,
      { CompanyID: companyId }
    );

    const todayCompleted = await executeScalar(
      `SELECT COUNT(*) as val FROM Schedule s
       INNER JOIN SalesMaster sm ON s.SalesNo = sm.SalesNo
       WHERE sm.CompanyID = @CompanyID AND sm.Status = 1
         AND CAST(s.ScheduleDate AS DATE) = CAST(GETDATE() AS DATE)
         AND s.ServiceStatus = 'Completed'`,
      { CompanyID: companyId }
    );

    res.json({
      totalCustomers: totalCustomers ? totalCustomers.val : 0,
      activeContracts: activeContracts ? activeContracts.val : 0,
      salesThisMonth: salesThisMonth ? salesThisMonth.val : 0,
      monthlyRevenue: monthlyRevenue ? monthlyRevenue.val : 0,
      pendingTasks: pendingTasks ? pendingTasks.val : 0,
      todayTasks: {
        pending: todayPending ? todayPending.val : 0,
        confirmed: todayConfirmed ? todayConfirmed.val : 0,
        completed: todayCompleted ? todayCompleted.val : 0
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

module.exports = {
  getDashboardStats
};
