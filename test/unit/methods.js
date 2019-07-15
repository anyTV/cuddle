

import cudl from './../../index';
import nock from 'nock';


describe('methods', () => {

    it ('should send a GET request', done => {

        nock('http://localhost')
            .get('/')
            .reply(200, 'ok');

        cudl.get
            .to(`http://localhost`)
            .then((err, result) => {
                result.should.equal('ok');
                done();
            });
    });


    it ('should send a POST request', done => {

        nock('http://localhost')
            .post('/')
            .reply(200, 'ok');

        cudl.post
            .to(`http://localhost`)
            .then((err, result) => {
                result.should.equal('ok');
                done();
            });
    });


    it ('should send a PUT request', done => {

        nock('http://localhost')
            .put('/')
            .reply(200, 'ok');

        cudl.put
            .to(`http://localhost`)
            .then((err, result) => {
                result.should.equal('ok');
                done();
            });
    });


    it ('should send a DELETE request', done => {

        nock('http://localhost')
            .delete('/')
            .reply(200, 'ok');

        cudl.delete
            .to(`http://localhost`)
            .then((err, result) => {
                result.should.equal('ok');
                done();
            });
    });


    it ('should send a PATCH request', done => {

        nock('http://localhost')
            .patch('/')
            .reply(200, 'ok');

        cudl.request('PATCH')
            .to(`http://localhost`)
            .then((err, result) => {
                result.should.equal('ok');
                done();
            });
    });

});
