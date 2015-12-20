var graphicsContext = null;

var GraphicsContext = function(){
	this.VIEWPORT = {
		width: window.innerWidth,
		height: window.innerWidth,
		viewAngle: 45,
		near: 0.1,
		far: 10000,
	};
	this.container = null;
	this.renderer = null;
	this.camera = null;
	this.scene = null;
	this.light = null;

	this.sphere = null;

	this.init();
}
GraphicsContext.prototype.init = function(){
	this.container = $("#renderContainer");
	this.renderer = new THREE.WebGLRenderer();
	this.camera = new THREE.PerspectiveCamera(this.VIEWPORT.viewAngle, this.VIEWPORT.width / this.VIEWPORT.height, this.VIEWPORT.near, this.VIEWPORT.far);
	this.scene = new THREE.Scene();

	this.light = new THREE.DirectionalLight(0xffffff, 1.0);
	this.light.position.set(0.2, 0.7, 1);
	this.scene.add(this.light);

	this.scene.add(this.camera);

	this.camera.position.z = 300;

	this.renderer.setSize(this.VIEWPORT.width, this.VIEWPORT.height);

	this.container.append(this.renderer.domElement);

	console.log("GraphicsContext init");
}
GraphicsContext.prototype.initDemoMeshes = function(){
	var radius = 30;
	var segments = 10;
	var rings = 10;

	var sphereMaterial = new THREE.MeshLambertMaterial({
		color: 0xCC00CC,
	});

	this.sphere = new THREE.Mesh(new THREE.SphereGeometry(radius,segments,rings), sphereMaterial);
	this.scene.add(this.sphere);
}
GraphicsContext.prototype.resize = function(){
	this.VIEWPORT.width = window.innerWidth;
	this.VIEWPORT.height = window.innerHeight;

	this.renderer.setSize(window.innerWidth, window.innerHeight);
	this.camera.aspect = this.VIEWPORT.width / this.VIEWPORT.height;
	this.camera.updateProjectionMatrix();
}
GraphicsContext.prototype.render = function(){
	this.renderer.render(this.scene, this.camera);
}

$(document).ready(function(){
	var input = new Input();

	graphicsContext = new GraphicsContext();
	graphicsContext.initDemoMeshes();

	$(window).on('resize',function(e){
		graphicsContext.resize();
	});
	
	new FrameActuator(60, function(delta){
		graphicsContext.render();

		if (input.forward){
			graphicsContext.sphere.position.z -= 0.5 * delta;
		}
		if (input.backward){
			graphicsContext.sphere.position.z += 0.5 * delta;
		}

	}).begin();

	var communicationClient = new CommunicationClient();
});



