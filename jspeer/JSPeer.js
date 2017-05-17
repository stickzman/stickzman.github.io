var conn, peer, player, vID, blockPlayer;
var respondingToPeer, ready = false;
var first = true;
var currTime = -1;

window.onload=setup();

function setup() {
  pID = prompt("Enter a username:").trim();
  peer = new Peer(pID, {key: 'pz37ds8uryrjm7vi', "debug": 1});

  peer.on('error', function (err) {
    if (err.type == 'invalid-id') {
      alert("Invalid ID chosen");
      setup();
    } else if (err.type == 'unavailable-id') {
      alert("Username already taken");
      setup();
    } else if (err.type == 'peer-unavailable') {
      alert("The peer you're trying to connect to does not exist");
    } else {
      alert("PeerJS Error: " + err.type);
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
        player.seekTo(data.substring(5));
        currTime = data.substring(5);
    } else if (data == "buffering" && player.getPlayerState() == 1) {
        blockPlayer.style.zIndex = "-1";
        respondingToPeer = true;
        player.pauseVideo();
    } else if (data == "play") {
        blockPlayer.style.zIndex = "0";
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
        blockPlayer.style.zIndex = "0";
        player.playVideo();
    }
  });
}

function loadNewVid(url) {
  vID = getVidID(url);
  if (first) {
    first = false;
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  } else {
    player.loadVideoById({"videoId": vID});
  }
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
  var p = document.getElementById("player");
  blockPlayer = document.getElementById("blockPlayer");
  blockPlayer.style.width = p.width + "px";
  blockPlayer.style.height = p.height + "px";
}

function onPlayerReady(event) {
  ready = true;
  conn.send("ready");
  setInterval(checkSeek, 1000);
}

function onPlayerStateChange(event) {
  switch (event.data) {
    case YT.PlayerState.PLAYING:
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
  }

  if ((Math.abs(currTime - player.getCurrentTime()) > 1)) {
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
