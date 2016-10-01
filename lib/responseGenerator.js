var fs = require('fs');

exports.send404 = function (res) {
	console.error("Resource Not Found");
	res.writeHead(404, {
		'Content-Type': 'text/plain'
	});

	res.end('Not Found');
}

exports.sendJson = function(data, res) {
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});

	res.end(JSON.stringify(data));
}

exports.send500 = function (data, res) {
	console.error(data.red);
	res.writeHead(500, {
		'Content-Type': 'text/plain'
	});

	res.end(data);
}

exports.staticFile = function (staticPath) {
	return function(data, res) {
		var readStream;

		data = data.replace(/^(\/home)(.html)?$/i, '$1.html');
		data = '.' + staticPath + data;

		fs.stat(data, function (error, stats) {
			if (error || stats.isDirectory()) {
				return exports.send404(res);
			}

			readStream = fs.createReadStream(data);
			return readStream.pipe(res);
		})
	}
}