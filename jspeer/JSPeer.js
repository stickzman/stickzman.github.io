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

var peer = new Peer({key: 'pz37ds8uryrjm7vi', "secure": true});

peer.on("open", function(id) {
	document.getElementById("id").innerHTML = 'My peer ID is: ' + id;
});