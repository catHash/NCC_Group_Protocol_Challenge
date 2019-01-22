var net = require('net');
var username = 'jkriebtrich';
var password = 'go!bears1984';


//buf1 is the username/password string
//first 2 bytes length, followed by 00 03
//next 2 bytes username lenth, followed by username
//next 2 bytes password length, followed by password
const buf1 = ("00"+(username.length + password.length + 8).toString(16)+"0003"+
"000" + (username.length).toString(16) + Buffer.from(username,'ascii').toString('hex') +
"000" + (password.length).toString(16) + Buffer.from(password, 'ascii').toString('hex'));
//console.log(buf1.toString('hex'));
//const buf1 = Buffer.from('001f0003000b6a6b726965627472696368000c676f21626561727331393834', 'hex');
//buf2 is the authentication response to username/password
const buf2 = Buffer.from('0006ff0303f2', 'hex');
//buf3 is the response to the timestamp, text string, looks like a menu
const buf3 = Buffer.from('0058ff0200050008686f6c64696e67730006000473656c6c0001000568656c6c6f000700036275790002000c6361706162696c6974696573000300056c6f67696e001400086163636f756e74730004000762616c616e6365', 'hex');
//buf4 is the response to the long response to the timestamp
//buf4 is balance inquiry
const buf4 = Buffer.from('0006000403f2','hex');
//buf5 is the response to buf4 //the last 4 bytes are the number of dollars we have
const buf5 = Buffer.from('0008ff040000c350','hex');
//buf6 is get holdings command
const buf6 = Buffer.from('0006000503f2','hex');
//00600503f2 get holdings

//1 hello(reset) 2 capabilities 3 logi 4 balance 5 holding 6 sell 7 buy 14 accounts
//00 03 login 00 04 balance 00 05 holdings 00 06 sell 00 07 buy 00 14 accounts
//ff 02 menu ff 03 login success, challenge ff 04 balance ff 05 holdings
//ff 20 accounts??

//2 byte number of stock, 00 03, 3 byte name of stock
//buf7 is holdings
const buf7 = Buffer.from('0027ff05001a0003444f430008000359554a001d0003485857000e0003535451000b00034f494a','hex');
//buf8 is a buy request. name of ticker and amount]
//looks like 00 length of string 00 07 03 f2 00
const buf8 = Buffer.from('0010000703f200044142435d0000000a','hex');
//buy request 000f000703f200034a45520000000a
//buf9 is a sell request, name of ticker and amount
//00 (length ]of string) 00 06 03 f2 00 03 (name) (amount)
const buf9 = Buffer.from('000f000603f200034142430000000a','hex');
//sell request 000f000603f200034a45460000000a
//console.log(buf3.toString('utf8'));
//console.log(buf8.toString('hex',3,6));
//buf10 is the response to a buy. ff 06 buy success and then cost of purchase
const buf10 = Buffer.from('0008ff060000005a','hex');


//console.log(parseInt(Buffer.from('0430000180ba0010','hex').toString('hex'),16));
//04 30 00 01 80 ba 00 10
//first 2 bytes are length


	//console.log(2251809945942998 - 1542323158);
	//console.log(2251809945942988 - 1542323148);
var server = net.createServer(function(socket) {
	//socket.write('\njkriebtrich\ngo!bears1984\n');
	socket.on('data', function (data) {
		//const binData = Buffer.from(data, 'binary');
  	//console.log(buf.toString('hex'));
		//console.log('time: ' + Date.now()/1000);
		console.log('Received Data: ' + data);
		console.log('Recieved Data Hex: ' + data.toString('hex'));
		//console.log('Recieved Data Integer: ' + parseInt(data.toString('hex'),16));
		//console.log('guess sequence number: ' + parseInt(2251808403619840 + Math.floor((Date.now()/1000))));
		//console.log('guess sequence number hex: ' + '000' + parseInt(2251808403619840 + Math.floor((Date.now()/1000))).toString(16));
		//console.log('buf:' + buf.toString('hex'));
		//console.log('buf1:' + buf1.toString('hex'));
		if(data.toString('hex') == buf1.toString('hex')){
			console.log("password recieved, sending challenge");
			socket.write(buf2);
		}
		//console.log(('000' + parseInt(2251808403619838 + Math.floor((Date.now()/1000))).toString(16)));
		//if(data.toString('hex') == ('000' + parseInt(2251808403619838 + Math.floor((Date.now()/1000))).toString(16))){
		if(data.toString('hex',2,4) == Buffer.from('0002','hex').toString('hex')){
			console.log("timestamp/response received, sending capabilities");
			socket.write(buf3);
		}
		if(data.toString('hex') == Buffer.from('0006000403f2','hex').toString('hex')){
	    console.log("command number 4 received, sending balance (50000)");
			socket.write(buf5);
		}
		if(data.toString('hex') == Buffer.from('0006000503f2','hex').toString('hex')){
	    console.log("command number 5 received, sending holdings");
			socket.write(buf7);
		}
		//console.log(data.toString('hex',3,6));
		if(data.toString('hex',3,6) == Buffer.from('0603f2','hex').toString('hex')){
			var name_length = (parseInt(data.toString('hex',0,2),16) - 12);
			var ticker_name = data.toString('utf8',8,8+name_length);
			var number_to_sell = parseInt(data.readIntBE(name_length+8,4));
			console.log("sell request: sell " + number_to_sell + " " + ticker_name);
			//console.log(buf8.toString('hex',3,6));
			socket.write(buf3);
		}
		if(data.toString('hex',3,6) == Buffer.from('0703f2','hex').toString('hex')){
			var name_length = (parseInt(data.toString('hex',0,2),16) - 12);
			var ticker_name = data.toString('utf8',8,8+name_length);
			var number_to_buy = parseInt(data.readIntBE(name_length+8,4));
			console.log("buy request: buy " + number_to_buy + " " + ticker_name);
			//console.log(buf8.toString('hex',3,6));
			socket.write(buf10);
		}
	});
	//socket.pipe(socket);
});

//
//console.log(buf2);
server.listen(6675, '192.168.2.2');
