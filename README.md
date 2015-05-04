# A wrapper around `request` for making internal service requests

A wrapper for [request](https://github.com/request/request) which sets up default headers, add's the proper hostname and protocol and log's error conditions.

# Usage

```javascript
var serviceRequest = require('service-request');

// Configure the default hostname and protocol
serviceRequest.hostname = 'musicmap.io';
serviceRequest.protocol = 'https:';

// Make a request
serviceRequest({
	method: 'GET',
	url: '/api/users'
}, function(err, resp, body) {
	if (err) {
		// Errors are logged using logtastic
		// inside of the module, so you don't have
		// to log here.  You should just do whatever
		// cleanup and response you need.
	}

	// `resp` and `body` are both just the normal
	// values that request would return with no
	// modifications.  Again error responses (>= 400)
	// are logged in the serviceRequest module, do just
	// do your response stuff here.
	
});
```

## Setting default headers

The service request module facilitates adding default headers, and headers on a per-request basis.  To do this set the `serviceRequest.headers` field.  This can be a static object of headers to set, or a function that accepts the custom headers and an optional request object.  For example, here is how you would pass the authorization header from a web request into a service request:

```javascript
var app = require('express')(),
	serviceRequest = require('service-request');

// Set headers
serviceRequest.headers = function(headers, req) {
	headers = headers || {};
	headers['Authorization'] = 'Bearer ' + req.cookies.sessid;
	return headers;
};

app.get(function(req, res, next) {
	// Editing a user requires the auth cookie
	serviceRequest({
		// Pass the request here and it will be passed into
		// the headers function we defined above
		req: req,
		method: 'POST',
		url: '/api/users/' + req.session.userId,
		json: {
			email: req.body.email
		}
	}, function(err, resp, body) {
		// do response stuff...
	});
});
```
