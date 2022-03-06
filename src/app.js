'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const logger = require('./../logger'); //winston logger
const util = require('./../pagination');

module.exports = (db) => {
    app.get('/health', (req, res) => res.send('Healthy'));

    app.post('/rides', jsonParser, (req, res) => {
        const startLatitude = Number(req.body.start_lat);
        const startLongitude = Number(req.body.start_long);
        const endLatitude = Number(req.body.end_lat);
        const endLongitude = Number(req.body.end_long);
        const riderName = req.body.rider_name;
        const driverName = req.body.driver_name;
        const driverVehicle = req.body.driver_vehicle;

        if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
            let err = 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively';
            logger.error(err);
            return res.status(500).send({
                error_code: 'VALIDATION_ERROR',
                message: err
            });
        }

        if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
            let err = 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively';
            logger.error(err);
            return res.status(500).send({
                error_code: 'VALIDATION_ERROR',
                message: err
            });
        }

        if (typeof riderName !== 'string' || riderName.length < 1) {
            let err = 'Rider name must be a non empty string';
            logger.error(err);
            return res.status(500).send({
                error_code: 'VALIDATION_ERROR',
                message: err
            });
        }

        if (typeof driverName !== 'string' || driverName.length < 1) {
            let err = 'Driver name must be a non empty string';
            logger.error(err);
            return res.status(500).send({
                error_code: 'VALIDATION_ERROR',
                message: err
            });
        }

        if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
            let err = 'Driver vehicle name must be a non empty string';
            logger.error(err);
            return res.status(500).send({
                error_code: 'VALIDATION_ERROR',
                message: err
            });
        }

        var values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];
        
        const result = db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function (err) {
            if (err) {
                logger.error('Unknown server error: ' + err);
                return res.status(500).send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, function (err, rows) {
                if (err) {
                    logger.error('Unknown server error: ' + err);
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

    app.get('/rides', (req, res) => {

        let enableResultPagination = req && req.body && req.body.pagination || false;
        db.all('SELECT * FROM Rides', function (err, rows) {
            if (err) {
                logger.error('Unknown server error: ' + err);
                return res.status(500).send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                logger.error('Could not find any rides');
                return res.status(404).send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }

            logger.info('GET /rides' + ' status OK');

            let pageContent = rows;

            if (enableResultPagination === true) {
                console.log(pageContent);
                let totalItems = rows.length;
                let x = util.pagination(totalItems);
                pageContent = rows.slice(x.startIndex, x.endIndex);
            }

            res.status(200).send(pageContent);
        });
    });

    app.get('/rides/:id', (req, res) => {
        db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, function (err, rows) {
            if (err) {
                logger.error('Unknown server error: ' + err);
                return res.status(500).send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                logger.error('Could not find this ride');
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
