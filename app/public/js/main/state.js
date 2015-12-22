
var state = null;

/*
	ClientSphere
		holds information for client the sphere
*/
var ClientSphere = function(sphere, sphereMesh){
	this.sphere = sphere;
	this.sphereMesh = sphereMesh;
}

/*
	Map that holds spheres
*/
var SphereMap = function(){}

var State = function(){
	this.sphereMap = new SphereMap();
	this.spheresToAnimatePosition = new SphereMap();

	this.epsilon = 0.1;
}
State.prototype.mergeDiffState = function(diffState){
	for (var i = 0; i < diffState.spheres.length; ++i){
		if (this.has(diffState.spheres[i])){ // if sphere exists in state

			var clientSphere = this.get(diffState.spheres[i]);
			clientSphere.sphere = diffState.spheres[i]; // update sphere in state

			if (diffState.spheres[i].updatedPosition){ //animate the sphere movement
				clientSphere.sphereMesh.targetPosition = clientSphere.sphere.pos;
				this.spheresToAnimatePosition[clientSphere.sphere.id] = clientSphere;
			}

		} else { //sphere does not exist so create and add it
			var sphereMesh = graphicsContext.createSphere(diffState.spheres[i]);
			var clientSphere = new ClientSphere(diffState.spheres[i], sphereMesh);
			this.put(clientSphere);
		}
	}
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
State.prototype.animate = function(delta){
	for (var id in this.spheresToAnimatePosition){
		var clientSphere = this.spheresToAnimatePosition[id];
		var changed = false;

		if (clientSphere.sphereMesh.position.x < clientSphere.sphereMesh.targetPosition.x-this.epsilon){
			var dist = clientSphere.sphereMesh.targetPosition.x - clientSphere.sphereMesh.position.x;
			clientSphere.sphereMesh.position.x += 0.005 * dist * delta;
			changed = true;

		} else if (clientSphere.sphereMesh.position.x > clientSphere.sphereMesh.targetPosition.x+this.epsilon){
			var dist = clientSphere.sphereMesh.targetPosition.x - clientSphere.sphereMesh.position.x;
			clientSphere.sphereMesh.position.x -= 0.005 * dist * delta;
			changed = true;
		}
		if (clientSphere.sphereMesh.position.y < clientSphere.sphereMesh.targetPosition.y-this.epsilon){
			var dist = clientSphere.sphereMesh.targetPosition.y - clientSphere.sphereMesh.position.y;
			clientSphere.sphereMesh.position.y += 0.005 * dist * delta;
			changed = true;

		} else if (clientSphere.sphereMesh.position.y > clientSphere.sphereMesh.targetPosition.y+this.epsilon){
			var dist = clientSphere.sphereMesh.targetPosition.y - clientSphere.sphereMesh.position.y;
			clientSphere.sphereMesh.position.y -= 0.005 * dist * delta;
			changed = true;
		}
		if (clientSphere.sphereMesh.position.z < clientSphere.sphereMesh.targetPosition.z-this.epsilon){
			var dist = clientSphere.sphereMesh.targetPosition.z - clientSphere.sphereMesh.position.z;
			clientSphere.sphereMesh.position.z += 0.005 * dist * delta;
			changed = true;

		} else if (clientSphere.sphereMesh.position.z > clientSphere.sphereMesh.targetPosition.z+this.epsilon){
			var dist = clientSphere.sphereMesh.targetPosition.z - clientSphere.sphereMesh.position.z;
			clientSphere.sphereMesh.position.z -= 0.005 * dist * delta;
			changed = true;
		}

		if (!changed){
			delete this.spheresToAnimatePosition[id];
			console.log("finished animation");
		}
	}
}
State.prototype.debug = function(){
	for (var id in this.sphereMap){
		console.log(this.sphereMap[id]);
	}
}