'use strict';

const cudl   = require(__dirname + '/../index');
const should = require('should');
const http   = require('http');
const PORT   = 8067;

let server;


before(done => {
    server = http.createServer((req, res) => {

            let body = '';

            req.addListener('data', (chunk) => {
                body += chunk;
            });

            req.addListener('end', (chunk) => {

                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify({
                    headers: req.headers,
                    method: req.method,
                    query: req.query,
                    body
                }));
            });

        })
        .listen(PORT, done);
});

after(done => server.close(done));


describe('GET request', () => {

    it ('should send a complete GET request', done => {
        const payload = '{"foo":"bar", "bar":"foo"}';

        cudl.post
            .to(`http://localhost:${PORT}`)
            .set_header('Content-Type', 'application/json')
            .send(payload)
            .format_payload(false)
            .end((err, result, request) => {

                result.body.should.eql(payload);

                done();
            });

    });

});
