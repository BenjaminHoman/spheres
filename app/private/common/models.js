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
	this.spheres = [];
}
exports.StateDiff = StateDiff;


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
}
Sphere.prototype.intersects = function(sphere){
	return (this.pos.distance(sphere.pos) <= this.radius + sphere.radius);
}
Sphere.prototype.debug = function(){
	console.log(JSON.stringify(this));
}
exports.Sphere = Sphere;
