const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const isWindowsAuth = (process.env.DB_AUTH_TYPE || '').toLowerCase() === 'windows';

let config;
if (isWindowsAuth) {
  config = {
    connectionString: `Server=${process.env.DB_SERVER};Database=${process.env.DB_DATABASE};Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}`,
  };
} else {
  config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
      enableArithAbort: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  };
}

let pool;

const getConnection = async () => {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
};

const executeQuery = async (query, params = {}) => {
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    // Add parameters to request
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });
    
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error('SQL Error:', error);
    throw error;
  }
};

const executeNonQuery = async (query, params = {}) => {
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });
    
    const result = await request.query(query);
    return result.rowsAffected[0];
  } catch (error) {
    console.error('SQL Error:', error);
    throw error;
  }
};

const executeScalar = async (query, params = {}) => {
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });
    
    const result = await request.query(query);
    if (result.recordset && result.recordset.length > 0) {
      return result.recordset[0];
    }
    return null;
  } catch (error) {
    console.error('SQL Error:', error);
    throw error;
  }
};

const closeConnection = async () => {
  if (pool) {
    await pool.close();
    pool = null;
  }
};

module.exports = {
  getConnection,
  executeQuery,
  executeNonQuery,
  executeScalar,
  closeConnection,
  sql
};
