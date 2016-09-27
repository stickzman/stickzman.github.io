var p = navigator.mediaDevices.getUserMedia({ audio: true, video: true });

var myStream;
var otherStream;
var conn;
var call;

p.then(function(mediaStream) {
  var video = document.getElementById("myVid");
  window.stream = mediaStream;
  video.srcObject = mediaStream;
  myStream = mediaStream;
});

p.catch(function(err) { console.log(err.name); });

var peer = new Peer({key: 'lwjd5qra8257b9'});

peer.on("open", function(id) {
	document.getElementById("id").innerHTML = 'My peer ID is: ' + id;
});

peer.on("connection", function(connection) {
	conn = connection;
	console.log("Connected to", conn.peer);
});

peer.on("call", function(receivedCall) {
	call = receivedCall;
	call.answer(myStream);
	call.on("stream", function(mediaStream) {
		otherStream = mediaStream;
		var video = document.getElementById("otherVid");
		video.srcObject = mediaStream;
	});	
});



function connect() {
	var id = document.getElementById("input").value
	conn = peer.connect(id);
	console.log("Connected to", conn.peer);
	call = peer.call(id, myStream);
	call.on("stream", function(mediaStream) {
		otherStream = mediaStream;
		var video = document.getElementById("otherVid");
		video.srcObject = mediaStream;
	});
}