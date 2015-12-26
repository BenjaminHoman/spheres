
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

	input = new Input();
	state = new State();
	communicationClient = new CommunicationClient();
});



