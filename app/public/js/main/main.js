
$(document).ready(function(){
	graphicsContext = new GraphicsContext();

	$(window).on('resize',function(e){
		graphicsContext.resize();
	});
	
	new FrameActuator(60, function(delta){
		graphicsContext.render();
		graphicsContext.orbitControls.update();

		if (state)
			state.animate(delta);

	}).begin();

	state = new State();
	communicationClient = new CommunicationClient();
	input = new Input();

	input.doUp = function(){
		communicationClient.send({
			dir: getClosestGlobalDirection(getCameraUp(graphicsContext.camera)).name,
		});
	}
	input.doDown = function(){
		communicationClient.send({
			dir: getClosestGlobalDirection(getCameraDown(graphicsContext.camera)).name,
		});
	}
	input.doLeft = function(){
		communicationClient.send({
			dir: getClosestGlobalDirection(getCameraLeft(graphicsContext.camera)).name,
		});
	}
	input.doRight = function(){
		communicationClient.send({
			dir: getClosestGlobalDirection(getCameraRight(graphicsContext.camera)).name,
		});
	}
	input.doForward = function(){
		communicationClient.send({
			dir: getClosestGlobalDirection(getCameraForward(graphicsContext.camera)).name,
		});
	}
	input.doBackward = function(){
		communicationClient.send({
			dir: getClosestGlobalDirection(getCameraBackward(graphicsContext.camera)).name,
		});
	}
});



