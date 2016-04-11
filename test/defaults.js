'use strict';

const cudl      = require(__dirname + '/../index');
const should    = require('chai').should();



describe('Defaults', () => {

    it ('should set RETRYABLES to []', done => {

        cudl.Request.RETRYABLES.should.eql([
            'ECONNREFUSED',
            'ECONNRESET',
            'ENOTFOUND',
            'EADDRINFO',
            'ETIMEDOUT',
            'ESRCH'
        ]);
        cudl.Request.RETRYABLES = [];
        cudl.Request.RETRYABLES.should.eql([]);

        done();
    });


    it ('should set MAX_RETRY to 3', done => {

        cudl.Request.MAX_RETRY.should.equal(0);
        cudl.Request.MAX_RETRY = 3;
        cudl.Request.MAX_RETRY.should.equal(3);

        done();
    });

});
