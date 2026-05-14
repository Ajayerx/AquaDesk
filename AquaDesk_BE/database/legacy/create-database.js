require('dotenv').config();

const isWindowsAuth = (process.env.DB_AUTH_TYPE || '').toLowerCase() === 'windows';

async function createDatabase() {
  try {
    console.log(`Connecting to SQL Server: ${process.env.DB_SERVER}`);
    console.log(`Auth type: ${isWindowsAuth ? 'Windows Authentication' : 'SQL Authentication'}`);

    const sql = require('mssql');

    let pool;
    if (isWindowsAuth) {
      const msnodesql = require('msnodesqlv8');
      const connectionString = `Server=${process.env.DB_SERVER};Database=master;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}`;
      
      pool = await new Promise((resolve, reject) => {
        msnodesql.open(connectionString, (err, conn) => {
          if (err) return reject(err);
          resolve(conn);
        });
      });

      const result = await new Promise((resolve, reject) => {
        pool.query(`SELECT name FROM sys.databases WHERE name = '${process.env.DB_DATABASE}'`, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });

      if (result.length === 0) {
        console.log(`Creating database: ${process.env.DB_DATABASE}...`);
        await new Promise((resolve, reject) => {
          pool.query(`CREATE DATABASE [${process.env.DB_DATABASE}]`, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
          });
        });
        console.log(`Database "${process.env.DB_DATABASE}" created successfully!`);
      } else {
        console.log(`Database "${process.env.DB_DATABASE}" already exists.`);
      }

      pool.close();
    } else {
      pool = await sql.connect({
        server: process.env.DB_SERVER,
        database: 'master',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        options: {
          encrypt: process.env.DB_ENCRYPT === 'true',
          trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
          enableArithAbort: true,
        }
      });
      
      const result = await pool.request().query(
        `SELECT name FROM sys.databases WHERE name = '${process.env.DB_DATABASE}'`
      );
      
      if (result.recordset.length === 0) {
        console.log(`Creating database: ${process.env.DB_DATABASE}...`);
        await pool.request().query(`CREATE DATABASE [${process.env.DB_DATABASE}]`);
        console.log(`Database "${process.env.DB_DATABASE}" created successfully!`);
      } else {
        console.log(`Database "${process.env.DB_DATABASE}" already exists.`);
      }
      
      await pool.close();
    }

    process.exit(0);
  } catch (error) {
    console.error('Failed to create database:', error.message);
    process.exit(1);
  }
}

createDatabase();
