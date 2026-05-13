const bcrypt = require('bcrypt');
const { executeQuery, executeScalar, executeNonQuery } = require('../config/database');

const getAllUsers = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const users = await executeQuery(
      `SELECT u.UserID, u.Username, u.FullName, u.Email, u.Phone, u.Role, u.Status, u.LastLogin, c.CompanyName
       FROM Users u
       LEFT JOIN Companies c ON u.CompanyID = c.CompanyID
       WHERE u.CompanyID = @CompanyID
       ORDER BY u.FullName`,
      { CompanyID: companyId }
    );
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await executeScalar(
      `SELECT u.UserID, u.Username, u.FullName, u.Email, u.Phone, u.Role, u.Status, u.LastLogin, u.CompanyID, c.CompanyName
       FROM Users u
       LEFT JOIN Companies c ON u.CompanyID = c.CompanyID
       WHERE u.UserID = @UserID`,
      { UserID: id }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's access rights
    const accessRights = await executeQuery(
      'SELECT FormName, CanView, CanAdd, CanEdit, CanDelete, CanSearch, CanPrint FROM UserAccess WHERE UserID = @UserID',
      { UserID: id }
    );

    res.json({ ...user, accessRights });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, password, fullName, email, phone, role, companyId, accessRights } = req.body;

    if (!username || !password || !fullName) {
      return res.status(400).json({ error: 'Username, password, and full name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if username already exists
    const existing = await executeScalar(
      'SELECT UserID FROM Users WHERE Username = @Username',
      { Username: username }
    );

    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await executeNonQuery(
      `INSERT INTO Users (Username, Password, FullName, Email, Phone, Role, CompanyID, Status)
       VALUES (@Username, @Password, @FullName, @Email, @Phone, @Role, @CompanyID, 1)`,
      { username, Password: hashedPassword, fullName, email, phone, role, CompanyID: companyId || req.user.companyId }
    );

    // Add access rights if provided
    if (accessRights && Array.isArray(accessRights)) {
      for (const access of accessRights) {
        await executeNonQuery(
          `INSERT INTO UserAccess (UserID, FormName, CanView, CanAdd, CanEdit, CanDelete, CanSearch, CanPrint)
           VALUES (@UserID, @FormName, @CanView, @CanAdd, @CanEdit, @CanDelete, @CanSearch, @CanPrint)`,
          {
            UserID: result,
            FormName: access.formName,
            CanView: access.canView ? 1 : 0,
            CanAdd: access.canAdd ? 1 : 0,
            CanEdit: access.canEdit ? 1 : 0,
            CanDelete: access.canDelete ? 1 : 0,
            CanSearch: access.canSearch ? 1 : 0,
            CanPrint: access.canPrint ? 1 : 0
          }
        );
      }
    }

    res.status(201).json({ message: 'User created successfully', userId: result });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, fullName, email, phone, role, companyId, status, accessRights } = req.body;

    await executeNonQuery(
      `UPDATE Users 
       SET Username = @Username, FullName = @FullName, Email = @Email, Phone = @Phone, 
           Role = @Role, CompanyID = @CompanyID, Status = @Status, UpdatedAt = GETDATE()
       WHERE UserID = @UserID`,
      { username, fullName, email, phone, role, CompanyID: companyId, Status: status ? 1 : 0, UserID: id }
    );

    // Update access rights if provided
    if (accessRights && Array.isArray(accessRights)) {
      // Delete existing access rights
      await executeNonQuery(
        'DELETE FROM UserAccess WHERE UserID = @UserID',
        { UserID: id }
      );

      // Add new access rights
      for (const access of accessRights) {
        await executeNonQuery(
          `INSERT INTO UserAccess (UserID, FormName, CanView, CanAdd, CanEdit, CanDelete, CanSearch, CanPrint)
           VALUES (@UserID, @FormName, @CanView, @CanAdd, @CanEdit, @CanDelete, @CanSearch, @CanPrint)`,
          {
            UserID: id,
            FormName: access.formName,
            CanView: access.canView ? 1 : 0,
            CanAdd: access.canAdd ? 1 : 0,
            CanEdit: access.canEdit ? 1 : 0,
            CanDelete: access.canDelete ? 1 : 0,
            CanSearch: access.canSearch ? 1 : 0,
            CanPrint: access.canPrint ? 1 : 0
          }
        );
      }
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await executeNonQuery(
      'UPDATE Users SET Status = 0 WHERE UserID = @UserID',
      { UserID: id }
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await executeNonQuery(
      'UPDATE Users SET Password = @Password, UpdatedAt = GETDATE() WHERE UserID = @UserID',
      { Password: hashedPassword, UserID: id }
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword
};
