var FrameActuatorVars = {
	fps: 0,
	fpsInterval: 0,
	then: null,
	startTime: null,
	elapsed: null,
	graphicsContext: null,
};

var FrameActuator = function(fps, graphicsContext){
	FrameActuatorVars.fps = fps;
	FrameActuatorVars.fpsInterval = 1000/FrameActuatorVars.fps;
	FrameActuatorVars.then = Date.now();
	FrameActuatorVars.startTime = FrameActuatorVars.then;
	FrameActuatorVars.elapsed = 0;

	FrameActuatorVars.graphicsContext = graphicsContext;
}
FrameActuator.prototype.beginRenderLoop = function(){
	FrameActuatorVars.fpsInterval = 1000/FrameActuatorVars.fps;
	FrameActuatorVars.then = Date.now();
	FrameActuatorVars.startTime = FrameActuatorVars.then;
	FrameActuatorDrawFrame();
}
var FrameActuatorDrawFrame = function(){
	requestAnimationFrame(FrameActuatorDrawFrame);

	FrameActuatorVars.now = Date.now();
	FrameActuatorVars.elapsed = FrameActuatorVars.now - FrameActuatorVars.then;
	if (FrameActuatorVars.elapsed > FrameActuatorVars.fpsInterval){
		FrameActuatorVars.then = FrameActuatorVars.now - (FrameActuatorVars.elapsed % FrameActuatorVars.fpsInterval);
		FrameActuatorVars.graphicsContext.render();
	}
}