var http = require('http');
var url = require('url');
const numeral = require('numeral');
var bodyParser = require('body-parser');
var AssistantV1 = require('watson-developer-cloud/assistant/v1');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var DiscoveryV1 = require('watson-developer-cloud/discovery/v1');
var path = require("path");
var express = require("express");
var app = express();
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, './public')));
var customerDB = require(path.join(__dirname, './model/CustomerDAO'));
var context = {};
var array = [];




console.log("path" + path.join(__dirname, 'views'));

app.get('/', function (req, res) {
  // console.log('app.js');

  res.render(path.join(__dirname, 'views') + '/application');


});

app.get('/index', function (req, res) {
  console.log('app.js');
  context = {};
  res.render(path.join(__dirname, 'views') + '/index');


});

app.get('/faq', function (req, res) {
  console.log('faq first call');
  res.render(path.join(__dirname, 'views') + '/faq', { ans: '', question: '' });


});

app.get('/discovery', function (req, res) {

  var reqData = url.parse(req.url, true, true);

  console.log('inside discovery get' + reqData.query.question);

  var discovery = new DiscoveryV1({
    url: 'https://gateway.watsonplatform.net/discovery/api',
    version: '2018-03-05',
    username: 'c1a0107d-6d6b-4b54-b7d6-317633af75a5',
    password: 'TiJ5GLOsKBEl',

  });
  const queryParams = {
    natural_language_query: reqData.query.question,
    passages: true,
    passages_characters: 1000,
    environment_id: '63c001f4-d858-4107-84a3-c4bb8a949590',
    collection_id: '7b308933-9042-4f2b-9feb-dc7574bd9320'
  };


  // Object.assign(queryParams, discoveryParams);
  discovery.query(queryParams, (err, searchResponse) => {
    discoveryResponse = 'Sorry, currently I do not have a response. Our Customer representative will get in touch with you shortly.';
    if (err) {
      console.error('Error searching for documents: ' + err);

    } else if (searchResponse.passages.length > 0) {
      console.log('searchResponse: ' + searchResponse);
      const bestPassage = searchResponse.passages[0];
      console.log('Passage score: ', bestPassage.passage_score);
      console.log('Passage text: ', bestPassage.passage_text);

      // Trim the passage to try to get just the answer part of it.
      const lines = bestPassage.passage_text.split('\n');
      console.log('Passage text end: ' + lines);
      let bestLine;
      let questionFound = false;
      for (let i = 0, size = lines.length; i < size; i++) {
        const line = lines[i].trim();
        if (!line) {
          console.log('inside continue');
          continue; // skip empty/blank lines
        }
        if (line.includes('?') || line.includes('<h1')) {
          // To get the answer we needed to know the Q/A format of the doc.
          // Skip questions which either have a '?' or are a header '<h1'...
          console.log('skipped ?' + line);
          if (line.includes(reqData.query.question))
            questionFound = true;

          continue;
        }
        bestLine = line; // Best so far, but can be tail of earlier answer.
        console.log('bestLine--->' + bestLine);
        if (questionFound && bestLine) {
          // We found the first non-blank answer after the end of a question. Use it.
          console.log('break');

          break;
        }
      }

      discoveryResponse =
        'Sorry I currently do not have an appropriate response for your query. Our customer care executive will call you in 24 hours.';
      console.log('bestLine ', bestLine);
      if (!questionFound) {
        console.log('Not found----------------->');
        bestLine = discoveryResponse;
      }
      if (bestLine.includes('<p dir="ltr">s')) {
        bestLine = bestLine.replace('<p dir="ltr">s', '');
        console.log('bestLine.replace(p dir="ltr', bestLine);
      }
      if (bestLine.includes('<p dir="ltr">')) {
        bestLine = bestLine.replace('<p dir="ltr">', '');
        console.log('bestLine.replace(p dir="ltr', bestLine);
      }
      if (bestLine.includes('</p>')) {
        bestLine = bestLine.replace('</p>', '');
        console.log('bestLine.replace(/p', bestLine);
      }


      res.render(path.join(__dirname, 'views') + '/faq', { ans: bestLine });

    }



  });

  /// res.render(path.join(__dirname, 'views')+'/login');

});

app.get('/dashboard', function (req, res) {
  var reqData = url.parse(req.url, true, true);

  console.log('inside dashborad get' + reqData.query.uname);
  customerDB.getCustFeedback(reqData.query.fname, function (err, policylist) {
    if (policylist != null && policylist != '') {
      const parameters = {
        text: policylist[0].feedback,
        features: {
          entities: {
            emotion: true,
            sentiment: true,
            limit: 2
          },
          keywords: {
            emotion: true,
            sentiment: true,
            limit: 2
          },
          sentiment: {
            targets: [
              'Page Insurance Agency'
            ]
          }
        }
      };
      const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
      const nlu = new NaturalLanguageUnderstandingV1({
        url: "https://gateway.watsonplatform.net/natural-language-understanding/api",
        username: "f01bc3e2-1e4b-4df7-be75-001bd1eb0797",
        password: "dLQQILAQhs7O",
        version_date: '2018-03-16'
      });

      nlu.analyze(parameters, function (err, response) {
        if (err)
          console.log('error:', err);
        else
          console.log(JSON.stringify(response, null, 2));

        res.render(path.join(__dirname, 'views') + '/dashboard', { response: response, uname: reqData.query.uname, pass: reqData.query.psw });
      });

    } else {
      res.render(path.join(__dirname, 'views') + '/dashboard', { response: '', uname: reqData.query.uname, pass: reqData.query.psw });
    }
    //if end   

  });

});




// Endpoint to be call from the client side
app.post('/api/message', function (req, res) {


  var workspace = 'a6bdda20-ae18-47a1-aa9b-31afddb7c84d';



  var payload = {
    workspace_id: workspace,
    input: req.body.input || {},
    context: context
  };
  var input = payload.input.text;
  if (input == null && input == '') {
    input = "first call";
  }

  var jsoninput = { "text": input };


  var service = new AssistantV1({
    username: '13fef1e1-e8d9-45e6-af36-bd4eeaf25e60', // replace with service username
    password: 'e3kB7U7kJ42N', // replace with service password
    version: '2018-06-24'
  });

  var params =
  {
    'tone_input': jsoninput,
    'content_type': 'application/json'
  };
  //const queryInput = JSON.stringify(payload.input);
  var toneAnalyzer = new ToneAnalyzerV3({
    version: '2017-09-21',
    username: '82e428d7-85e8-47e8-932a-9a73860c2d6e',
    password: 'Xzdp4WIr6PFi',
    url: 'https://gateway.watsonplatform.net/tone-analyzer/api'
  });


  // Use our Tone Analyzer variable to analyze the tone.
  toneAnalyzer.tone(params, function (error, response) {
    var toneAngerScore = '';
    // There's an error.
    if (error) {
      console.log('Error:', error);
    }
    // No error, we got our tone result.
    else {
      // The tone of the text, as determined by watson.
      var tone = JSON.stringify(response, null, 2)

      // Output Watson's tone analysis to the console.
      console.log("The tone analysis for \'" + input + "\' is:\n");
      console.log(response.document_tone);
      const len = response.document_tone.tones.length;
      console.log("len" + len);


      for (let i = 0; i < len; i++) {
        if (response.document_tone.tones[i].tone_id === 'anger') {
          //  console.log('Input = ', queryInput);
          console.log('emotion_anger score = ', 'Emotion_anger', response.document_tone.tones[i].tone_id);
          toneAngerScore = response.document_tone.tones[i].tone_id;
          break;
        }
      }


    }
    console.log('toneAngerScore = ', toneAngerScore);
    if (toneAngerScore == 'anger') {
      payload.context = {};
      payload.context['tone_anger_score'] = toneAngerScore;

    }
    //  console.log('payload.context ', payload.context);
    // Original code added here
    if (context.feedback != null && (context.feedback == 'yes' || context.feedback == 'Yes')) {
      customerDB.createFeedback(payload.input.text, context.personname);
      console.log('context.personname' + context.personname);
      if (toneAngerScore == 'anger') {
        context = {};
        return res.json("Please wait while we are transferring your request to the helpdesk team.");
      } else return res.json("Thanks for your feedback.Good Bye");
      // res.render(path.join(__dirname, 'views')+'/application',{username :context.personname});
      context = {};

    } else {
      // Send the input to the assistant service
      service.message(payload, function (err, data) {
        if (err) {
          return res.status(err.code || 500).json(err);
        }
        console.log('data.context.tone_anger_score' + data.context.tone_anger_score);
        if (data.context.policycode != null && data.context.termsandconditions == null && context.policycode == null &&
          toneAngerScore != 'anger') {

          context = data.context;

          customerDB.calcPremium(data.context, function (err, policylist) {
            context.emi = policylist.emi;
            var str = "PolicyCode: " + policylist.policycode + "  EMI: " + policylist.emi;
            //console.log("str"+str);

            data.output.text.push(str);
            str = "   Terms and Conditions: " + policylist.termdesc;

            data.output.text.push(str);

            str = "Please type Accept/Reject?"
            console.log("policylist" + policylist.policycode);
            data.output.text.push(str);

            return res.json(data.output.text);


          });


        } else if (data.context.termsandconditions == null && context.policycode != null &&
          toneAngerScore != 'anger') {
          context = data.context;

          customerDB.calcPremium(data.context, function (err, policylist) {
            context.emi = policylist.emi;

            var str = "PolicyCode: " + policylist.policycode + "  EMI: " + policylist.emi;


            data.output.text.push(str);
            str = "   Terms and Conditions: " + policylist.termdesc;

            data.output.text.push(str);

            str = "Please  Accept/Reject?"
            console.log("policylist" + policylist.policycode);
            data.output.text.push(str);

            return res.json(data.output.text);


          });

        }

        else {

          if (context.termsandconditions == null && data.context.termsandconditions != null &&
            ['Accept', 'accept', 'yes', 'ok', 'Y', 'y', 'Yes'].indexOf(data.context.termsandconditions) >= 0 &&
            toneAngerScore != 'anger') {
            context = data.context;
            customerDB.insertCustomerRec(context, function (err, policynum) {

              var str = "Please find your Insurance number";

              data.output.text.push(str);

              str = "policynum: " + policynum;


              data.output.text.push(str);

              str = "Would you like to give us feedback (Yes/No) ";

              data.output.text.push(str);
              return res.json(data.output.text);

            });

          } else {
            if (data.context.feedback != null && (data.context.feedback == 'no' || data.context.feedback == 'No')) {
              context = {};

              return res.json("GoodBye");
            } else {
              context = data.context;
              return res.json(data.output.text);
            }

          }

        }


      });
    }

    // Original code ended here

  });
  /*
    
   */
});

app.get('/api/db', function (req, res) {

  var age = context.age.toString();
  customerDB.getPolicies(age, function (err, policylist) {
    console.log("We  have policy for" + policylist);
    var str = new Array();
    if (policylist != '' && policylist != "") {
      console.log("var r in policylist");
      for (var r in policylist) {
        var policy = "";
        policy = "policycode:   " + policylist[r].policycode + "  sumassured:  " + policylist[r].sumassured + "  accidentcover " +
          policylist[r].accidentcover + "  tenure:  " + policylist[r].tenure;

        str.push(policy);

      }
    } else {
      context = {};
      console.log("Sorry,We don't have policy for");
      str.push("Sorry,We don't have policy for age group you mentioned   " + context.age);
    }


    return res.json(str);

  });


});

app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "airline_bot_token"
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    console.log('inside WEBHOOK_VERIFIED');
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      console.log('WEBHOOK_NOTVERIFIED');
      res.sendStatus(403);      
    }
  }
});

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
 
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});
app.listen(process.env.VCAP_APP_PORT || 3000, function () {
  context = {};
  console.log('Server running on port: %d', 3000);
});