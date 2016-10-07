'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Request = function () {
    _createClass(Request, null, [{
        key: 'stringify',


        /**
            @name           Stringify
            @description    Converts object to url form encoded data
            @arg1           Object  {a:1, b:2}
            @returns        String  'a=1&b=2'
            @usage          Request.stringify({a:1, b:2});
        */
        value: function stringify(obj) {

            if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') {
                return '';
            }

            return Object.keys(obj || {}).map(function (key) {
                return encodeURIComponent(key) + (obj[key] === null ? '' : '=' + encodeURIComponent(obj[key]));
            }).join('&');
        }
    }, {
        key: 'throttle',
        value: function throttle(n) {
            this._max_running = n;
            this._max_concurrent = n;
        }
    }, {
        key: 'request_start',
        value: function request_start(req) {

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
    }, {
        key: 'request_done',
        value: function request_done() {

            if (!this._max_running) {
                return;
            }

            if (this._requests_queue.length) {
                var req = this._requests_queue.shift();
                return req.start();
            }

            this._running--;
        }
    }, {
        key: 'RETRYABLES',
        get: function get() {
            return this._retryables || ['ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND', 'EADDRINFO', 'ETIMEDOUT', 'ESRCH'];
        },
        set: function set(retryables) {
            this._retryables = retryables;
        }
    }, {
        key: 'MAX_RETRY',
        get: function get() {
            return isFinite(this._max_retry) ? this._max_retry : 0;
        },
        set: function set(max_retry) {
            this._max_retry = max_retry;
        }
    }]);

    function Request(method) {
        _classCallCheck(this, Request);

        this._max_retry = Request.MAX_RETRY;
        this._retryables = Request.RETRYABLES;

        this.method = method;
        this.data = '';
        this.headers = {};
        this.callbacks = {};
        this.request_opts = {};
        this.retries = 0;
        this.secure = false;
        this.follow = false;
        this.started = false;
        this.encoding = 'utf8';
        this.logger = console;
        this.errors = [];

        this.end = this.then;
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


    _createClass(Request, [{
        key: 'toString',
        value: function toString() {
            return this.method + ' http' + (this.secure ? 's' : '') + '://' + this.request_opts.host + ('' + (~[80, 443].indexOf(this.request_opts.port) ? '' : ':' + this.request_opts.port) + this.path) + ('\nPayload:\n' + JSON.stringify(this.data, null, 1)) + ('\nHeaders:\n' + JSON.stringify(this.headers, null, 1));
        }
    }, {
        key: 'to',
        value: function to(uri) {

            this.uri = uri;

            uri = _url2.default.parse(uri);

            var port = uri.port || 80;

            if (uri.protocol === 'https:') {
                port = 443;
                this.secure = true;
            }

            this.path = uri.path;
            this.request_opts = {
                host: uri.hostname,
                port: port
            };

            return this;
        }
    }, {
        key: 'max_retry',
        value: function max_retry(max) {
            this._max_retry = max;
            return this;
        }
    }, {
        key: 'set_retryables',
        value: function set_retryables(retryables) {
            this._retryables = retryables;
            return this;
        }
    }, {
        key: 'add_header',
        value: function add_header(key, value) {
            console.error('Cuddle\'s add_header will be deprecated. Use set_header instead.');
            this.headers[key] = value;
            return this;
        }
    }, {
        key: 'set_header',
        value: function set_header(key, value) {
            this.headers[key] = value;
            return this;
        }
    }, {
        key: 'set_opts',
        value: function set_opts(key, value) {
            this.request_opts[key] = value;
            return this;
        }
    }, {
        key: 'then',
        value: function then(_cb) {

            // if cb is not a function, make it a no-op
            if (typeof _cb !== 'function') {
                _cb = function _cb() {};
            }

            this.cb = function () {
                Request.request_done();
                _cb.apply(undefined, arguments);
            };

            Request.request_start(this);

            return this;
        }
    }, {
        key: 'args',
        value: function args() {
            this.additional_arguments = arguments;
            return this;
        }
    }, {
        key: 'set_encoding',
        value: function set_encoding(encoding) {
            this.encoding = encoding;
            return this;
        }
    }, {
        key: 'follow_redirects',
        value: function follow_redirects(max_redirects) {
            this.max_redirects = max_redirects || 3;
            this.follow = true;
            return this;
        }
    }, {
        key: 'logger',
        value: function logger(_logger) {
            this.logger = _logger;
            return this;
        }
    }, {
        key: 'debug',
        value: function debug() {
            this.is_verbose = true;
            return this;
        }
    }, {
        key: 'log',
        value: function log() {
            var _logger2;

            if (!this.is_verbose) {
                return;
            }

            (_logger2 = this.logger).log.apply(_logger2, _toConsumableArray(Array.from(arguments).map(JSON.stringify)));
        }
    }, {
        key: 'retry',
        value: function retry() {

            if (this.retries++ < this._max_retry) {
                this.log('warn', 'Retrying request');
                return this.send(this.data);
            }

            this.cb({
                message: 'Reached max retries',
                errors: this.errors,
                url: this.uri
            }, null, this, this.additional_arguments);
        }
    }, {
        key: 'promise',
        value: function promise() {
            var _this = this;

            return new Promise(function (resolve) {
                _this.then(function (err, result) {
                    return resolve(err ? new Error(JSON.stringify(err)) : result);
                });
            });
        }
    }, {
        key: 'send',
        value: function send(data) {
            this.data = data || '';
            return this;
        }
    }, {
        key: 'start',
        value: function start() {

            var new_path = this.path;
            var payload = '';

            this.started = true;

            // form payload
            if (this.method === 'GET') {
                // do not override the this.path because of redirects or retries
                new_path += '?' + Request.stringify(this.data);
            } else {
                payload = !this.headers['Content-Type'] && this.data ? Request.stringify(this.data) : JSON.stringify(this.data);
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
            this.request_opts.path = new_path;
            this.request_opts.method = this.method;
            this.request_opts.headers = this.headers;

            // create request
            var req = (this.secure ? _https2.default : _http2.default).request(this.request_opts);

            // attach event handlers
            req.on('response', this.handle_response.bind(this));
            req.on('error', this.handle_error.bind(this));

            // send payload

            if (this.method !== 'GET') {
                req.write(payload);
            }

            // end the request
            req.end();

            return this;
        }
    }, {
        key: 'handle_response',
        value: function handle_response(response) {
            var _this2 = this;

            this.raw = '';

            this.response = response;

            response.setEncoding(this.encoding);

            response.on('data', function (chunk) {
                return _this2.raw += chunk;
            });

            response.on('close', function () {
                _this2.log('error', 'Response closed');
                _this2.errors.push('Response closed');
                _this2.retry();
            });

            response.on('error', function (err) {
                _this2.log('error', 'Response error', err);
                _this2.errors.push('Response closed');
                _this2.retry();
            });

            response.on('end', this.handle_end.bind(this));
        }
    }, {
        key: 'handle_end',
        value: function handle_end() {

            if (this.response.headers.location && this.follow) {
                return this.handle_redirects();
            }

            this.log('verbose', 'Response', this.response.statusCode);
            this.log('silly', this.raw);

            // try parsing if application/json
            var content_type = this.response.headers['content-type'];

            if (content_type && content_type.includes('application/json')) {
                try {
                    this.raw = JSON.parse(this.raw);
                } catch (e) {
                    this.log('error', 'JSON is invalid');
                    return this.cb(e, this.raw, this, this.additional_arguments);
                }
            }

            // non-200 status codes
            if (this.response.statusCode < 200 || this.response.statusCode >= 300) {
                var error = {
                    response: this.raw,
                    code: this.response.statusCode
                };

                return this.cb(error, null, this, this.additional_arguments);
            }

            // everything is good
            this.cb(null, this.raw, this, this.additional_arguments);
        }
    }, {
        key: 'handle_redirects',
        value: function handle_redirects() {

            if (!this.max_redirects) {
                return this.cb({ message: 'Too many redirects' }, this.raw, this, this.additional_arguments);
            }

            var temp = this.response.headers.location.split('/');

            var redir = new Request('GET').to(this.response.headers.location).follow_redirects(this.max_redirects - 1);

            if (temp[0] === 'https:') {
                redir.secured();
            }

            for (temp in this.headers) {
                redir.set_header(temp, this.headers[temp]);
            }

            redir.set_encoding(this.encoding);

            return redir.then(this.cb);
        }
    }, {
        key: 'handle_error',
        value: function handle_error(err) {

            this.log('error', 'Request error', err);

            if (~this._retryables.indexOf(err.code) && this.retries < this._max_retry) {
                this.errors.push(err);
                return this.retry();
            }

            this.cb(err, null, this, this.additional_arguments);
        }
    }]);

    return Request;
}();

exports.default = Request;
module.exports = exports['default'];