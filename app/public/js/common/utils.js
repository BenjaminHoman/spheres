/*
	Frame Actuator
		used for calling frames limited by fps
*/

var FrameActuator = function(fps, callback){
	this.fps = fps;
	this.fpsInterval = 1000/this.fps;
	this.then = Date.now();
	this.startTime = this.then;
	this.elapsed = 0;

	this.callback = callback;
}
FrameActuator.prototype.begin = function(){
	this.fpsInterval = 1000/this.fps;
	this.then = Date.now();
	this.startTime = this.then;
	this.runFrame();
}
FrameActuator.prototype.runFrame = function(){
	var that = this;
	requestAnimationFrame(function(){
		that.runFrame();
	});

	this.now = Date.now();
	this.elapsed = this.now - this.then;
	if (this.elapsed > this.fpsInterval){
		this.then = this.now - (this.elapsed % this.fpsInterval);
		this.callback(this.elapsed);
	}
}

/*
	Input
		used for handling relevent input events
*/

var input = null;
var Input = function(){
	this.forward = false;
	this.backward = false;
	this.left = false;
	this.right = false;
	this.up = false;
	this.down = false;

	this.init();
}
Input.prototype.init = function(){
	var that = this;
	$(window).on('keydown', function(event){
		that.onKeydown(event);
	});
	$(window).on('keyup', function(event){
		that.onKeyUp(event);
	});
}
Input.prototype.onKeydown = function(event){
	switch(event.keyCode){
		case 87: //W
			this.forward = true;
			break;
		case 83: //S
			this.backward = true;
			break;
		case 65: //A
			this.left = true;
			break;
		case 68: //D
			this.right = true;
			break;
		case 82: //R
			this.up = true;
			break;
		case 70: //F
			this.down = true;
			break;
	}
}
Input.prototype.onKeyUp = function(event){
	switch(event.keyCode){
		case 87: //W
			this.forward = false;
			break;
		case 83: //S
			this.backward = false;
			break;
		case 65: //A
			this.left = false;
			break;
		case 68: //D
			this.right = false;
			break;
		case 82: //R
			this.up = false;
			break;
		case 70: //F
			this.down = false;
			break;
	}
}

/*
	CommunicationClient
		used for handling communication protocols with server
*/

var communicationClient = null;
var CommunicationClient = function(){
	this.ws = new WebSocket(this.getUrl());

	var that = this;
	this.ws.onopen = function(event){
		console.log("connected with server");
	}
	this.ws.onmessage = function(event){
		var data = JSON.parse(event.data);
		switch (data.type){
			case 'stateDiff':
				state.mergeDiffState(data);
				break;
		}
	}
}
CommunicationClient.prototype.getUrl = function(){
	var url = "ws://" + window.location.host + "/event";
	console.log("using server url: " + url);
	return url;
}

var unit = 1.0/255;
var hexToRGB = function(hex){
	return {
		r: unit * ((hex >> 16) & 255),
		g: unit * ((hex >> 8) & 255),
		b: unit * (hex & 255),
	};
}

var isEqualVec = function(v1, v2){
	return (v1.x == v2.x && v1.y == v2.y && v1.z == v2.z);
}

var distance = function(v1, v2){
	return Math.sqrt(Math.pow(v1.x-v2.x,2) + Math.pow(v1.y-v2.y,2) + Math.pow(v1.z-v2.z,2));
}

/*
	move to target
*/
var moveToTarget = function(vec, target, delta, scale, epsilon){
	var dist = distance(vec, target);
	if (dist > epsilon){
		return {
			x: vec.x + ((target.x-vec.x) * scale * delta),
			y: vec.y + ((target.y-vec.y) * scale * delta),
			z: vec.z + ((target.z-vec.z) * scale * delta),
		};

	} else {
		return null;
	}
}

/*

*/
var cameraFollowAtDistance = function(vec, target, delta, dist, epsilon){
	var actualDist = distance(vec, target);
	if (actualDist < dist){
		return null;
	}
	var directionToTarget = {
		x: vec.x - target.x,
		y: vec.y - target.y,
		z: vec.z - target.z,
	};
	var directionMagnitude = distance(directionToTarget, {x: 0, y: 0, z: 0});
	directionToTarget.x = (directionToTarget.x / directionMagnitude) * dist;
	directionToTarget.y = (directionToTarget.y / directionMagnitude) * dist;
	directionToTarget.z = (directionToTarget.z / directionMagnitude) * dist;
	var actualTarget = {
		x: target.x - directionToTarget.x,
		y: target.y - directionToTarget.y,
		z: target.z - directionToTarget.z,
	};

	return moveToTarget(vec, actualTarget, delta, 0.0005, epsilon);

	// if (distance(vec, actualTarget) > epsilon){
	// 	var newX = vec.x;
	// 	var newY = vec.y;
	// 	var newZ = vec.z;
	// 	if (directionToTarget.x < 0){
	// 		newX += 0.01 * delta;

	// 	} else if (directionToTarget.x > 0){
	// 		newX -= 0.01 * delta;
	// 	}
	// 	if (directionToTarget.y < 0){
	// 		newY += 0.01 * delta;

	// 	} else if (directionToTarget.y > 0){
	// 		newY -= 0.01 * delta;
	// 	}
	// 	if (directionToTarget.z < 0){
	// 		newZ += 0.01 * delta;

	// 	} else if (directionToTarget.z > 0){
	// 		newZ -= 0.01 * delta;
	// 	}
	// 	return {
	// 		x: newX,
	// 		y: newY,
	// 		z: newZ,
	// 	}

	// } else {
	// 	return null;
	// }
}