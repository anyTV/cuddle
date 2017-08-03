'use strict';

import cudl from './../index';
import should from 'should';
import nock from 'nock';


describe('format_payload', () => {

    it ('should send payload as it is', done => {

        nock('http://test.com')
            .post('/')
            .reply(200, (uri, body, cb) => {
                cb(null, body);
            });

        const payload = '{"foo":"bar", "bar":"foo"}';

        cudl.post
            .to('http://test.com')
            .send(payload)
            .format_payload(false)
            .end((err, result) => {

                result.should.eql(payload);

                done();
            });

    });

});
