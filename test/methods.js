'use strict';

const cudl      = require(__dirname + '/../index');
const should    = require('chai').should();
const http      = require('http');
const PORT      = 8064;

let server;


before(done => {
    server = http.createServer((req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify({
                headers: req.headers,
                method: req.method,
                query: req.query,
                body: req.body
            }));
        })
        .listen(PORT, done);
});

after(done => server.close(done));


describe('methods', () => {

    it ('should send a GET request', done => {
        cudl.get
            .to(`http://localhost:${PORT}`)
            .then((err, result) => {
                result.method.should.equal('GET');
                done();
            });
    });

    it ('should send a POST request', done => {
        cudl.post
            .to(`http://localhost:${PORT}`)
            .then((err, result) => {
                result.method.should.equal('POST');
                done();
            });
    });

    it ('should send a PUT request', done => {
        cudl.put
            .to(`http://localhost:${PORT}`)
            .then((err, result) => {
                result.method.should.equal('PUT');
                done();
            });
    });

    it ('should send a DELETE request', done => {
        cudl.delete
            .to(`http://localhost:${PORT}`)
            .then((err, result) => {
                result.method.should.equal('DELETE');
                done();
            });
    });

    it ('should send a PATCH request', done => {
        cudl.request('PATCH')
            .to(`http://localhost:${PORT}`)
            .then((err, result) => {
                result.method.should.equal('PATCH');
                done();
            });
    });

});
