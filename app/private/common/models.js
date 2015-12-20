var uuid = require("node-uuid");

var Client = function(){
	this.id = uuid.v1();
}
Client.prototype.debug = function(){
	console.log(this.constructor.name + " with id: " + this.id);
}
exports.Client = Client;