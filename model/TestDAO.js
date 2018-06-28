var cust = require('./CustomerDAO.js');

//cust.createCust("12357","abcd","bihar","saving");
var userDetails="";
var detail=cust.calcPremium("sd",function(err, policylist){
   
    console.log("result"+policylist);  
   // updateChat(robot, policylist[r]);
  } );
//console.log("result"+detail);