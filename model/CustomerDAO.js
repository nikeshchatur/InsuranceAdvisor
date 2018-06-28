var MongoClient  = require('mongodb').MongoClient;;

//var url = "mongodb://localhost:27017/mydb";
var url = "mongodb://nikesh:nikesh123@ds159840.mlab.com:59840/customerdb";
var detail;
module.exports.createCust = function (custID, custName,branch,acctype) {
  MongoClient.connect(url, function(err, customerdb) {
    if (err) throw err;
    var dbo = customerdb.db("customerdb");
    var myobj = { policycode: "PLC-1002", agelimit: "40" ,sumassured:"50000",accidentcover:"Y",tenure:"15",termdesc:"1. It is any ailment ordisease that a person is already suffering from, at the time of purchasing health insurance.2. Personal Accident Policy is issued as fixed benefit policies whereby specified sums are paid on the occurrence of specified events such as death or disability.3. As the term suggests, the insured can make a claim without paying any cash for the medical assistance at the specified network hospitals 4. Sum assured is the maximum amount payable in the event of a claim. The premium of the health insurance policy is dependent on the  policy chosen by you  5. A policy for a serious, possibly terminal disease, which is strictly defined by the insurer. Most critical illness policies provide for the payment of a lump sum benefit if the policyholder is diagnosed as suffering from  any one of the specified conditions."};
    dbo.collection("Insurance-master").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      customerdb.close(); 
      return ;
    });
  });
  
}

module.exports.createFeedback = function (feedback,name) {
  MongoClient.connect(url, function(err, customerdb) {
    if (err) throw err;
    var dbo = customerdb.db("customerdb");
    var myobj = { feedback: feedback, name: name};
    dbo.collection("Feedback").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      customerdb.close(); 
      return ;
    });
  });
  
}


module.exports.getCustFeedback = function (custName, callback) {
  var custdetails;
MongoClient.connect(url, function(err, customerdb) {
if (err) throw err;
var dbo = customerdb.db("customerdb");
var query = { name: custName };
var array=dbo.collection("Feedback").find(query).toArray(function(err, result) {
  if (err) throw err;
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  customerdb.close();
    detail=result;
  callback(err, result);
      
});

});

}



module.exports.getCustDetail = function (branchName, callback) {
    var custdetails;
MongoClient.connect(url, function(err, customerdb) {
  if (err) throw err;
  var dbo = customerdb.db("customerdb");
  var query = { age: branchName };
  var detail ="";
  //console.log(dbo.collection("customers").find(query).query);
 
  var array=dbo.collection("customers").find(query).toArray(function(err, result) {
    if (err) throw err;
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    customerdb.close();
    //console.log(result);
    detail=result;
    console.log(detail);
    //return result;
    callback(err, result);
        
  });
 console.log(array);
 //custdetails=detail;
 
  //return detail;
});
//console.log(detail);
}

 
module.exports.getPolicies = function (customerAge,callback){
	MongoClient.connect(url, function(err, customerdb) {
    if (err) throw err;
   
  var dbo = customerdb.db("customerdb");
  var query = { agelimit:{$gt:customerAge}};
  
  var array = dbo.collection("Insurance-master").find(query).toArray(function(err,result){
    if(err) throw err;
    console.log('getPolicies'+result);
    
  customerdb.close();

    callback(err, result);
	  //console.log(result);
  });
  
	});
	
} 
 

module.exports.updateCustDetail = function (custID,custName,brnchName) {
MongoClient.connect(url, function(err, customerdb) {
  if (err) throw err;
  var dbo = customerdb.db("customerdb");
  var myquery = { agelimit: "40" };
  var newvalues = { $set: {customerName: custName, BranchName: brnchName } };
  dbo.collection("customers").updateOne(myquery, newvalues, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
    customerdb.close();
  });
});
}

module.exports.deleteCustDetail = function (custID) {

MongoClient.connect(url, function(err, customerdb) {
  if (err) throw err;
  var dbo = customerdb.db("customerdb");
  var myquery = { policycode: "PLC-1003" };
  dbo.collection("Insurance-master").deleteOne(myquery, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    customerdb.close();
  });
});   
}



// Calculate EMI for Premium as per eligibility and chosen policy
module.exports.calcPremium = function (data,callback){
  var emiobj={};
  MongoClient.connect(url, function(err, customerdb) {
  if (err) throw err;
    var dbo = customerdb.db("customerdb");
    var query = { policycode: data.policycode };
    //console.log('data.policycode'+data.policycode);
    //console.log('query'+query);
    var array = dbo.collection("Insurance-master").find(query).toArray(function(err, result) {
      if (err) throw err;
      //console.log(result[0].termdesc);
        
    var addOnCharge = 0;
    if(data.Diseases==="Y")
    addOnCharge+=500;
    //console.log('result[0].sumassured-->'+result[0].sumassured);
    //console.log('result[0].agelimit -->'+result[0].agelimit );

    var perYear= result[0].sumassured / (result[0].agelimit - data.age);
    var emi = (perYear / 12) + addOnCharge;
    //console.log('emi-->'+emi);
  
    emiobj = {"policycode":data.policycode,"emi":emi,"termdesc":result[0].termdesc};
    //console.log('emiobj'+emiobj);
    callback(err,emiobj);

    
      //dbo.close();
    });
      
    customerdb.close();
  });
  return emiobj;
  }
  
  
 // Insert record in customer master after accepting terms
module.exports.insertCustomerRec = function (data,callback){
var policynum="";
MongoClient.connect(url, function(err, customerdb) {
if (err) throw err;
var rn = require('random-number');
var options = {min: 100, max: 999, integer: true};
var dbo = customerdb.db("customerdb");
var polnum = "CUSPLC-"+rn(options);
console.log('data.emi'+data.emi);
var myobj = { name: data.name, age: data.age ,disease: data.disease,policycode:data.policycode,policynumber: polnum,premiumamt:data.emi,familyhistory:data.familyhistory};
    dbo.collection("customers").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      customerdb.close(); 
      
  //policynum = polnum;
  callback(err,polnum);
    });
});
// MongoClient.connect() closed
}


   
  
 function Test(branchName) {
  return "hello world";
 }
//console.log(Test("bihar"));
