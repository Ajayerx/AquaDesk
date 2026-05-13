# Qsystech Service Management System - API

A comprehensive secured REST API for the Qsystech Service Management System built with Node.js, Express, and SQL Server.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Company Management**: Multi-tenant support with company isolation
- **User Management**: User accounts with granular access permissions
- **Customer Management**: Complete customer profiles with systems and contracts
- **Sales Master**: Service plans, sales orders, and complaints management
- **Schedule Management**: Week view, task confirmation, rescheduling, manual scheduling
- **Admin Modules**: Engineers, teams, systems, services, items, area codes, costs
- **Reports**: Daywise tasks, areawise tasks, item requirements, contract renewals
- **Contract Management**: Service contracts with renewal tracking
- **Security**: Helmet, CORS, rate limiting, input validation

## Prerequisites

- Node.js (v14 or higher)
- SQL Server (2017 or higher)
- npm or yarn

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd qsystech-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env` and update the values:
   ```bash
   copy .env.example .env
   ```
   
   Update the following variables in `.env`:
   ```
   PORT=3000
   NODE_ENV=development
   
   DB_SERVER=localhost
   DB_DATABASE=QsystechDB
   DB_USER=sa
   DB_PASSWORD=YourPassword123
   DB_ENCRYPT=true
   DB_TRUST_SERVER_CERTIFICATE=true
   
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=30d
   
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Create the database**
   
   Create a new SQL Server database named `QsystechDB` (or your preferred name matching the `.env` configuration).

5. **Initialize the database schema**
   
   Run the database initialization script:
   ```bash
   npm run init-db
   ```
   
   This will execute the schema.sql file to create all required tables and insert default data.

6. **Update default admin password**
   
   The default admin user is created with:
   - Username: `admin`
   Password: `admin123`
   
   **Important**: Change this password immediately after first login.

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on the configured port (default: 3000).

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Companies (Admin Only)

- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get company by ID
- `POST /api/companies` - Create company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Users (Admin Only)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/reset-password` - Reset user password

### Customers

- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `POST /api/customers/:id/systems` - Add system to customer
- `POST /api/customers/:id/contracts` - Add contract to customer

### Sales Master (Plans/Complaints)

- `GET /api/sales` - Get all sales records
- `GET /api/sales/:id` - Get sales record by ID
- `POST /api/sales` - Create sales record
- `PUT /api/sales/:id` - Update sales record
- `DELETE /api/sales/:id` - Delete sales record

### Schedule

- `GET /api/schedule/week-view` - Get week view
- `GET /api/schedule/upcoming` - Get upcoming tasks
- `GET /api/schedule/confirmed` - Get confirmed tasks
- `GET /api/schedule/completed` - Get completed tasks
- `GET /api/schedule/manual` - Get manual schedule
- `GET /api/schedule/:id` - Get schedule by ID
- `POST /api/schedule/:id/confirm` - Confirm schedule
- `POST /api/schedule/:id/reschedule` - Reschedule task
- `POST /api/schedule/mark-completed` - Mark tasks as completed
- `POST /api/schedule/manual-insert` - Insert manual schedule

### Admin

#### Service Engineers
- `GET /api/admin/engineers` - Get all engineers
- `POST /api/admin/engineers` - Create engineer
- `PUT /api/admin/engineers/:id` - Update engineer
- `DELETE /api/admin/engineers/:id` - Delete engineer

#### Service Teams
- `GET /api/admin/teams` - Get all teams
- `POST /api/admin/teams` - Create team
- `PUT /api/admin/teams/:id` - Update team
- `DELETE /api/admin/teams/:id` - Delete team

#### Systems
- `GET /api/admin/systems` - Get all systems
- `POST /api/admin/systems` - Create system
- `PUT /api/admin/systems/:id` - Update system
- `DELETE /api/admin/systems/:id` - Delete system

#### Services
- `GET /api/admin/services` - Get all services
- `POST /api/admin/services` - Create service
- `PUT /api/admin/services/:id` - Update service
- `DELETE /api/admin/services/:id` - Delete service

#### Items
- `GET /api/admin/items` - Get all items
- `POST /api/admin/items` - Create item
- `PUT /api/admin/items/:id` - Update item
- `DELETE /api/admin/items/:id` - Delete item

#### Item Stock
- `GET /api/admin/item-stock` - Get item stock
- `PUT /api/admin/item-stock` - Update item stock

#### Area Codes
- `GET /api/admin/area-codes` - Get all area codes
- `POST /api/admin/area-codes` - Create area code
- `PUT /api/admin/area-codes/:id` - Update area code
- `DELETE /api/admin/area-codes/:id` - Delete area code

#### Contract Categories
- `GET /api/admin/contract-categories` - Get all contract categories
- `POST /api/admin/contract-categories` - Create contract category
- `PUT /api/admin/contract-categories/:id` - Update contract category
- `DELETE /api/admin/contract-categories/:id` - Delete contract category

#### Contract Intervals
- `GET /api/admin/contract-intervals` - Get all contract intervals
- `POST /api/admin/contract-intervals` - Create contract interval
- `PUT /api/admin/contract-intervals/:id` - Update contract interval
- `DELETE /api/admin/contract-intervals/:id` - Delete contract interval

#### Service Intervals
- `GET /api/admin/service-intervals` - Get all service intervals
- `POST /api/admin/service-intervals` - Create service interval
- `PUT /api/admin/service-intervals/:id` - Update service interval
- `DELETE /api/admin/service-intervals/:id` - Delete service interval

#### Costs
- `GET /api/admin/service-cost` - Get service costs
- `PUT /api/admin/service-cost` - Update service cost
- `GET /api/admin/system-cost` - Get system costs
- `PUT /api/admin/system-cost` - Update system cost
- `GET /api/admin/item-cost` - Get item costs
- `PUT /api/admin/item-cost` - Update item cost

### Reports

- `GET /api/reports/daywise-task` - Get daywise task report
- `GET /api/reports/areawise-task` - Get areawise task report
- `GET /api/reports/item-required` - Get item required report
- `GET /api/reports/contract-renewal` - Get contract renewal report

### Contracts

- `GET /api/contracts` - Get all contracts
- `GET /api/contracts/:id` - Get contract by ID
- `POST /api/contracts` - Create contract
- `PUT /api/contracts/:id` - Update contract
- `DELETE /api/contracts/:id` - Delete contract
- `POST /api/contracts/:id/renew` - Renew contract

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Login Example

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123",
  "rememberMe": true
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "username": "admin",
    "fullName": "Administrator",
    "email": "admin@qsystech.com",
    "role": "Admin",
    "companyId": 1
  },
  "accessRights": [...]
}
```

## Role-Based Access Control

The system implements role-based access control with the following permissions per form:

- **CanView**: View data
- **CanAdd**: Create new records
- **CanEdit**: Modify existing records
- **CanDelete**: Delete records
- **CanSearch**: Search/filter data
- **CanPrint**: Generate reports/exports

Access rights are configured per user per form in the UserAccess table.

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password hashing
- **Helmet**: Security headers
- **CORS**: Cross-Origin Resource Sharing configuration
- **Rate Limiting**: Protection against brute force attacks
- **SQL Injection Prevention**: Parameterized queries
- **Input Validation**: Request validation

## Database Schema

The database consists of the following main tables:

- **Companies**: Company/tenant information
- **Users**: User accounts and authentication
- **UserAccess**: Role-based access control
- **Customers**: Customer information
- **CustomerSystems**: Systems installed at customer locations
- **ServiceContracts**: Service agreements
- **SalesMaster**: Service plans, sales, complaints
- **SalesMasterSystems**: Systems in sales records
- **SalesMasterServices**: Services in sales records
- **SalesMasterItems**: Items in sales records
- **Schedule**: Task scheduling
- **Complaints**: Complaint tracking
- **ServiceEngineers**: Service technicians
- **ServiceTeams**: Engineer teams
- **Systems**: Master system catalog
- **Services**: Master service catalog
- **Items**: Master item catalog
- **ItemStock**: Inventory management
- **AreaCodes**: Geographic areas
- **ContractCategories**: Contract types
- **ContractIntervals**: Contract duration periods
- **ServiceIntervals**: Service visit intervals
- **ServiceCost**: Service pricing
- **SystemCost**: System pricing
- **ItemCost**: Item pricing

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Adding New Endpoints

1. Create a controller in `controllers/`
2. Create routes in `routes/`
3. Import and use the route in `server.js`
4. Add authentication/authorization middleware as needed

### Database Changes

1. Update `database/schema.sql`
2. Run `npm run init-db` to apply changes (in development)
3. For production, create migration scripts

## Testing

Use tools like Postman, Insomnia, or curl to test the API endpoints.

Example curl command for login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Production Deployment

1. Set `NODE_ENV=production` in environment variables
2. Use a strong, unique `JWT_SECRET`
3. Configure proper CORS origin
4. Use HTTPS
5. Set up proper database backups
6. Configure logging and monitoring
7. Use a process manager like PM2

## License

ISC

## Support

For issues and questions, please contact the development team.
