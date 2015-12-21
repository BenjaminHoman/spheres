var Models = require("./common/models.js");
var Utils = require("./common/utils.js");

/*
	Segment
		contains spheres
*/
var Segment = function(pos, size){
	this.spheres = [];
	this.size = size;
	this.pos = pos;
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
Segment.prototype.containsPosition = function(pos){
	return (pos.x >= this.pos.x && pos.x < this.pos.x+this.size.x && pos.y >= this.pos.y && pos.y < this.pos.y+this.size.y && pos.z >= this.pos.z && pos.z < this.pos.z+this.size.z);
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
	this.size = new Models.Vec3(30,30,30);

	this.segmentSize = new Models.Vec3(10,10,10);
	this.segmentAmnt = Utils.convertToUnitSpace(this.size, this.segmentSize);
	this.segments = [];
}
World.prototype.handleClientConnect = function(ws){
	ws.client = new Models.Client();
	ws.client.debug();

	this.clients.push(ws);

	var stateDiff = new Models.StateDiff();
	stateDiff.spheres.push(new Models.Sphere(new Models.Vec3(3,3,3), 5));
	stateDiff.spheres.push(new Models.Sphere(new Models.Vec3(10,6,3), 2));
	stateDiff.spheres.push(new Models.Sphere(new Models.Vec3(20,3,3), 7));
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
World.prototype.init = function(){
	for (var z = this.pos.z; z < this.pos.z + this.size.z; z += this.segmentSize.z){
		for (var y = this.pos.y; y < this.pos.y + this.size.y; y += this.segmentSize.y){
			for (var x = this.pos.x; x < this.pos.x + this.size.x; x += this.segmentSize.x){
				var segment = new Segment(new Models.Vec3(x,y,z), this.segmentSize);
				this.segments.push(segment);
			}
		}
	}
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
	this.segments[segmentIndex].spheres.push(sphere);
}
/*
	unassign to segment based on the calculated index and sphere id
*/
World.prototype.unassignFromSegment = function(sphere){
	var segmentIndex = this.getSegmentIndex(sphere);
	var segment = this.segments[segmentIndex];
	for (var i = 0; i < segment.spheres.length; ++i){
		if (segment.spheres[i].id == sphere.id){
			segment.spheres.splice(i, 1);
			return;
		}
	}
}
/*
	find all spheres that intersect with arg
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
World.prototype.debug = function(){
	for (var i = 0; i < this.segments.length; ++i){
		this.segments[i].debug();
	}
}
exports.World = World;