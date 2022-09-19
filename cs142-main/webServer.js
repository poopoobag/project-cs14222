"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const MongoStore = require("connect-mongo");

const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");

require("dotenv").config();
var async = require("async");

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require("./schema/user.js").User;
var Record = require("./schema/user.js").Record;

var Photo = require("./schema/photo.js").Photo;
var Comment = require("./schema/photo.js").Comment;
var SchemaInfo = require("./schema/schemaInfo.js");

console.log(Photo);

var express = require("express");
const { request } = require("express");

const { makePasswordEntry, doesPasswordMatch } = require("./cs142password.js");

const clientMongo = mongoose
  .connect("mongodb://localhost/cs142project6", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((m) => m.connection.getClient());

var app = express();

const upload = multer();
app.use(express.static(__dirname));
app.use(bodyParser.json());

const sessionStore = MongoStore.create({ clientPromise: clientMongo });

app.use(
  session({
    secret: process.env.secretKey,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
  })
);

// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!
// var cs142models = require('./modelData/photoApp.js').cs142models;
// const { prototype } = require('bluebird');

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */

const checkAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).send("Auth failed");
  } else {
    next();
  }
};

app.get("/test/:p1", function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params objects.
  // console.log('/test called with param1 = ', request.params.p1);

  var param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        // Query returned an error.  We pass it back to the browser with an Internal Service
        // Error (500) error code.
        console.error("Doing /user/info error:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object - This
        // is also an internal error return.
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      // We got the object - return it in JSON format.
      // console.log('SchemaInfo', info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    // In order to return the counts of all the collections we need to do an async
    // call to each collections. That is tricky to do so we use the async package
    // do the work.  We put the collections into array and use async.each to
    // do each .count() query.
    var collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          var obj = {};
          for (var i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400) status.
    response.status(400).send("Bad param " + param);
  }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get("/user/list", checkAuth, function (request, response) {
  User.find({})
    .populate("records")
    .exec((err, info) => {
      if (err) {
        console.error(err);
        response.status(400).send(err);
        return;
      }
      if (info.length === 0) {
        console.error("No users found");
        response.status(400).send("No users found");
        return;
      }

      // console.log('user info ', test);
      info.forEach((element) => {
        delete element.location;
        delete element.occupation;
        delete element.__v;
        delete element.description;
      });

      // console.log(info);
      // console.log("user Id: " + request.session.userId);
      // console.log(test);
      response.status(200).send(info);
      return;
    });
  // response.status(200).send(cs142models.userListModel());
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get("/user/:id", checkAuth, function (request, response) {
  var id = request.params.id;
  // console.log(request.params.id);

  User.find({ _id: id }).exec((err, info) => {
    if (err) {
      return;
      response.status(400).send(err);
    }
    if (info === 0) {
      return response.status(400).send("User with _id:" + id + " not found!");
    }
    var test = {};

    test.user = JSON.parse(JSON.stringify(info[0]));

    delete test.user.__v;

    Photo.find({
      comments: {
        $exists: true,
        $not: { $size: 0 },
        $elemMatch: {
          mentions: { $exists: true, $not: { $size: 0 }, $in: id },
        },
      },
    })
      .lean()
      .exec((err, info1) => {
        if (err) {
          return response.status(200).send(test);
        }
        if (info.length === 0) {
          return response.status(200).send(test);
        }

        info1.forEach((elementPhotos) => {
          var mentionComments = [];
          elementPhotos.comments.forEach((elementComments) => {
            if (elementComments.mentions.includes(id)) {
              mentionComments.push(elementComments);
            }
            elementPhotos.comments = mentionComments;
          });
        });
        // info1.forEach((element) => {
        //   if (element.mentions.includes(id)) {
        //   }
        // });

        test.photos = info1;

        return response.status(200).send(test);
      });
  });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get("/photosOfUser/:id", checkAuth, function (request, response) {
  var id = request.params.id;
  // var photos = cs142models.photoOfUserModel(id);
  // if (photos.length === 0) {
  //     console.log('Photos for user with _id:' + id + ' not found.');
  //     response.status(400).send('Not found');
  //     return;
  // }
  // console.log(photos);

  // response.status(200).send(photos);
  Photo.find({ user_id: id })
    .lean()
    .exec(function (err, info) {
      if (err) {
        console.error(err);

        response.status(400).send(err);
        return;
      }
      if (info.length === 0) {
        console.error("Photo id user_id: " + id + "not found!");

        response.status(400).send("Photo id user_id: " + id + "not found!");
        return;
      }

      async.each(
        info,
        function (element, callback) {
          delete element.__v;
          async.each(
            element.comments,
            function (comment, callback1) {
              User.findById(comment.user_id)
                .lean()
                .exec(function (err, info) {
                  if (err) {
                    console.err("error has occured: " + err);
                    callback1(err);
                    return;
                  }
                  delete comment.user_id;
                  delete info.__v;
                  delete info.location;
                  delete info.description;
                  delete info.occupation;
                  comment.user = info;
                  callback1();
                });
            },
            function (err) {
              callback(err);
            }
          );
        },
        function (err) {
          if (err) {
            console.error(err);
            response.status(400).send(err);
          }
          response.status(200).send(info);
        }
      );
    });
});

app.post("/admin/login", function (req, res) {
  User.find({ login_name: req.body.login_name }, (err, info) => {
    if (err) {
      console.log(err);
      return res.status(400).send(err);
    }
    if (info.length === 0) {
      console.log("user not found /login");
      return res.status(400).send("User not found");
    }

    if (
      doesPasswordMatch(
        info[0].password_digest,
        info[0].salt,
        req.body.password
      )
    ) {
      req.session.user = info[0];
      // res.redirect(`/photo-share.html#/users/${info[0]._id}`);

      var record = new Record({
        user_id: req.session.user._id,
        type: "Login",
      });
      record.save();

      return res.status(200).send(req.session.user);
    }

    return res.status(400).send("pass not correct");
  });
});

app.post("/admin/logout", function (req, res) {
  // if (!req.session.user) {
  //   return res.status(400).send();
  // }

  var record = new Record({
    user_id: req.session.user._id,
    type: "Logout",
  });
  record.save();

  req.session.destroy();
  res.status(200).send();
});

app.post("/commentsOfPhoto/:photo_id", checkAuth, (req, res) => {
  var photo_id = req.params.photo_id;
  if (!req.body.comment) {
    return res.status(400).send("no comment");
  }
  if (req.body.comment.length === 0) {
    return res.status(400).send("Comment empty");
  }

  Photo.findById(photo_id, (err, info) => {
    if (err) {
      return res.status(500).send("photo not found");
    }
    if (info.length === 0) {
      return res.status(400).send("Empty");
    }

    const comment = new Comment({
      comment: req.body.comment,
      user_id: req.session.user._id, // 	The ID of the user who created the comment.
      mentions: req.body.mentions,
    });

    console.log(comment);
    info.comments.push(comment);
    info.save();

    var record = new Record({
      user_id: req.session.user._id,
      object_id: comment._id,
      parent_object_id: info._id,
      type: "Comment",
    });
    record.save();

    return res.status(200).send("Success!");
  });
});

app.get("/currentUser", checkAuth, (req, res) => {
  res.status(200).send(req.session.user);
});

const processFormBody = multer({ storage: multer.memoryStorage() }).single(
  "uploadedphoto"
);

const fs = require("fs");
const { exec } = require("child_process");

app.post("/photos/new", checkAuth, (request, response) => {
  processFormBody(request, response, function (err) {
    if (err || !request.file) {
      // XXX -  Insert error handling code here.
      return response.status(400).send("no file: ", err);
    }
    // request.file has the following properties of interest
    //      fieldname      - Should be 'uploadedphoto' since that is what we sent
    //      originalname:  - The name of the file the user uploaded
    //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
    //      buffer:        - A node Buffer containing the contents of the file
    //      size:          - The size of the file in bytes

    // XXX - Do some validation here.
    // We need to create the file in the directory "images" under an unique name. We make
    // the original file name unique by adding a unique prefix with a timestamp.
    const timestamp = new Date().valueOf();
    const filename = "U" + String(timestamp) + request.file.originalname;

    fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
      // XXX - Once you have the file written into your images directory under the name
      // filename you can create the Photo object in the database
      if (err) {
        return response.status(400).send(err);
      }
      //  var photoSchema = new mongoose.Schema({
      //    file_name: String, // 	Name of a file containing the actual photo (in the directory project6/images).
      //    date_time: { type: Date, default: Date.now }, // 	The date and time when the photo was added to the database
      //    user_id: mongoose.Schema.Types.ObjectId, // The ID of the user who created the photo.
      //    comments: [commentSchema], // Array of comment objects representing the comments made on this photo.
      //  });

      var newPhoto = new Photo({
        file_name: filename,
        user_id: request.session.user._id,
      });

      newPhoto.save();

      var record = new Record({
        user_id: request.session.user._id,
        object_id: newPhoto._id,
        type: "Photo",
      });
      record.save();
      return response.status(200).send();
    });
  });
});

app.post("/user", (req, res) => {
  var arr = Object.keys(req.body);
  if (arr.length !== 6) {
    return res.status(400).send("Invalid Input");
  }
  arr.forEach((e) => {
    if (e.length == 0) {
      return res.status(400).send(e, " is Invalid Input");
    }
  });

  User.find({ login_name: req.body.last_name.toLowerCase() }, (err, info) => {
    if (err) {
      console.log(err);
      return res.status(505).send(err);
    }
    if (info.length > 0) {
      return res.status(400).send("login_name not available");
    }

    var password = makePasswordEntry(req.body.password);

    var newUser = new User({
      login_name: req.body.last_name.toLowerCase(),
      first_name: req.body.first_name, // First name of the user.
      last_name: req.body.last_name, // Last name of the user.
      location: req.body.location, // Location  of the user.
      description: req.body.description, // A brief user description
      occupation: req.body.occupation, // Occupation of the user.
      password_digest: password.hash,
      salt: password.salt,
    });

    newUser.save();

    var record = new Record({
      user_id: newUser._id,
      object_id: newUser._id,
      type: "Register",
    });
    record.save();

    console.log("registered user: ", newUser);

    res.status(200).send();
  });
});

app.get("/123", (req, res) => {});

app.get("/currentUser", checkAuth, (req, res) => {
  res.status(200).send(req.session.user);
});

var server = app.listen(3000, function () {
  var port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});

app.get("/activity", checkAuth, (req, res) => {
  Record.find({})
    .lean()
    .exec((err, info) => {
      if (err) {
        res.status(505).send(err);
      }

      info.slice(0, 5);

      var response = [];

      async.each(
        info,
        (element, callback) => {
          switch (element.type) {
            case "Photo": {
              Photo.findById(element.object_id)
                .lean()
                .exec((err, info) => {
                  if (err) {
                    console.error(err);
                    return;
                  }

                  var sendObject = {};
                  delete info.comments;
                  sendObject.photo = info;
                  sendObject.type = "Photo";
                  response.push(sendObject);
                  callback();
                });
              break;
            }
            case "Comment": {
              var sendObject = {};

              Photo.findById(element.parent_object_id)
                .lean()
                .exec((err, info) => {
                  if (err) {
                    console.error(err);
                    return;
                  }

                  sendObject.comment = info.comments.find((elementSub) => {
                    if (elementSub._id === element._id) {
                      return true;
                    }
                  });

                  delete info.comments;
                  sendObject.type = "Comment";
                  sendObject.photo = info;
                  sendObject.date_time = element.date_time;
                  response.push(sendObject);
                  callback();
                });
              break;
            }
            case "Register": {
              User.findById(element.user_id)
                .lean()
                .exec((err, info) => {
                  if (err) {
                    console.error(err);
                    return;
                  }
                  var sendObject = {};
                  sendObject.type = "Register";
                  sendObject.login_name = info.login_name;
                  sendObject.date_time = element.date_time;
                  response.push(sendObject);
                  callback();
                });
              break;
            }
            case "Login": {
              User.findById(element.user_id)
                .lean()
                .exec((err, info) => {
                  if (err) {
                    console.error(err);
                    return;
                  }
                  var sendObject = {};
                  sendObject.type = "Login";
                  sendObject.login_name = info.login_name;
                  sendObject.date_time = element.date_time;
                  response.push(sendObject);
                  callback();
                });
              break;
            }
            case "Logout": {
              console.log(element);

              User.findById(element.user_id)
                .lean()
                .exec((err, info) => {
                  if (err) {
                    console.error(err);
                    return;
                  }
                  var sendObject = {};
                  sendObject.type = "Logout";
                  console.log(info);
                  sendObject.login_name = info.login_name;
                  sendObject.date_time = element.date_time;
                  response.push(sendObject);
                  callback();
                });
              break;
            }
            default: {
              callback(element.type);
            }
          }
        },
        function (err) {
          if (err) {
            console.error(err);
          }

          res.status(200).send(response);
        }
      );
    });
});

// var testRecord = new Record({
//   object_id: mongoose.Types.ObjectId("621b73efaf2839441cc92b98"),
//   user_id: mongoose.Types.ObjectId("621b73efaf2839441cc92b86"),
// });

// testRecord.save();
