'use strict';

const cudl = require(__dirname + '/../index');



describe('stringify', () => {

    it ('should stringify the object', done => {
        cudl.stringify({a:1, b:2}).should.be.equal('a=1&b=2');
        cudl.stringify({a:null, b:2}).should.be.equal('a&b=2');
        cudl.stringify({a:null}).should.be.equal('a');
        cudl.stringify({a:null,b:null}).should.be.equal('a&b');
        cudl.stringify({a:[1],b:null}).should.be.equal('a=1&b');
        cudl.stringify({a:0,b:'asdf'}).should.be.equal('a=0&b=asdf');
        cudl.stringify({a:'+'}).should.be.equal('a=%2B');
        done();
    });

});
