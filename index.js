var http = require('http');
var employeeService = require('./lib/employees');
var responder = require('./lib/responseGenerator');
var staticFile = responder.staticFile('/public');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
var db = mongoose.connection;
var dbUrl = "mongodb://heroku_9xfg7c6s:s1in64sabb0nacnhhkav7oo993@ds047166.mlab.com:47166/heroku_9xfg7c6s";

var TeamSchema = new Schema({
  name: {
    type: String,
    required: true
  }
});

var Team = mongoose.model('Team', TeamSchema);

db.on('error', function() {
  console.log("there was an error communiating with the database");
});

mongoose.connect(dbUrl, function (err) {
  if (err) {
    return console.log("There was a problem connecting to the database: ", err);
  }

  console.log("Connected!");
  var team = new Team({
    name: "Product Development"
  });

  team.save(function (error, data) {
    if (error) {
      console.log(error);
    } else {
      console.dir(data);
    }
    db.close();
    process.exit();
  })
})

var EmployeeSchema = new Schema({
  name: {
    first: {
      type: String,
      required: true
    },
    last: {
    type: String,
    required: true
    }
  },
  team: {
    type: Schema.Types.ObjectId,
    ref: "Team"
  },
  image: {
    type: String,
    default: "images/user.png"
  },
  address: {
    lines: {
      type: [String]
    },
    postal: {
      type: String
    }
  }
});




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