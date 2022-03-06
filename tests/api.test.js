'use strict';

const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

const util = require('./../pagination');

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
                .expect(404, {
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
        });
    });

    describe('POST /rides', async() => {
        it('should add rides successfully', async() => {
            const data = {
                start_lat:'10',
                end_lat:'10',
                start_long:'20',
                end_long:'25',
                rider_name:'Jose',
                driver_name:'Xendit',
                driver_vehicle:'XYZ123'
            };
            await request(app)
                .post('/rides')
                .send(data)
                .expect(200)
                .then(async (response) => {
                    // Check the response
                    expect(response.body[0].startLat).equal(Number(data.start_lat));
                    expect(response.body[0].startLong).equal(Number(data.start_long));
                    expect(response.body[0].endLat).equal(Number(data.end_lat));
                    expect(response.body[0].endLong).equal(Number(data.end_long));
                    expect(response.body[0].riderName).equal(data.rider_name);
                    expect(response.body[0].driverName).equal(data.driver_name);
                    expect(response.body[0].driverVehicle).equal(data.driver_vehicle);
                });
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
                .expect(500, {
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
                .expect(500, {
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
                .expect(500, {
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
                .expect(500, {
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
                .expect(500, {
                    error_code: 'VALIDATION_ERROR',
                    message: 'Driver vehicle name must be a non empty string'
                });
        });
    });

    describe('GET /rides', () => {
        it('should get all rides succesfully with pagination', async()=>{
            const data = {
                start_lat:'10',
                end_lat:'10',
                start_long:'20',
                end_long:'25',
                rider_name:'Jose',
                driver_name:'Xendit',
                driver_vehicle:'XYZ123'
            };

            let i = 0;
            for(i = 0; i<9; i++){                
                await request(app)
                    .post('/rides')
                    .send(data)
                    .expect(200);
            }

            await request(app)
                .get('/rides')
                .send({
                    pagination:true,
                })
                .expect(200)
                .then(async (response) => {
                    expect(response.body.length).equals(10);
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
                .expect(404, {
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find this ride'
                });
        });
    });


    // Assertion made below
    describe('Pagination test', () => {
    
        it('Page no 1', function() {
            assert.deepEqual(util.pagination(10).pages, [1, 2]);
            assert.deepEqual(util.pagination(10,2).pages, [1, 2]);
            assert.deepEqual(util.pagination(10,2,10).pages, [1]);
        });
        
        it('Page no 2', function() {
            assert.deepEqual(util.pagination(20).pages, [1, 2, 3, 4]);
        });
        
        it('Page no 3', function() {
            assert.deepEqual(util.pagination(20,3).pages, [1, 2, 3, 4]);
        });
        
        it('Page no 4', function() {
            assert.deepEqual(util.pagination(20,4).pages, [1, 2, 3, 4]);
        });
        
        it('Page no 10', function() {
            console.log(util.pagination(20,7));
            assert.deepEqual(util.pagination(20,7).pages, [7, 8, 9, 10, 11]);
        });
        
        it('Page no 17', function() {
            assert.deepEqual(util.pagination(20).pages, [14, 15, 16, 17, 18]);
        });
        
        it('Page no 18', function() {
            assert.deepEqual(util.pagination(20).pages, [15, 16, 17, 18, 19]);
        });
        
        it('Page no 19', function() {
            assert.deepEqual(util.pagination(20).pages, [15, 16, 17, 18, 19]);
        });
        
        it('Page no 20', function() {
            console.log(util.pagination(20,15,1));
            assert.deepEqual(util.pagination(20,15,1).pages, [15, 16, 17, 18, 19]);
        });
        
        it('Total 1 page - 5 items, currently on page 5, with 5 items per page', function() {
            assert.deepEqual(util.pagination(5,5,5).pages, [1]);
        });
        
        it('Total 4 page - 4 items, currently on page 3, with 1 item per page', function() {
            assert.deepEqual(util.pagination(4,3,1).pages, [ 1, 2, 3, 4]);
        });
        
        it('Total 2 page - 2 items, currently on page 2, with 1 item per page', function() {
            assert.deepEqual(util.pagination(2,2,1).pages, [1, 2]);
        });
        
        it('Total 1 page - 1 item', function() {
            assert.deepEqual(util.pagination(1).pages, [1]);
        });

        it('Total 1 page - 1 item, currently in page -1 (invalid), with 5 item per page, and max page is 5 (default)', function() {
            assert.deepEqual(util.pagination(1,-1).pages, [1]);
        });

        it('Total 2 page - 5 items, currently in page 10, with 1 item per page, and max page is 2', function() {
            assert.deepEqual(util.pagination(5,10,1,2).pages, [4,5]);
        });

        it('Total 1 page - 5 items, currently in page 1, with 1 item per page, and max page is 2', function() {
            assert.deepEqual(util.pagination(5,1,1,2).pages, [1,2]);
        });

        it('Total 2 page - 5 items, currently in page 2, with 1 item per page, and max page is 2 - current page somewhere in the middle', function() {
            assert.deepEqual(util.pagination(5,3,1,2).pages, [2,3]);
        });
        
    });
});