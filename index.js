'use strict';

const port = 8010;

const swaggerUI = require('swagger-ui-express');
const YAML =  require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

const logger = require('./logger'); //winston logger

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const buildSchemas = require('./src/schemas');

db.serialize( async() => {
    await buildSchemas(db);

    const app = require('./src/app')(db);
      
    app.use('/', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
      
    app.listen(port, () => logger.info(`App started and listening on port ${port}`));
});