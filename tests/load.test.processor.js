'use strict';

const { faker } = require("@faker-js/faker");

function generateRide(requestParams, ctx, ee, next) {
  ctx.vars["start_lat"] = faker.datatype.number({ min: -90, max: 90 }).toString();
  ctx.vars["start_long"] = faker.datatype.number({min: -180,max: 180}).toString();
  ctx.vars["start_long"] = faker.datatype.number({min: -90,max: 90}).toString();
  ctx.vars["end_long"] = faker.datatype.number({min: -180,max: 180}).toString();
  ctx.vars["rider_name"] = faker.name.findName();
  ctx.vars["driver_name"] = faker.name.findName();
  ctx.vars["driver_vehicle"] = faker.vehicle.vehicle();
  return next();
}
 
module.exports = {
  generateRide
};
