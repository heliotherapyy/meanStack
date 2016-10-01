var http = require('http');
var employeeService = require('./lib/employees');
var responder = require('./lib/responseGenerator');
var staticFile = responder.staticFile('/public');

http.createServer(function (req, res) {
	var _url;

	req.method = req.method.toUpperCase();
	console.log(req.method + ' ' + req.url);
	// res.end('The current time is ' + Date.now());

	if (req.method !== 'GET') {
		res.writeHead(501, {
			'Content-Type': 'text/plain'
		});
		return res.end(req.method + ' is not implemented by this server');
	}

	if (_url = /^\/employees$/i.exec(req.url)) {
		employeeService.getEmployees(function (error, data) {
			if (error) {
				// 500 Error
				responder.send500(error, res);
			} else {
				// 200 
				responder.sendJson(data, res);
			}
		})
	} else if (_url = /^\/employees\/(\d+)$/i.exec(req.url)) {
		employeeService.getEmployee(_url[1], function(error, data) {
			if (error) {
				// 500
				responder.send500(error, res);
			} 

			if (!data) {
				// 404
				responder.send404(res);
			}

			// 200 + data
			responder.sendJson(data, res);
		})
	} else {
		res.writeHead(200);
		res.end('static file served');
	}

}).listen(1337, '127.0.0.1');

console.log('Server running at http://localhost:1337');