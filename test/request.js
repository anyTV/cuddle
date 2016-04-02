'use strict';

const cudl      = require(__dirname + '/../index');
const http      = require('http');
const url       = require('url');
const PORT      = 8066;

let server;


before(done => {
    server = http.createServer((req, res) => {
        let raw = '';

        req.on('data', chunk => raw += chunk)
            .on('end', end);

        function end () {
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                headers: req.headers,
                method: req.method,
                query: url.parse(req.url, true).query,
                body: new Buffer(raw, 'utf8').toString()
            }));
        }

    })
    .listen(PORT, done);
});

after(done => server.close(done));


describe('GET request', () => {

    it ('should send a complete GET request', done => {
        const payload = {a:'sample', b:'sample2'};

        cudl.get
            .to(`http://localhost:${PORT}`)
            .send(payload)
            .then((err, result, request) => {

                result.query.should.be.eql(payload);

                done();
            });

    });

});



describe('POST request', () => {

    it ('should send a complete POST request', done => {
        const payload = {a:'sample', b:'sample2'};

        cudl.post
            .to(`http://localhost:${PORT}`)
            .send(payload)
            .then((err, result, request) => {

                result.body.should.be.eql('a=sample&b=sample2');

                done();
            });

    });

});




describe('PUT JSON request', () => {

    it ('should send a complete POST request', done => {
    	const payload = {a:'sample', b:'sample2'};

        cudl.put
            .to(`http://localhost:${PORT}`)
            .set_header('Content-Type', 'application/json')
            .send(payload)
            .then((err, result, request) => {

                result.body.should.be.eql(JSON.stringify(payload));

		        done();
            });

    });

});
