const express = require('express');
const router = express.Router();
const { authenticateToken, checkAccess } = require('../middleware/auth');
const {
  // Engineers
  getAllEngineers,
  createEngineer,
  updateEngineer,
  deleteEngineer,
  // Teams
  getAllTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  // Systems
  getAllSystems,
  createSystem,
  updateSystem,
  deleteSystem,
  // Services
  getAllServices,
  createService,
  updateService,
  deleteService,
  // Items
  getAllItems,
  createItem,
  updateItem,
  deleteItem,
  // Item Stock
  getItemStock,
  updateItemStock,
  // Area Codes
  getAllAreaCodes,
  createAreaCode,
  updateAreaCode,
  deleteAreaCode,
  // Contract Categories
  getAllContractCategories,
  createContractCategory,
  updateContractCategory,
  deleteContractCategory,
  // Contract Periods
  getAllContractPeriods,
  createContractPeriod,
  updateContractPeriod,
  deleteContractPeriod,
  // Companies
  getAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  // Users
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  // Service Hours
  getAllServiceHours,
  createServiceHours,
  updateServiceHours,
  deleteServiceHours,
  // UserAccess
  getAllUserAccess,
  createUserAccess,
  updateUserAccess,
  deleteUserAccess,
  // CustomerSystems
  getAllCustomerSystems,
  createCustomerSystem,
  updateCustomerSystem,
  deleteCustomerSystem,
  // ServiceContracts
  getAllServiceContracts,
  createServiceContract,
  updateServiceContract,
  deleteServiceContract,
  // Schedule
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  // Complaints
  getAllComplaints,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  // Contract Category Systems
  getAllContractCategorySystems,
  createContractCategorySystem,
  updateContractCategorySystem,
  deleteContractCategorySystem,
  // Contract Category Services
  getAllContractCategoryServices,
  createContractCategoryService,
  updateContractCategoryService,
  deleteContractCategoryService,
  // Contract Category Items
  getAllContractCategoryItems,
  createContractCategoryItem,
  updateContractCategoryItem,
  deleteContractCategoryItem,
  // Contract Intervals
  getAllContractIntervals,
  createContractInterval,
  updateContractInterval,
  deleteContractInterval,
  // Service Intervals
  getAllServiceIntervals,
  createServiceInterval,
  updateServiceInterval,
  deleteServiceInterval,
  // Costs
  getServiceCost,
  updateServiceCost,
  getSystemCost,
  updateSystemCost,
  getItemCost,
  updateItemCost,
  // Contract Type Filtering
  getSystemsByContractType,
  getServicesByContractType,
  getItemsByContractType,
  // Holidays
  getAllHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday
} = require('../controllers/adminController');

// Service Engineers
router.get('/engineers', authenticateToken, checkAccess('ServiceEngineer', 'CanView'), getAllEngineers);
router.post('/engineers', authenticateToken, checkAccess('ServiceEngineer', 'CanAdd'), createEngineer);
router.put('/engineers/:id', authenticateToken, checkAccess('ServiceEngineer', 'CanEdit'), updateEngineer);
router.delete('/engineers/:id', authenticateToken, checkAccess('ServiceEngineer', 'CanDelete'), deleteEngineer);

// Service Teams
router.get('/teams', authenticateToken, checkAccess('ServiceTeam', 'CanView'), getAllTeams);
router.post('/teams', authenticateToken, checkAccess('ServiceTeam', 'CanAdd'), createTeam);
router.put('/teams/:id', authenticateToken, checkAccess('ServiceTeam', 'CanEdit'), updateTeam);
router.delete('/teams/:id', authenticateToken, checkAccess('ServiceTeam', 'CanDelete'), deleteTeam);

// Systems
router.get('/systems', authenticateToken, checkAccess('System', 'CanView'), getAllSystems);
router.post('/systems', authenticateToken, checkAccess('System', 'CanAdd'), createSystem);
router.put('/systems/:id', authenticateToken, checkAccess('System', 'CanEdit'), updateSystem);
router.delete('/systems/:id', authenticateToken, checkAccess('System', 'CanDelete'), deleteSystem);

// Services
router.get('/services', authenticateToken, checkAccess('Service', 'CanView'), getAllServices);
router.post('/services', authenticateToken, checkAccess('Service', 'CanAdd'), createService);
router.put('/services/:id', authenticateToken, checkAccess('Service', 'CanEdit'), updateService);
router.delete('/services/:id', authenticateToken, checkAccess('Service', 'CanDelete'), deleteService);

// Items
router.get('/items', authenticateToken, checkAccess('Item', 'CanView'), getAllItems);
router.post('/items', authenticateToken, checkAccess('Item', 'CanAdd'), createItem);
router.put('/items/:id', authenticateToken, checkAccess('Item', 'CanEdit'), updateItem);
router.delete('/items/:id', authenticateToken, checkAccess('Item', 'CanDelete'), deleteItem);

// Item Stock
router.get('/item-stock', authenticateToken, checkAccess('ItemStock', 'CanView'), getItemStock);
router.put('/item-stock', authenticateToken, checkAccess('ItemStock', 'CanEdit'), updateItemStock);

// Area Codes
router.get('/area-codes', authenticateToken, checkAccess('AreaCode', 'CanView'), getAllAreaCodes);
router.post('/area-codes', authenticateToken, checkAccess('AreaCode', 'CanAdd'), createAreaCode);
router.put('/area-codes/:id', authenticateToken, checkAccess('AreaCode', 'CanEdit'), updateAreaCode);
router.delete('/area-codes/:id', authenticateToken, checkAccess('AreaCode', 'CanDelete'), deleteAreaCode);

// Contract Categories
router.get('/contract-categories', authenticateToken, checkAccess('ContractCategory', 'CanView'), getAllContractCategories);
router.post('/contract-categories', authenticateToken, checkAccess('ContractCategory', 'CanAdd'), createContractCategory);
router.put('/contract-categories/:id', authenticateToken, checkAccess('ContractCategory', 'CanEdit'), updateContractCategory);
router.delete('/contract-categories/:id', authenticateToken, checkAccess('ContractCategory', 'CanDelete'), deleteContractCategory);

// Contract Periods
router.get('/contract-periods', authenticateToken, checkAccess('ContractPeriod', 'CanView'), getAllContractPeriods);
router.post('/contract-periods', authenticateToken, checkAccess('ContractPeriod', 'CanAdd'), createContractPeriod);
router.put('/contract-periods/:id', authenticateToken, checkAccess('ContractPeriod', 'CanEdit'), updateContractPeriod);
router.delete('/contract-periods/:id', authenticateToken, checkAccess('ContractPeriod', 'CanDelete'), deleteContractPeriod);

// Companies
router.get('/companies', authenticateToken, checkAccess('Company', 'CanView'), getAllCompanies);
router.post('/companies', authenticateToken, checkAccess('Company', 'CanAdd'), createCompany);
router.put('/companies/:id', authenticateToken, checkAccess('Company', 'CanEdit'), updateCompany);
router.delete('/companies/:id', authenticateToken, checkAccess('Company', 'CanDelete'), deleteCompany);

// Users
router.get('/users', authenticateToken, checkAccess('User', 'CanView'), getAllUsers);
router.post('/users', authenticateToken, checkAccess('User', 'CanAdd'), createUser);
router.put('/users/:id', authenticateToken, checkAccess('User', 'CanEdit'), updateUser);
router.delete('/users/:id', authenticateToken, checkAccess('User', 'CanDelete'), deleteUser);

// Service Hours
router.get('/service-hours', authenticateToken, checkAccess('ServiceHours', 'CanView'), getAllServiceHours);
router.post('/service-hours', authenticateToken, checkAccess('ServiceHours', 'CanAdd'), createServiceHours);
router.put('/service-hours/:id', authenticateToken, checkAccess('ServiceHours', 'CanEdit'), updateServiceHours);
router.delete('/service-hours/:id', authenticateToken, checkAccess('ServiceHours', 'CanDelete'), deleteServiceHours);

// UserAccess
router.get('/user-access', authenticateToken, checkAccess('UserAccess', 'CanView'), getAllUserAccess);
router.post('/user-access', authenticateToken, checkAccess('UserAccess', 'CanAdd'), createUserAccess);
router.put('/user-access/:id', authenticateToken, checkAccess('UserAccess', 'CanEdit'), updateUserAccess);
router.delete('/user-access/:id', authenticateToken, checkAccess('UserAccess', 'CanDelete'), deleteUserAccess);

// CustomerSystems
router.get('/customer-systems', authenticateToken, checkAccess('CustomerSystem', 'CanView'), getAllCustomerSystems);
router.post('/customer-systems', authenticateToken, checkAccess('CustomerSystem', 'CanAdd'), createCustomerSystem);
router.put('/customer-systems/:id', authenticateToken, checkAccess('CustomerSystem', 'CanEdit'), updateCustomerSystem);
router.delete('/customer-systems/:id', authenticateToken, checkAccess('CustomerSystem', 'CanDelete'), deleteCustomerSystem);

// ServiceContracts
router.get('/service-contracts', authenticateToken, checkAccess('ServiceContract', 'CanView'), getAllServiceContracts);
router.post('/service-contracts', authenticateToken, checkAccess('ServiceContract', 'CanAdd'), createServiceContract);
router.put('/service-contracts/:id', authenticateToken, checkAccess('ServiceContract', 'CanEdit'), updateServiceContract);
router.delete('/service-contracts/:id', authenticateToken, checkAccess('ServiceContract', 'CanDelete'), deleteServiceContract);

// Schedule
router.get('/schedules', authenticateToken, checkAccess('Schedule', 'CanView'), getAllSchedules);
router.post('/schedules', authenticateToken, checkAccess('Schedule', 'CanAdd'), createSchedule);
router.put('/schedules/:id', authenticateToken, checkAccess('Schedule', 'CanEdit'), updateSchedule);
router.delete('/schedules/:id', authenticateToken, checkAccess('Schedule', 'CanDelete'), deleteSchedule);

// Complaints
router.get('/complaints', authenticateToken, checkAccess('Complaint', 'CanView'), getAllComplaints);
router.post('/complaints', authenticateToken, checkAccess('Complaint', 'CanAdd'), createComplaint);
router.put('/complaints/:id', authenticateToken, checkAccess('Complaint', 'CanEdit'), updateComplaint);
router.delete('/complaints/:id', authenticateToken, checkAccess('Complaint', 'CanDelete'), deleteComplaint);

// Contract Category Systems
router.get('/contract-category-systems', authenticateToken, checkAccess('ContractCategorySystem', 'CanView'), getAllContractCategorySystems);
router.post('/contract-category-systems', authenticateToken, checkAccess('ContractCategorySystem', 'CanAdd'), createContractCategorySystem);
router.put('/contract-category-systems/:id', authenticateToken, checkAccess('ContractCategorySystem', 'CanEdit'), updateContractCategorySystem);
router.delete('/contract-category-systems/:id', authenticateToken, checkAccess('ContractCategorySystem', 'CanDelete'), deleteContractCategorySystem);

// Contract Category Services
router.get('/contract-category-services', authenticateToken, checkAccess('ContractCategoryService', 'CanView'), getAllContractCategoryServices);
router.post('/contract-category-services', authenticateToken, checkAccess('ContractCategoryService', 'CanAdd'), createContractCategoryService);
router.put('/contract-category-services/:id', authenticateToken, checkAccess('ContractCategoryService', 'CanEdit'), updateContractCategoryService);
router.delete('/contract-category-services/:id', authenticateToken, checkAccess('ContractCategoryService', 'CanDelete'), deleteContractCategoryService);

// Contract Category Items
router.get('/contract-category-items', authenticateToken, checkAccess('ContractCategoryItem', 'CanView'), getAllContractCategoryItems);
router.post('/contract-category-items', authenticateToken, checkAccess('ContractCategoryItem', 'CanAdd'), createContractCategoryItem);
router.put('/contract-category-items/:id', authenticateToken, checkAccess('ContractCategoryItem', 'CanEdit'), updateContractCategoryItem);
router.delete('/contract-category-items/:id', authenticateToken, checkAccess('ContractCategoryItem', 'CanDelete'), deleteContractCategoryItem);

// Contract Intervals
router.get('/contract-intervals', authenticateToken, checkAccess('ContractInterval', 'CanView'), getAllContractIntervals);
router.post('/contract-intervals', authenticateToken, checkAccess('ContractInterval', 'CanAdd'), createContractInterval);
router.put('/contract-intervals/:id', authenticateToken, checkAccess('ContractInterval', 'CanEdit'), updateContractInterval);
router.delete('/contract-intervals/:id', authenticateToken, checkAccess('ContractInterval', 'CanDelete'), deleteContractInterval);

// Service Intervals
router.get('/service-intervals', authenticateToken, checkAccess('ServiceInterval', 'CanView'), getAllServiceIntervals);
router.post('/service-intervals', authenticateToken, checkAccess('ServiceInterval', 'CanAdd'), createServiceInterval);
router.put('/service-intervals/:id', authenticateToken, checkAccess('ServiceInterval', 'CanEdit'), updateServiceInterval);
router.delete('/service-intervals/:id', authenticateToken, checkAccess('ServiceInterval', 'CanDelete'), deleteServiceInterval);

// Service Cost
router.get('/service-cost', authenticateToken, checkAccess('ServiceCost', 'CanView'), getServiceCost);
router.post('/service-cost', authenticateToken, checkAccess('ServiceCost', 'CanAdd'), updateServiceCost);
router.put('/service-cost', authenticateToken, checkAccess('ServiceCost', 'CanEdit'), updateServiceCost);

// System Cost
router.get('/system-cost', authenticateToken, checkAccess('SystemCost', 'CanView'), getSystemCost);
router.post('/system-cost', authenticateToken, checkAccess('SystemCost', 'CanAdd'), updateSystemCost);
router.put('/system-cost', authenticateToken, checkAccess('SystemCost', 'CanEdit'), updateSystemCost);

// Item Cost
router.get('/item-cost', authenticateToken, checkAccess('ItemCost', 'CanView'), getItemCost);
router.post('/item-cost', authenticateToken, checkAccess('ItemCost', 'CanAdd'), updateItemCost);
router.put('/item-cost', authenticateToken, checkAccess('ItemCost', 'CanEdit'), updateItemCost);

// Holidays
router.get('/holidays', authenticateToken, checkAccess('Holiday', 'CanView'), getAllHolidays);
router.post('/holidays', authenticateToken, checkAccess('Holiday', 'CanAdd'), createHoliday);
router.put('/holidays/:id', authenticateToken, checkAccess('Holiday', 'CanEdit'), updateHoliday);
router.delete('/holidays/:id', authenticateToken, checkAccess('Holiday', 'CanDelete'), deleteHoliday);

// Contract Type Filtering for Sales Master Plan
router.get('/contract-type/:categoryId/systems', authenticateToken, getSystemsByContractType);
router.get('/contract-type/:categoryId/services', authenticateToken, getServicesByContractType);
router.get('/contract-type/:categoryId/items', authenticateToken, getItemsByContractType);

module.exports = router;
