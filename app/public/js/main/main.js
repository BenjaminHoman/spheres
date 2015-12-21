
$(document).ready(function(){
	graphicsContext = new GraphicsContext();

	$(window).on('resize',function(e){
		graphicsContext.resize();
	});
	
	new FrameActuator(60, function(delta){
		graphicsContext.render();

		if (input.forward){
			graphicsContext.camera.position.z -= 0.5 * delta;
		}
		if (input.backward){
			graphicsContext.camera.position.z += 0.5 * delta;
		}
		if (input.left){
			graphicsContext.camera.position.x -= 0.5 * delta;
		}
		if (input.right){
			graphicsContext.camera.position.x += 0.5 * delta;
		}
		if (input.up){
			graphicsContext.camera.position.y += 0.5 * delta;
		}
		if (input.down){
			graphicsContext.camera.position.y -= 0.5 * delta;
		}

	}).begin();

	input = new Input();
	state = new State();
	communicationClient = new CommunicationClient();
});



