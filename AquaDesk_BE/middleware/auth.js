const jwt = require('jsonwebtoken');
const { executeScalar } = require('../config/database');
const logger = require('../utils/logger');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      logger.warn('Authentication failed: No token provided', { ip: req.ip, path: req.path });
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user exists and is active
    const user = await executeScalar(
      'SELECT UserID, Username, FullName, Email, Role, CompanyID, Status FROM Users WHERE UserID = @UserID',
      { UserID: decoded.userId }
    );

    if (!user || !user.Status) {
      logger.warn('Authentication failed: Invalid or inactive user', { userId: decoded.userId, ip: req.ip });
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = {
      userId: user.UserID,
      username: user.Username,
      fullName: user.FullName,
      email: user.Email,
      role: user.Role,
      companyId: user.CompanyID
    };

    logger.info('User authenticated', { userId: user.UserID, username: user.Username, role: user.Role, path: req.path });
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Authentication failed: Invalid token', { ip: req.ip });
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      logger.warn('Authentication failed: Token expired', { ip: req.ip });
      return res.status(401).json({ error: 'Token expired' });
    }
    logger.error('Authentication error', { error: error.message, ip: req.ip, path: req.path });
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const checkAccess = (formName, action) => {
  return async (req, res, next) => {
    try {
      // Admin role bypasses access checks
      if (req.user.role === 'Admin') {
        logger.debug('Admin bypassed access check', { userId: req.user.userId, formName, action });
        return next();
      }

      const userId = req.user.userId;
      
      const access = await executeScalar(
        `SELECT ${action} FROM UserAccess WHERE UserID = @UserID AND FormName = @FormName`,
        { UserID: userId, FormName: formName }
      );

      if (!access || !access[action]) {
        logger.warn('Access denied', { userId, formName, action, role: req.user.role });
        return res.status(403).json({ error: `Access denied: ${action} permission required for ${formName}` });
      }

      logger.debug('Access granted', { userId, formName, action });
      next();
    } catch (error) {
      logger.error('Access check error', { error: error.message, userId: req.user.userId, formName, action });
      res.status(500).json({ error: 'Access check failed' });
    }
  };
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    logger.warn('Admin access denied', { userId: req.user.userId, role: req.user.role, path: req.path });
    return res.status(403).json({ error: 'Admin access required' });
  }
  logger.debug('Admin access granted', { userId: req.user.userId, path: req.path });
  next();
};

module.exports = {
  authenticateToken,
  checkAccess,
  isAdmin
};
