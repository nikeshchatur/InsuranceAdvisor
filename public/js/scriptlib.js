$(document).ready(function(){
    $("#dash").click(function(){
        $("#login").slideDown();
    });
	
	$("#close").click(function(){
        $("#login").slideUp();
    });
});

function validate(uname,pass){
	if(uname==="admin"){
		if(pass==="admin123")
			return true;
		else{
			alert("Password is incorrect");
			return false;
		}
	}
	else{
		alert("Username is incorrect");
		return false;
	}
}