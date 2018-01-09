function Success(type, data) {
	this.type = type;
	this.data = data;
}

//GETTER
Success.prototype.getType = function(){return this.type};
Success.prototype.getData = function(){return this.data};