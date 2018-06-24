
var Api = (function() {
    var requestPayload;
    var responsePayload;
    var messageEndpoint = '/api/message';
  
    // Publicly accessible methods defined
    return {
      sendRequest: sendRequest,
  
      // The request/response getters/setters are defined here to prevent internal methods
      // from calling the methods without any of the callbacks that are added elsewhere.
      getRequestPayload: function() {
        return requestPayload;
      },
      setRequestPayload: function(newPayloadStr) {
        requestPayload = JSON.parse(newPayloadStr);
      },
      getResponsePayload: function() {
        return responsePayload;
      },
      setResponsePayload: function(newPayloadStr) {
        responsePayload = JSON.parse(newPayloadStr);
      }
    };


var AssistantV1 = require('watson-developer-cloud/assistant/v1');

var context;



function sendRequest(input){

  var payloadToWatson = {};
    if (text) {
      payloadToWatson.input = {
        text: text
      };
    }
    if (context) {
      payloadToWatson.context = context;
    }

// Set up Assistant service wrapper.
var service = new AssistantV1({
  username: '13fef1e1-e8d9-45e6-af36-bd4eeaf25e60', // replace with service username
  password: 'e3kB7U7kJ42N', // replace with service password
  version: '2018-06-22'
});

var workspace_id = 'a6bdda20-ae18-47a1-aa9b-31afddb7c84d';

service.message({
    workspace_id: workspace_id
    }, processResponse);
  
  // Process the service response.
  function processResponse(err, response) {
    if (err) {
      console.error(err); // something went wrong
      return;
    }
  
    // If an intent was detected, log it out to the console.
    if (response.intents.length > 0) {
      console.log('Detected intent: #' + response.intents[0].intent);
    }
  
    context = response.context;
    // Display the output from dialog, if any.
    if (response.output.text.length != 0) {
        return response.output.text[0];
    }
  
}       
    
  
}

}());