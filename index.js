'use strict';

/**
    Cuddle.js

    @author Raven Lagrimas
*/

var https = require('https'),
    http = require('http'),
    url = require('url'),

    logger = {
        log: function () {}
    },

    grapher,

    stringify = function (obj) {
        var ret = [],
            key;

        for (key in obj) {
            ret.push(
                obj[key] === null ? encodeURIComponent(key) : encodeURIComponent(key) + '=' + encodeURIComponent(
                    obj[key])
            );
        }

        return ret.join('&');
    },

    Request = function (method) {
        this.method = method;
        this.secure = false;
        this.started = false;
        this.follow = false;
        this.request_opts = {};
        this.headers = {};
        this.retries = 0;
        this.max_retry = 3;
        this.callbacks = {};
        this.encoding = 'utf8';
        this.log = true;

        this.to_string = function () {
            return [
                this.method,
                ' ',
                'http',
                this.secured ? 's' : '',
                '://',
                this.host,
                ':',
                this.port,
                this.path,
                '\nPayload:\t',
                JSON.stringify(this.data),
                '\nHeaders:\t',
                JSON.stringify(this.headers)
            ].join('');
        };

        this.raw = function () {
            console.log('\tcudl.raw() is deprecated');
            return this;
        };

        this.to = function (host, port, path) {

            if (!port && !path) {
                host = url.parse(host);
                this.host = host.hostname;
                this.path = host.path;
                this.port = host.port ? host.port : 80;

                if (host.protocol === 'https:') {
                    this.port = 443;
                    this.secure = true;
                }
            }
            else {
                this.path = path;
                this.host = host;
                this.port = port;
            }

            this.request_opts = {
                host: this.host,
                port: this.port
            };

            return this;
        };

        this.set_max_retry = function (max) {
            this.max_retry = max;
            return this;
        };

        this.secured = function () {
            this.secure = true;
            return this;
        };

        this.add_header = function (key, value) {
            this.headers[key] = value;
            return this;
        };

        this.add_opts = function (key, value) {
            this.request_opts[key] = value;
            return this;
        };

        this.then = function (cb) {
            if (!this.real_cb) {
                this.real_cb = cb;
            }

            if (!this.started) {
                this.send();
            }
            return this;
        };

        this.cb = function () {
            if (grapher) {
                grapher(this.start_date, +new Date());
            }

            if (this.real_cb) {
                this.real_cb.apply(this, arguments);
            }
        };

        this.args = function () {
            this.additional_arguments = arguments;
            return this;
        };

        this.set_before_json = function (fn) {
            this.before_json = fn;
            return this;
        };

        this.set_encoding = function (encoding) {
            this.encoding = encoding;
            return this;
        };

        this.follow_redirects = function (max_redirects) {
            this.max_redirects = +max_redirects || 3;
            this.follow = true;
            return this;
        };

        this.logging = function (log) {
            this.log = log;
            return this;
        };

        this.req_log = function () {
            if (this.log) {
                logger.log.apply(logger, arguments);
            }
        };

        this.stringify = stringify;

        this.retry = function () {
            this.retries++;
            if (this.retries > this.max_retry) {
                this.req_log('error', 'Reached max retries');
                this.cb({
                        message: 'Reached max retries',
                        url: this.host + ':' + this.port + this.path
                    },
                    null,
                    this,
                    this.additional_arguments
                );
                return this;
            }
            this.req_log('warn', 'Retrying request');
            return this.send(this.data);
        };

        this.pipe = function (stream) {
            this.req_log('verbose', 'Piping file..');
            this._stream = stream;
            return this;
        };

        this.on = function (event_type, next) {

            if (this.callbacks[event_type]) {
                this.callbacks[event_type] = this.callbacks[event_type].push(next);
            }

            this.callbacks[event_type] = [next];

            return this;
        };

        this.emit = function (event_type, err, response) {
            if (this.callbacks[event_type]) {
                this.callbacks[event_type].forEach(function (callback) {
                    callback(err, response);
                });
            }

            return this;
        };

        this.allow_unauthorized = function () {
            this.request_opts.reject_unauthorized = false;
            return this;
        };

        this.send = function (data) {
            var new_path = this.path,
                self = this,
                protocol,
                payload,
                req;

            this.started = true;
            this.data = data || '';

            if (data && this.method === 'GET') {
                new_path += '?' + this.stringify(data);
            }
            else {
                if (!this.headers['Content-Type']) {
                    payload = this.stringify(data);
                    this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    this.headers['Content-Length'] = payload.length;
                }
                else {
                    payload = JSON.stringify(data);
                }
            }

            this.headers.Accept = 'application/json';

            this.req_log('verbose', this.method, this.host + ':' + this.port + new_path);

            if (payload) {
                this.req_log('debug', 'data\n', payload);
            }

            this.req_log('debug', 'headers\n', this.headers);

            protocol = this.secure ? https : http;

            this.request_opts.path = new_path;
            this.request_opts.method = this.method;
            this.request_opts.headers = this.headers;

            try {
                req = protocol.request(this.request_opts);

                req.on('response', function (response) {
                    var s = '';

                    response.setEncoding(self.encoding);

                    response.on('data', function (chunk) {
                        s += chunk;

                        self.emit('data', null, chunk);

                    });

                    response.on('close', function () {
                        self.req_log('error', 'request closed');
                        self.emit('close', 'request closed');
                        self.retry();
                    });

                    response.on('error', function (err) {
                        self.req_log('error', 'Response error', err);
                        self.emit('error', err);
                        self.retry();
                    });

                    response.on('end', function () {
                        var redir,
                            temp;

                        self.response_headers = response.headers;
                        self.target_location = response.headers.location;

                        if (self.follow && self.response_headers.location) {
                            if (!self.max_redirects) {
                                self.cb({
                                    message: 'Too many redirects'
                                }, s, self, self.additional_arguments);
                                return;
                            }

                            temp = self.response_headers.location.split('/');

                            redir = new Request('GET')
                                .to(self.response_headers.location)
                                .follow_redirects(self.max_redirects - 1);

                            if (temp[0] === 'https:') {
                                redir = redir.secured();
                            }

                            for (temp in self.headers) {
                                redir = redir.add_header(temp, self.headers[temp]);
                            }

                            if (typeof (self._stream) !== 'undefined') {
                                redir.pipe(self._stream);
                            }

                            if (typeof (self.callbacks) !== 'undefined') {
                                redir.callbacks = self.callbacks;
                            }

                            redir.target_location = self.target_location;
                            redir.set_encoding(self.encoding);

                            redir.then(self.real_cb);
                        }
                        else {
                            self.req_log('verbose', 'Response', response.statusCode);
                            self.req_log('silly', s);

                            if (response.headers['content-type'] && response.headers[
                                    'content-type'].split(';')[0] ===
                                'application/json') {
                                if (self.before_json) {
                                    s = self.before_json(s);
                                }
                                try {
                                    s = JSON.parse(s);
                                }
                                catch (e) {
                                    self.req_log('error', 'JSON is invalid');
                                    self.req_log('error', e);
                                    e.status_code = response.statusCode;
                                    return self.cb(e, s, self, self.additional_arguments);
                                }
                            }


                            if (response.statusCode >= 200 && response.statusCode < 300) {

                                if (typeof (self._stream) !== 'undefined') {
                                    response.pipe(self._stream);
                                }

                                self.cb(null, s, self, self.additional_arguments);

                            }
                            else {

                                self.cb({
                                    response: s,
                                    status_code: response.statusCode
                                }, null, self, self.additional_arguments);
                            }
                        }
                    });
                });

                req.on('error', function (err) {
                    var retryable_errors = [
                        'ECONNREFUSED',
                        'ECONNRESET',
                        'ENOTFOUND',
                        'EADDRINFO',
                        'ETIMEDOUT',
                        'ESRCH'
                    ];

                    self.req_log('error', 'Request error', err, self.host + ':' + self.port +
                        self.path);

                    if (~retryable_errors.indexOf(err.code)) {
                        if (self.retries < self.max_retry) {
                            return self.retry();
                        }
                        err.message = 'OMG. Server on ' + self.host + ':' + self.port +
                            ' seems dead';
                    }

                    self.cb(err, null, self, self.additional_arguments);
                });

                req.on('socket', function () {
                    self.start_date = +new Date();
                });

                req.on('continue', function () {
                    self.req_log('error', 'continue event emitted');
                    self.retry();
                });

                req.on('upgrade', function () {
                    self.req_log('error', 'upgrade event emitted');
                    self.retry();
                });

                req.on('connect', function () {
                    self.req_log('error', 'connect event emitted');
                    self.retry();
                });

                if (this.method !== 'GET') {
                    req.write(payload);
                }

                req.end();
            }
            catch (e) {
                self.req_log('error', e.toString() || e);
                self.retry();
            }
            return this;
        };
    },

    attach = function (object) {
        object.get = {
            to: function (host, port, path) {
                return new Request('GET').to(host, port, path);
            }
        };

        object.post = {
            to: function (host, port, path) {
                return new Request('POST').to(host, port, path);
            }
        };

        object.put = {
            to: function (host, port, path) {
                return new Request('PUT').to(host, port, path);
            }
        };

        object.delete = {
            to: function (host, port, path) {
                return new Request('DELETE').to(host, port, path);
            }
        };

        object.request = function (method) {
            this.to = function (host, port, path) {
                return new Request(method).to(host, port, path);
            };
            return this;
        };

        object.graph = function (cb) {
            grapher = cb;
            return this;
        };

        object.stringify = stringify;

        return object;
    };

module.exports = function (_logger) {
    logger = _logger || logger;
    return attach({});
};

attach(module.exports);
