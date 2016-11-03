'use strict';

import Request from './Request';


export default class Cuddle {

    static get Request () {
        return Request;
    }

    static get stringify () {
        return Request.stringify;
    }

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

    static throttle (n) {
        return Request.throttle(n);
    }
}
