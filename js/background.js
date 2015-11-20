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
var moodleURL = "http://moodle.cs.huji.ac.il";
getMoodleURL();

storage.get(null,function(data) {

  install_notice();
  
  function install_notice() {
    if (localStorage.installed != 1 && data.installed != 1) {
      storage.set({'installed':1,'showUpdate':0},function() {});
      chrome.tabs.create({url: "welcome.html"});
    }
  }
  
  storage.get('showUpdate',function(r) {
    if(r.showUpdate != 0) {
      chrome.tabs.create({url:"update.html"});
      chrome.storage.sync.set({'configured':localStorage.configured,'counter':localStorage.counter,'coursesList':localStorage.coursesList,
                'digits':localStorage.digits,'installed':localStorage.installed,'login':localStorage.login,
                'myKey':localStorage.myKey,'showUpdate':0},function() {});
    }
  });
});



function getMoodleURL() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", moodleURL, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var page = xhr.responseXML;
      localStorage.moodleURL = page.getElementById('inst33').children[0].children[2].href;
    }
  }
  xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xhr.responseType = "document";
  xhr.send();
}

