const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { executeScalar, executeNonQuery, executeQuery } = require('../config/database');
const logger = require('../utils/logger');

const login = async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;

    if (!username || !password) {
      logger.warn('Login attempt failed: Missing credentials', { ip: req.ip });
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await executeScalar(
      'SELECT * FROM Users WHERE Username = @Username',
      { Username: username }
    );

    if (!user) {
      logger.warn('Login attempt failed: User not found', { username, ip: req.ip });
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    if (!user.Status) {
      logger.warn('Login attempt failed: Inactive account', { username, userId: user.UserID, ip: req.ip });
      return res.status(401).json({ error: 'Account is inactive' });
    }

    const passwordMatch = await bcrypt.compare(password, user.Password);
    if (!passwordMatch) {
      logger.warn('Login attempt failed: Invalid password', { username, userId: user.UserID, ip: req.ip });
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Update last login
    await executeNonQuery(
      'UPDATE Users SET LastLogin = GETDATE() WHERE UserID = @UserID',
      { UserID: user.UserID }
    );

    // Generate JWT token
    const expiresIn = rememberMe ? '30d' : process.env.JWT_EXPIRES_IN || '1d';
    const token = jwt.sign(
      { userId: user.UserID, username: user.Username, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Get user's access rights
    const accessRights = await executeQuery(
      'SELECT FormName, CanView, CanAdd, CanEdit, CanDelete, CanSearch, CanPrint FROM UserAccess WHERE UserID = @UserID',
      { UserID: user.UserID }
    );

    logger.info('User logged in successfully', { userId: user.UserID, username: user.Username, role: user.Role, ip: req.ip, rememberMe });

    res.json({
      token,
      user: {
        userId: user.UserID,
        username: user.Username,
        fullName: user.FullName,
        email: user.Email,
        role: user.Role,
        companyId: user.CompanyID
      },
      accessRights
    });
  } catch (error) {
    logger.error('Login error', { error: error.message, ip: req.ip });
    res.status(500).json({ error: 'Login failed' });
  }
};

const logout = async (req, res) => {
  logger.info('User logged out', { userId: req.user.userId, username: req.user.username });
  // In a JWT-based system, logout is handled client-side by removing the token
  // For additional security, you could implement a token blacklist
  res.json({ message: 'Logged out successfully' });
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await executeScalar(
      'SELECT UserID, Username, FullName, Email, Phone, Role, CompanyID, LastLogin FROM Users WHERE UserID = @UserID',
      { UserID: req.user.userId }
    );

    // Get user's access rights
    const accessRights = await executeQuery(
      'SELECT FormName, CanView, CanAdd, CanEdit, CanDelete, CanSearch, CanPrint FROM UserAccess WHERE UserID = @UserID',
      { UserID: req.user.userId }
    );

    logger.debug('Current user fetched', { userId: req.user.userId, username: req.user.username });
    res.json({ user, accessRights });
  } catch (error) {
    logger.error('Get current user error', { error: error.message, userId: req.user.userId });
    res.status(500).json({ error: 'Failed to get user information' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      logger.warn('Password change failed: Missing credentials', { userId });
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      logger.warn('Password change failed: Password too short', { userId });
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await executeScalar(
      'SELECT Password FROM Users WHERE UserID = @UserID',
      { UserID: userId }
    );

    const passwordMatch = await bcrypt.compare(currentPassword, user.Password);
    if (!passwordMatch) {
      logger.warn('Password change failed: Invalid current password', { userId });
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await executeNonQuery(
      'UPDATE Users SET Password = @Password, UpdatedAt = GETDATE() WHERE UserID = @UserID',
      { Password: hashedPassword, UserID: userId }
    );

    logger.info('Password changed successfully', { userId });
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error', { error: error.message, userId: req.user.userId });
    res.status(500).json({ error: 'Failed to change password' });
  }
};

module.exports = {
  login,
  logout,
  getCurrentUser,
  changePassword
};
