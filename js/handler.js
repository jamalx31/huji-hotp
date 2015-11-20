/* options.js      HOTP huji implementation
   Copyright (c) 2012 Jamal Mashal
   
	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:
	
	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.   
*/

$(document).ready(function() {
  checkLogin();
	check();
	$("#openWelcome").click(openWelcome);
	$("#help").click(help);
	$("#generate").click(generate);
	$("#regenerate").click(generate);
	$("#forget").click(forget);
	$("#reset").click(config);
	$("#setlogin").click(setLogin);
  $("#refresList").click(refreshList);
  $("#showList").click(showList);
  $("#coursesList").click(ajaxLogin);
});

function refreshList() {
storage.get('login',function(r) {
  refreshCoursesList(r.login); 
});   
}

function checkSetPIN() {
  var pin = $("#pin").val();
  if(!isNaN(pin)) {
		if ($("#remPin").is(':checked')){
			localStorage.remember = 1;
			localStorage.pin = pin;	
		} else {
			localStorage.removeItem("pin");
			localStorage.remember = 0;
		}
    return pin;
	}
  return undefined;
}

//generate the otp
function generate(){
  storage.get(['myKey','counter','digits'],function(r) {
    var pin = checkSetPIN();
  	if(pin){
  		var otp = getOtp(pin, r.myKey, r.counter, r.digits);
  		$("#otp").html(otp);
  		$(".ready").hide();
  		$(".result").show();
      //for auto loing - options.js
      autoLogin(otp);
	  }
  });
}

function showList() {
  checkSetPIN();
  $("#coursesList").delay(100).slideDown();
}


//if it's activated
function check(){
  storage.get(['configured','coursesList'],function(r) { 
  	if(r.configured == 1){
  		$(".init").hide();
  		$(".ready").show();
  		filldata();
      if(r.coursesList != undefined){
         var coursesList = JSON.parse(r.coursesList);
         var htmlStr = "";
         for(var i in coursesList) { 
            htmlStr += "<li><a class=\"courseLink\" href=\""+coursesList[i]+"\" target=\"_blank\">"+i.toLowerCase()+"</a></li>";
         }
         $('#coursesList').html(htmlStr);       
      } else {
        $('#coursesList').html("Update courses list first, from <a href=\"options.html\" target=\"_blank\">options page</a>"); 
      }
  	}
  });
}


//fill the form with the user PIN
function filldata(){
	if(localStorage.remember == 1){
		$("#remPin").attr('checked', true);
		if(localStorage.pin !=null) {
			$("#pin").val(localStorage.pin);
		} 
	}
}

function help() {
	chrome.tabs.create({'url': 'http://wiki.cs.huji.ac.il/wiki/Hotp_chrome'});
}

function openWelcome() {
  chrome.tabs.create({url: "welcome.html"});
}

