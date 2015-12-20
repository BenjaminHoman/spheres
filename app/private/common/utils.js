var Models = require("./Models.js");

var convertToUnitSpace = function(pos, unit){
	return new Models.Vec3(Math.floor(pos.x / unit.x), Math.floor(pos.y / unit.y), Math.floor(pos.z / unit.z));
}
exports.convertToUnitSpace = convertToUnitSpace;

var getIndex = function(pos, size){
	return (pos.x + size.x * (pos.y + size.z * pos.z));
}
exports.getIndex = getIndex;

var adjacentDirections = [
	new Models.Vec3(0,0,0),

	new Models.Vec3(-1,0,0),
	new Models.Vec3(1,0,0),

	new Models.Vec3(0,-1,0),
	new Models.Vec3(0,1,0),

	new Models.Vec3(0,0,-1),
	new Models.Vec3(0,0,1),
];
exports.adjacentDirections = adjacentDirections;