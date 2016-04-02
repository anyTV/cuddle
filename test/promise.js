'use strict';

const cudl = require(__dirname + '/../index');


describe('promise', () => {

    it ('should return a promise', done => {
        let promise = cudl.get
            .to('http://localhost')
            .promise();

        promise.should.be.an.instanceOf(Promise);
        done();
    });

});
