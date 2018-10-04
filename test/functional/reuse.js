'use strict';

import cudl from '../../index';
import should from 'should';
import nock from 'nock';


describe('reuse', () => {

    it ('should be reused without issue', done => {

        const body_1 = {sample: 1};
        const body_2 = {sample: 2};

        nock('http://localhost')
            .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
            .post('/', cudl.stringify(body_1))
            .reply(200);

        nock('http://localhost')
            .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
            .post('/', cudl.stringify(body_2))
            .reply(200);

        const request = cudl.post
            .to('http://localhost')
            .send(body_1)
            .then((err) => {

                should(err).be.eql(null);

                request.send(body_2)
                    .then((err) => {

                        should(err).be.eql(null);

                        done();
                    });
            });
    });

});
