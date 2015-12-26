var Models = require("./Models.js");

/*
	convert rgb components to hex for transmission
*/
var rgbToInt = function(r, g, b){
	var rgb = r;
	rgb = (rgb << 8) + g;
	rgb = (rgb << 8) + b;
	return rgb;
}
exports.rgbToInt = rgbToInt;

var generateRandomBaseColor = function(){
	return rgbToInt(randomInt(24, 60), randomInt(80, 120), randomInt(80, 110));
}
exports.generateRandomBaseColor = generateRandomBaseColor;

/*
	get random number from (low) to (high)
*/
var random = function(low, high){
	return Math.random() * (high - low) + low;
}
exports.random = random;

var randomInt = function(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
exports.randomInt = randomInt;

var clamp = function(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
exports.clamp = clamp;

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

var quaterionMultiply = function(vectorA, vectorB){
	var out = {};
    out.w = vectorA.w*vectorB.w - vectorA.x*vectorB.x - vectorA.y*vectorB.y - vectorA.z*vectorB.z;
    out.x = vectorA.w*vectorB.x + vectorA.x*vectorB.w + vectorA.y*vectorB.z - vectorA.z*vectorB.y;
    out.y = vectorA.w*vectorB.y - vectorA.x*vectorB.z + vectorA.y*vectorB.w + vectorA.z*vectorB.x;
    out.z = vectorA.w*vectorB.z + vectorA.x*vectorB.y - vectorA.y*vectorB.x + vectorA.z*vectorB.w;
    return out;
}

var rotateVec = function(vec, inputaxis, inputangle){
    var vector = {
    	x: vec.x,
    	y: vec.y,
    	z: vec.z,
    	w: 0,
    };

    var axis = {
    	x: inputaxis.x * Math.sin(inputangle/2),
    	y: inputaxis.y * Math.sin(inputangle/2),
    	z: inputaxis.z * Math.sin(inputangle/2),
    	w: Math.cos(inputangle/2),
    };

    var axisInv = {
    	x: -axis.x,
    	y: -axis.y,
    	z: -axis.z,
    	w: axis.w,
    };

    axis = quaterionMultiply(axis, vector);
    axis = quaterionMultiply(axis, axisInv);

    return axis;
}



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
	handles actions on spheres
*/
var DiffHandler = function(){
	this.stateDiff = new Models.StateDiff();
}
DiffHandler.prototype.createSphere = function(sphere){
	var unitDiff = new Models.UnitDiff().asAdd();
	unitDiff.data = {
		pos: sphere.pos,
		radius: sphere.radius,
		color: sphere.color,
	};
	this.stateDiff.unitDiffs[sphere.id] = unitDiff;
}
DiffHandler.prototype.updateSpherePosition = function(sphere){
	this.createUpdateIfNeeded(sphere);
	this.stateDiff.unitDiffs[sphere.id].data.pos = sphere.pos;
}
DiffHandler.prototype.updateSphereColor = function(sphere){
	this.createUpdateIfNeeded(sphere);
	this.stateDiff.unitDiffs[sphere.id].data.color = sphere.color;
}
DiffHandler.prototype.removeSphere = function(sphere){
	var unitDiff = new Models.UnitDiff().asRemove();
	this.stateDiff.unitDiffs[sphere.id] = unitDiff;
}
DiffHandler.prototype.createUpdateIfNeeded = function(sphere){
	if (!this.stateDiff.unitDiffs[sphere.id]){
		this.stateDiff.unitDiffs[sphere.id] = new Models.UnitDiff().asUpdate();
	}
}
exports.DiffHandler = DiffHandler;


/*
	World generator
*/
var WorldGenerator = function(world, sphereAmnt, size){
	this.sphereAmnt = sphereAmnt;
	this.world = world;
	this.size = size;

	this.lastPosition = new Models.Vec3(0,0,0);
	this.lastDirection = null;
	this.lastRadius = 0;
}
WorldGenerator.prototype.generate = function(){
	for (var i = 0; i < this.sphereAmnt; ++i){
		var position = null;
		var radius = randomInt(3,8);
		if (i == 0){
			position = new Models.Vec3(random(0,this.size.x-1), random(0,this.size.y-1), random(0,this.size.z-1));
			this.add(position, radius);

		} else {
			position = this.getNextPosition(radius);
			this.add(position, radius);
		}
		this.lastRadius = radius;
		this.lastPosition = position;
	}
}
WorldGenerator.prototype.add = function(position, radius){
	var sphere = new Models.Sphere(position, radius);
	sphere.baseColor = generateRandomBaseColor();
	this.world.spheres.push(sphere);
}
WorldGenerator.prototype.getNextPosition = function(thisRadius){
	var axis = new Models.Vec3(random(-1,1), random(-1,1), random(-1,1)).normalize();
	var angle = random(-70 * Math.PI / 180, 70 * Math.PI / 180);
	var lengthToNext = (this.lastRadius + thisRadius) * 0.8;

	if (!this.lastDirection){
		this.lastDirection = new Models.Vec3(lengthToNext,0,0);

	} else {
		this.lastDirection = this.lastDirection.normalize().mult(lengthToNext);
		var dir = rotateVec(this.lastDirection, axis, angle);
		this.lastDirection = new Models.Vec3(dir.x, dir.y, dir.z);
	}

	return this.lastPosition.add(this.lastDirection);
}
exports.WorldGenerator = WorldGenerator;


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

	new Models.Vec3(-1,-1,-1),
	new Models.Vec3(-1,-1,0),
	new Models.Vec3(-1,-1,1),
	new Models.Vec3(-1,0,1),
	new Models.Vec3(-1,1,1),
	new Models.Vec3(-1,1,0),
	new Models.Vec3(-1,1,-1),
	new Models.Vec3(-1,0,-1),

	new Models.Vec3(1,-1,-1),
	new Models.Vec3(1,-1,0),
	new Models.Vec3(1,-1,1),
	new Models.Vec3(1,0,1),
	new Models.Vec3(1,1,1),
	new Models.Vec3(1,1,0),
	new Models.Vec3(1,1,-1),
	new Models.Vec3(1,0,-1),

	new Models.Vec3(0,-1,-1),
	new Models.Vec3(0,-1,1),
	new Models.Vec3(0,1,-1),
	new Models.Vec3(0,1,1),
];
exports.adjacentDirections = adjacentDirections;