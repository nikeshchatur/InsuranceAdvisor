var MongoClient  = require('mongodb').MongoClient;;

var url = "mongodb://nikesh:nikesh123@ds159840.mlab.com:59840/customerdb";
//mongodb://<dbuser>:<dbpassword>@ds159840.mlab.com:59840/customerdb

MongoClient.connect(url, function(err, customerdb) {
  if (err) throw err;
  var dbo = customerdb.db("customerdb");
  dbo.createCollection("Insurance-master", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
    customerdb.close();
  });
});