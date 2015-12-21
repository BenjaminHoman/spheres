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
		that.ws.send("hello");
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