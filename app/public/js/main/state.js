
var state = null;

/*
	Map that holds spheres
*/
var SphereMap = function(){

}

var State = function(){
	this.sphereMap = new SphereMap();
}
State.prototype.mergeDiffState = function(diffState){
	for (var i = 0; i < diffState.spheres.length; ++i){
		if (this.has(diffState.spheres[i])){
			graphicsContext.removeSphere(diffState.spheres[i]);
		}
		graphicsContext.addSphere(diffState.spheres[i]);
		this.put(diffState.spheres[i]);
	}
}
State.prototype.put = function(sphere){
	this.sphereMap[sphere.id] = sphere;
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