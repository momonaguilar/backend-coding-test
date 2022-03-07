'use strict';

const { createLogger, format, transports } = require('winston');

const env = process.env.NODE_ENV || 'development';
const filename = 'logs/app.log';

const logger = createLogger({
    level: env === 'development' ? 'debug' : 'info',
    format: format.combine(
        format.timestamp({format: 'YYYY-MM-DD HH:mm:ss.SSS A'}),
        format.align(),
        format.printf(info => `${[info.timestamp]}: ${info.level}:  ${info.message}`),
    ),
    transports: [
        new transports.Console({
            level: 'info',
            format: format.combine(format.printf(info => `${[info.timestamp]}: ${info.level}:  ${info.message}`)),
        }),
        new transports.File({ filename }),
    ],
});

module.exports = logger;