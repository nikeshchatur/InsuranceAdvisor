var http = require('http');
var url = require('url');
const numeral = require('numeral');
var bodyParser = require('body-parser');
var AssistantV1 = require('watson-developer-cloud/assistant/v1');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var path    = require("path");
var express = require("express");
var app     = express();
app.use(bodyParser.json());
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname, './public')));
var customerDB = require(path.join(__dirname,'./model/CustomerDAO'));
var context={};
var array =[];




console.log("path"+path.join(__dirname, 'views'));

    app.get('/',function(req,res){
      console.log('app.js');
        res.render(path.join(__dirname, 'views')+'/application');
      
       
      });

      app.get('/index',function(req,res){
        console.log('app.js');
          res.render(path.join(__dirname, 'views')+'/index');
        
         
        });
/*
        app.get('/login',function(req,res){
          console.log('app.js');
          //var reqData = url.parse(req.url,true,true);
            res.render(path.join(__dirname, 'views')+'/login');
          
           
          }); */

        app.get('/dashboard',function(req,res){
          var reqData = url.parse(req.url,true,true);
                  
          console.log('inside dashborad get'+reqData.query.uname);
          customerDB.getCustFeedback(reqData.query.fname,function(err, policylist){
            if(policylist!=null && policylist!=''){
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

              nlu.analyze(parameters, function(err, response) {
                if (err)
                  console.log('error:', err);
                else
                console.log(JSON.stringify(response, null, 2));
            //res.render(path.join(__dirname, 'views')+'/dashboard',{sentiment :response.sentiment});
            res.render(path.join(__dirname, 'views')+'/dashboard',{response :response,uname:reqData.query.uname,pass:reqData.query.psw});
              });

            }else{
              res.render(path.join(__dirname, 'views')+'/dashboard',{response :'',uname:reqData.query.uname,pass:reqData.query.psw});
            }
        //if end   
  
          });
        
          });


/*
          app.post('/dashboard',function(req,res){
            console.log('inside dashborad post'+req);
            customerDB.getCustFeedback('Nikesh Chatur',function(err, policylist){
              //console.log('policylist[0].feedback'+policylist[0].feedback);
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
    
    nlu.analyze(parameters, function(err, response) {
      if (err)
        console.log('error:', err);
      else
      
  //res.render(path.join(__dirname, 'views')+'/dashboard',{sentiment :response.sentiment});
  res.render(path.join(__dirname, 'views')+'/dashboard',{response :response});
    });
    
            });
            
           
              
            
             
            }); */

      // Endpoint to be call from the client side
app.post('/api/message', function(req, res) {

  
  var workspace =  'a6bdda20-ae18-47a1-aa9b-31afddb7c84d';

 
 
  var payload = {
    workspace_id: workspace,
    input:  req.body.input || {},
    context:context
  };
  var input=payload.input.text;
  if(input==null && input==''){
    input="first call";
  }

  var jsoninput = { "text": input };
  console.log('input--->'+jsoninput);

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
toneAnalyzer.tone(params, function(error, response) 
        {
         var toneAngerScore='';
        // There's an error.
        if (error)
                {
                console.log('Error:', error);
                }
        // No error, we got our tone result.
        else
                {
                // The tone of the text, as determined by watson.
                var tone = JSON.stringify(response, null, 2)
                
                // Output Watson's tone analysis to the console.
                console.log("The tone analysis for \'" + input + "\' is:\n");
                console.log(response.document_tone);
                const len =response.document_tone.tones.length;
                console.log("len"+len);
       
      //var catgry=tone.document_tone.tone_categories;
     // console.log('catgry = ', catgry);
     // const emotionTones = catgry.tones;
     // console.log('emotionTones = ', emotionTones);
     // if(emotionTones!=null && emotionTones!=''){
      //  toneAngerScore = emotionTones.tone_id;
      //  const len = emotionTones.length;
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
   if(toneAngerScore =='anger')
    payload.context['tone_anger_score'] = toneAngerScore;
  //  console.log('payload.context ', payload.context);
    // Original code added here
    if(context.feedback!=null && (context.feedback=='yes' || context.feedback=='Yes')){
      customerDB.createFeedback(payload.input.text,context.personname);
      console.log('context.personname'+context.personname);
      if(toneAngerScore=='anger'){
        context={};
        return res.json("Please wait while we are transferring your request to the helpdesk team.");
      }else  return res.json("Thanks for your feedback.Good Bye");
     // res.render(path.join(__dirname, 'views')+'/application',{username :context.personname});
      context={};
  
    }else{
    // Send the input to the assistant service
    service.message(payload, function(err, data) {
      if (err) {
        return res.status(err.code || 500).json(err);
      }
     console.log('data.context.tone_anger_score'+data.context.tone_anger_score);
      if(data.context.policycode!=null && data.context.termsandconditions==null && context.policycode==null &&
        toneAngerScore!='anger'){
         
        context=data.context;
        
       customerDB.calcPremium(data.context,function(err, policylist){
        context.emi=policylist.emi;
        var str="PolicyCode: "+ policylist.policycode + "  EMI: "+ policylist.emi ;
        //console.log("str"+str);
        
          data.output.text.push(str); 
          str="   Terms and Conditions: "+policylist.termdesc;
          
          data.output.text.push(str);
  
          str="Please type Accept/Reject?"
          console.log("policylist"+policylist.policycode);
          data.output.text.push(str);
  
          return res.json(data.output.text);
          
         // updateChat(robot, policylist[r]);
        } ); 
        //console.log("str..policycode"+str.policycode);
       // data.output.text.push(str);
      
      }else if (data.context.termsandconditions==null && context.policycode!=null &&
        toneAngerScore!='anger'){
        context=data.context;
        
        customerDB.calcPremium(data.context,function(err, policylist){
         context.emi=policylist.emi;
         
         var str="PolicyCode: "+ policylist.policycode + "  EMI: "+ policylist.emi ;
         //console.log("str"+str);
         
           data.output.text.push(str); 
           str="   Terms and Conditions: "+policylist.termdesc;
           
           data.output.text.push(str);
   
           str="Please  Accept/Reject?"
           console.log("policylist"+policylist.policycode);
           data.output.text.push(str);
   
           return res.json(data.output.text);
           
          // updateChat(robot, policylist[r]);
         } );
  
      }
      
      else {
      
      if(context.termsandconditions==null && data.context.termsandconditions!=null && 
        ['Accept', 'accept', 'yes', 'ok','Y','y','Yes'].indexOf(data.context.termsandconditions) >= 0 &&
        toneAngerScore!='anger'){
          context=data.context;
        customerDB.insertCustomerRec(context,function(err, policynum){
     
          var str="Please find your Insurance number";
  
          data.output.text.push(str);
  
           str="policynum: "+ policynum  ;
          //console.log("str"+str);
          
            data.output.text.push(str); 
            
            str="Would you like to give us feedback (Yes/No) "  ;
           
           data.output.text.push(str); 
            return res.json(data.output.text);
            
           // updateChat(robot, policylist[r]);
          } ); 
  
      }else{
        if(data.context.feedback!=null && (data.context.feedback=='no' || data.context.feedback=='No') ){
          context={};
          
          return res.json("GoodBye");
        }else{
          context=data.context;
          return res.json(data.output.text);
        }
        
      }
      
      }
     
     
    });
    }

    // Original code ended here
   
  });
/*
  if(context.feedback!=null && (context.feedback=='yes' || context.feedback=='Yes')){
    customerDB.createFeedback(payload.input.text,context.personname);
    console.log('context.personname'+context.personname);
    return res.json("Thanks for your feedback.Good Bye");
   // res.render(path.join(__dirname, 'views')+'/application',{username :context.personname});
    context={};

  }else{
  // Send the input to the assistant service
  service.message(payload, function(err, data) {
    if (err) {
      return res.status(err.code || 500).json(err);
    }
   console.log('data.context.policycode'+data.context.policycode);
    if(data.context.policycode!=null && data.context.termsandconditions==null && context.policycode==null ){
       
      context=data.context;
      
     customerDB.calcPremium(data.context,function(err, policylist){
      context.emi=policylist.emi;
      var str="PolicyCode: "+ policylist.policycode + "  EMI: "+ policylist.emi ;
      //console.log("str"+str);
      
        data.output.text.push(str); 
        str="   Terms and Conditions: "+policylist.termdesc;
        
        data.output.text.push(str);

        str="Please type Accept/Reject?"
        console.log("policylist"+policylist.policycode);
        data.output.text.push(str);

        return res.json(data.output.text);
        
       // updateChat(robot, policylist[r]);
      } ); 
      //console.log("str..policycode"+str.policycode);
     // data.output.text.push(str);
    
    }else if (data.context.termsandconditions==null && context.policycode!=null){
      context=data.context;
      
      customerDB.calcPremium(data.context,function(err, policylist){
       context.emi=policylist.emi;
       
       var str="PolicyCode: "+ policylist.policycode + "  EMI: "+ policylist.emi ;
       //console.log("str"+str);
       
         data.output.text.push(str); 
         str="   Terms and Conditions: "+policylist.termdesc;
         
         data.output.text.push(str);
 
         str="Please  Accept/Reject?"
         console.log("policylist"+policylist.policycode);
         data.output.text.push(str);
 
         return res.json(data.output.text);
         
        // updateChat(robot, policylist[r]);
       } );

    }
    
    else {
    
    if(context.termsandconditions==null && data.context.termsandconditions!=null && 
      ['Accept', 'accept', 'yes', 'ok','Y','y','Yes'].indexOf(data.context.termsandconditions) >= 0){
        context=data.context;
      customerDB.insertCustomerRec(context,function(err, policynum){
   
        var str="Please find your Insurance number";

        data.output.text.push(str);

         str="policynum: "+ policynum  ;
        //console.log("str"+str);
        
          data.output.text.push(str); 
          
          str="Would you like to give us feedback (Yes/No) "  ;
         
         data.output.text.push(str); 
          return res.json(data.output.text);
          
         // updateChat(robot, policylist[r]);
        } ); 

    }else{
      if(data.context.feedback!=null && (data.context.feedback=='no' || data.context.feedback=='No') ){
        context={};
        
        return res.json("GoodBye");
      }else{
        context=data.context;
        return res.json(data.output.text);
      }
      
    }
    
    }
   
   
  });
  }
 */
});
    
app.get('/api/db', function(req, res) {

  var age =context.age.toString();  
  customerDB.getPolicies(age,function(err, policylist){
    console.log("We  have policy for"+policylist);
    var str=new Array();
    if (policylist!='' && policylist!="" )
    {
      console.log("var r in policylist");
      for(var r in policylist) {
        var policy="";
        policy="policycode:   "+policylist[r].policycode + "  sumassured:  "+policylist[r].sumassured+"  accidentcover "+
        policylist[r].accidentcover+"  tenure:  "+policylist[r].tenure;
   
        str.push(policy);
       
     } 
    }else{
      context={};
      console.log("Sorry,We don't have policy for");
      str.push("Sorry,We don't have policy for age group you mentioned   "+context.age);
    }
   

  return res.json(str);
        
});

   
  }); 


      app.listen(process.env.VCAP_APP_PORT || 3000, function() {
        context={};
        console.log('Server running on port: %d', 3000);
      });