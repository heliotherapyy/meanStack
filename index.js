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

var Team = mongoose.model('Team', TeamSchema);
var Employee = mongoose.model('Employee', EmployeeSchema);

db.on('error', function() {
  console.log("there was an error communiating with the database");
});

function insertTeams (callback) {
	Team.create({
		name: 'Product Development'
	}, {
		name: 'Dev Ops'
	}, {
		name: 'Accounting'
	}, function (error, pd, devops, acct) {
		if (error) {
			return callback(error);
		} else {
			console.info("Teams Successfully added");
			callback(null, pd, devops, acct);
		}
	});
}

function insertEmployees (pd, devops, acct, callback) {
  Employee.create([{
    name: {
      first: 'John',
      last: 'Adams'
    },
    Team: pd._id,
    address: {
      lines: ['2 Lincoln Memorial Cir NW'],
      postal: '20037'
    }
  }, {
    name: {
      first: 'Thomas',
      last: 'Jefferson'
    },
    Team: devops._id,
    address: {
      lines: ['1600 Pennsylvania Avenue', 'White House'],
      postal: '20500'
    }
  }, {
    name: {
      first: 'James',
      last: 'Madison'
    },
    team: acct._id,
    address: {
      lines: ['2 15th St NW', 'PO Box 8675309'],
      postal: '20007'
    }
  }, {
    name: {
      first: 'James',
      last: 'Monroe'
    },
    team: acct._id,
    address: {
      lines: ['1850 West Basin Dr SW', 'Suite 210'],
      postal: '20242'
    }
  }], function (error, johnadams) {
    if (error) {
      return callback(error);
    } else {
      console.info('employees successfully added sir!');
      callback(null, {
        team: pd,
        employee: johnadams
      });
    }
  })
}

mongoose.connect(dbUrl, function (err) {
  if (err) {
    return console.log("There was a problem connecting to the database: ", err);
  }

  console.log("Connected!");

  insertTeams(function (err, pd, devops, acct) {
  	if (err) {
  		return console.log(err);
  	}

  	insertEmployees(pd, devops, acct, function (err, result) {
  		if (err) {
  			console.error(err);
  		} else {
  			console.info("Database activity complete");
  		}

  		db.close();
  		process.exit();
  	})
  })
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