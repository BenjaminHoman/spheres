
var state = null;

/*
	ClientSphere
		holds information for client the sphere
*/
var start = Date.now();
var ClientSphere = function(sphereMesh, baseColor){
	this.sphereMesh = sphereMesh;
	this.updateData = {};
	this.baseColor = baseColor;
	this.charge = 'D';

	this.token = null;
}
ClientSphere.prototype.applyToken = function(delta){
	var tokenPosition = {
		x: this.sphereMesh.position.x,
		y: this.sphereMesh.position.y + 10 + Math.sin((start - Date.now()) * 0.01),
		z: this.sphereMesh.position.z,
	};
	if (!this.token){
		var token = graphicsContext.createToken(tokenPosition);
		if (token){
			this.token = token;
		}

	} else {
		this.token.position.x = tokenPosition.x;
		this.token.position.y = tokenPosition.y;
		this.token.position.z = tokenPosition.z;
		this.token.rotation.y += 0.005 * delta;
	}
}
ClientSphere.prototype.unapplyToken = function(){
	if (this.token){
		graphicsContext.removeMesh(this.token);
		this.token = null;
	}
}


var State = function(){
	this.cameraTargetLocation = {
		x: 0,
		y: 0,
		z: 0,
	};

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
					if (unitDiff.data.charge){
						this.handleChargeUpdate(id, unitDiff.data.charge, true);
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

				}), hexToRGB(unitDiff.data.color));
				this.handleChargeUpdate(id, unitDiff.data.charge, false);
				break;
			case 'remove':
				graphicsContext.removeMesh(this.sphereMap[id].sphereMesh);
				delete this.sphereMap[id];
				break;
		}
	}
	if (diffState.clientPosition){
		this.cameraTargetLocation = diffState.clientPosition;
	}
}
State.prototype.handleChargeUpdate = function(sphereId, charge, shouldAnimate){
	this.sphereMap[sphereId].charge = charge;
	switch (charge){
		case 'D': //Default
			this.sphereMap[sphereId].sphereMesh.material.specular.setHex(0x010001);
			this.sphereMap[sphereId].sphereMesh.material.emissive.setHex(0x111111);
			if (shouldAnimate){
				this.sphereMap[sphereId].updateData.color = this.sphereMap[sphereId].baseColor;
				this.spheresToUpdateColor[sphereId] = this.sphereMap[sphereId];
			} else {
				this.sphereMap[sphereId].sphereMesh.material.color.r = this.sphereMap[sphereId].baseColor.r;
				this.sphereMap[sphereId].sphereMesh.material.color.g = this.sphereMap[sphereId].baseColor.g;
				this.sphereMap[sphereId].sphereMesh.material.color.b = this.sphereMap[sphereId].baseColor.b;
			}
			break;
		case 'C': //Charged
			this.sphereMap[sphereId].sphereMesh.material.specular.setHex(0xffffff);
			this.sphereMap[sphereId].sphereMesh.material.emissive.setHex(0xff891f);
			if (shouldAnimate){
				this.sphereMap[sphereId].updateData.color = {r: 1.0, g: 0.5372, b: 0.1215};
				this.spheresToUpdateColor[sphereId] = this.sphereMap[sphereId];
			} else {
				this.sphereMap[sphereId].sphereMesh.material.color.r = 0.2235;
				this.sphereMap[sphereId].sphereMesh.material.color.g = 1.0;
				this.sphereMap[sphereId].sphereMesh.material.color.b = 0.07843;
			}
			break;
		case 'P': //Player
			this.sphereMap[sphereId].sphereMesh.material.specular.setHex(0xffffff);
			this.sphereMap[sphereId].sphereMesh.material.emissive.setHex(0x39FF14);
			if (shouldAnimate){
				this.sphereMap[sphereId].updateData.color = {r: 0.2235, g: 1.0, b: 0.07843};
				this.spheresToUpdateColor[sphereId] = this.sphereMap[sphereId];
			} else {
				this.sphereMap[sphereId].sphereMesh.material.color.r = 0.2235;
				this.sphereMap[sphereId].sphereMesh.material.color.g = 1.0;
				this.sphereMap[sphereId].sphereMesh.material.color.b = 0.07843;
			}
			break;
	}
}
State.prototype.animate = function(delta){
	for (var id in this.sphereMap){
		var clientSphere = this.sphereMap[id];

		if (clientSphere.charge == 'C'){
			clientSphere.applyToken(delta);

		} else {
			clientSphere.unapplyToken();
		}
	}
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

	if (!isEqualVec(graphicsContext.orbitControls.target, this.cameraTargetLocation)){
		var epsilon = 0.1;
		var newPos = moveToTarget(graphicsContext.orbitControls.target, this.cameraTargetLocation, delta, 0.005, epsilon);
		if (newPos){
			graphicsContext.orbitControls.target.x = newPos.x;
			graphicsContext.orbitControls.target.y = newPos.y;
			graphicsContext.orbitControls.target.z = newPos.z;
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