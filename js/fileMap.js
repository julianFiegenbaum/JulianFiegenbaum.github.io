var fileMap = new Map();

//TODO: use *.json file or something
fileMap.set("europe", "img/achievements/europa.png");

function findFile(key) {
	// Intercept grammatical problems here
	if (localizer.has(key)) return localizer.get(key);
	else return key;
}