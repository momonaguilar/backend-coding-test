'use strict';

const port = 8010;

const logger = require('./logger'); //winston logger

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const buildSchemas = require('./src/schemas');

db.serialize(() => {
    buildSchemas(db);

    const app = require('./src/app')(db);

    app.listen(port, () => logger.info(`App started and listening on port ${port}`));
});