'use strict';

import cudl from './../index';
import nock from 'nock';
import url from 'url';


describe('GET request', () => {

    it ('should send a complete GET request', done => {
        const payload = {a:'sample', b:'sample2'};

        nock('http://localhost')
            .get(/a=sample&b=sample2/)
            .reply(200, function (uri, body, cb) {
                cb(null, url.parse(this.req.path, true).query);
            });

        cudl.get
            .to('http://localhost')
            .send(payload)
            .end((err, result) => {

                result.should.be.eql(payload);

                done();
            });

    });

});


describe('GET request with ?pre=data', () => {

    it ('should send a complete GET request', done => {
        const payload = {a:'sample', b:'sample2'};

        nock('http://localhost')
            .get(/a=sample&b=sample2/)
            .reply(200, function (uri, body, cb) {
                cb(null, url.parse(this.req.path, true).query);
            });

        cudl.get
            .to(`http://localhost?pre=data`)
            .send(payload)
            .end((err, result) => {

                payload.pre = 'data';

                result.should.be.eql(payload);

                done();
            });

    });

});


describe('POST request', () => {

    it ('should send a complete POST request', done => {

        nock('http://localhost')
            .post('/')
            .reply(200, (uri, body, cb) => cb(null, body));

        const payload = {a:'sample', b:'sample2'};

        cudl.post
            .to('http://localhost')
            .send(payload)
            .then((err, result) => {

                result.should.be.eql('a=sample&b=sample2');

                done();
            });

    });

});




describe('PUT JSON request', () => {

    it ('should send a complete POST request', done => {

        nock('http://localhost')
            .put('/')
            .reply(200, (uri, body) => body);

    	const payload = {a:'sample', b:'sample2'};

        cudl.put
            .to('http://localhost')
            .set_header('Content-Type', 'application/json')
            .send(payload)
            .then((err, result) => {

                result.should.be.eql(payload);

		        done();
            });

    });

});
