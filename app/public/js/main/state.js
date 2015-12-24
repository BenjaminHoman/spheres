
var state = null;

/*
	ClientSphere
		holds information for client the sphere
*/
var ClientSphere = function(sphereMesh){
	this.sphereMesh = sphereMesh;
	this.updateData = {};
}

var State = function(){
	this.sphereMap = {};
	this.spheresToUpdate = {};
}
State.prototype.mergeDiffState = function(diffState){
	for (var id in diffState.unitDiffs){
		var unitDiff = diffState.unitDiffs[id];

		switch (unitDiff.type){
			case 'update':
				if (this.sphereMap[id]){
					this.sphereMap[id].sphereMesh.material.color.setHex(unitDiff.data.color);

					if (!isEqualVec(this.sphereMap[id].sphereMesh.position, unitDiff.data.pos)){
						this.sphereMap[id].updateData.position = unitDiff.data.pos;
						this.spheresToUpdate[id] = this.sphereMap[id];
					}
				}
				break;
			case 'add':
				this.sphereMap[id] = new ClientSphere(graphicsContext.createSphere({
					pos: unitDiff.data.pos,
					radius: unitDiff.data.radius,
					color: unitDiff.data.color,
				}));
				break;
			case 'remove':
				graphicsContext.removeSphere(this.sphereMap[id]);
				delete this.sphereMap[id];
				break;
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
	for (var id in this.spheresToUpdate){
		var clientSphere = this.spheresToUpdate[id];

		if (clientSphere.updateData.position){
			var newPos = moveToTarget(clientSphere.sphereMesh.position, clientSphere.updateData.position, delta);
			if (!newPos){
				delete clientSphere.updateData.position;
				delete this.spheresToUpdate[id];
				console.log("finished animation");

			} else {
				clientSphere.sphereMesh.position.x = newPos.x;
				clientSphere.sphereMesh.position.y = newPos.y;
				clientSphere.sphereMesh.position.z = newPos.z;
			}
		}
	}
}
State.prototype.debug = function(){
	for (var id in this.sphereMap){
		console.log(this.sphereMap[id]);
	}
}