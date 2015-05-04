var request = require('request'),
	url = require('url'),
	logger = require('logtastic');

var serviceRequest = module.exports = function(opts, done) {
	opts = opts || {};

	// Add protocol and hostname if absent
	var u = url.parse(opts.url || opts.uri);
	u.protocol = u.protocol || serviceRequest.protocol;
	u.hostname = u.hostname || serviceRequest.hostname;
	opts.uri = u.format();

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
