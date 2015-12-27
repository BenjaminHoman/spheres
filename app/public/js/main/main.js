
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
			dir: 'up',
		});
	}
	input.doDown = function(){
		communicationClient.send({
			dir: 'down',
		});
	}
	input.doLeft = function(){
		communicationClient.send({
			dir: 'left',
		});
	}
	input.doRight = function(){
		communicationClient.send({
			dir: 'right',
		});
	}
	input.doForward = function(){
		communicationClient.send({
			dir: 'forward',
		});
	}
	input.doBackward = function(){
		communicationClient.send({
			dir: 'backward',
		});
	}
});



