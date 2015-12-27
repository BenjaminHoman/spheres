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
	this.doLeft = null;
	this.doRight = null;
	this.doUp = null;
	this.doDown = null;
	this.doForward = null;
	this.doBackward = null;

	this.init();
}
Input.prototype.init = function(){
	var that = this;
	$(window).on('keydown', function(event){
		that.onKeydown(event);
	});
}
Input.prototype.onKeydown = function(event){
	switch(event.keyCode){
		case 87: //W
			this.doUp();
			break;
		case 83: //D
			this.doDown();
			break;
		case 65: //A
			this.doLeft();
			break;
		case 68: //D
			this.doRight();
			break;
		case 82: //R
			this.doForward();
			break;
		case 70: //F
			this.doBackward();
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
	this.send = function(data){
		this.ws.send(JSON.stringify(data));
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