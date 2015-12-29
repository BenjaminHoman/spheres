var graphicsContext = null;

var GraphicsContext = function(){
	this.VIEWPORT = {
		width: window.innerWidth,
		height: window.innerWidth,
		viewAngle: 45,
		near: 0.1,
		far: 10000,
	};
	this.hideDistThreshhold = 150;

	this.container = null;
	this.renderer = null;
	this.camera = null;
	this.scene = null;
	this.light = null;

	this.sphere = null;
	this.orbitControls = null;

	this.tokenGeometry = null;
	this.tokenMaterial = null;

	this.init();
}
GraphicsContext.prototype.loadTokenGeometry = function(){
	var loader = new THREE.JSONLoader();
	var that = this;
	loader.load("/obj/token.js", function(geometry){
		that.tokenGeometry = geometry;
		that.tokenGeometry.scale(1.3,1.3,1.3);
		that.tokenMaterial = new THREE.MeshPhongMaterial({
			color: 0xff891f,
			shininess: 80.0,
			emissive: 0xff891f,
			specular: 0xffffff,
		});
	});
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

	this.renderer.setSize(this.VIEWPORT.width, this.VIEWPORT.height);
	this.renderer.setClearColor(0x696969, 1);

	this.container.append(this.renderer.domElement);

	this.orbitControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
	this.orbitControls.enableDamping = true;
	this.orbitControls.dampingFactor = 0.25;
	this.orbitControls.enableZoom = true;
	this.orbitControls.minDistance = 120;
	this.orbitControls.maxDistance = 200;

	this.loadTokenGeometry();
}
GraphicsContext.prototype.createSphere = function(sphere){
	var radius = sphere.radius;
	var segments = 8;
	var rings = 8;
	var sphereMaterial = new THREE.MeshPhongMaterial({
		color: sphere.color,
		shininess: 100.0,
		emissive: 0x111111,
		specular: 0x010001,
	});
	sphereMaterial.transparent = true;
	var sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(radius,segments,rings), sphereMaterial);
	sphereMesh.position.x = sphere.pos.x;
	sphereMesh.position.y = sphere.pos.y;
	sphereMesh.position.z = sphere.pos.z;
	this.scene.add(sphereMesh);
	return sphereMesh;
}
GraphicsContext.prototype.createToken = function(position){
	if (!this.tokenGeometry || !this.tokenMaterial){
		return null;
	}
	var token = new THREE.Mesh(this.tokenGeometry, this.tokenMaterial);
	token.position.x = position.x;
	token.position.y = position.y;
	token.position.z = position.z;
	this.scene.add(token);
	return token;
}
GraphicsContext.prototype.removeMesh = function(mesh){
    this.scene.remove(mesh);
}
GraphicsContext.prototype.resize = function(){
	this.VIEWPORT.width = window.innerWidth;
	this.VIEWPORT.height = window.innerHeight;

	this.renderer.setSize(window.innerWidth, window.innerHeight);
	this.camera.aspect = this.VIEWPORT.width / this.VIEWPORT.height;
	this.camera.updateProjectionMatrix();
}
GraphicsContext.prototype.render = function(){
	this.hideNearObjects();
	this.renderer.render(this.scene, this.camera);
}
GraphicsContext.prototype.hideNearObjects = function(){
	var unit = 1.0 / this.hideDistThreshhold;
	var that = this;
	this.scene.traverse(function(node){
		if (node instanceof THREE.Mesh){
			var distanceToCamera = distance(node.position, that.camera.position);

			if (distanceToCamera < that.hideDistThreshhold){
				node.material.opacity = (unit * (Math.pow(distanceToCamera, 2) * 0.02));
			
			} else {
				node.material.opacity = 1.0;
			}
    	}
	});
}