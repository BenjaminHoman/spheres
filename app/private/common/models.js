var uuid = require("node-uuid");

/*
	Client
		represents a remote client
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
	this.type = 'diff';
	this.spheres = [];
}
exports.StateDiff = StateDiff;

/*
	Diff
		represents a diff component. could be an addition/removal/statechange...
*/
var Diff = function(){
	this.type = "";
}
Diff.prototype.asRemove = function(){
	this.type = "remove";
	return this;
}
Diff.prototype.asAdd = function(){
	this.type = "add";
	return this;
}
Diff.prototype.asChange = function(){
	this.type = "change";
	return this;
}
exports.Diff = Diff;

/*
	Vec3
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

/*
	Sphere
*/
var Sphere = function(pos, radius){
	this.pos = pos;
	this.radius = radius;
	this.id = uuid.v1();
}
Sphere.prototype.intersects = function(sphere){
	return (this.pos.distance(sphere.pos) <= this.radius + sphere.radius);
}
Sphere.prototype.debug = function(){
	console.log(JSON.stringify(this));
}
exports.Sphere = Sphere;
