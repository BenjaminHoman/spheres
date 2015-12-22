
$(document).ready(function(){
	graphicsContext = new GraphicsContext();

	$(window).on('resize',function(e){
		graphicsContext.resize();
	});
	
	new FrameActuator(60, function(delta){
		graphicsContext.render();

		if (input.forward){
			var forward = graphicsContext.camera.getWorldDirection();
			graphicsContext.camera.position.z += forward.z * 0.5 * delta;
			graphicsContext.camera.position.y += forward.y * 0.5 * delta;
			graphicsContext.camera.position.x += forward.x * 0.5 * delta;
		}
		if (input.backward){
			var forward = graphicsContext.camera.getWorldDirection();
			graphicsContext.camera.position.z -= forward.z * 0.5 * delta;
			graphicsContext.camera.position.y -= forward.y * 0.5 * delta;
			graphicsContext.camera.position.x -= forward.x * 0.5 * delta;
		}
		if (input.left){
			graphicsContext.camera.rotation.y += 0.001 * delta;
		}
		if (input.right){
			graphicsContext.camera.rotation.y -= 0.001 * delta;
		}
		if (input.up){
			graphicsContext.camera.position.y += 0.5 * delta;
		}
		if (input.down){
			graphicsContext.camera.position.y -= 0.5 * delta;
		}

		if (state)
			state.animate(delta);

	}).begin();

	input = new Input();
	state = new State();
	communicationClient = new CommunicationClient();
});



