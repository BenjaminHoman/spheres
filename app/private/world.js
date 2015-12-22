var Models = require("./common/models.js");
var Utils = require("./common/utils.js");

/*
	Segment
		contains spheres
*/
var Segment = function(){
	this.spheres = [];
}
Segment.prototype.intersects = function(sphere){
	var intersectingSpheres = [];
	for (var i = 0; i < this.spheres.length; ++i){
		if (sphere.id != this.spheres[i].id && this.spheres[i].intersects(sphere)){
			intersectingSpheres.push(this.spheres[i]);
		}
	}
	return intersectingSpheres;
}
Segment.prototype.debug = function(){
	console.log("pos: ", JSON.stringify(this.pos) + " size " + JSON.stringify(this.size) + " " + JSON.stringify(this.spheres));
}

/*
	World
		holds references to all web sockets wich have client object tacked to them
*/
var World = function(){
	this.clients = [];

	this.pos = new Models.Vec3(0,0,0);
	this.size = new Models.Vec3(100,100,100);

	this.segmentSize = new Models.Vec3(10,10,10);
	this.segmentAmnt = Utils.convertToUnitSpace(this.size, this.segmentSize);
	this.segments = {};
	this.spheres = [];

	this.init();
	var that = this;
	setInterval(function(){
		that.update();

	}, 300);
}
World.prototype.update = function(){
	this.spheres[0].pos.x += 1;
	this.spheres[0].pos.y += 0.5;
	this.spheres[0].updatedPosition = true;

	this.spheres[2].pos.x += 1;
	this.spheres[2].updatedPosition = true;

	this.assigneSpheresToSegments();

	for (var i = 0; i < this.spheres.length; ++i){
		if (this.intersects(this.spheres[i]).length > 0){
			this.spheres[i].color = 0x00ff00;
		} else {
			this.spheres[i].color = 0xCCF0CC;
		}
	}

	var stateDiff = new Models.StateDiff();
	stateDiff.spheres.push(this.spheres[0]);
	stateDiff.spheres.push(this.spheres[1]);
	stateDiff.spheres.push(this.spheres[2]);

	this.broadcast(stateDiff);
	this.endUpdate();
}
World.prototype.init = function(){
	this.spheres.push(new Models.Sphere(new Models.Vec3(3,3,3), 5));
	this.spheres.push(new Models.Sphere(new Models.Vec3(10,6,3), 2));
	this.spheres.push(new Models.Sphere(new Models.Vec3(3,10,3), 7));
}
World.prototype.handleClientConnect = function(ws){
	ws.client = new Models.Client();
	ws.client.debug();

	this.clients.push(ws);

	var stateDiff = new Models.StateDiff();
	stateDiff.spheres = this.spheres;

	ws.send(JSON.stringify(stateDiff));
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
World.prototype.getSegmentIndex = function(sphere){
	var unitPos = Utils.convertToUnitSpace(sphere.pos, this.segmentSize);
	return Utils.getIndex(unitPos, this.segmentAmnt);
}
/*
	assign to segment based on the calculated index
*/
World.prototype.assignToSegment = function(sphere){
	var segmentIndex = this.getSegmentIndex(sphere);
	var segment = this.segments[segmentIndex];
	if (!segment){
		this.segments[segmentIndex] = new Segment();
	}
	this.segments[segmentIndex].spheres.push(sphere);
}
World.prototype.assigneSpheresToSegments = function(){
	this.segments = {};
	for (var i = 0; i < this.spheres.length; ++i){
		if (this.spheres[i].updatedPosition){
			this.assignToSegment(this.spheres[i]);
		}
	}
}
World.prototype.endUpdate = function(){
	for (var i = 0; i < this.spheres.length; ++i){
		this.spheres[i].updatedPosition = false;
	}
}
/*
	find all spheres that intersect with sphere
*/
World.prototype.intersects = function(sphere){
	var spheres = [];
	var unitPos = Utils.convertToUnitSpace(sphere.pos, this.segmentSize);
	for (var i = 0; i < Utils.adjacentDirections.length; ++i){
		var adjacentPos = unitPos.add(Utils.adjacentDirections[i]);
		var segment = this.segments[Utils.getIndex(adjacentPos, this.segmentAmnt)];
		if (segment){
			var intersectingSpheres = segment.intersects(sphere);
			spheres = spheres.concat(intersectingSpheres);
		}
	}
	return spheres;
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