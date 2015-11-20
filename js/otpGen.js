/* otpGen.js      HOTP huji implementation
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

//the padding string they use :)
var paddingString = "blablablabla";
//also from them
var truncationOffset = -1;

//pad the given pin with the given string
function padding(pin,str){
	return (pin + str).substring(0,16);
}

//return the hashed key offset
function getOffset(hashedKey,truncationOffset) {
	if (truncationOffset < 0){
		return hashedKey[hashedKey.length-1] & 0xF;
	} else {
		return truncationOffset;
	}
}

//compute the final otp of the given hashed key
function getFinalOTP(hashedKey,startingOffset,digits){
	var fullKey = (hashedKey[startingOffset] & 0x7F) << 24 |
	(hashedKey[startingOffset + 1] & 0xFF) << 16 |
	(hashedKey[startingOffset + 2] & 0xFF) << 8 |
	(hashedKey[startingOffset + 3] & 0xFF);

	var finalKey = fullKey.toString();
	if (finalKey.length > digits)
		finalKey = finalKey.substr(finalKey.length - digits);
	return finalKey;

}

//hash the given key and counter with Hmac-sha1
function hashKey(key,counter){
	var shaObj = new jsSHA(counter, "HEX");
	return hexToByteArray(shaObj.getHMAC(key, "HEX","HEX"));
}


//convert the given string to bytes array
function string2byte(str) {
	var bytes = [];
	for (var i = 0; i < str.length; ++i)
	{
	    bytes.push(str.charCodeAt(i));
	}
	return bytes;
}

//return an otp
function getOtp(pin, myKey, counter, digits){
	var padPin = padding(pin,this.paddingString);
	//decrypte your key (from the jad file) by the AES algorithem with padPin as secret phase 
	var decryptedKey = byteArrayToHex(rijndaelDecrypt(hexToByteArray(myKey), string2byte(padPin), "ECB"));
	//get the hash code of your decrypted key by Hmac-sha1 algorithem
	var hashedKey = hashKey(decryptedKey,counter);
	//compute the final otp
	var otp = getFinalOTP(hashedKey,getOffset(hashedKey,truncationOffset),digits);
  //increase the counter by one
	updateCounter();
  //Done :)
	return otp;
}


//clear the hex string
function clearHex(hex){
	return hex.replace(/0x/,"").replace(/L$/,"");
}

//increment the counter by one
function updateCounter(){
  storage.get('counter',function(r) { 
  	var temp = r.counter.toLowerCase();
  	var i = temp.length -1 ;
  	
  	do {
  		switch(temp[i]){
  			case '9':
  				temp = replaceChar(temp,i,'a');
  				break;
  			case 'a':
  				temp = replaceChar(temp,i,'b');
  				break;
  			case 'b':
  				temp = replaceChar(temp,i,'c');
  				break;
  			case 'c':
  				temp = replaceChar(temp,i,'d');
  				break;
  			case 'd':
  				temp = replaceChar(temp,i,'e');
  				break;
  			case 'e':
  				temp = replaceChar(temp,i,'f');
  				break;
  			case 'f':
  				temp = replaceChar(temp,i,'0');
  				break;
  			default:
  				temp = replaceChar(temp,i,parseInt(temp[i])+1);
  		}
  		i--;
  	} while(i >= 0 && temp[i+1] == '0');
  	
  	if ( i == -1 ) { 
  		temp = 1 + temp;
  	}
  	
  	storage.set({'counter':temp},function() {});
  	
  	//replace char at the given index
  	function replaceChar(str,index, char) {
  		return str.substr(0, index) + char + str.substr(index+1);
  	}
  });
}



