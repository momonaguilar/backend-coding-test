'use strict';

const request = require('supertest');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

describe('API tests', () => {
    before((done) => {
        db.serialize((err) => { 
            if (err) {
                return done(err);
            }

            buildSchemas(db);

            done();
        });
    });

    describe('GET /health', () => {
        it('should return health', (done) => {
            request(app)
                .get('/health')
                .expect('Content-Type', /text/)
                .expect(200, done);
        });
    });

    describe('GET /rides', () => {
        it('should fail to get all rides, couldn\'t find any rides', async()=>{
            await request(app)
                .get('/rides')
                .expect(200, {
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
        });
    });

    describe('POST /rides', async() => {
        it('should add rides successfully', async() => {
            await request(app)
                .post('/rides')
                .send({
                    start_lat:'10',
                    end_lat:'10',
                    start_long:'20',
                    end_long:'25',
                    rider_name:'Jose',
                    driver_name:'Xendit',
                    driver_vehicle:'XYZ123'
                })
                .expect(200);
        });
    });

    describe('POST /rides', async() => {
        it('should return invalid start long/lat value', async() => {
            await request(app)
                .post('/rides')
                .send({
                    start_lat:10000,
                    end_lat:'10',
                    start_long:'20',
                    end_long:'25',
                    rider_name:'Jose',
                    driver_name:'Xendit',
                    driver_vehicle:'XYZ123'
                })
                .expect(200, {
                    error_code: 'VALIDATION_ERROR',
                    message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
                });
        });
    });

    describe('POST /rides', async() => {
        it('should return invalid end long/lat value', async() => {
            await request(app)
                .post('/rides')
                .send({
                    start_lat:'90',
                    end_lat:'10000',
                    start_long:'20',
                    end_long:'25',
                    rider_name:'Jose',
                    driver_name:'Xendit',
                    driver_vehicle:'XYZ123'
                })
                .expect(200, {
                    error_code: 'VALIDATION_ERROR',
                    message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
                });
        });
    });

    describe('POST /rides', async() => {
        it('should return Rider name must be a non empty string', async() => {
            await request(app)
                .post('/rides')
                .send({
                    start_lat:'90',
                    end_lat:'90',
                    start_long:'20',
                    end_long:'25',
                    rider_name: '',
                    driver_name:'Xendit',
                    driver_vehicle:'XYZ123'
                })
                .expect(200, {
                    error_code: 'VALIDATION_ERROR',
                    message: 'Rider name must be a non empty string'
                });
        });
    });

    describe('POST /rides', async() => {
        it('should return Driver name must be a non empty string', async() => {
            await request(app)
                .post('/rides')
                .send({
                    start_lat:'90',
                    end_lat:'90',
                    start_long:'20',
                    end_long:'25',
                    rider_name: 'Jose',
                    driver_name:'',
                    driver_vehicle:'XYZ123'
                })
                .expect(200, {
                    error_code: 'VALIDATION_ERROR',
                    message: 'Driver name must be a non empty string'
                });
        });
    });

    describe('POST /rides', async() => {
        it('should return Driver vehicle name must be a non empty string', async() => {
            await request(app)
                .post('/rides')
                .send({
                    start_lat:'90',
                    end_lat:'90',
                    start_long:'20',
                    end_long:'25',
                    rider_name: 'Jose',
                    driver_name:'Xendit',
                    driver_vehicle:''
                })
                .expect(200, {
                    error_code: 'VALIDATION_ERROR',
                    message: 'Driver vehicle name must be a non empty string'
                });
        });
    });

    describe('GET /rides', () => {
        it('should get all rides succesfully', async()=>{
            await request(app)
                .get('/rides')
                .expect(200);
        });
    });

    describe('GET /rides/:id', () => {
        it('should get single ride successfully',async()=>{
            await request(app)
                .get('/rides')
                .send({
                    riderID:1
                })
                .expect(200);
          
        });
    });

    describe('GET /rides/:id', () => {
        it('should fail to get single ride, couldn\'t find this ride' ,async()=>{
            await request(app)
                .get('/rides/:id')
                .send({
                    id:10000
                })
                .expect(200, {
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find this ride'
                });
        });
    });


});