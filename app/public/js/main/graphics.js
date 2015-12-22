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

	this.camera.position.z = 600;

	this.renderer.setSize(this.VIEWPORT.width, this.VIEWPORT.height);
	this.renderer.setClearColor(0xffffff, 1);

	this.container.append(this.renderer.domElement);

	console.log("GraphicsContext init");
}
GraphicsContext.prototype.createSphere = function(sphere){
	var radius = sphere.radius;
	var segments = 10;
	var rings = 10;
	var sphereMaterial = new THREE.MeshLambertMaterial({
		color: 0xCC00CC,
	});
	var sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(radius,segments,rings), sphereMaterial);
	sphereMesh.position.x = sphere.pos.x;
	sphereMesh.position.y = sphere.pos.y;
	sphereMesh.position.z = sphere.pos.z;
	sphereMesh.name = sphere.id;
	this.scene.add(sphereMesh);
	return sphereMesh;
}
GraphicsContext.prototype.removeSphere = function(sphereMesh){
    this.scene.remove(sphereMesh);
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