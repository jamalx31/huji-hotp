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

var storage = chrome.storage.sync;

//clear the user information
function forget() {
	storage.clear();
	showMessage(["#optMess"],"Your Data has been cleared.","blue",4000);
}

//set the user login for auto-login
function setLogin() {
	var login = $("#login").val();
	if(login.length == 0) {
		showMessage(["#optMess"],"Insert a valid value!","red");
	} else {
		storage.set({'login':login},function(){});
		showMessage(["#optMess"],"Your login has been updated.","blue",4000);
	}
}


//auto-login
function autoLogin(otp) {
  storage.get('login',function(login) {
		chrome.tabs.getSelected(null, function(tab) {
	    	if(login != undefined) {
			    chrome.tabs.executeScript(tab.id, {
					code: "document.getElementById(\"username\").value = \""+login+"\";"
				});
			
				chrome.tabs.executeScript(tab.id, {
					code: "document.getElementById(\"password\").value = \""+otp+"\";\
							document.getElementById(\"login\").submit();"
				});
			}
		});
  });
} 

//print the given 'message' in the div element 'pos'
function showMessage(pos,message,textColor,timeOut){
  for (var i = 0; i < pos.length; i++) {
	  $(pos[i]).html(message).css({color:((textColor == undefined) ? "blue" : textColor)});
    if(timeOut != undefined) {
      (function(i) {
	      setTimeout(function () {$(pos[i]).empty();},(timeOut));
      })(i);
    }
  }
}

function ajaxLogin() {
  storage.get(['login','myKey','counter','digits'],function(r){ 
    pin = $("#pin").val();
    if (pin != undefined && pin.length != 0 && localStorage.loggedin == 0) {
      var xhrLogin = new XMLHttpRequest();
      var url = localStorage.moodleURL + "/login/index.php";
      xhrLogin.open("POST", url, false);
      xhrLogin.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      xhrLogin.timeout = 5000;
      xhrLogin.ontimeout = function () { alert("Timed out, can't login'"); }
      xhrLogin.send("username=" + r.login + "&password=" + getOtp(pin, r.myKey, r.counter, r.digits));
    }
  });
}

function checkLogin() {
  localStorage.loggedin = 0;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", localStorage.moodleURL, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var page = xhr.responseXML;
      var loginform = $(page).find('.loginform');
      if (loginform.length == 0) {
        localStorage.loggedin = 1;
      }
    }
  }
  xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xhr.responseType = "document";
  xhr.send();
  
}

function getPageHTML() {
  var xhr = new XMLHttpRequest();
  var url = localStorage.moodleURL;
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var page = xhr.responseXML;
      var coursesList = page.getElementById("inst38");
      var loginform = $(page).find('.loginform');
      if (coursesList && loginform.length == 0) {
        getCoursesList(page);
        showMessage(["#optMess","#welMess"],"Your courses list has been updated.","blue", 4000);
        logout($(page).find('.loginlogout')[0].parentElement.href);
      } else {
        showMessage(["#welMess"],"Faild to get courses list, reEnter your PIN in the options page.","red");
        showMessage(["#optMess"],"Faild to get your courses list, check your PIN or try again later.","red");
      }
    }
  }
  xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xhr.responseType = "document";
  xhr.send();
}

function logout(logoutLink) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", logoutLink, true);
  xhr.send();
}

//internet needed
function refreshCoursesList(_Login) {
  var pin = $("#pin").val();
  var login = $("#login").val();
  if (!isNaN(pin) && pin.length == 5 && _login != undefined) {
    if (!navigator.onLine) {
      showMessage(["#welMess","#optMess"],"No internet connection.","red");
      return false;
    }
    showMessage(["#optMess","#welMess"],"Updating ...","blue");
    ajaxLogin();
    getPageHTML();
    return true;
  } else if (login.length == 0 && pin.length != 0 && !_login) {
    showMessage(["#welMess","#optMess"],"Set your login first.","red");
    return false;
  } else if (pin.length != 0 && !_login) {
    showMessage(["#welMess","#optMess"],"Set your login first.","red");
    return false;
  } else if (pin.length == 0) {
    showMessage(["#optMess"],"Insert a valid PIN, 5-digits!","red");
    return true;
  } else {
    showMessage(["#optMess","#welMess"],"sert a valid PIN, 5-digits!","red");
    return false;
  }
}

function getCoursesList(page) {
  var courses = {}
  var coursesList = $(page).find('li').filter(function() { return /r(0|1)/.test(this.className);}); 
  for (var i = 0; i < coursesList.length - 1; i++) {
    courseName = coursesList[i].children[1].children[0].innerHTML;
    courses[courseName] = coursesList[i].children[1].children[0].href;
  }
  storage.set({'coursesList':JSON.stringify(courses)},function(){});
}

//set the configration settings
function config(){
	var act = $("#activationCode").val();
  var noError = 1;
  if (!navigator.onLine) {
    showMessage(["#welMess","#optMess"],"No internet connection.","red");
    return 0;
  } else if(isNaN(act) || act.length == 0){
		showMessage(["#optMess","#welMess"],"Invalid activation code, try again.","red");
		return 0;
	}
	var xhr = new XMLHttpRequest();
	var url="http://shotp.cs.huji.ac.il/activate/" + act;
	xhr.open("GET", url, false);
	xhr.onreadystatechange = function() {
 		if (xhr.readyState == 4 && xhr.status == 200) {
			var lines = xhr.responseText.split('\n');
			for (var i = 0; i < lines.length; i++){
				var data = lines[i].split(': ');
				switch(data[0].toString()){
          case "HOTP-Install-Notify":
            var notfLink = data[1];
            break;
					case "HOTP-Key":
						var myKey = clearHex(data[1]);
						break;
					case "HOTP-Counter":
						var counter = clearHex(data[1]);
						break;
					case "HOTP-Digits":
						var digits = data[1];
						break;
        }
      }
      configured = 1;
      storage.set({'configured':configured,'counter':counter,'digits':digits,'myKey':myKey},function(){});
      var xhrNotf = new XMLHttpRequest();
      url = notfLink;
      xhrNotf.open("GET", url, true);
      xhrNotf.send();
      // for options
      showMessage(["#optMess"], "Your Pin has been replaced.","blue",4000);
      check();
    } else {
     showMessage(["#optMess","#welMess"],"Invalid activation code, try again.","red"); //TODO check
     noError = 0;
	  }
  }
	xhr.send();
  return noError;
}
