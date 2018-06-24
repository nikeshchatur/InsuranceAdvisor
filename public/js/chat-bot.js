


function chatBot() {
	
//	var AssistantV1 = require('watson-developer-cloud/assistant/v1');

	// current user input
	this.input;
	var responsePayload;
	/**
	 * respondTo
	 * 
	 * return nothing to skip response
	 * return string for one response
	 * return array of strings for multiple responses
	 * 
	 * @param input - input chat string
	 * @return reply of chat-bot
	 */
	this.respondTo = function(input,callback) {

		console.log('input');
		var messageEndpoint = '/api/message';
		var payloadToWatson = {};
    if (input) {
      payloadToWatson.input = {
        text: input
      };
    }

		console.log('payloadToWatson');

			/* var service = new AssistantV1({
			username: '13fef1e1-e8d9-45e6-af36-bd4eeaf25e60', // replace with service username
			password: 'e3kB7U7kJ42N', // replace with service password
			version: '2018-06-22'
		  });
		  
		  var workspace_id = 'a6bdda20-ae18-47a1-aa9b-31afddb7c84d'; */
		  
				//this.input = input.toLowerCase();

	
		if(this.match('(hi|hello|hey|hola|howdy)(\\s|!|\\.|$)'))
			return "Can't understand...Can you please clarify again?";
		
		if(this.match('what[^ ]* up') || this.match('sup') || this.match('how are you'))
			return "this github thing is pretty cool, huh?";
		
		if(this.match('l(ol)+') || this.match('(ha)+(h|$)') || this.match('lmao'))
			return "what's so funny?";
		
		if(this.match('^no+(\\s|!|\\.|$)'))
			return "don't be such a negative nancy :(";
		
		if(this.match('(cya|bye|see ya|ttyl|talk to you later)'))
			return ["alright, see you around", "good teamwork!"];
		
		if(this.match('(dumb|stupid|is that all)'))
			return ["hey i'm just a proof of concept", "you can make me smarter if you'd like"];
		
		if(this.input == 'noop')
			return;

			var http = new XMLHttpRequest();
			http.open('POST', messageEndpoint, true);
		http.setRequestHeader('Content-type', 'application/json');
			http.onreadystatechange = function() {
			  if (http.readyState === 4 && http.status === 200 && http.responseText) {
				//Api.setResponsePayload(http.responseText);
				callback.apply(http);
				
			//	return http.responseText;
				
				}
				else 	console.log('else');
				
			};  
			var params = JSON.stringify(payloadToWatson);
		//	var params = JSON.stringify(payloadToWatson);
			// Stored in variable (publicly visible through Api.getRequestPayload)
			// to be used throughout the application
			
			console.log('params'+params);
			// Send request
			http.send(params);

		//return params + " what?";  

	/*	service.message({
			workspace_id: workspace_id
			}, processResponse); */
	}
	

	function processResponse(err, response) {
		console.log('processResponse');
		if (err) {
		  console.error(err); // something went wrong
		  return;
		}
	  
		// Display the output from dialog, if any.
		if (response.output.text.length != 0) {
			console.log(response.output.text[0]);
			return response.output.text[0];
		}
	  }
	/**
	 * match
	 * 
	 * @param regex - regex string to match
	 * @return boolean - whether or not the input string matches the regex
	 */
	this.match = function(regex) {
	
		return new RegExp(regex).test(this.input);
	}
}
