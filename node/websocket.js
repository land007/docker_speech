(function() {
  "use strict";
  const sdk = require("microsoft-cognitiveservices-speech-sdk");
  const fs = require("fs");
  const WebSocket = require('ws');
  const http = require('http');
  const url = require("url");
  const path = require("path");
  const normalize = path.normalize;
  const join = path.join
  const sep = path.sep;
  //const https = require('https');
  const wav = require('wav');
  var subscriptionKey = process.env['SUBSCRIPTION_KEY'] || "6e83631f53fb4a07b0cde7cf8fab0b26";
  var serviceRegion = process.env['SERVICE_REGION'] || "westus"; // e.g., "westus"
  var filename = "YourAudioFile.wav"; // 16000 Hz, Mono
//  var pushStream = sdk.AudioInputStream.createPushStream();
//  console.log(pushStream.write.toString());
//  fs.createReadStream(filename).on('data', function(arrayBuffer) {
//    pushStream.write(arrayBuffer.slice());
//  }).on('end', function() {
////    pushStream.close();
//  });
  var root = __dirname + sep + 'static';
  var http_server = function(req, res) {
	//  var pathname = __dirname + url.parse(req.url).pathname;
		var pathname = url.parse(req.url).pathname;
		if(pathname == '/test.json') {
			var obj = {code: 200, msg: 'ok'};
			res.writeHead(200, {
				"Content-Type" : "text/javascript",
				"Cache-Control" : "no-store, no-cache, must-revalidate",
				"Pragma" : "no-cache",
				"Access-Control-Allow-Origin" : "*",
				"Access-Control-Allow-Headers" : "Content-Type,Content-Length, Authorization, Accept,X-Requested-With",
				"Access-Control-Allow-Methods" : "PUT,POST,GET,DELETE,OPTIONS",
			});
			res.end(JSON.stringify(obj));
			return;
		}
		var pathfile = normalize(join(root, pathname));
	    root = normalize(root + sep);
	    // malicious path
	    if ((pathfile + sep).substr(0, root.length) !== root) {
	    	console.error('malicious path "' + pathfile + '"');
	    	res.writeHead(403);
	    	res.end('malicious path "' + pathfile + '"\n');
	    	return;
	    }
		if (path.extname(pathfile) == "") {
			if(pathfile.endsWith('\\')) {
				pathfile += "index.html";
			}
		}
//		path.exists(pathfile, function(exists) {
//			if (exists) {
		fs.stat(pathfile, function(stat_error, stat) {
			if (!stat_error && stat.isFile()) {
				switch (path.extname(pathfile)) {
				case ".html":
					res.writeHead(200, {
						"Content-Type" : "text/html",
						"Cache-Control" : "no-store, no-cache, must-revalidate",
						"Pragma" : "no-cache"
					});
					break;
				case ".js":
					res.writeHead(200, {
						"Content-Type" : "text/javascript",
						"Cache-Control" : "no-store, no-cache, must-revalidate",
						"Pragma" : "no-cache"
					});
					break;
				case ".json":
					res.writeHead(200, {
						"Content-Type" : "application/json",
						"Cache-Control" : "no-store, no-cache, must-revalidate",
						"Pragma" : "no-cache",
						"Access-Control-Allow-Origin" : "*",
						"Access-Control-Allow-Headers" : "Content-Type,Content-Length, Authorization, Accept,X-Requested-With",
						"Access-Control-Allow-Methods" : "PUT,POST,GET,DELETE,OPTIONS",
					});
					break;
				case ".css":
					res.writeHead(200, {
						"Content-Type" : "text/css",
						"Cache-Control" : "no-store, no-cache, must-revalidate",
						"Pragma" : "no-cache"
					});
					break;
				case ".gif":
					res.writeHead(200, {
						"Content-Type" : "image/gif",
						"Cache-Control" : "no-store, no-cache, must-revalidate",
						"Pragma" : "no-cache"
					});
					break;
				case ".jpg":
					res.writeHead(200, {
						"Content-Type" : "image/jpeg",
						"Cache-Control" : "no-store, no-cache, must-revalidate",
						"Pragma" : "no-cache"
					});
					break;
				case ".png":
					res.writeHead(200, {
						"Content-Type" : "image/png",
						"Cache-Control" : "no-store, no-cache, must-revalidate",
						"Pragma" : "no-cache"
					});
					break;
				default:
					res.writeHead(200, {
						"Content-Type" : "application/octet-stream",
						"Cache-Control" : "no-store, no-cache, must-revalidate",
						"Pragma" : "no-cache"
					});
				}
				fs.readFile(pathfile, function(err, data) {
					res.end(data);
				});
			} else {
				res.writeHead(404, {
					"Content-Type" : "text/html",
					"Cache-Control" : "no-store, no-cache, must-revalidate",
					"Pragma" : "no-cache"
				});
				res.end("<h1>404 Not Found</h1>");
			}
		});
	};
  const server = http.createServer(http_server);
//  const wss = new WebSocket.Server({ port: 80 });
  const wss = new WebSocket.Server({ server });
  var toBuffer = function (ab) {
	    var buf = new Buffer(ab.byteLength);
	    var view = new Uint8Array(ab);
	    for (var i = 0; i < buf.length; ++i) {
	        buf[i] = view[i];
	    }
	    return buf;
	}
  var jq = function(buff) {
		return buff.slice(buff.indexOf('\n') + 1, buff.length);
	};
  let i = 0;
  var myFilePath = __dirname + '/test.wav';
  var data = new Buffer(0);
  var fileWriter = new wav.FileWriter(myFilePath, {
	    channels: 1,
	    sampleRate: 16000,
	    bitDepth: 16
	  });
  var send_startmsg = true;
  wss.on('connection', function connection(ws) {
	  let requestid = '';
	  console.log("Now recognizing from: " + filename);
	  let pushStream = sdk.AudioInputStream.createPushStream();
	  let audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
	//  console.log(audioConfig);
	  let speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
	  speechConfig.speechRecognitionLanguage = "zh-CN";
	//  console.log(speechConfig);
	  let recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
	  recognizer.recognized = (r, event) => {
	    console.log(event);
	    console.log(event.privResult.SpeechRecognitionResult);
	    if(event.privResult.privText) {
			let phrase = 'X-RequestId:' + requestid + '\r\n\
Path:speech.phrase\r\n\
Content-Type:application/json; charset=utf-8\r\n\
\r\n\
' + event.privResult.privJson;
//{"Id":"426f641361e749518ce5a7c81c156e2e","RecognitionStatus":"Success","DisplayText":"' + event.privResult.privText + '","Offset":' + event.privResult.privOffset + ',"Duration":' + event.privResult.privDuration + '}';
		    console.log('----------------------------phrase------------------------------');
		    console.log(phrase);
		    console.log('----------------------------------------------------------');
		    if(ws)
		    ws.send(phrase);
		    let endDetected = 'X-RequestId:' + requestid + '\r\n\
Path:speech.endDetected\r\n\
Content-Type:application/json; charset=utf-8\r\n\
\r\n\
{"Offset":' + event.privResult.privOffset + '}';
		    console.log('----------------------------endDetected------------------------------');
		    console.log(endDetected);
		    console.log('----------------------------------------------------------');
		    if(ws)
		    ws.send(endDetected);
		    send_startmsg = true;
		}
	  };
	  recognizer.recognizing = (r, event) => {
	    console.log(event);
	    console.log(event.privResult.SpeechRecognitionResult);
	    if(event.privResult.privText) {
	    	if(send_startmsg) {
		    	send_startmsg = false;
		    	let startmsg = 'X-RequestId:' + requestid + '\r\n\
Path:speech.startDetected\r\n\
Content-Type:application/json; charset=utf-8\r\n\
\r\n\
{"Offset":' + event.privResult.privOffset + '}';
			    console.log('----------------------------startmsg------------------------------');
			    console.log(startmsg);
			    console.log('----------------------------------------------------------');
			    if(ws)
		    	ws.send(startmsg);
	    	}
	    	let hypothesis = 'X-RequestId:' + requestid + '\r\n\
Path:speech.hypothesis\r\n\
Content-Type:application/json; charset=utf-8\r\n\
\r\n\
' + event.privResult.privJson;
//{"Id":"' + event.privResult.privResultId + '","Text":"' + event.privResult.privText + '","Offset":' + event.privResult.privOffset + ',"Duration":' + event.privResult.privDuration + '}';
		    console.log('---------------------------hypothesis-------------------------------');
		    console.log(hypothesis);
		    console.log('----------------------------------------------------------');
		    if(ws)
		    ws.send(hypothesis);
		}
	  };
	  recognizer.startContinuousRecognitionAsync();
    ws.on('message', function incoming(message) {
//    	let base64data = message.toString('base64');
//    	console.log(base64data);
//      console.log(message);
//        console.log('message', message.length);
      if(message.length == 4197) {// || message.length == 172
//    	  if(i == 11) {
//        	  fs.writeFile(myFilePath, message, {flag: 'a'}, function (err) {
//	       		   if(err) {
//	       		    console.error(err);
//	       		    } else {
//	       		       console.log('写入成功');
//	       		    }
//	       		});
//    	  }
          message = jq(message);//替代品 https://recordrtc.org/
          message = jq(message);//方法 https://stackoverflow.com/questions/34319617/recording-binary-stream-to-wav-file-over-websocket-with-ssl
          message = jq(message);
//          data = Buffer.concat([data, message], data.length + message.length);
          if(pushStream) {
              pushStream.write(message);
          }
          
          //test
//          let header = 'cpath: audio\r\n\
//x-requestid: ' + requestid + '\r\n\
//x-timestamp: 2020-03-19T01:18:23.188Z\r\n\
//';
          let header = 'X-RequestId:' + requestid + '\r\n\
Path:audio\r\n\
Content-Type:audio/x-wav\r\n\
\r\n\
';
          let header_buffer = Buffer.from(header);
          let index_buffer = new ArrayBuffer(2);
          let view = new DataView(index_buffer, 0, 2);
          view.setInt16(0, header_buffer.byteLength);
          let audo = Buffer.concat([toBuffer(index_buffer), header_buffer, message]);
//          if(ws)
//          ws.send(audo);
      } else if(message.length == 144) {
    	  console.log('==============================================================');
    	  let index = message.indexOf('x-requestid: ') + 'x-requestid: '.length;
    	  console.log('index =', index);
    	  requestid = message.substring(index, index + '3864B344DCB74B80976843C098130683'.length);
    	  console.log('requestid =', requestid);
    	  let inimsg = 'X-RequestId:' + requestid + '\r\n\
Path:turn.start\r\n\
Content-Type:application/json; charset=utf-8\r\n\
\r\n\
{\r\n\
  "context": {\r\n\
    "serviceTag": "4eb371467e9b4bb1923c7ed2974efb86"\r\n\
  }\r\n\
}';
    	  if(ws)
    	  ws.send(inimsg);
      } else {
    	  console.log('《', message, "》");
      }
//      console.log('received: %s', i);
      i++
    });
    ws.on('close', function() {
    	pushStream.close();
    	pushStream = undefined;
    	recognizer.close();
        recognizer = undefined;
//        ws.close();
        ws = undefined;
//        fileWriter.write(data);
//        fileWriter.end();
      });
    ws.on('error', () => console.log('error'));
  });
  server.listen(80);
  console.log('server started. static dir is ' + root + '. open the url http://127.0.0.1');
}());
  