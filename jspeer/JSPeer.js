var conn;
var call;

var peer = new Peer({key: 'pz37ds8uryrjm7vi', "secure": false, "debug": 3});

peer.on('open', function(id) {
  document.getElementById("id").innerHTML = 'My peer ID is: ' + id;
});

function connect() {
	conn = peer.connect(document.getElementById("input"));
}

peer.on('connection', function(con) {
	conn = con;
});

conn.on('open', function() {
  // Receive messages
  conn.on('data', function(data) {
    console.log('Received', data);
  });

  // Send messages
  conn.send('Hello!');
});