var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var mongoUrl = 'mongodb://15.184.12.32:15593/cultyvate_test';
var db;

exports.connect = function(callback) {
  MongoClient.connect(mongoUrl, function(err, database) {
    if( err ) throw err;
    db = database;
    callback();
  })
}

exports.doSomethingWithDatabase = function(callback) {
  // this is using the same db connection
  var mysort = {_id:-1};
  db.collection('telemetrydatas').find({"devId":"a840410001818dab"}).sort(mysort).limit(1).toArray((err, docs) => {
    // do something
    callback(docs);
  });
};

// exports.doSomethingWithDatabase = function(callback) {
//     // this is using the same db connection
//     db.collection('telemetrydatas').find({"devId":"a840410001818dab"}, function(err, docs) {
//       // do something
//       callback(docs);
//     });
//   };

//use this app.js
data_base.connect(function() {
    // Start the application after the database connection is ready
    app.listen(3000);
    console.log("Listening on port 3000");
    
    app.get("/he", function(req, res) {
      //  do some stuff
      const vu = data_base.doSomethingWithDatabase(someCallback);
      console.log(vu)
      res.send(vu)
    });
  });