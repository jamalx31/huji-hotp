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
	$("#toGetCode").click(showGetCode);
  $("#backWelcomeMessage").click(showWelcomeMessage);
	$("#toActive").click(showActive);
  $("#backToGetCode").click(showGetCode);
  $("#backToActive").click(showActive);
  $("#toLogin").click(showLogin);
  $("#toByebye").click(byebye);
});

function showGetCode() {
  $("#welcomeMessage").slideUp();
  $("#active").slideUp();
	$("#getCode").delay(500).slideDown();
}

function showWelcomeMessage() {
  $("#getCode").slideUp();
	$("#welcomeMessage").delay(500).slideDown();
}


function showActive() {
  $("#getCode").slideUp();
  $("#getLogin").slideUp();
  $("#active").delay(500).slideDown();
}


function showLogin() {
  if(config()) {
    $("#active").slideUp();
    $("#getLogin").delay(500).slideDown();
  } 
}

function byebye() {
  setLogin();
  storage.get('login',function(r) {
    if(refreshCoursesList(r.login)) {
      $("#getLogin").slideUp();
      $("#byebye").delay(500).slideDown();
    }
  });   
}


