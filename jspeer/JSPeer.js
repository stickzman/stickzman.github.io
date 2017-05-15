var conn;
var connected = false;

var peer = new Peer({key: 'pz37ds8uryrjm7vi', "debug": 2});

peer.on('open', function(id) {
  document.getElementById("id").innerHTML = 'My peer ID is: ' + id;
});

function connect() {
	var destID = document.getElementById("input").value;
	initConn(peer.connect(destID));
}

peer.on('connection', function(c) {initConn(c);});

function initConn(c) {
	conn = c;
	conn.on('open', function() {
		connected = true;
		
		conn.on('data', function(data) {
			console.log('Received', data);
		});	
	});
	alert("Connected to: " + conn.peer);
}