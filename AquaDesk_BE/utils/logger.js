const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);

const logLevels = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

function formatLog(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}\n`;
}

function writeLog(logEntry) {
  fs.appendFileSync(logFile, logEntry);
}

function log(level, message, meta = {}) {
  const logEntry = formatLog(level, message, meta);
  writeLog(logEntry);
  
  // Also output to console for development
  if (process.env.NODE_ENV !== 'production') {
    console.log(logEntry.trim());
  }
}

module.exports = {
  error: (message, meta) => log(logLevels.ERROR, message, meta),
  warn: (message, meta) => log(logLevels.WARN, message, meta),
  info: (message, meta) => log(logLevels.INFO, message, meta),
  debug: (message, meta) => log(logLevels.DEBUG, message, meta)
};
