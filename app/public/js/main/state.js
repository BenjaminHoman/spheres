
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
	this.spheresToUpdatePosition = {};
	this.spheresToUpdateColor = {};
}
State.prototype.mergeDiffState = function(diffState){
	for (var id in diffState.unitDiffs){
		var unitDiff = diffState.unitDiffs[id];

		switch (unitDiff.type){
			case 'update':
				if (this.sphereMap[id]){
					if (unitDiff.data.color){
						//this.sphereMap[id].sphereMesh.material.color.setHex(unitDiff.data.color);
						this.sphereMap[id].updateData.color = hexToRGB(unitDiff.data.color);
						this.spheresToUpdateColor[id] = this.sphereMap[id];
					}

					if (unitDiff.data.pos){
						if (!isEqualVec(this.sphereMap[id].sphereMesh.position, unitDiff.data.pos)){
							this.sphereMap[id].updateData.position = unitDiff.data.pos;
							this.spheresToUpdatePosition[id] = this.sphereMap[id];
						}
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
	for (var id in this.spheresToUpdatePosition){
		var clientSphere = this.spheresToUpdatePosition[id];

		if (clientSphere.updateData.position){
			this.animateMovement(id, clientSphere, delta);
		}
	}
	for (var id in this.spheresToUpdateColor){
		var clientSphere = this.spheresToUpdateColor[id];

		if (clientSphere.updateData.color){
			this.animateColorChange(id, clientSphere, delta);
		}
	}
}
State.prototype.animateMovement = function(id, clientSphere, delta){
	var epsilon = 0.1;
	var newPos = moveToTarget(clientSphere.sphereMesh.position, clientSphere.updateData.position, delta, 0.005, epsilon);
	if (!newPos){
		delete clientSphere.updateData.position;
		delete this.spheresToUpdatePosition[id];

	} else {
		clientSphere.sphereMesh.position.x = newPos.x;
		clientSphere.sphereMesh.position.y = newPos.y;
		clientSphere.sphereMesh.position.z = newPos.z;
	}
}
State.prototype.animateColorChange = function(id, clientSphere, delta){
	var epsilon = 0.01;
	var currentColor = clientSphere.sphereMesh.material.color;
	var targetColor = clientSphere.updateData.color;
	var newColorVec = moveToTarget({x: currentColor.r, y: currentColor.g, z: currentColor.b}, {x: targetColor.r, y: targetColor.g, z: targetColor.b}, delta, 0.006, epsilon);
	if (!newColorVec){
		delete clientSphere.updateData.color;
		delete this.spheresToUpdateColor[id];

	} else {
		clientSphere.sphereMesh.material.color.r = newColorVec.x;
		clientSphere.sphereMesh.material.color.g  = newColorVec.y;
		clientSphere.sphereMesh.material.color.b  = newColorVec.z;
	}
}
State.prototype.debug = function(){
	for (var id in this.sphereMap){
		console.log(this.sphereMap[id]);
	}
}