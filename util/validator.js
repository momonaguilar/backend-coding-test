const logger = require('./../logger'); //winston logger

class Validator {

    validate (req) {

        const startLatitude = Number(req.body.start_lat);
        const startLongitude = Number(req.body.start_long);
        const endLatitude = Number(req.body.end_lat);
        const endLongitude = Number(req.body.end_long);
        const riderName = req.body.rider_name;
        const driverName = req.body.driver_name;
        const driverVehicle = req.body.driver_vehicle;

        let err = '';
        if (typeof riderName !== 'string' ){
            err = 'rider name, expects string, got ' + typeof(riderName);
        } else if (typeof driverName !== 'string'){
            err = 'driver name, expects string, got ' + typeof(driverName);
        } else if (typeof driverVehicle !== 'string'){
            err = 'driver vehicle, expects string, got ' + typeof(driverVehicle);
        }

        if (err.length !== 0){
            err = 'Invalid type: ' + err;
            logger.error(err);
            return ({
                error_code: 'INVALID_TYPE_ERROR',
                message: err
            });
        }



        if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
            err = 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively';
            logger.error(err);
            return ({
                error_code: 'VALIDATION_ERROR',
                message: err
            });
        }

        if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
            err = 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively';
            logger.error(err);
            return ({
                error_code: 'VALIDATION_ERROR',
                message: err
            });
        }

        if (typeof riderName !== 'string' || riderName.length < 1) {
            err = 'Rider name must be a non empty string';
            logger.error(err);
            return ({
                error_code: 'VALIDATION_ERROR',
                message: err
            });
        }

        if (typeof driverName !== 'string' || driverName.length < 1) {
            err = 'Driver name must be a non empty string';
            logger.error(err);
            return ({
                error_code: 'VALIDATION_ERROR',
                message: err
            });
        }

        if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
            err = 'Driver vehicle name must be a non empty string';
            logger.error(err);
            return ({
                error_code: 'VALIDATION_ERROR',
                message: err
            });
        }
        return {error_code: ''};
    }

}

module.exports = new Validator();