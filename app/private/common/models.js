var uuid = require("node-uuid");
var Utils = require('./utils.js');

/*
	Client
		represents a client...
*/
var Client = function(packet){
	this.id = uuid.v1();
	this.packet = packet;
}
Client.prototype.debug = function(){
	console.log(this.constructor.name + " with id: " + this.id);
}
exports.Client = Client;


/*
	StateDiff
		holds information about the differences of each sphere in the scene
*/
var StateDiff = function(){
	this.type = 'stateDiff';
	this.unitDiffs = {};
}
exports.StateDiff = StateDiff;


/*
	UnitDiff
		holds info about what to do with individual spheres
*/
var UnitDiff = function(){
	this.type = "";
	this.data = {};
}
UnitDiff.prototype.asUpdate = function(){
	this.type = "update";
	return this;
}
UnitDiff.prototype.asRemove = function(){
	this.type = 'remove';
	return this;
}
UnitDiff.prototype.asAdd = function(){
	this.type = 'add';
	return this;
}
exports.UnitDiff = UnitDiff;


/*
	Spacial Models
*/

var Vec3 = function(x, y, z){
	this.x = x;
	this.y = y;
	this.z = z;
}
Vec3.prototype.add = function(vec){
	return new Vec3(this.x+vec.x, this.y+vec.y, this.z+vec.z);
}
Vec3.prototype.mult = function(scalar){
	return new Vec3(this.x*scalar, this.y*scalar, this.z*scalar);
}
Vec3.prototype.neg = function(){
	return new Vec3(-this.x, -this.y, -this.z);
}
Vec3.prototype.distance = function(vec){
	return Math.sqrt(Math.pow(vec.x-this.x,2) + Math.pow(vec.y-this.y,2) + Math.pow(vec.z-this.z,2));
}
Vec3.prototype.normalize = function(){
	var mag = this.distance({x: 0, y: 0, z: 0});
	return new Vec3(this.x/mag, this.y/mag, this.z/mag);
}
Vec3.prototype.debug = function(){
	console.log(this.x, this.y, this.z);
}
exports.Vec3 = Vec3;


var Sphere = function(pos, radius){
	this.pos = pos;
	this.radius = radius;
	this.id = uuid.v1();
	this.updatedPosition = false;
	this.baseColor = Utils.generateRandomBaseColor();
	this.color = 0xCC00CC;

	this.inputPackets = [];
	this.outputPackets = [];
	this.outputClientPackets = [];
}
Sphere.prototype.intersects = function(sphere){
	return (this.pos.distance(sphere.pos) <= this.radius + sphere.radius);
}
/*
	push output packets to intersecting spheres
*/
var passProbability = 0.92;
Sphere.prototype.process = function(intersectingSpheres){
	for (var i = 0; i < this.outputPackets.length; ++i){
		var outPacket = this.outputPackets[i];

		var possibleOutSpheres = [];
		for (var j = 0; j < intersectingSpheres.length; ++j){
			var intersectingSphere = intersectingSpheres[j];

			if (intersectingSphere.id != outPacket.prevSphere){
				possibleOutSpheres.push(intersectingSphere);
			}
		}

		if (possibleOutSpheres.length > 0){
			if (!outPacket.hasClient){
				if (Math.random() < passProbability){
					var passIndex = Utils.randomInt(0, possibleOutSpheres.length);
					outPacket.prevSphere = this.id;
					possibleOutSpheres[passIndex].pushPacket(outPacket);
				}

			} else if (outPacket.nextSphere){
				outPacket.nextSphere.pushPacket(outPacket);
				outPacket.nextSphere = null;
				
			} else {
				this.outputClientPackets.push(outPacket);
			}

		} else if (outPacket.hasClient){
			this.outputClientPackets.push(outPacket);
		}
	}
}
Sphere.prototype.postProcess = function(){
	this.outputPackets = this.inputPackets.concat(this.outputClientPackets);
	this.outputClientPackets = [];
	this.inputPackets = [];
}
Sphere.prototype.calculateColor = function(){
	if (this.outputPackets.length > 0){
		this.color = 0x39FF14; //neon green

	} else {
		this.color = this.baseColor;
	}
}
Sphere.prototype.pushPacket = function(packet){
	packet.currentSphere = this;
	packet.pos = this.pos;
	this.inputPackets.push(packet);
}
Sphere.prototype.debug = function(){
	console.log(JSON.stringify(this));
}
exports.Sphere = Sphere;


/*
	contains the packet to be passed from sphere to sphere
*/
var Packet = function(model){
	this.energy = model.energy;
	this.prevSphere = model.prevSphere;
	this.hasClient = model.hasClient;
	this.pos = model.pos;

	this.nextSphere = null;
	this.currentSphere = null;
}
exports.Packet = Packet;


/*
	Segment
		contains spheres within a localized area for efficient collision detection
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
exports.Segment = Segment;
