'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var https = _interopDefault(require('https'));
var http = _interopDefault(require('http'));
var url = _interopDefault(require('url'));

class Request {

    static get RETRYABLES () {
        return this._retryables || [
            'ECONNREFUSED',
            'ECONNRESET',
            'ENOTFOUND',
            'EADDRINFO',
            'ETIMEDOUT',
            'ESRCH'
        ];
    }

    static set RETRYABLES (retryables) {
        this._retryables = retryables;
    }

    static get MAX_RETRY () {
        return isFinite(this._max_retry)
            ? this._max_retry
            : 0;
    }

    static set MAX_RETRY (max_retry) {
        this._max_retry = max_retry;
    }

    /**
        @name           Stringify
        @description    Converts object to url form encoded data
        @arg1           Object  {a:1, b:2}
        @returns        String  'a=1&b=2'
        @usage          Request.stringify({a:1, b:2});
    */
    static stringify (obj) {

        if (typeof obj !== 'object') {
            return '';
        }

        return Object.keys(obj || {})
            .map(key =>
                encodeURIComponent(key) +
                    (obj[key] === null
                        ? ''
                        : `=${encodeURIComponent(obj[key])}`)
            )
            .join('&');
    }

    static throttle (n) {
        this._max_running = n;
        this._max_concurrent = n;
    }

    static request_start (req) {

        if (!this._max_running) {
            return req.start();
        }

        if (!this._requests_queue) {
            this._running = 0;
            this._requests_queue = [];
        }

        if (this._running < this._max_running) {
            this._running++;
            return req.start();
        }

        this._requests_queue.push(req);
    }

    static request_done () {

        if (!this._max_running) {
            return;
        }

        if (this._requests_queue.length) {
            const req = this._requests_queue.shift();
            return req.start();
        }

        this._running--;
    }


    constructor (method) {

        method = method.toUpperCase();

        this._max_retry     = Request.MAX_RETRY;
        this._retryables    = Request.RETRYABLES;

        this.method         = method;
        this.data           = '';
        this.headers        = {};
        this.callbacks      = {};
        this.request_opts   = {};
        this.retries        = 0;
        this.secure         = false;
        this.follow         = false;
        this.started        = false;
        this.encoding       = 'utf8';
        this.logger         = console;
        this.errors         = [];

        this.end            = this.then;
    }


    /**
        @name           toString
        @description    overrides the default object toString
                        will be called once the object is typecasted to string
        @returns        String
            `GET http://host.com/hello
            Payload:    {searh: "key"}
            Headers:    {accept: "application/json"}`
        @usage          console.log('Request ' + request);
    */
    toString () {
        return `${this.method} http${this.secure ? 's' : ''}://${this.request_opts.host}`
        + `${~[80, 443].indexOf(this.request_opts.port) ? '':':' + this.request_opts.port}${this.path}`
        + `\nPayload:\n${JSON.stringify(this.data, null, 1)}`
        + `\nHeaders:\n${JSON.stringify(this.headers, null, 1)}`;
    }


    to (uri) {

        this.uri = uri;

        uri = url.parse(uri);

        let port = uri.port || 80;

        if (uri.protocol === 'https:') {
            port = 443;
            this.secure = true;
        }

        this.path = uri.path;
        this.request_opts = {
            host: uri.hostname,
            port
        };

        return this;
    }


    max_retry (max) {
        this._max_retry = max;
        return this;
    }


    set_retryables (retryables) {
        this._retryables = retryables;
        return this;
    }


    add_header (key, value) {
        console.error(`Cuddle's add_header will be deprecated. Use set_header instead.`);
        this.headers[key] = value;
        return this;
    }


    set_header (key, value) {
        this.headers[key] = value;
        return this;
    }


    set_opts (key, value) {
        this.request_opts[key] = value;
        return this;
    }

    then (_cb) {

        // if cb is not a function, make it a no-op
        if (typeof _cb !== 'function') {
            _cb = () => {};
        }

        this.cb = function () {
            Request.request_done();
            _cb(...arguments);

            // handle the case where `error` is called twice
            this.cb = () => {};
        }.bind(this);

        Request.request_start(this);

        return this;
    }

    args () {
        this.additional_arguments = arguments;
        return this;
    }

    set_encoding (encoding) {
        this.encoding = encoding;
        return this;
    }

    follow_redirects (max_redirects) {
        this.max_redirects = max_redirects || 3;
        this.follow = true;
        return this;
    }

    logger (logger) {
        this.logger = logger;
        return this;
    }

    debug () {
        this.is_verbose = true;
        return this;
    }

    log () {
        if (!this.is_verbose) {
            return;
        }

        this.logger.log(...Array.from(arguments).map(JSON.stringify));
    }

    retry () {

        if (this.retries++ < this._max_retry) {
            this.log('warn', 'Retrying request');
            return this.send(this.data);
        }

        this.cb(
            {
                message: 'Reached max retries',
                errors: this.errors,
                url: this.uri
            },
            null,
            this,
            this.additional_arguments
        );
    }

    promise () {
        return new Promise((resolve, reject) => {
            this.then((err, result) =>
                (err && reject(err)) || resolve(result)
            );
        });
    }

    send (data) {
        this.data = data || '';
        return this;
    }


    start () {

        // do not override the this.path because of redirects or retries
        let new_path = this.path;
        let payload = '';

        this.started = true;


        // form payload
        if (this.method === 'GET') {

            let data = Request.stringify(this.data);

            if (data && ~new_path.indexOf('?')) {
                new_path += '&' + data;
            }
            else if (data) {
                new_path += '?' + data;
            }
        }
        else {
            payload = (!this.headers['Content-Type'] && this.data)
                ? Request.stringify(this.data)
                : JSON.stringify(this.data);
        }


        // set headers
        if (!this.headers.Accept) {
            this.headers.Accept = 'application/json';
        }

        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        if (payload) {
            this.headers['Content-Length'] = payload.length;
        }


        // set request options
        this.request_opts.path    = new_path;
        this.request_opts.method  = this.method;
        this.request_opts.headers = this.headers;



        // create request
        const req = (this.secure ? https : http).request(this.request_opts);

        // attach event handlers
        req.on('response',  this.handle_response.bind(this));
        req.on('socket',    this.handle_timeout.bind(this));
        req.on('error',     this.handle_error.bind(this));

        // send payload

        if (this.method !== 'GET') {
            req.write(payload);
        }

        // end the request
        req.end();

        return this;
    }


    handle_response (response) {
        this.raw = '';

        this.response = response;

        response.setEncoding(this.encoding);

        response.on('data', chunk => this.raw += chunk);

        response.on('close', () => {
            this.log('error', 'Response closed');
            this.errors.push('Response closed');
            this.retry();
        });

        response.on('error', err => {
            this.log('error', 'Response error', err);
            this.errors.push('Response closed');
            this.retry();
        });

        response.on('end', this.handle_end.bind(this));
    }


    handle_end () {

        if (this.response.headers.location && this.follow) {
            return this.handle_redirects();
        }

        this.log('verbose', 'Response', this.response.statusCode);
        this.log('silly', this.raw);


        // try parsing if application/json
        let content_type = this.response.headers['content-type'];

        if (content_type && content_type.includes('application/json')) {
            try {
                this.raw = JSON.parse(this.raw);
            }
            catch (e) {
                this.log('error', 'JSON is invalid');
                return this.cb(e, this.raw, this, this.additional_arguments);
            }
        }

        // non-200 status codes
        if (this.response.statusCode < 200 || this.response.statusCode >= 300) {
            let error = {
                response: this.raw,
                code: this.response.statusCode
            };

            return this.cb(error, null, this, this.additional_arguments);
        }

        // everything is good
        this.cb(null, this.raw, this, this.additional_arguments);
    }


    handle_redirects () {

        if (!this.max_redirects) {
            return this.cb({message: 'Too many redirects'}, this.raw, this, this.additional_arguments);
        }

        let temp = this.response.headers.location.split('/');

        let redir = new Request('GET')
            .to(this.response.headers.location)
            .follow_redirects(this.max_redirects - 1);

        if (temp[0] === 'https:') {
            redir.secured();
        }

        for (temp in this.headers) {
            redir.set_header(temp, this.headers[temp]);
        }

        redir.set_encoding(this.encoding);

        return redir.then(this.cb);
    }


    handle_timeout (socket) {

        socket.setTimeout(1000 * 30);

        socket.on('timeout', () => {
            this.request.abort();
        });
    }


    handle_error (err) {

        this.log('error', 'Request error', err);

        if (~this._retryables.indexOf(err.code) && this.retries < this._max_retry) {
            this.errors.push(err);
            return this.retry();
        }

        this.cb(err, null, this, this.additional_arguments);

    }
}

class Cuddle {

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

module.exports = Cuddle;
