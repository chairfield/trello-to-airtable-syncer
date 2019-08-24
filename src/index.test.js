const router = require('./index');
const express = require('express');
const request = require('supertest');

const initApp = () => {
    const app = express();
    app.use(router);
    return app;
};

describe('GET /', () => {
    test('It should 200', async () => {
        const app = initApp();
        const res = await request(app).get('/');
        expect(res.status).toEqual(200);
    });
});
