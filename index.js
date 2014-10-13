/**
	Cuddle.js

	@author	Raven Lagrimas
*/

var https	= require('https'),
	http	= require('http'),
	url 	= require('url'),

	logger,

	Request = function (method) {
		this.method		= method;
		this.secure 	= false;
		this.started 	= false;
		this._raw 		= false;
		this.headers 	= {};

		this.to = function (host, port, path) {
			if (!port && !path) {
				if (host.substring(0, 4) !== 'http') {
					host = 'http://' + host;
				}
				host = url.parse(host);
			}
			this.path = host.path || path;
			this.host = host.hostname || host;
			this.port = host.port || (host.protocol === 'https:' ? 443 : (port || 80));
			if (host.protocol === 'https:') {
				this.secure = true;
			}
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

		this.send = function (data) {
			var self = this,
				protocol,
				payload,
				req;

			this.started = true;

			if (data && this.method === 'GET') {
				this.path += '?' + this.stringify(data);
			}
			else if (this.method !== 'GET') {
				payload = this.stringify(data);
				this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
			}

			if (!this._raw) {
				this.headers['Accept'] = 'application/json';
			}

			logger.log('verbose', this.method, this.host + ':' + this.port + this.path);

			if (payload) {
				logger.log('debug', 'data\n', payload);
			}

			logger.log('debug', 'headers\n', this.headers);

			protocol = this.secure ? https : http;

			req = protocol.request({
				host: this.host,
				port: this.port,
				path: this.path,
				method: this.method,
				headers: this.headers
			}, function (response) {
				var s = '';

				response.setEncoding('utf8');

				response.on('data', function (chunk) {
					s += chunk;
				});

				response.on('end', function () {

					if (self._raw) {
						if (response.statusCode === 200) {
							logger.log('verbose', 'Response', response.statusCode);
							logger.log('silly', s);
							self.cb(null, s, response.headers, self.additional_arguments);
						}
						else {
							s = {
								response : s,
								statusCode : response.statusCode
							};
							self.cb(s, null, response.headers, self.additional_arguments);
						}
					}
					else {
						logger.log('verbose', 'Response', response.statusCode);
						logger.log('silly', s);

						s = s.replace(/\\u([\d\w]{4})/gi, function (c) {
							var temp = eval("'" + c + "'");
							return temp === c ? '' : temp;
						});

						try {
							JSON.parse(s);
						}
						catch (e) {
							logger.log('error', 'JSON is invalid');
							e.statusCode = response.statusCode;
							return self.cb(e, s, response.headers, self.additional_arguments);
						}
						if (response.statusCode === 200) {
							self.cb(null, JSON.parse(s), response.headers, self.additional_arguments);
						}
						else {
							s = JSON.parse(s);
							s.statusCode = response.statusCode;
							self.cb(s, null, response.headers, self.additional_arguments);
						}
					}
				});
			});

			req.on('error', function (err) {
				logger.log('error', 'Request error', err);

                if (err.code === 'ECONNREFUSED') {
                    err.message = 'OMG. Server on ' + self.host + ':' + self.port + ' seems dead';
                }

				self.cb(err, null, null, self.additional_arguments);
			});

			if (this.method !== 'GET') {
				req.write(payload);
			}

			req.end();
			return this;
		};
	};

module.exports = function (_logger) {
	logger = _logger || {log:function(){}};

	this.get = {
		to : function (host, port, path) {
			return new Request('GET').to(host, port, path);
		}
	};

	this.post = {
		to : function (host, port, path) {
			return new Request('POST').to(host, port, path);
		}
	};

	this.put = {
		to : function (host, port, path) {
			return new Request('PUT').to(host, port, path);
		}
	};

	this.delete = {
		to : function (host, port, path) {
			return new Request('DELETE').to(host, port, path);
		}
	};

	this.request = function (method) {
		this.to = function (host, port, path) {
			return new Request(method).to(host, port, path);
		};
		return this;
	};

	return this;
};
