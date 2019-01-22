var net = require('net');
var fs = require('fs')
var password = 'go!bears1984';
var username = 'jkriebtrich';
var client = new net.Socket();
var successes = 0;
var responses = 0;

console.log("testing username " + username + " password " + password);
client.connect(6675, 'ec2-52-90-98-19.compute-1.amazonaws.com', function() {
  console.log('Connected');
  fs.readFile('wordlist.txt','utf8',function(err, data) {
    if (err) throw err;
    var test = data.split('\n');
    for (i=0;i<256;i++){
      if(true){
          setTimeout(function(){
            try{
              //const buf6 = Buffer.from('00060014044b','hex');//03f8
              console.log('i: ' + i)
              console.log(Buffer.from('00060005' + '03'+ i.toString(16),'hex'));
              client.write(Buffer.from('00060005' + '03'+ i.toString(16),'hex'));// 4 balance 5 holdings
              //console.log(Buffer.from('0020'+ '0030' + '2e2f2e2f2e2f2e2f2e2f2e2f2e2f2e2f2e2f2e2f2e2f2e2f2e2f2e2f','hex'));
              //client.write(Buffer.from('0020'+ '0030' +'2e2f2e2f2e2f2e2f2e2f2e2f2e2f2e2f2e2f2e2f2e2f2e2f2e2f2e2f','hex'));
            }catch(e){};
            i--;
          },i*100);
      };
    };
  });

});

var i;
for (i = 65; i < 91;i++) {
  //console.log(String.fromCharCode(i));
}
for (i = 97; i < 123;i++) {
  //console.log(String.fromCharCode(i));
}


//buf1 is the username/password string
//first 2 bytes length, followed by 00 03
//next 2 bytes username lenth, followed by username
//next 2 bytes password length, followed by password
//console.log(buf1.toString('hex'));
//const buf1 = Buffer.from('001f0003000b6a6b726965627472696368000c676f21626561727331393834', 'hex');
//console.log(buf1.toString('hex'));
//buf2 is the authentication response to username/password
const buf2 = Buffer.from('0006ff0303f2', 'hex');
//buf3 is the response to the timestamp, text string, looks like a menu
const buf3 = Buffer.from('0058ff0200050008686f6c64696e67730006000473656c6c0001000568656c6c6f000700036275790002000c6361706162696c6974696573000300056c6f67696e001400086163636f756e74730004000762616c616e6365', 'hex');
//buf4 is the response to the long response to the timestamp
//buf4 is balance inquiry
const buf4 = Buffer.from('0006000403f2','hex');
//buf5 is the response to buf4 //the last 4 bytes are the number of dollars we have
const buf5 = Buffer.from('0008ff040000c350','hex');
//buf6 is get account info command
const buf6 = Buffer.from('0006000503f2','hex');
//1 hello(reset) 2 capabilities 3 logi 4 balance 5 holding 6 sell 7 buy 14 accounts
//const buf6 = Buffer.from('0006000103f2','hex');//will reset stock account
//const buf6 = Buffer.from('0010000703f200044142435d0000000a','hex');//buy order
//ticker is preceded by 0003, then 3 bytes of name
//2 byte number of stock, 00 03, 3 byte name of stock
const buf7 = Buffer.from('0027ff05001a0003444f430008000359554a001d0003485857000e0003535451000b00034f494a','hex');

//"malformed"
const buf22 = '000dffff6d616c666f726d6564'
//"unsupported command"
const buf23 = '0017ffff756e737570706f7274656420636f6d6d616e64'
//"no such user"
const buf24 = '0010ffff6e6f20737563682075736572'
//"authentication failed"(wrong password)
const buf25 = '0019ffff61757468656e7469636174696f6e206661696c6564'





client.on('data', function(data) {
  //esponses++;
  console.log('Received data: ' + data);
  console.log('Hex: ' + data.toString('hex'));
  //console.log('successes: ' + successes);
  //console.log('responses: ' + responses)
  if(data.toString('hex') == buf24.toString('hex')){
    console.log("no such user");
  }
  if(data.toString('hex') == buf25.toString('hex')){
  //  successes++;
    console.log("wrong password");
  }
  if(data.toString('hex') == buf2.toString('hex')){
    console.log('authentication response received, sending timestamp');
    client.write(Buffer.from('000' + parseInt(2251808403619840 + Math.floor((Date.now()/1000))).toString(16), 'hex'));
  }
  if(data.toString('hex') == buf3.toString('hex')){
    console.log('response 4');
    client.write(buf4);
  }//console.log(buf5.toString('hex',0,6));
  if(data.toString('hex',2,4) == Buffer.from('ff04','hex').toString('hex')){
    console.log('balance: ' + parseInt(data.toString('hex',6,8),16));
    //console.log(data.toString('hex',6,8));
    console.log('response 5')
    client.write(buf6);
  }
  if(data.toString('hex',2,4) == Buffer.from('ff05','hex').toString('hex')){
    //first 2 bytes are message length
    //next 2 bytes are ff 05 (holdings response)
    //next 2 bytes are number of stock
    //next 2 bytes are length of name
    //next bytes are the name of the stock
    //then number of stock again for next stock
    var message_length = parseInt(data.toString('hex',0,2),16);
    //console.log("message length: " + message_length);
    var i;
    //var location = data.indexOf('0003','hex');
    for (i = 4; i < message_length;) {
      //console.log(location);
      //console.log(data.toString('hex',i,i+2));
      var num_stock = parseInt(data.readIntBE(i,2));
      console.log("number of stock: " + num_stock);
      //console.log(data.toString('hex',i+2,i+4));
      name_length = parseInt(data.toString('hex',i+2,i+4),16);
      //console.log("name length: " + name_length);
      console.log(data.toString('utf8',i+4,i+4+name_length));
      //console.log(data.toString('hex',location+2,next_location-2));
      i = i + 4 + name_length;
    }
  }
  if(data.toString('hex',2,4) == Buffer.from('ff20','hex').toString('hex')){



  }

  //parseInt(2251808403619840 + Math.floor((Date.now()/1000)))
  //client.destroy(); // kill client after server's response
});

client.on('close', function() {
  console.log('Connection closed');
});
