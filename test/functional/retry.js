'use strict';

import cudl from './../../index';
import nock from 'nock';


describe('Retry request', () => {

    it ('should retry twice', done => {

        nock('http://localhost')
            .post('/')
            .twice()
            .reply(500);

        nock('http://localhost')
            .post('/')
            .reply(200);

        cudl.post
            .to('http://localhost')
            .max_retry(3)
            .then((err, result, request) => {

                if (err && err.code >= 500) {
                    return request.retry();
                }

                done();
            });

    });

});
