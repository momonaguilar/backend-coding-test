'use strict';

const logger = require('../logger');

const postRides = (db, req, res) => {
    return new Promise(resolve => {
        const data = [];

        var sqlQuery = 'INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)';
        var values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];
        
        db.run(sqlQuery, values, async function (err) {
            if (err) {
                //TODO: logger.error('Unknown server error: ' + err);
                return res.status(500).send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            sqlQuery = 'SELECT * FROM Rides WHERE rideID = ?';
            await db.all(sqlQuery, [this.lastID], function (err, rows) {
                if (err) {
                    //TODO: logger.error('Unknown server error: ' + err);
                    return res.status(500).send({
                        error_code: 'SERVER_ERROR',
                        message: 'Unknown error'
                    });
                }

                logger.info('POST /rides' + JSON.stringify(rows));
                if(rows && rows.length > 0) {
                    rows.forEach((row)=> data.push(row));
                }
                resolve(data);
            });
        });
    });
};

const getRidesById = (db, req, res) => {
    return new Promise(resolve => {
        const data = [];
        let id = req.params.id;
        const sqlQuery = 'SELECT * FROM Rides WHERE rideID = ?';
        db.all(sqlQuery, [id], function (err, rows) {
            if (err) {
                //logger.error('Unknown server error: ' + err);
                return res.status(500).send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                //logger.error('Could not find this ride');
                return res.status(404).send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find this ride'
                });
            }

            logger.info('GET /rides/' + req.params.id + ' status OK');
            if(rows && rows.length > 0){
                rows.forEach((row)=> data.push(row));
            }
            resolve(data);
        });
    });
};

const getRides = (db, req, res) => {
    return new Promise(resolve => {
        const data = [];
        const sqlQuery = 'SELECT * FROM Rides';
        db.all(sqlQuery, function (err, rows) {
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

            if(rows && rows.length > 0){
                rows.forEach((row)=> data.push(row));
            }
            resolve(data);

        });
    });
};

module.exports = { postRides, getRides, getRidesById };