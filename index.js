var nets = require('nets');
var url = require('url');
var logger = require('logtastic');

var serviceRequest = module.exports = function(opts, done) {
	opts = opts || {};

	// log when the request is not provided
	if (!opts.req) {
		logger.warning('Request not provided to service request, things might not work correctly without it');
	}

	// Add protocol and hostname if absent
	var uri = opts.url || opts.uri;
	if (typeof uri === 'string') {
		uri = url.parse(uri);
	}

	// Default protocol and host
	uri.protocol = uri.protocol || serviceRequest.protocol;
	uri.hostname = uri.hostname || serviceRequest.hostname;

	// Format the url
	opts.uri = url.format(uri);

	// Add headers
	opts.headers = opts.headers || {};
	if (typeof serviceRequest.headers === 'function') {
		opts.headers = serviceRequest.headers(opts.headers, opts.req);
	} else {
		for (var i in serviceRequest.headers) {
			if (!opts.headers[i]) {
				opts.headers[i] = serviceRequest.headers[i];
			}
		}
	}

	// Make the actual request
	nets(opts, function(err, resp, body) {
		if (err || resp.statusCode >= 400) {
			serviceRequest.logErrorResponse(opts, err, resp, body);
		}

		done(err, resp, body);
	});

};

serviceRequest.logErrorResponse = function(opts, err, resp, body) {
	var msg = 'Service request error',
		level = 'error',
		meta = {
			options: opts
		};

	// Log error responses
	if (err) {
		meta.error = err;
	} else if (resp.statusCode >= 500) {
		meta.body = body;
		body && body.errors ? meta.errors = body.errors : false;
		msg = 'Service request 500 response';
		meta.response = {
			code: resp.statusCode,
			headers: resp.headers
		};
	} else if (resp.statusCode >= 400) {
		meta.body = body;
		body && body.errors ? meta.errors = body.errors : false;
		level = 'warning'
		msg = 'Service request 400 response';
		meta.response = {
			code: resp.statusCode,
			headers: resp.headers
		};
	}
	logger[level](msg, meta);
};

serviceRequest.hostname = 'localhost';
serviceRequest.protocol = 'http:';
serviceRequest.headers = {};
