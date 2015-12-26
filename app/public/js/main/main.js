
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

	input.doClientEvent = function(){
		communicationClient.send({
			type: 'event',
		});
	}
});



