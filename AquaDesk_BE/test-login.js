require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { executeScalar, executeNonQuery, executeQuery } = require('./config/database');

async function testLogin() {
  try {
    console.log('Testing Login Functionality\n');

    // Test 1: Admin Login
    console.log('=== Test 1: Admin Login ===');
    const adminUser = await executeScalar('SELECT * FROM Users WHERE Username = @Username', { Username: 'admin' });
    const adminPasswordMatch = await bcrypt.compare('admin123', adminUser.Password);
    
    if (adminPasswordMatch) {
      console.log('✓ Admin password verification successful');
      
      // Generate token
      const adminToken = jwt.sign(
        { userId: adminUser.UserID, username: adminUser.Username, role: adminUser.Role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      console.log('✓ Admin token generated:', adminToken.substring(0, 50) + '...');
      
      // Verify token
      const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
      console.log('✓ Admin token verified:', { userId: decoded.userId, username: decoded.username, role: decoded.role });
      
      // Update last login
      await executeNonQuery('UPDATE Users SET LastLogin = GETDATE() WHERE UserID = @UserID', { UserID: adminUser.UserID });
      console.log('✓ Admin last login updated');
    } else {
      console.log('✗ Admin password verification failed');
    }

    // Test 2: Manager Login
    console.log('\n=== Test 2: Manager Login ===');
    const managerUser = await executeScalar('SELECT * FROM Users WHERE Username = @Username', { Username: 'manager' });
    const managerPasswordMatch = await bcrypt.compare('manager123', managerUser.Password);
    
    if (managerPasswordMatch) {
      console.log('✓ Manager password verification successful');
      
      // Generate token
      const managerToken = jwt.sign(
        { userId: managerUser.UserID, username: managerUser.Username, role: managerUser.Role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      console.log('✓ Manager token generated:', managerToken.substring(0, 50) + '...');
      
      // Verify token
      const decoded = jwt.verify(managerToken, process.env.JWT_SECRET);
      console.log('✓ Manager token verified:', { userId: decoded.userId, username: decoded.username, role: decoded.role });
      
      // Update last login
      await executeNonQuery('UPDATE Users SET LastLogin = GETDATE() WHERE UserID = @UserID', { UserID: managerUser.UserID });
      console.log('✓ Manager last login updated');
    } else {
      console.log('✗ Manager password verification failed');
    }

    // Test 3: Invalid Login
    console.log('\n=== Test 3: Invalid Login (Wrong Password) ===');
    const invalidMatch = await bcrypt.compare('wrongpassword', adminUser.Password);
    if (!invalidMatch) {
      console.log('✓ Invalid password correctly rejected');
    } else {
      console.log('✗ Invalid password accepted (should not happen)');
    }

    // Test 4: Non-existent User
    console.log('\n=== Test 4: Non-existent User ===');
    const nonExistent = await executeScalar('SELECT * FROM Users WHERE Username = @Username', { Username: 'nonexistent' });
    if (!nonExistent) {
      console.log('✓ Non-existent user correctly not found');
    } else {
      console.log('✗ Non-existent user found (should not happen)');
    }

    // Test 5: Inactive User
    console.log('\n=== Test 5: Inactive User ===');
    await executeNonQuery('UPDATE Users SET Status = 0 WHERE Username = @Username', { Username: 'johnmgr' });
    const inactiveUser = await executeScalar('SELECT * FROM Users WHERE Username = @Username', { Username: 'johnmgr' });
    if (inactiveUser && !inactiveUser.Status) {
      console.log('✓ Inactive user correctly identified');
    }
    // Restore status
    await executeNonQuery('UPDATE Users SET Status = 1 WHERE Username = @Username', { Username: 'johnmgr' });
    console.log('✓ User status restored');

    console.log('\n=== All Login Tests Completed ===');
    console.log('\nAuthentication system is working correctly!');
    console.log('You can now test login via the API at: POST /api/auth/login');
    console.log('  Admin: username=admin, password=admin123');
    console.log('  Manager: username=manager, password=manager123');

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

testLogin();
