

function temp() {
  var mongoose = require('mongoose');
  var Schema = mongoose.Schema;
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
}

exports.temp = temp;