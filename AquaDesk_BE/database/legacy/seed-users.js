require('dotenv').config();
const bcrypt = require('bcrypt');
const { executeNonQuery, executeQuery, executeScalar } = require('../config/database');

async function seedUsers() {
  try {
    console.log('Seeding admin and manager users...\n');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const managerPassword = await bcrypt.hash('manager123', 10);

    // Check if admin exists
    const existingAdmin = await executeScalar('SELECT UserID FROM Users WHERE Username = @Username', { Username: 'admin' });
    
    if (!existingAdmin) {
      // Create admin user
      await executeNonQuery(`
        INSERT INTO Users (Username, Password, FullName, Email, Phone, Role, CompanyID, Status)
        VALUES (@Username, @Password, @FullName, @Email, @Phone, @Role, @CompanyID, 1)
      `, {
        Username: 'admin',
        Password: adminPassword,
        FullName: 'System Administrator',
        Email: 'admin@qsystech.com',
        Phone: '+91-9876543210',
        Role: 'Admin',
        CompanyID: 1
      });
      console.log('Created admin user');
    } else {
      console.log('Admin user already exists');
    }

    // Check if manager exists
    const existingManager = await executeScalar('SELECT UserID FROM Users WHERE Username = @Username', { Username: 'manager' });
    
    if (!existingManager) {
      // Create manager user
      await executeNonQuery(`
        INSERT INTO Users (Username, Password, FullName, Email, Phone, Role, CompanyID, Status)
        VALUES (@Username, @Password, @FullName, @Email, @Phone, @Role, @CompanyID, 1)
      `, {
        Username: 'manager',
        Password: managerPassword,
        FullName: 'Service Manager',
        Email: 'manager@qsystech.com',
        Phone: '+91-9876543211',
        Role: 'Manager',
        CompanyID: 1
      });
      console.log('Created manager user');
    } else {
      console.log('Manager user already exists');
    }

    // Get user IDs
    const adminId = (await executeScalar('SELECT UserID FROM Users WHERE Username = @Username', { Username: 'admin' })).UserID;
    const managerId = (await executeScalar('SELECT UserID FROM Users WHERE Username = @Username', { Username: 'manager' })).UserID;

    // Define forms and their access rights
    const forms = [
      'Dashboard', 'Customer', 'Sales', 'Schedule', 'Report', 'Admin', 'Contract', 'SalesMasterPlan'
    ];

    // Admin gets full access to all forms
    for (const form of forms) {
      const exists = await executeScalar(
        'SELECT 1 FROM UserAccess WHERE UserID = @UserID AND FormName = @FormName',
        { UserID: adminId, FormName: form }
      );
      
      if (!exists) {
        await executeNonQuery(`
          INSERT INTO UserAccess (UserID, FormName, CanView, CanAdd, CanEdit, CanDelete, CanSearch, CanPrint)
          VALUES (@UserID, @FormName, 1, 1, 1, 1, 1, 1)
        `, { UserID: adminId, FormName: form });
      }
    }
    console.log('Admin access rights configured');

    // Manager gets limited access (no Admin form, no delete on most forms)
    const managerForms = [
      { name: 'Dashboard', view: 1, add: 0, edit: 0, delete: 0, search: 1, print: 1 },
      { name: 'Customer', view: 1, add: 1, edit: 1, delete: 0, search: 1, print: 1 },
      { name: 'Sales', view: 1, add: 1, edit: 1, delete: 0, search: 1, print: 1 },
      { name: 'Schedule', view: 1, add: 1, edit: 1, delete: 0, search: 1, print: 1 },
      { name: 'Report', view: 1, add: 0, edit: 0, delete: 0, search: 1, print: 1 },
      { name: 'Contract', view: 1, add: 1, edit: 1, delete: 0, search: 1, print: 1 },
      { name: 'SalesMasterPlan', view: 1, add: 1, edit: 1, delete: 0, search: 1, print: 1 }
    ];

    for (const form of managerForms) {
      const exists = await executeScalar(
        'SELECT 1 FROM UserAccess WHERE UserID = @UserID AND FormName = @FormName',
        { UserID: managerId, FormName: form.name }
      );
      
      if (!exists) {
        await executeNonQuery(`
          INSERT INTO UserAccess (UserID, FormName, CanView, CanAdd, CanEdit, CanDelete, CanSearch, CanPrint)
          VALUES (@UserID, @FormName, @CanView, @CanAdd, @CanEdit, @CanDelete, @CanSearch, @CanPrint)
        `, {
          UserID: managerId,
          FormName: form.name,
          CanView: form.view,
          CanAdd: form.add,
          CanEdit: form.edit,
          CanDelete: form.delete,
          CanSearch: form.search,
          CanPrint: form.print
        });
      }
    }
    console.log('Manager access rights configured');

    // Display summary
    const users = await executeQuery('SELECT UserID, Username, FullName, Role, Status FROM Users WHERE Role IN (@Admin, @Manager)', { Admin: 'Admin', Manager: 'Manager' });
    console.log('\n=== Users Summary ===');
    users.forEach(user => {
      console.log(`  ${user.Username} (${user.Role}): ${user.FullName} - Status: ${user.Status ? 'Active' : 'Inactive'}`);
    });

    console.log('\n=== Credentials ===');
    console.log('  Admin: username=admin, password=admin123');
    console.log('  Manager: username=manager, password=manager123');

    console.log('\nSeeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

seedUsers();
