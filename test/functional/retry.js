'use strict';

import cudl from './../../index';
import should from 'should';
import nock from 'nock';


describe('Retry request', () => {

    it ('should retry twice', done => {

        nock('http://localhost')
            .post('/')
            .times(2)
            .reply(500);

        nock('http://localhost')
            .post('/')
            .reply(200);

        cudl.post
            .to('http://localhost')
            .max_retry(3)
            .then((err) => {

                should(err).be.eql(null);

                done();
            });
    });


    it ('should reach max retry', done => {

        nock('http://localhost')
            .post('/')
            .times(3)
            .reply(500);

        cudl.post
            .to('http://localhost')
            .max_retry(3)
            .then((err) => {

                err.max_retry_reached.should.be.exactly(true);
                err.code.should.be.exactly(500);
                err.errors.length.should.be.exactly(2);

                done();
            });
    });


    it ('should retry when response was closed', done => {

        const mock_last_error = {
            response: 'Response closed',
            code: 500
        };

        nock('http://localhost')
            .post('/')
            .times(3)
            .reply(500, mock_last_error);

        cudl.post
            .to('http://localhost')
            .max_retry(3)
            .then((err) => {

                const last_error = err.response;

                last_error.response.should.be.exactly(mock_last_error.response);
                last_error.code.should.be.exactly(mock_last_error.code);

                err.max_retry_reached.should.be.exactly(true);
                err.code.should.be.exactly(500);
                err.errors.length.should.be.exactly(2);

                done();
            });
    });


    it ('should retry and correctly url-form-encode payload', done => {
        const body = {sample_key: 'sample_value'};

        nock('http://localhost')
            .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
            .post('/', cudl.stringify(body))
            .times(1)
            .reply(500);

        nock('http://localhost')
            .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
            .post('/', cudl.stringify(body))
            .reply(200);

        cudl.post
            .to('http://localhost')
            .send(body)
            .max_retry(2)
            .then((err) => {

                should(err).be.eql(null);

                done();
            });
    });


    it ('should retry and correctly send JSON string payload', done => {
        const body = {sample_key: 'sample_value'};

        nock('http://localhost')
            .matchHeader('Content-Type', 'application/json')
            .post('/', body)
            .times(1)
            .reply(500);

        nock('http://localhost')
            .matchHeader('Content-Type', 'application/json')
            .post('/', body)
            .reply(200);

        cudl.post
            .to('http://localhost')
            .set_header('Content-Type', 'application/json')
            .send(body)
            .max_retry(2)
            .then((err) => {

                should(err).be.eql(null);

                done();
            });
    });
});
