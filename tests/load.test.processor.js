'use strict';

const { faker } = require('@faker-js/faker');

function generateRide(userContext, events, next) {
    userContext.vars.start_lat = faker.datatype.number({ min: -90, max: 90 });
    userContext.vars.start_long = faker.datatype.number({min: -180,max: 180}).toString();
    userContext.vars.end_lat = faker.datatype.number({min: -90,max: 90}).toString();
    userContext.vars.end_long = faker.datatype.number({min: -180,max: 180}).toString();
    userContext.vars.rider_name = faker.name.findName();
    userContext.vars.driver_name = faker.name.findName();
    userContext.vars.driver_vehicle = faker.vehicle.vehicle();
    return next();
}
 
module.exports = {
    generateRide
};
