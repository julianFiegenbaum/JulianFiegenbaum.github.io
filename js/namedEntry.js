function NamedEntry (name, category, style, multipleChoice, xPos, yPos, xImg, yImg, svg, svgSolved, nodeList, without, additional) {
	this.name 			= name;
	this.category 		= category;
	this.style 			= style;
	this.multipleChoice = multipleChoice;
	this.xPos 			= xPos;
	this.yPos 			= yPos;
	this.xImg 			= xImg;
	this.yImg 			= yImg;
	this.svg 			= svg;
	this.svgSolved 		= svgSolved;
	this.nodeList		= nodeList;
	this.without		= without;
	if (this.without == "" || typeof without == 'undefined') this.without = null;
	this.additional		= additional;
	if (this.additional == "" || typeof additional == 'undefined') this.additional = null;
}

//Getter()
NamedEntry.prototype.getName 				= function() {return this.name;};
NamedEntry.prototype.getCategory 			= function() {return this.category;};
NamedEntry.prototype.getStyle 				= function() {return this.style;};
NamedEntry.prototype.getMultipleChoice 		= function() {return this.multipleChoice;};
NamedEntry.prototype.getXPos 				= function() {return this.xPos;};
NamedEntry.prototype.getYPos 				= function() {return this.yPos;};
NamedEntry.prototype.getXImg 				= function() {return this.xImg;};
NamedEntry.prototype.getYImg 				= function() {return this.yImg;};
NamedEntry.prototype.getSvg 				= function() {return this.svg;};
NamedEntry.prototype.getSvgSolved 			= function() {return this.svgSolved;};
NamedEntry.prototype.getNodeList			= function() {return this.nodeList;};
NamedEntry.prototype.getWithout				= function() {return this.without;};
NamedEntry.prototype.getAdditional			= function() {return this.additional;};

//Setter()
NamedEntry.prototype.setName				= function(name) 		{this.name = name};
NamedEntry.prototype.setNodeList			= function(nodeList) 	{this.nodeList = nodeList};
NamedEntry.prototype.setCategory			= function(category) 	{this.category = category};
NamedEntry.prototype.setWithout				= function(without) 	{this.without = without};
NamedEntry.prototype.setAdditional			= function(additional) 	{this.additional = additional};
//TODO: Rest as appropriate

//Class method to create a NamedEntry from an untyped array, such as created by JSON.stringify()
//TODO: Is this a proper way to create Class methods in JS?
NamedEntry.fromJson = function(jsonNE) {
	var nodeList = new Array();
	for (var i = 0; i < jsonNE.nodeList.length; i++) {
		nodeList.push(pos.fromJson(jsonNE.nodeList[i]));
	}
	return new NamedEntry(jsonNE.name, jsonNE.category, jsonNE.style, jsonNE.multipleChoice, jsonNE.xPos, jsonNE.yPos, jsonNE.xImg, jsonNE.yImg, jsonNE.svg, jsonNE.svgSolved, nodeList, jsonNE.without, jsonNE.additional);
}