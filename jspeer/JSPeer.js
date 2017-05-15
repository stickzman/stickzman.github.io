var conn;
var call;

var peer = new Peer({key: 'pz37ds8uryrjm7vi', "secure": true, "debug": 3});

peer.on('open', function(id) {
  console.log('My peer ID is: ' + id);
});