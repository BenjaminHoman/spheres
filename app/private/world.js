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

	this.spheres[Utils.randomInt(0,this.spheres.length-1)].pushPacket(new Models.Packet({
		prevSphere: null,
		energy: 2,
		hasClient: false,
		pos: null,
	}));

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
			diffHandler.updateSphereCharged(this.spheres[i]);
		}
	}

	this.broadcastStateDiff(diffHandler.stateDiff);

	now = Date.now();
	console.log(now - this.last);
	this.last = now;
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
  
  	this.spheres.push(new Models.Sphere(new Models.Vec3(54,12,34), 4));

  	for (var i = 0; i < 30; ++i){
		this.spheres.push(new Models.Sphere(new Models.Vec3(Utils.random(100,400), Utils.random(100,400), Utils.random(100,400)), Utils.random(3,8)));
	}
	for (var i = 0; i < 10; ++i){
		new Utils.WorldGenerator(this, 40, new Models.Vec3(400,400,400)).generate();
	}

	for (var x = 0; x < 10*8; x += 8){
		for (var y = 0; y < 10*8; y += 8){
			this.spheres.push(new Models.Sphere(new Models.Vec3(100+x,12,100+y), 4));
		}
	}
}
World.prototype.handleClientConnect = function(ws){
	var initSphere = Utils.randomInt(0, this.spheres.length-1);
	var clientPacket = new Models.Packet({
		prevSphere: null,
		energy: 2,
		hasClient: true,
		pos: this.spheres[initSphere].pos,
	});
	this.spheres[initSphere].pushPacket(clientPacket);

	ws.client = new Models.Client(clientPacket);
	console.log("Client connected: " + ws.client.id);

	this.clients.push(ws);

	var diffHandler = new Utils.DiffHandler();
	for (var i = 0; i < this.spheres.length; ++i){ 
		diffHandler.createSphere(this.spheres[i]);
	}

	ws.send(JSON.stringify(diffHandler.stateDiff));
}
World.prototype.handleClientMessage = function(ws, data){
	switch (data.dir){
		case 'up':
			ws.client.packet.nextSphere = Utils.getUpmostSphere(this.collisionGrid.getIntersections(ws.client.packet.currentSphere));
			break;
		case 'down':
			ws.client.packet.nextSphere = Utils.getDownmostSphere(this.collisionGrid.getIntersections(ws.client.packet.currentSphere));
			break;
		case 'left':
			ws.client.packet.nextSphere = Utils.getLeftmostSphere(this.collisionGrid.getIntersections(ws.client.packet.currentSphere));
			break;
		case 'right':
			ws.client.packet.nextSphere = Utils.getRightmostSphere(this.collisionGrid.getIntersections(ws.client.packet.currentSphere));
			break;
		case 'forward':
			ws.client.packet.nextSphere = Utils.getForwardmostSphere(this.collisionGrid.getIntersections(ws.client.packet.currentSphere));
			break;
		case 'backward':
			ws.client.packet.nextSphere = Utils.getBackwardmostSphere(this.collisionGrid.getIntersections(ws.client.packet.currentSphere));
			break;
		default:
			ws.client.packet.nextSphere = null;
			break;
	}
}
World.prototype.handleClientDisconnect = function(ws){
	ws.client.packet.hasClient = false;
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
	for (var i = 0; i < this.clients.length; ++i){
		try {
			unitDiff.clientPosition = this.clients[i].client.packet.pos;
			this.clients[i].send(JSON.stringify(unitDiff));

		} catch (err){
			console.error("Error sending data");
		}
	}
}
exports.World = World;