require('dotenv').config();
const { executeNonQuery, executeQuery, executeScalar } = require('./config/database');

async function testAuth() {
  try {
    console.log('Testing Authentication and Authorization System\n');

    // Test 1: Verify admin user exists
    console.log('=== Test 1: Verify Admin User ===');
    const admin = await executeScalar('SELECT * FROM Users WHERE Username = @Username', { Username: 'admin' });
    if (admin) {
      console.log('✓ Admin user exists:', admin.Username, admin.Role);
    } else {
      console.log('✗ Admin user not found');
    }

    // Test 2: Verify manager user exists
    console.log('\n=== Test 2: Verify Manager User ===');
    const manager = await executeScalar('SELECT * FROM Users WHERE Username = @Username', { Username: 'manager' });
    if (manager) {
      console.log('✓ Manager user exists:', manager.Username, manager.Role);
    } else {
      console.log('✗ Manager user not found');
    }

    // Test 3: Verify admin has full access
    console.log('\n=== Test 3: Verify Admin Access Rights ===');
    const adminAccess = await executeQuery('SELECT * FROM UserAccess WHERE UserID = @UserID', { UserID: admin.UserID });
    console.log(`Admin has access to ${adminAccess.length} forms`);
    adminAccess.forEach(access => {
      const hasFullAccess = access.CanView && access.CanAdd && access.CanEdit && access.CanDelete && access.CanSearch && access.CanPrint;
      console.log(`  ${access.FormName}: ${hasFullAccess ? '✓ Full Access' : '✗ Limited'}`);
    });

    // Test 4: Verify manager has limited access
    console.log('\n=== Test 4: Verify Manager Access Rights ===');
    const managerAccess = await executeQuery('SELECT * FROM UserAccess WHERE UserID = @UserID', { UserID: manager.UserID });
    console.log(`Manager has access to ${managerAccess.length} forms`);
    managerAccess.forEach(access => {
      const canDelete = access.CanDelete ? 'Can Delete' : 'No Delete';
      console.log(`  ${access.FormName}: View=${access.CanView}, Add=${access.CanAdd}, Edit=${access.CanEdit}, ${canDelete}`);
    });

    // Test 5: Verify manager cannot access Admin form
    console.log('\n=== Test 5: Verify Manager Cannot Access Admin Form ===');
    const managerAdminAccess = await executeScalar(
      'SELECT * FROM UserAccess WHERE UserID = @UserID AND FormName = @FormName',
      { UserID: manager.UserID, FormName: 'Admin' }
    );
    if (!managerAdminAccess) {
      console.log('✓ Manager correctly does not have access to Admin form');
    } else {
      console.log('✗ Manager has access to Admin form (should not)');
    }

    // Test 6: Verify all users are active
    console.log('\n=== Test 6: Verify User Status ===');
    const allUsers = await executeQuery('SELECT Username, Role, Status FROM Users');
    allUsers.forEach(user => {
      console.log(`  ${user.Username} (${user.Role}): ${user.Status ? 'Active' : 'Inactive'}`);
    });

    console.log('\n=== All Tests Completed ===');
    console.log('\nCredentials for testing:');
    console.log('  Admin: username=admin, password=admin123');
    console.log('  Manager: username=manager, password=manager123');

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

testAuth();
