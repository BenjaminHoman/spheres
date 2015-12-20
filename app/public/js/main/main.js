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

	this.light = new THREE.PointLight(0xFFFFFF);
	this.light.position.x = 10;
	this.light.position.y = 50;
	this.light.position.z = 130;
	this.scene.add(this.light);

	this.scene.add(this.camera);

	this.camera.position.z = 300;

	this.renderer.setSize(this.VIEWPORT.width, this.VIEWPORT.height);

	this.container.append(this.renderer.domElement);

	console.log("GraphicsContext init");
}
GraphicsContext.prototype.initDemoMeshes = function(){
	var radius = 50;
	var segments = 16;
	var rings = 16;

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
	graphicsContext = new GraphicsContext();
	graphicsContext.initDemoMeshes();
	
	var frameActuator = new FrameActuator(60, graphicsContext);
	frameActuator.beginRenderLoop();

	//Event listeners
	$(window).on('keydown', function(e){
		switch (e.keyCode){
			case 87:
				graphicsContext.sphere.position.z -= 10;
				break;
			case 38:
				graphicsContext.light.position.x += 5;
				break;
		}
	});
	$(window).on('resize',function(e){
		graphicsContext.resize();
	});
});



