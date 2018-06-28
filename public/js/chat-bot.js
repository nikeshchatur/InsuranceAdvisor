


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

			var http = new XMLHttpRequest();
			http.open('POST', messageEndpoint, true);
		http.setRequestHeader('Content-type', 'application/json');
			http.onreadystatechange = function() {
			  if (http.readyState === 4 && http.status === 200 && http.responseText) {
						callback.apply(http);				
			
				}
				else 	console.log('else');
				
			};  
			var params = JSON.stringify(payloadToWatson);
					
			console.log('params'+params);
			// Send request
			http.send(params);


	}
	

	this.getDBPolicy = function(input,callback) {

		console.log('input');
		var messageEndpoint = '/api/db';
		

			var http = new XMLHttpRequest();
			http.open('GET', messageEndpoint, true);
	//	http.setRequestHeader('Content-type', 'application/json');
			http.onreadystatechange = function() {
			  if (http.readyState === 4 && http.status === 200 && http.responseText) {
						callback.apply(http);				
			
				}
				else 	console.log('else');
				
			};  
		
			// Send request
			http.send();


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
