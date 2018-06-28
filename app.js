var http = require('http');
var url = require('url');
var bodyParser = require('body-parser');
var AssistantV1 = require('watson-developer-cloud/assistant/v1');
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

        app.get('/dashboard',function(req,res){
          var reqData = url.parse(req.url,true,true);
          console.log('inside dashborad get'+reqData.query.fname);
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
            res.render(path.join(__dirname, 'views')+'/dashboard',{response :response});
              });

            }else{
              res.render(path.join(__dirname, 'views')+'/dashboard',{response :''});
            }
        //if end   
  
          });
          
          });



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
            
           
              
            
             
            });

      // Endpoint to be call from the client side
app.post('/api/message', function(req, res) {

  
  var workspace =  'a6bdda20-ae18-47a1-aa9b-31afddb7c84d';

 
 
  var payload = {
    workspace_id: workspace,
    input:  req.body.input || {},
    context:context
  };
  var input=req.body.input || {};
  console.log('input'+payload.input.text);

  var service = new AssistantV1({
    username: '13fef1e1-e8d9-45e6-af36-bd4eeaf25e60', // replace with service username
    password: 'e3kB7U7kJ42N', // replace with service password
    version: '2018-06-24'
  });

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
  /*
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
   
   
  });  */
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


      app.listen(3000, function() {
        console.log('Server running on port: %d', 3000);
      });