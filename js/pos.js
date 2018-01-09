function pos(x, y) {
	this.x = x;
	this.y = y;
}

//Getter()
pos.prototype.getX = function() {return this.x};
pos.prototype.getY = function() {return this.y};
//setter()
pos.prototype.setX = function(x) {this.x = x};
pos.prototype.setY = function(y) {this.y = y};

//Class method to create a pos from an untyped array, such as created by JSON.stringify()
//TODO: Is this a proper way to create Class methods in JS?
pos.fromJson = function(jsonPos) {
	return new pos(jsonPos.x, jsonPos.y);
}