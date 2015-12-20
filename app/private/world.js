var Models = require("./common/models.js");

/*
	World
		holds references to all web sockes wich have client object tacked to them
*/
var World = function(){
	this.clients = [];
}
World.prototype.handleClientConnect = function(ws){
	ws.client = new Models.Client();
	ws.client.debug();

	this.clients.push(ws);
}
World.prototype.handleClientMessage = function(ws, msg){
	console.log("client message: " + msg + " from: ");
}
World.prototype.handleClientDisconnect = function(ws){
	this.removeClientWithWs(ws);
}
World.prototype.removeClientWithWs = function(ws){
	for (var i = 0; i < this.clients.length; ++i){
		if (this.clients[i] == ws){
			this.clients.splice(i, 1);
			return;
		}
	}
	console.error("trying to remove client that is not connected");
}
exports.World = World;