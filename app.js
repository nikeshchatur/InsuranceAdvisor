var http = require('http');
var fs = require('fs');
var path    = require("path");
var express = require("express");
var app     = express();
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname, './public')));
//app.use('/js',express.static(path.join(__dirname, 'public')));
//app.set('views', path.join(__dirname, '../views'));

//create a server object:



console.log("path"+path.join(__dirname, 'views'));

    app.get('/',function(req,res){
        res.render(path.join(__dirname, 'views')+'/index');
       // res.sendFile('../../index.html');
        //__dirname : It will resolve to your project folder.
       
      });

     // fs.readFile('../index.html', function (err, html) {

      //  if (err) throw err;    
    
      app.listen(3000, function() {
        console.log('Server running on port: %d', 3000);
      });