var conn, peer, player, vID, seekFunc;
var respondingToPeer, ready = false;
var currTime = -1;

window.onload=setup();

function setup() {
  pID = prompt("Enter a username:").trim();
  peer = new Peer(pID, {key: 'pz37ds8uryrjm7vi', "debug": 2});

  peer.on('error', function (err) {
    if (err.type == 'unavailable-id' || err.type == 'invalid-id') {
      alert("Invalid ID chosen, generating new ID");
      peer = new Peer({key: 'pz37ds8uryrjm7vi', "debug": 2});
      pID = peer.id;

      peer.on('open', function(id) {
        document.getElementById("id").innerHTML = 'My peer ID is: ' + id;
      });

      peer.on('connection', function(c) {initConn(c);});
    }
  });

  peer.on('open', function(id) {
    pID = id;
    document.getElementById("id").innerHTML = 'My peer ID is: ' + id;
  });

  peer.on('connection', function(c) {initConn(c);});
}

function start() {
  document.getElementById("input").value = "";
	var btn = document.getElementById("submit");
  btn.value = "Go";
  btn.onclick = function () {
    loadNewVid(document.getElementById("input").value);
    conn.send("id:"+vID);
    host = true;
  };
}

function connect() {
	var destID = document.getElementById("input").value;
	initConn(peer.connect(destID));
}

function initConn(c) {
	conn = c;

  conn.on('error', function(err) {
    console.log(err);
  });

  conn.on('open', function() {
    alert("Connected to: " + conn.peer);
    start();
  });

  //Handle Received Data
  conn.on('data', function(data) {
    console.log('Received', data);
    if (data.indexOf("id:") != -1) {
        loadNewVid(data.substring(3));
    } else if (data.indexOf("seek:") != -1) {
        clearInterval(seekFunc);
        player.seekTo(data.substring(5));
        currTime = data.substring(5);
        seekFunc = setInterval(checkSeek, 1000);
    } else if (data == "buffering" && player.getPlayerState() == 1) {
        respondingToPeer = true;
        player.pauseVideo();
    } else if (data == "play") {
        if (player.getPlayerState() == 3) {
          conn.send("buffering");
        } else {
          respondingToPeer = true;
        }
        player.playVideo();
    } else if (data == "pause") {
        respondingToPeer = true;
        player.pauseVideo();
    } else if (data == "ready" && ready) {
        player.playVideo();
    }
  });
}

function loadNewVid(url) {
  vID = getVidID(url);
  var tag = document.createElement('script');

  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '480',
    width: '787',
    videoId: vID,
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    },
    enablejsapi: true
  });
}

function onPlayerReady(event) {
  ready = true;
  conn.send("ready");
}

function onPlayerStateChange(event) {
  switch (event.data) {
    case YT.PlayerState.PLAYING:
      if (currTime == -1) {
        seekFunc = setInterval(checkSeek, 1000);
      }
      if (!respondingToPeer) {
        conn.send("play");
      } else {
        respondingToPeer = false;
      }
      break;
    case YT.PlayerState.PAUSED:
      if (!respondingToPeer) {
        conn.send("pause");
      } else {
        respondingToPeer = false;
      }
      break;
    case YT.PlayerState.BUFFERING:
      respondingToPeer = false;
      conn.send("buffering");
      break;
  }
}

function checkSeek() {
  if (player.getPlayerState() == 1) {
    if (currTime == -1) {
      currTime = player.getCurrentTime();
    } else {
      currTime++;
    }
    console.log(currTime);
  }

  if (player.getCurrentTime() > currTime + 1 || player.getCurrentTime() < currTime - 1) {
    currTime = player.getCurrentTime();
    conn.send("seek:" + currTime);
  }
}

function getVidID(url) {
  url = url.trim();
  var begin = url.indexOf("v=") + 2;
  var end = url.indexOf("&", begin);
  if (begin == 1) {
    return url;
  } else if (end == -1) {
    return url.substring(begin);
  } else {
    return url.substring(begin, end);
  }
}
