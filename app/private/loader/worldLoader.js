var parser = require("objtojs");
var Models = require("../common/models.js");

/*
	World loader will read a wavefront file and assume all objects are spheres
*/
var WorldLoader = function(filename){
	this.filename = filename;
}
WorldLoader.prototype.loadInto = function(world){
	var data = parser.parseSync(this.filename);
	for (var objIndex = 0; objIndex < data.data.data.objects.length; ++objIndex){
		var object = data.data.data.objects[objIndex];

		var center = this.getCenter(object);
		var radius = this.getRadius(object, center);

		var sphere = new Models.Sphere(new Models.Vec3(center.x, center.y, center.z), radius);
		world.spheres.push(sphere);
	}
}
WorldLoader.prototype.getCenter = function(object){
	var vertexAmnt = object.vertices.geometric.length / 3;
	var avgX = 0;
	var avgY = 0;
	var avgZ = 0;
	for (var i = 0; i < object.vertices.geometric.length; i += 3){
		avgX += object.vertices.geometric[i];
		avgY += object.vertices.geometric[i+1];
		avgZ += object.vertices.geometric[i+2];
	}
	return {x: (avgX/vertexAmnt), y: (avgY/vertexAmnt), z: (avgZ/vertexAmnt)};
}
WorldLoader.prototype.getRadius = function(object, center){
	var sampleX = object.vertices.geometric[0];
	var sampleY = object.vertices.geometric[1];
	var sampleZ = object.vertices.geometric[2];
	return new Models.Vec3(sampleX, sampleY, sampleZ).distance(center);
}
exports.WorldLoader = WorldLoader;