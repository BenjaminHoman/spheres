var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
var World = require('./private/World.js');

var world = new World.World();

app.use(express.static('public'));

app.ws('/event', function(ws, req) {
	world.handleClientConnect(ws);

	ws.on('message', function(msg) {
		world.handleClientMessage(ws, msg);
	});

	ws.on('close', function(){
		world.handleClientDisconnect(ws);
	});

	ws.on('error', function(){
		world.handleClientDisconnect(ws);
	});
});

var server = app.listen(3000, function(){
	var host = server.address().address;
	var port = server.address().port;

	console.log('Server Listening at http://%s:%s', host, port);
});