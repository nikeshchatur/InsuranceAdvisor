var http = require('http');
var bodyParser = require('body-parser');
var AssistantV1 = require('watson-developer-cloud/assistant/v1');
var path    = require("path");
var express = require("express");
var app     = express();
app.use(bodyParser.json());
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname, './public')));
//app.use('/js',express.static(path.join(__dirname, 'public')));
//app.set('views', path.join(__dirname, '../views'));

//create a server object:



console.log("path"+path.join(__dirname, 'views'));

    app.get('/',function(req,res){
      console.log('app.js');
        res.render(path.join(__dirname, 'views')+'/index');
       // res.sendFile('../../index.html');
        //__dirname : It will resolve to your project folder.
       
      });

     // fs.readFile('../index.html', function (err, html) {

      //  if (err) throw err;    

      // Endpoint to be call from the client side
app.post('/api/message', function(req, res) {

  console.log('hi tere'+req.body);
  var workspace =  'a6bdda20-ae18-47a1-aa9b-31afddb7c84d';
 /* var workspace = process.env.WORKSPACE_ID || 'a6bdda20-ae18-47a1-aa9b-31afddb7c84d';
  if (!workspace || workspace === 'a6bdda20-ae18-47a1-aa9b-31afddb7c84d') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    });
  } */
  var payload = {
    workspace_id: workspace,
    input:  req.body.input || {}
  };
  console.log('payload'+payload);

  var service = new AssistantV1({
    username: '13fef1e1-e8d9-45e6-af36-bd4eeaf25e60', // replace with service username
    password: 'e3kB7U7kJ42N', // replace with service password
    version: '2018-06-24'
  });

  
  // Send the input to the assistant service
  service.message(payload, function(err, data) {
    if (err) {
      return res.status(err.code || 500).json(err);
    }
   console.log('data.output.text'+data.output.text);
    return res.json(data.output.text);
  }); 
});
    
      app.listen(3000, function() {
        console.log('Server running on port: %d', 3000);
      });