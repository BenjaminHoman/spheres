var Models = require("./common/models.js");
var Utils = require("./common/utils.js");

/*
	World
		holds references to all web sockets wich have client object tacked to them
*/
var World = function(){
	/*
		list of web sockets that are currently connected.
			they will have a client obj tacked on to them
	*/
	this.clients = [];

	/*
		list of all spheres in the world
	*/
	this.spheres = [];

	this.init();
	var that = this;
	setInterval(function(){
		that.update();

	}, 300);
}
/*
	recurring execution
*/
World.prototype.update = function(){

}
/*
	init world
*/
World.prototype.init = function(){
	this.spheres.push(new Models.Sphere(new Models.Vec3(10,12,3), 5));
	this.spheres.push(new Models.Sphere(new Models.Vec3(10,6,3), 3));
	this.spheres.push(new Models.Sphere(new Models.Vec3(10,44,3), 8));
}
/*
	client connect event
*/
World.prototype.handleClientConnect = function(ws){
	ws.client = new Models.Client();
	ws.client.debug();

	this.clients.push(ws);

	var stateDiff = new Models.StateDiff();
	stateDiff.spheres = this.spheres;

	ws.send(JSON.stringify(stateDiff));
}
/*
	Client sends data event
*/
World.prototype.handleClientMessage = function(ws, msg){
	console.log("client message: " + msg);
}
/*
	Client Disconnects
*/
World.prototype.handleClientDisconnect = function(ws){
	this.removeClientWithWs(ws);
}
/*
	remove web socket from client list
*/
World.prototype.removeClientWithWs = function(ws){
	for (var i = 0; i < this.clients.length; ++i){
		if (this.clients[i] == ws){
			this.clients.splice(i, 1);
			return;
		}
	}
	console.error("trying to remove client that is not connected");
}
/*
	send data to all connected clients
*/
World.prototype.broadcast = function(data){
	var strData = JSON.stringify(data);
	for (var i = 0; i < this.clients.length; ++i){
		this.clients[i].send(strData);
	}
}
World.prototype.debug = function(){
	for (var i = 0; i < this.segments.length; ++i){
		this.segments[i].debug();
	}
}
exports.World = World;