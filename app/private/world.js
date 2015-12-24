var Models = require("./common/models.js");
var Utils = require("./common/utils.js");

/*
	World
		holds references to all web sockets wich have client object tacked to them
*/
var World = function(){
	this.clients = [];

	this.worldPos = new Models.Vec3(0,0,0);
	this.worldSize = new Models.Vec3(100000,100000,100000);

	this.segmentSize = new Models.Vec3(10,10,10);
	this.segmentAmnt = Utils.convertToUnitSpace(this.worldSize, this.segmentSize);
	this.collisionGrid = new Utils.CollisionGrid(this.segmentSize, this.segmentAmnt);

	this.spheres = [];
	this.last = Date.now();

	this.init();
	var that = this;
	setInterval(function(){
		that.update();

	}, 300);
}
/*
	executes every frame
*/
World.prototype.update = function(){
	var diffHandler = new Utils.DiffHandler();

	this.spheres[0].pos = this.spheres[0].pos.add(new Models.Vec3(2,1,0));
	diffHandler.updateSphere(this.spheres[0]);

	this.spheres[2].pos = this.spheres[2].pos.add(new Models.Vec3(3,1.5,1));
	diffHandler.updateSphere(this.spheres[2]);

	this.collisionGrid.assign(this.spheres);

	for (var i = 0; i < this.spheres.length; ++i){
		if (this.collisionGrid.getIntersections(this.spheres[i]).length > 0){
			if (0x00ff00 != this.spheres[i].color){
				this.spheres[i].color = 0x00ff00;
				diffHandler.updateSphere(this.spheres[i]);
			}

		} else if (0xCCF0CC != this.spheres[i].color){
			this.spheres[i].color = 0xCCF0CC;
			diffHandler.updateSphere(this.spheres[i]);
		}
	}

	this.broadcast(diffHandler.stateDiff);
}
World.prototype.init = function(){
	this.spheres.push(new Models.Sphere(new Models.Vec3(3,3,3), 5));
	this.spheres.push(new Models.Sphere(new Models.Vec3(10,6,3), 2));
	this.spheres.push(new Models.Sphere(new Models.Vec3(3,10,3), 7));
	
	for (var i = 0; i < 30; ++i){
		this.spheres.push(new Models.Sphere(new Models.Vec3(Utils.random(10,100), Utils.random(10,100), Utils.random(10,100)), Utils.random(3,10)));
	}
}
World.prototype.handleClientConnect = function(ws){
	ws.client = new Models.Client();
	ws.client.debug();

	this.clients.push(ws);

	var diffHandler = new Utils.DiffHandler();
	for (var i = 0; i < this.spheres.length; ++i){ 
		diffHandler.createSphere(this.spheres[i]);
	}

	ws.send(JSON.stringify(diffHandler.stateDiff));
}
World.prototype.handleClientMessage = function(ws, msg){
	console.log("client message: " + msg);
}
World.prototype.handleClientDisconnect = function(ws){
	this.removeClientWithWs(ws);
}
World.prototype.removeClientWithWs = function(ws){
	for (var i = 0; i < this.clients.length; ++i){
		if (this.clients[i] == ws){
			this.clients.splice(i, 1);
			return;
		}
	}
	console.error("trying to remove client that is not connected");
}
World.prototype.broadcast = function(data){
	var strData = JSON.stringify(data);
	for (var i = 0; i < this.clients.length; ++i){
		try {
			this.clients[i].send(strData);

		} catch (err){
			console.log("Error sending data");
		}
	}
}
World.prototype.debug = function(){
	for (var i = 0; i < this.segments.length; ++i){
		this.segments[i].debug();
	}
}
exports.World = World;