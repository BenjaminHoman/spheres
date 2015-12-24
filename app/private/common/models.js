var uuid = require("node-uuid");

/*
	Client
		represents a client...
*/
var Client = function(){
	this.id = uuid.v1();
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
Vec3.prototype.neg = function(){
	return new Vec3(-this.x, -this.y, -this.z);
}
Vec3.prototype.distance = function(vec){
	return Math.sqrt(Math.pow(vec.x-this.x,2) + Math.pow(vec.y-this.y,2) + Math.pow(vec.z-this.z,2));
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
	this.color = 0xCC00CC;
}
Sphere.prototype.intersects = function(sphere){
	return (this.pos.distance(sphere.pos) <= this.radius + sphere.radius);
}
Sphere.prototype.debug = function(){
	console.log(JSON.stringify(this));
}
exports.Sphere = Sphere;


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
