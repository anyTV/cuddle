'use strict';

import cudl from './../index';
import nock from 'nock';


describe('toString', () => {

    it ('request object should be readable when converted to string', done => {

        const payload = {a:1, b:2};

        cudl.get
            .to('http://localhost')
            .set_header('Authorization', 'Token sampletoken')
            .send(payload)
            .then((err, result, request) => {

                const str = request.toString();

                str.should.equal(`GET http://localhost:80/\n`
                    + `Payload:\n${JSON.stringify(payload, null, 1)}\n`
                    + `Headers:\n{\n "Authorization": "Token sampletoken",\n`
                    + ` "Accept": "application/json",\n`
                    + ` "Content-Type": "application/x-www-form-urlencoded"\n}`);

                done();
            });

    });

});
