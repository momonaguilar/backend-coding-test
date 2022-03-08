'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const logger = require('./../logger');
const validator = require('../util/validator');
const dbUtil = require('../util/dbUtil');
const paginator = require('../util/paginator');

module.exports = (db) => {

    app.get('/health', (req, res) => res.status(200).send('Healthy'));

    app.post('/rides', jsonParser, async (req, res) => {
        let validate = validator.validate(req, res);
        if (validate.error_code.length !== 0)
        {
            return res.status(500).send({
                error_code: validate.error_code,
                message: validate.message
            });
        }
        var result = await dbUtil.postRides(db,req,res);

        logger.info('Result: ' + JSON.stringify(result));
        res.status(200).send(result);    
    });

    app.get('/rides', async(req, res) => {
        var result = await dbUtil.getRides(db, req, res);
        var enableResultPagination = req && req.params && req.params.pagination || false;
        
        if (enableResultPagination) {
            let totalItems = result.length;
            let pagedResult = paginator.paginate(totalItems);
            result = result.slice(pagedResult.firstRecordIndexOfCurrentPage, 
                pagedResult.lastRecordIndexOfCurrentPage);
        }

        res.status(200).send(result);     
    });

    app.get('/rides/:rideID', async(req, res) => {
        let id = Number(req.params.rideID);
        if (typeof id !== 'number') {
            return res.status(404).send('Invalid parameters!');
        }

        const result = await dbUtil.getRidesById(db, req, res);
        res.status(200).send(result);    
    });

    return app;
};
