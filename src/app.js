'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const logger = require('./../logger'); //winston logger
const util = require('../util/pagination');
const validator = require('../util/validator');

module.exports = (db) => {
    app.get('/health', (req, res) => res.send('Healthy'));

    app.post('/rides', jsonParser, async (req, res) => {

        let validate = validator.validate(req, res);
        if (validate.error_code.length !== 0)
        {
            return res.status(500).send({
                error_code: validate.error_code,
                message: validate.message
            });
        }

        var values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];
        
        const result = await db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, async function (err) {
            if (err) {
                //TODO: logger.error('Unknown server error: ' + err);
                return res.status(500).send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            await db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, function (err, rows) {
                if (err) {
                    //TODO: logger.error('Unknown server error: ' + err);
                    return res.status(500).send({
                        error_code: 'SERVER_ERROR',
                        message: 'Unknown error'
                    });
                }

                logger.info('POST /rides' + JSON.stringify(rows));
                res.send(rows);
            });
        });

        // log result of db run cmd exec
        logger.info('Result: ' + JSON.stringify(result));
    });

    app.get('/rides', async(req, res) => {

        let enableResultPagination = req && req.body && req.body.pagination || false;
        await db.all('SELECT * FROM Rides', function (err, rows) {
            if (err) {
                //TODO: logger.error('Unknown server error: ' + err);
                return res.status(500).send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                //TODO: logger.error('Could not find any rides');
                return res.status(404).send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }

            logger.info('GET /rides' + ' status OK');

            let pageContent = rows;

            if (enableResultPagination === true) {
                let totalItems = rows.length;
                let x = util.pagination(totalItems);
                pageContent = rows.slice(x.startIndex, x.endIndex);
            }

            res.status(200).send(pageContent);
        });
    });

    app.get('/rides/:id', async(req, res) => {
        await db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, function (err, rows) {
            if (err) {
                //TODO: logger.error('Unknown server error: ' + err);
                return res.status(500).send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                //TODO: logger.error('Could not find this ride');
                return res.status(404).send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find this ride'
                });
            }

            logger.info('GET /rides/' + req.params.id + ' status OK');
            res.send(rows);
        });
    });

    return app;
};
