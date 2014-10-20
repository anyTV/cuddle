/**
	Cuddle.js

	@author	Raven Lagrimas
*/

var https	= require('https'),
	http	= require('http'),

	logger 	= {log:function(){}},

	Request = function (method) {
		this.method		= method;
		this.secure 	= false;
		this.started 	= false;
		this._raw 		= false;
		this.headers 	= {};
		this.retries	= 0;
		this.max_retry	= 3;

		this.to = function (host, port, path) {
			this.path = path;
			this.host = host;
			this.port = port;
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

		this.raw = function () {
			this._raw = true;
			return this;
		};

		this.then = function (cb) {
			if (!this.cb) {
				this.cb = cb;
			}

			!this.started && this.send();
			return this;
		};

		this.args = function () {
			this.additional_arguments = arguments;
			return this;
		};

		this.set_before_json = function (fn) {
			this.before_json = fn;
			return this;
		};

		this.stringify = function (obj) {
		    var ret = [],
		        key;

		    for (key in obj) {
		        ret.push(
		            obj[key] === null
		            ? encodeURIComponent(key)
		            : encodeURIComponent(key) + '=' + encodeURIComponent(obj[key])
		        );
		    }

		    return ret.join('&');
		};

		this.retry = function () {
			this.retries++;
			if (this.retries > this.max_retry) {
				logger.log('error', 'Reached max retries');
				this.cb({message : 'Reached max retries'}, null, this, this.additional_arguments);
				return this;
			}
			logger.log('warn', 'Retrying request');
			return this.send(this.data);
		};

		this.send = function (data) {
			var new_path = this.path,
				self = this,
				protocol,
				payload,
				req;

			this.started = true;
			this.data = data;

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

			if (!this._raw) {
				this.headers['Accept'] = 'application/json';
			}

			logger.log('verbose', this.method, this.host + ':' + this.port + new_path);

			if (payload) {
				logger.log('debug', 'data\n', payload);
			}

			logger.log('debug', 'headers\n', this.headers);

			protocol = this.secure ? https : http;

			req = protocol.request({
				host: this.host,
				port: this.port,
				path: new_path,
				method: this.method,
				headers: this.headers
			}, function (response) {
				var s = '';

				response.setEncoding('utf8');

				response.on('data', function (chunk) {
					s += chunk;
				});

				response.on('end', function () {

					self.response_headers = response.headers;

					if (self._raw) {
						if (response.statusCode === 200) {
							logger.log('verbose', 'Response', response.statusCode);
							logger.log('silly', s);
							self.cb(null, s, self, self.additional_arguments);
						}
						else {
							s = {
								response : s,
								statusCode : response.statusCode
							};
							self.cb(s, null, self, self.additional_arguments);
						}
					}
					else {
						logger.log('verbose', 'Response', response.statusCode);
						logger.log('silly', s);

						if (this.before_json) {
							s = this.before_json(s);
						}

						try {
							JSON.parse(s);
						}
						catch (e) {
							logger.log('error', 'JSON is invalid');
							logger.log('error', s);
							e.statusCode = response.statusCode;
							return self.cb(e, s, self, self.additional_arguments);
						}
						if (response.statusCode === 200) {
							self.cb(null, JSON.parse(s), self, self.additional_arguments);
						}
						else {
							s = JSON.parse(s);
							s.statusCode = response.statusCode;
							self.cb(s, null, self, self.additional_arguments);
						}
					}
				});
			});

			req.on('error', function (err) {
				var retryable_errors = [
						'ECONNREFUSED',
						'ENOTFOUND',
						'ECONNRESET',
						'EADDRINFO',
						'EMFILE'
					];

				logger.log('error', 'Request error', err, self.host + ':' + self.port + self.path);

                if (~retryable_errors.indexOf(err.code)) {
    				if (self.retries < self.max_retry) {
						return self.retry();
					}
                    err.message = 'OMG. Server on ' + self.host + ':' + self.port + ' seems dead';
                }

				self.cb(err, null, self, self.additional_arguments);
			});

			if (this.method !== 'GET') {
				req.write(payload);
			}

			req.end();
			return this;
		};
	},

	attach = function (object) {
		object.get = {
			to : function (host, port, path) {
				return new Request('GET').to(host, port, path);
			}
		};

		object.post = {
			to : function (host, port, path) {
				return new Request('POST').to(host, port, path);
			}
		};

		object.put = {
			to : function (host, port, path) {
				return new Request('PUT').to(host, port, path);
			}
		};

		object.delete = {
			to : function (host, port, path) {
				return new Request('DELETE').to(host, port, path);
			}
		};

		object.request = function (method) {
			this.to = function (host, port, path) {
				return new Request(method).to(host, port, path);
			};
			return this;
		};

		return object;
	};

module.exports = function (_logger) {
	logger = _logger || logger;
	return attach({});
};

attach(module.exports);
