'use strict';

import Request from './request';



export default class Cuddle {

    static get get () {
        return new Request('GET');
    }

    static get post () {
        return new Request('POST');
   }

    static get put () {
        return new Request('PUT');
    }

    static get delete () {
        return new Request('DELETE');
    }

    static request (method) {
        return new Request(method);
    }

    static stringify () {
        return Request.stringify.apply(null, arguments);
    }
}
