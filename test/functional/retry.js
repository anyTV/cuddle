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

});
