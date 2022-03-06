const { createLogger, format, transports } = require('winston');

module.exports = createLogger({
    transports:
    new transports.File({
        filename: 'logs/app.log',
        format:format.combine(
            format.timestamp({format: 'YYYY-MM-DD HH:mm:ss.SSS A'}),
            format.align(),
            format.printf(info => `${[info.timestamp]}: ${info.level}:  ${info.message}`),
        )}),
});