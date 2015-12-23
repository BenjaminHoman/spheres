var Models = require("./Models.js");

var convertToUnitSpace = function(pos, unit){
	return new Models.Vec3(Math.floor(pos.x / unit.x), Math.floor(pos.y / unit.y), Math.floor(pos.z / unit.z));
}
exports.convertToUnitSpace = convertToUnitSpace;

var getIndex = function(pos, size){
	return (pos.x + size.x * (pos.y + size.z * pos.z));
}
exports.getIndex = getIndex;

/*
	convert a sphere world position to a unique spacial index such
		that spheres with close positions will likey resolve to the same index give the same segmentInformation
*/
var getSegmentIndex = function(sphere, segmentSize, segmentAmnt){
	var unitPos = convertToUnitSpace(sphere.pos, segmentSize);
	return getIndex(unitPos, segmentAmnt);
}
exports.getSegmentIndex = getSegmentIndex;



/*
	Used for efficient collision detection using spacial partitioning
*/
var CollisionGrid = function(segmentSize, segmentAmnt){
	this.segments = [];
	this.segmentSize = segmentSize;
	this.segmentAmnt = segmentAmnt;
}
/*
	assign phase must be called before any intersection testing
*/
CollisionGrid.prototype.assign = function(spheres){
	this.segments = {};
	for (var i = 0; i < spheres.length; ++i){
		var sphere = spheres[i];
		var segmentIndex = getSegmentIndex(sphere, this.segmentSize, this.segmentAmnt);
		if (!this.segments[segmentIndex]){
			this.segments[segmentIndex] = new Models.Segment();
		}
		this.segments[segmentIndex].spheres.push(sphere);
	}
}
CollisionGrid.prototype.getIntersections = function(sphere){
	var intersectingSpheres = [];
	var unitPos = convertToUnitSpace(sphere.pos, this.segmentSize);
	for (var i = 0; i < adjacentDirections.length; ++i){
		var adjacentPos = unitPos.add(adjacentDirections[i]);

		var segment = this.segments[getIndex(adjacentPos, this.segmentAmnt)];
		if (segment){
			intersectingSpheres = intersectingSpheres.concat(segment.intersects(sphere));
		}
	}
	return intersectingSpheres;
}
exports.CollisionGrid = CollisionGrid;





/*
	Defines what is next to a segment or area
*/
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