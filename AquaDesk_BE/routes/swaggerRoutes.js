const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../config/swagger');

const router = express.Router();

// Extend swaggerSpec with paths
const paths = {
  // ==================== AUTH ====================
  '/api/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login user',
      security: [],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
      },
      responses: {
        200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Logout user',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Logged out', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
  },
  '/api/auth/me': {
    get: {
      tags: ['Auth'],
      summary: 'Get current user info',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Current user info' },
        401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/auth/change-password': {
    post: {
      tags: ['Auth'],
      summary: 'Change password',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } } },
      },
      responses: {
        200: { description: 'Password changed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        401: { description: 'Current password incorrect', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  // ==================== COMPANIES ====================
  '/api/companies': {
    get: {
      tags: ['Companies'],
      summary: 'Get all companies',
      security: [{ bearerAuth: [] }],
      description: 'Requires Admin role',
      responses: { 200: { description: 'List of companies', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Company' } } } } } },
    },
    post: {
      tags: ['Companies'],
      summary: 'Create a company',
      security: [{ bearerAuth: [] }],
      description: 'Requires Admin role',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CompanyInput' } } } },
      responses: {
        201: { description: 'Company created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/companies/{id}': {
    get: {
      tags: ['Companies'],
      summary: 'Get company by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Company details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Company' } } } },
        404: { description: 'Company not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    put: {
      tags: ['Companies'],
      summary: 'Update a company',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CompanyInput' } } } },
      responses: {
        200: { description: 'Company updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    delete: {
      tags: ['Companies'],
      summary: 'Delete a company (soft delete)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Company deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Cannot delete', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  // ==================== USERS ====================
  '/api/users': {
    get: {
      tags: ['Users'],
      summary: 'Get all users',
      security: [{ bearerAuth: [] }],
      description: 'Requires Admin role',
      responses: { 200: { description: 'List of users', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } } },
    },
    post: {
      tags: ['Users'],
      summary: 'Create a user',
      security: [{ bearerAuth: [] }],
      description: 'Requires Admin role',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UserInput' } } } },
      responses: {
        201: { description: 'User created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/users/{id}': {
    get: {
      tags: ['Users'],
      summary: 'Get user by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'User details with access rights' },
        404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    put: {
      tags: ['Users'],
      summary: 'Update a user',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UserUpdate' } } } },
      responses: { 200: { description: 'User updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
    delete: {
      tags: ['Users'],
      summary: 'Delete a user (soft delete)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'User deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Cannot delete', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/users/{id}/reset-password': {
    post: {
      tags: ['Users'],
      summary: 'Reset user password',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordInput' } } } },
      responses: {
        200: { description: 'Password reset', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  // ==================== CUSTOMERS ====================
  '/api/customers': {
    get: {
      tags: ['Customers'],
      summary: 'Get all customers',
      security: [{ bearerAuth: [] }],
      description: 'Requires CanView on Customer',
      parameters: [
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name, code, or mobile' },
        { name: 'areaCode', in: 'query', schema: { type: 'string' }, description: 'Filter by area code' },
      ],
      responses: { 200: { description: 'List of customers', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Customer' } } } } } },
    },
    post: {
      tags: ['Customers'],
      summary: 'Create a customer',
      security: [{ bearerAuth: [] }],
      description: 'Requires CanAdd on Customer',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CustomerInput' } } } },
      responses: {
        201: { description: 'Customer created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/customers/{id}': {
    get: {
      tags: ['Customers'],
      summary: 'Get customer by ID with systems, contracts, sales',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Customer details' },
        404: { description: 'Customer not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    put: {
      tags: ['Customers'],
      summary: 'Update a customer',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CustomerInput' } } } },
      responses: { 200: { description: 'Customer updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
    delete: {
      tags: ['Customers'],
      summary: 'Delete a customer (soft delete)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Customer deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Cannot delete', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/customers/{id}/systems': {
    post: {
      tags: ['Customers'],
      summary: 'Add a system to a customer',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Customer ID' }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CustomerSystemInput' } } } },
      responses: { 201: { description: 'System added', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
  },
  '/api/customers/{id}/contracts': {
    post: {
      tags: ['Customers'],
      summary: 'Add a contract to a customer',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Customer ID' }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CustomerContractInput' } } } },
      responses: { 201: { description: 'Contract added', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
  },

  // ==================== CONTRACTS ====================
  '/api/contracts': {
    get: {
      tags: ['Contracts'],
      summary: 'Get all service contracts',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'customerId', in: 'query', schema: { type: 'integer' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['0', '1'] } },
      ],
      responses: { 200: { description: 'List of contracts', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Contract' } } } } } },
    },
    post: {
      tags: ['Contracts'],
      summary: 'Create a service contract',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ContractInput' } } } },
      responses: {
        201: { description: 'Contract created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/contracts/{id}': {
    get: {
      tags: ['Contracts'],
      summary: 'Get contract by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Contract details' },
        404: { description: 'Contract not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    put: {
      tags: ['Contracts'],
      summary: 'Update a contract',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ContractUpdate' } } } },
      responses: { 200: { description: 'Contract updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
    delete: {
      tags: ['Contracts'],
      summary: 'Delete a contract (soft delete)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Contract deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
  },
  '/api/contracts/{id}/renew': {
    post: {
      tags: ['Contracts'],
      summary: 'Renew a contract',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RenewContractInput' } } } },
      responses: {
        200: { description: 'Contract renewed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  // ==================== SALES MASTER ====================
  '/api/sales': {
    get: {
      tags: ['Sales'],
      summary: 'Get all sales records',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'filterType', in: 'query', schema: { type: 'string', enum: ['AreaCode', 'CustomerCode', 'CustomerName', 'All'] } },
        { name: 'filterValue', in: 'query', schema: { type: 'string' } },
        { name: 'planType', in: 'query', schema: { type: 'string', enum: ['Plan', 'Complaint'] } },
        { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
        { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
      ],
      responses: { 200: { description: 'List of sales records' } },
    },
    post: {
      tags: ['Sales'],
      summary: 'Create a sales record',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SalesMasterInput' } } } },
      responses: {
        201: { description: 'Sales record created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/sales/{id}': {
    get: {
      tags: ['Sales'],
      summary: 'Get sales record by ID with systems, services, items',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Sales record details' },
        404: { description: 'Sales record not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    put: {
      tags: ['Sales'],
      summary: 'Update a sales record',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SalesMasterInput' } } } },
      responses: { 200: { description: 'Sales record updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
    delete: {
      tags: ['Sales'],
      summary: 'Delete a sales record (soft delete)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Sales record deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
  },

  // ==================== SALES MASTER PLANS ====================
  '/api/sales-master-plans': {
    get: {
      tags: ['Sales Master Plans'],
      summary: 'Get all sales master plans',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'List of sales master plans', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/SalesMasterPlan' } } } } } },
    },
    post: {
      tags: ['Sales Master Plans'],
      summary: 'Create a sales master plan',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SalesMasterPlanInput' } } } },
      responses: {
        201: { description: 'Plan created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/sales-master-plans/frequency/{frequency}': {
    get: {
      tags: ['Sales Master Plans'],
      summary: 'Get plans by frequency',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'frequency', in: 'path', required: true, schema: { type: 'string', enum: ['Weekly', 'Monthly', 'Quarterly', 'Yearly'] }, description: 'Plan frequency' }],
      responses: { 200: { description: 'List of plans filtered by frequency', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/SalesMasterPlan' } } } } } },
    },
  },
  '/api/sales-master-plans/{id}': {
    get: {
      tags: ['Sales Master Plans'],
      summary: 'Get sales master plan by ID with systems, services, items',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Plan details with associated systems, services, items' },
        404: { description: 'Plan not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    put: {
      tags: ['Sales Master Plans'],
      summary: 'Update a sales master plan',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SalesMasterPlanInput' } } } },
      responses: { 200: { description: 'Plan updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
    delete: {
      tags: ['Sales Master Plans'],
      summary: 'Delete a sales master plan (soft delete)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Plan deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
  },

  // ==================== SCHEDULE ====================
  '/api/schedule/week-view': {
    get: {
      tags: ['Schedule'],
      summary: 'Get week view of schedules',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Start date of the week' }],
      responses: { 200: { description: 'Week view data grouped by day' } },
    },
  },
  '/api/schedule/upcoming': {
    get: {
      tags: ['Schedule'],
      summary: 'Get upcoming tasks (unscheduled plans)',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'List of upcoming tasks' } },
    },
  },
  '/api/schedule/confirmed': {
    get: {
      tags: ['Schedule'],
      summary: 'Get confirmed tasks',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'date', in: 'query', schema: { type: 'string', format: 'date' } }],
      responses: { 200: { description: 'List of confirmed tasks' } },
    },
  },
  '/api/schedule/completed': {
    get: {
      tags: ['Schedule'],
      summary: 'Get completed tasks',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
        { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
      ],
      responses: { 200: { description: 'List of completed tasks' } },
    },
  },
  '/api/schedule/manual': {
    get: {
      tags: ['Schedule'],
      summary: 'Get manual schedule for a date',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'date', in: 'query', required: true, schema: { type: 'string', format: 'date' } }],
      responses: { 200: { description: 'List of schedules for the date' } },
    },
  },
  '/api/schedule/{id}': {
    get: {
      tags: ['Schedule'],
      summary: 'Get schedule by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Schedule details with systems, services, items, engineers' },
        404: { description: 'Schedule not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/schedule/{id}/confirm': {
    post: {
      tags: ['Schedule'],
      summary: 'Confirm a schedule',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ConfirmScheduleInput' } } } },
      responses: {
        200: { description: 'Schedule confirmed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Already confirmed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: 'Schedule not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/schedule/{id}/reschedule': {
    post: {
      tags: ['Schedule'],
      summary: 'Reschedule a task',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RescheduleInput' } } } },
      responses: {
        200: { description: 'Task rescheduled', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/schedule/mark-completed': {
    post: {
      tags: ['Schedule'],
      summary: 'Mark tasks as completed',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MarkCompletedInput' } } } },
      responses: {
        200: { description: 'Tasks marked completed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/schedule/manual-insert': {
    post: {
      tags: ['Schedule'],
      summary: 'Insert a manual schedule',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ManualScheduleInput' } } } },
      responses: {
        201: { description: 'Manual schedule inserted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  // ==================== REPORTS ====================
  '/api/reports/daywise-task': {
    get: {
      tags: ['Reports'],
      summary: 'Get daywise task report',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'taskDate', in: 'query', required: true, schema: { type: 'string', format: 'date' } }],
      responses: { 200: { description: 'Daywise task report' }, 400: { description: 'Task date required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
    },
  },
  '/api/reports/areawise-task': {
    get: {
      tags: ['Reports'],
      summary: 'Get areawise task report',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'startDate', in: 'query', required: true, schema: { type: 'string', format: 'date-time' } },
        { name: 'endDate', in: 'query', required: true, schema: { type: 'string', format: 'date-time' } },
        { name: 'areaCode', in: 'query', schema: { type: 'string' } },
      ],
      responses: { 200: { description: 'Areawise task report' }, 400: { description: 'Dates required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
    },
  },
  '/api/reports/item-required': {
    get: {
      tags: ['Reports'],
      summary: 'Get item required report',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'startDate', in: 'query', required: true, schema: { type: 'string', format: 'date-time' } },
        { name: 'endDate', in: 'query', required: true, schema: { type: 'string', format: 'date-time' } },
        { name: 'itemId', in: 'query', schema: { type: 'integer' } },
      ],
      responses: { 200: { description: 'Item required report' }, 400: { description: 'Dates required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
    },
  },
  '/api/reports/contract-renewal': {
    get: {
      tags: ['Reports'],
      summary: 'Get contract renewal report',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'days', in: 'query', schema: { type: 'integer', default: 30 }, description: 'Days threshold for renewal' }],
      responses: { 200: { description: 'Contracts due for renewal' } },
    },
  },

  // ==================== ADMIN - ENGINEERS ====================
  '/api/admin/engineers': {
    get: {
      tags: ['Admin - Engineers'],
      summary: 'Get all service engineers',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'List of engineers' } },
    },
    post: {
      tags: ['Admin - Engineers'],
      summary: 'Create an engineer',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/EngineerInput' } } } },
      responses: {
        201: { description: 'Engineer created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/admin/engineers/{id}': {
    put: {
      tags: ['Admin - Engineers'],
      summary: 'Update an engineer',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/EngineerUpdate' } } } },
      responses: { 200: { description: 'Engineer updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
    delete: {
      tags: ['Admin - Engineers'],
      summary: 'Delete an engineer (soft delete)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Engineer deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
  },

  // ==================== ADMIN - TEAMS ====================
  '/api/admin/teams': {
    get: {
      tags: ['Admin - Teams'],
      summary: 'Get all service teams',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'List of teams' } },
    },
    post: {
      tags: ['Admin - Teams'],
      summary: 'Create a team',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TeamInput' } } } },
      responses: {
        201: { description: 'Team created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/admin/teams/{id}': {
    put: {
      tags: ['Admin - Teams'],
      summary: 'Update a team',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TeamUpdate' } } } },
      responses: { 200: { description: 'Team updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
    delete: {
      tags: ['Admin - Teams'],
      summary: 'Delete a team (soft delete)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Team deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
  },

  // ==================== ADMIN - SYSTEMS ====================
  '/api/admin/systems': {
    get: {
      tags: ['Admin - Systems'],
      summary: 'Get all systems',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'List of systems' } },
    },
    post: {
      tags: ['Admin - Systems'],
      summary: 'Create a system',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SystemInput' } } } },
      responses: {
        201: { description: 'System created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/admin/systems/{id}': {
    put: {
      tags: ['Admin - Systems'],
      summary: 'Update a system',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SystemUpdate' } } } },
      responses: { 200: { description: 'System updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
    delete: {
      tags: ['Admin - Systems'],
      summary: 'Delete a system (soft delete)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'System deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
  },

  // ==================== ADMIN - SERVICES ====================
  '/api/admin/services': {
    get: {
      tags: ['Admin - Services'],
      summary: 'Get all services',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'List of services' } },
    },
    post: {
      tags: ['Admin - Services'],
      summary: 'Create a service',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceInput' } } } },
      responses: {
        201: { description: 'Service created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/admin/services/{id}': {
    put: {
      tags: ['Admin - Services'],
      summary: 'Update a service',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceUpdate' } } } },
      responses: { 200: { description: 'Service updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
    delete: {
      tags: ['Admin - Services'],
      summary: 'Delete a service (soft delete)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Service deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
  },

  // ==================== ADMIN - ITEMS ====================
  '/api/admin/items': {
    get: {
      tags: ['Admin - Items'],
      summary: 'Get all items',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'List of items' } },
    },
    post: {
      tags: ['Admin - Items'],
      summary: 'Create an item',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ItemInput' } } } },
      responses: {
        201: { description: 'Item created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/admin/items/{id}': {
    put: {
      tags: ['Admin - Items'],
      summary: 'Update an item',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ItemUpdate' } } } },
      responses: { 200: { description: 'Item updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
    delete: {
      tags: ['Admin - Items'],
      summary: 'Delete an item (soft delete)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Item deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
  },

  // ==================== ADMIN - ITEM STOCK ====================
  '/api/admin/item-stock': {
    get: {
      tags: ['Admin - Item Stock'],
      summary: 'Get item stock',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'List of item stock' } },
    },
    put: {
      tags: ['Admin - Item Stock'],
      summary: 'Update item stock',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ItemStockUpdate' } } } },
      responses: {
        200: { description: 'Item stock updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  // ==================== ADMIN - AREA CODES ====================
  '/api/admin/area-codes': {
    get: {
      tags: ['Admin - Area Codes'],
      summary: 'Get all area codes',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'List of area codes' } },
    },
    post: {
      tags: ['Admin - Area Codes'],
      summary: 'Create an area code',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AreaCodeInput' } } } },
      responses: {
        201: { description: 'Area code created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/admin/area-codes/{id}': {
    put: {
      tags: ['Admin - Area Codes'],
      summary: 'Update an area code',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AreaCodeUpdate' } } } },
      responses: { 200: { description: 'Area code updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
    delete: {
      tags: ['Admin - Area Codes'],
      summary: 'Delete an area code (soft delete)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Area code deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
  },

  // ==================== ADMIN - CONTRACT CATEGORIES ====================
  '/api/admin/contract-categories': {
    get: {
      tags: ['Admin - Contract Categories'],
      summary: 'Get all contract categories',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'List of contract categories' } },
    },
    post: {
      tags: ['Admin - Contract Categories'],
      summary: 'Create a contract category',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ContractCategoryInput' } } } },
      responses: {
        201: { description: 'Category created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/admin/contract-categories/{id}': {
    put: {
      tags: ['Admin - Contract Categories'],
      summary: 'Update a contract category',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ContractCategoryUpdate' } } } },
      responses: { 200: { description: 'Category updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
    delete: {
      tags: ['Admin - Contract Categories'],
      summary: 'Delete a contract category (soft delete)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Category deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
  },

  // ==================== ADMIN - CONTRACT INTERVALS ====================
  '/api/admin/contract-intervals': {
    get: {
      tags: ['Admin - Contract Intervals'],
      summary: 'Get all contract intervals',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'List of contract intervals' } },
    },
    post: {
      tags: ['Admin - Contract Intervals'],
      summary: 'Create a contract interval',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ContractIntervalInput' } } } },
      responses: {
        201: { description: 'Interval created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/admin/contract-intervals/{id}': {
    put: {
      tags: ['Admin - Contract Intervals'],
      summary: 'Update a contract interval',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ContractIntervalUpdate' } } } },
      responses: { 200: { description: 'Interval updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
    delete: {
      tags: ['Admin - Contract Intervals'],
      summary: 'Delete a contract interval (soft delete)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Interval deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
  },

  // ==================== ADMIN - SERVICE INTERVALS ====================
  '/api/admin/service-intervals': {
    get: {
      tags: ['Admin - Service Intervals'],
      summary: 'Get all service intervals',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'List of service intervals' } },
    },
    post: {
      tags: ['Admin - Service Intervals'],
      summary: 'Create a service interval',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceIntervalInput' } } } },
      responses: {
        201: { description: 'Interval created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/api/admin/service-intervals/{id}': {
    put: {
      tags: ['Admin - Service Intervals'],
      summary: 'Update a service interval',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceIntervalUpdate' } } } },
      responses: { 200: { description: 'Interval updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
    delete: {
      tags: ['Admin - Service Intervals'],
      summary: 'Delete a service interval (soft delete)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Interval deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } },
    },
  },

  // ==================== ADMIN - SERVICE COST ====================
  '/api/admin/service-cost': {
    get: {
      tags: ['Admin - Costs'],
      summary: 'Get service costs',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'List of service costs' } },
    },
    put: {
      tags: ['Admin - Costs'],
      summary: 'Update service cost',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceCostUpdate' } } } },
      responses: {
        200: { description: 'Service cost updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  // ==================== ADMIN - SYSTEM COST ====================
  '/api/admin/system-cost': {
    get: {
      tags: ['Admin - Costs'],
      summary: 'Get system costs',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'List of system costs' } },
    },
    put: {
      tags: ['Admin - Costs'],
      summary: 'Update system cost',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SystemCostUpdate' } } } },
      responses: {
        200: { description: 'System cost updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  // ==================== ADMIN - ITEM COST ====================
  '/api/admin/item-cost': {
    get: {
      tags: ['Admin - Costs'],
      summary: 'Get item costs',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'List of item costs' } },
    },
    put: {
      tags: ['Admin - Costs'],
      summary: 'Update item cost',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ItemCostUpdate' } } } },
      responses: {
        200: { description: 'Item cost updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
};

swaggerSpec.paths = { ...swaggerSpec.paths, ...paths };

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec));

router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

module.exports = router;
