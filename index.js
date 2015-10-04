var request = require('request'),
	url = require('url'),
	logger = require('logtastic'),
	tip = require('trusted-real-ip');

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

	// Set the trusted ip header, unless othwerwise set
	opts.headers[tip.header] = opts.headers[tip.header] || opts.req ? tip.encode(opts.req.ip) : tip.encode('127.0.0.1');

	// Make the actual request
	request(opts, function(err, resp, body) {
		// Log error responses
		if (err) {
			logger.error('Service request error', {
				error: err, 
				options: opts,
				response: resp,
				body: body
			});
		} else if (resp.statusCode >= 500) {
			logger.error('Service request 500 response', {
				options: opts,
				response: resp,
				body: body
			});
		} else if (resp.statusCode >= 400) {
			logger.warning('Service request 400 response', {
				options: opts,
				response: resp,
				body: body
			});
		}
		done(err, resp, body);
	});

};

serviceRequest.hostname = 'localhost';
serviceRequest.protocol = 'http:';
serviceRequest.headers = {};
