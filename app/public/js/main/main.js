
$(document).ready(function(){
	graphicsContext = new GraphicsContext();
	var orbitControls = new THREE.OrbitControls(graphicsContext.camera, graphicsContext.renderer.domElement);
	orbitControls.enableDamping = true;
	orbitControls.dampingFactor = 0.25;
	orbitControls.enableZoom = false;

	$(window).on('resize',function(e){
		graphicsContext.resize();
	});
	
	new FrameActuator(60, function(delta){
		graphicsContext.render();
		orbitControls.update();

		if (state)
			state.animate(delta);

	}).begin();

	input = new Input();
	state = new State();
	communicationClient = new CommunicationClient();
});



