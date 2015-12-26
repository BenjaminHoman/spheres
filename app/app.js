var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
var favicon = require('serve-favicon');
var World = require('./private/World.js');

var world = new World.World();

app.use(express.static('public'));
app.use(favicon(__dirname + '/public/img/favicon.ico'));

app.ws('/event', function(ws, req) {
	world.handleClientConnect(ws);

	ws.on('message', function(msg) {
		world.handleClientMessage(ws, JSON.parse(msg));
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