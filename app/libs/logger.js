const appRoot = require('app-root-path');
const { createLogger, format, transports } = require('winston');
const path = require('path');

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.label({ label: path.basename(process.mainModule.filename) }),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`,
        ),
      ),
    }),
    new transports.File({
      filename: `${appRoot}/logs/app.log`,
      format: format.combine(
        format.printf(
          info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`,
        ),
      ),
    }),
  ],
});

module.exports = logger;
