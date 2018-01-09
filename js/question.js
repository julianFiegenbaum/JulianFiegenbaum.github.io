var Question = function(text, correctElement, type, entry) {
	this.type = type;
	this.correctElement = correctElement;
	this.text = text;
	this.entry = entry;
}
//Getter()
Question.prototype.getType = function(){return this.type};
Question.prototype.getCorrectElement = function(){return this.correctElement};
Question.prototype.getText = function(){return this.text};
Question.prototype.getEntry = function(){return this.entry};