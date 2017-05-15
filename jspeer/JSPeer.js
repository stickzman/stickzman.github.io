var conn;
var call;

var peer = new Peer({key: 'pz37ds8uryrjm7vi', "secure": true});

peer.on("open", function(id) {
	document.getElementById("id").innerHTML = 'My peer ID is: ' + id;
});