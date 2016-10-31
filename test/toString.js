'use strict';

const cudl = require(__dirname + '/../index');
const http = require('http');
const PORT = 8065;

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


describe('toString', () => {

    it ('request object should be readable when converted to string', done => {
        const payload = {a:1, b:2};

        cudl.get
            .to(`http://localhost:${PORT}`)
            .set_header('Authorization', 'Token sampletoken')
            .send(payload)
            .then((err, result, request) => {

                const str = request + '';

                str.should.equal(`GET http://localhost:${PORT}/\n`
                    + `Payload:\n${JSON.stringify(payload, null, 1)}\n`
                    + `Headers:\n{\n "Authorization": "Token sampletoken",\n`
                    + ` "Accept": "application/json",\n`
                    + ` "Content-Type": "application/x-www-form-urlencoded"\n}`);

                done();
            });

    });

});
