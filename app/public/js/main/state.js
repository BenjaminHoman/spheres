
var state = null;

/*
	ClientSphere
		holds information for client the sphere
*/
var ClientSphere = function(sphere, sphereMesh){
	this.sphere = sphere;
	this.sphereMesh = sphereMesh;
}

var State = function(){
	this.sphereMap = {};

	this.epsilon = 0.1;
}
/*
	gets called when a state diff from the server is sent
*/
State.prototype.handleDiff = function(diffState){
	
}
State.prototype.put = function(sphere){
	this.sphereMap[sphere.sphere.id] = sphere;
}
State.prototype.get = function(sphere){
	return this.sphereMap[sphere.id];
}
State.prototype.has = function(sphere){
	if (this.sphereMap[sphere.id]){
		return true;
	}
	return false;
}
State.prototype.debug = function(){
	for (var id in this.sphereMap){
		console.log(this.sphereMap[id]);
	}
}