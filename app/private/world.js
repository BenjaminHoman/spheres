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

	setTimeout(function(){
		that.spheres[7].inputPackets.push(new Models.Packet(null, 2, that.clients[0].client));

	}, 10000);
}
/*
	executes every frame
*/
World.prototype.update = function(){
	var diffHandler = new Utils.DiffHandler();

	this.spheres[Utils.randomInt(0,this.spheres.length-1)].inputPackets.push(new Models.Packet(null, 2, null));

	//this.spheres[0].pos = this.spheres[0].pos.add(new Models.Vec3(2,1,0));
	//diffHandler.updateSpherePosition(this.spheres[0]);

	//this.spheres[2].pos = this.spheres[2].pos.add(new Models.Vec3(3,1.5,1));
	//diffHandler.updateSpherePosition(this.spheres[2]);

	this.collisionGrid.assign(this.spheres);

	for (var i = 0; i < this.spheres.length; ++i){

		var sphere = this.spheres[i];
		var sphereIntersections = this.collisionGrid.getIntersections(sphere);
		sphere.process(sphereIntersections);
	}
	for (var i = 0; i < this.spheres.length; ++i){

		this.spheres[i].postProcess();

		var color = this.spheres[i].color;
		this.spheres[i].calculateColor();
		if (color != this.spheres[i].color){
			diffHandler.updateSphereColor(this.spheres[i]);
		}
	}

	this.broadcastStateDiff(diffHandler.stateDiff);

	//var now = Date.now();
	//console.log(now - this.last);
	//this.last = now;
}
World.prototype.init = function(){
	this.spheres.push(new Models.Sphere(new Models.Vec3(3,30,3), 5));
	this.spheres.push(new Models.Sphere(new Models.Vec3(10,63,3), 2));
	this.spheres.push(new Models.Sphere(new Models.Vec3(3,40,3), 7));

	this.spheres.push(new Models.Sphere(new Models.Vec3(14,12,2), 4));
 	this.spheres.push(new Models.Sphere(new Models.Vec3(22,12,2), 4));
 	this.spheres.push(new Models.Sphere(new Models.Vec3(30,12,2), 4));
 	this.spheres.push(new Models.Sphere(new Models.Vec3(38,12,2), 4));
 	this.spheres.push(new Models.Sphere(new Models.Vec3(46,12,2), 4));
 	this.spheres.push(new Models.Sphere(new Models.Vec3(54,12,2), 4));
 	this.spheres.push(new Models.Sphere(new Models.Vec3(62,12,2), 4));
 
 	this.spheres.push(new Models.Sphere(new Models.Vec3(46,12,10), 4));
 	this.spheres.push(new Models.Sphere(new Models.Vec3(46,12,18), 4));
 	this.spheres.push(new Models.Sphere(new Models.Vec3(46,12,26), 4));
 	this.spheres.push(new Models.Sphere(new Models.Vec3(46,12,34), 4));
 
 	this.spheres.push(new Models.Sphere(new Models.Vec3(62,12,10), 4));
 	this.spheres.push(new Models.Sphere(new Models.Vec3(62,12,18), 4));
 	this.spheres.push(new Models.Sphere(new Models.Vec3(62,12,26), 4));
 	this.spheres.push(new Models.Sphere(new Models.Vec3(62,12,34), 4));
  
  	//this.spheres.push(new Models.Sphere(new Models.Vec3(54,12,34), 4));

  	for (var i = 0; i < 130; ++i){
		this.spheres.push(new Models.Sphere(new Models.Vec3(Utils.random(100,400), Utils.random(100,400), Utils.random(100,400)), Utils.random(3,8)));
	}
}
World.prototype.handleClientConnect = function(ws){
	ws.client = new Models.Client();
	console.log("Client connected: " + ws.client.id);

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
	console.log("Client disconnected: " + ws.client.id);
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
World.prototype.broadcastStateDiff = function(unitDiff){
	var strData = JSON.stringify(unitDiff);
	for (var i = 0; i < this.clients.length; ++i){
		try {
			this.clients[i].send(strData);

		} catch (err){
			console.error("Error sending data");
		}
	}
}
exports.World = World;