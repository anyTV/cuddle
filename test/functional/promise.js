

import cudl from './../../index';


describe('promise', () => {

    it ('should return a promise', done => {
        let promise = cudl.get
            .to('http://localhost')
            .promise()
            // suppress warning for unhandled promise
            .catch(err => err);

        promise.should.be.an.instanceOf(Promise);
        done();
    });

    it ('should call catch', done => {
        cudl.get
            .to('http://localhos')
            .promise()
            .catch(() => done());
    });
});
