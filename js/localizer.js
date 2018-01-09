var localizerDE = new Map();

var localizer;
localizer = localizerDE;

//TODO: use *.json file or something
localizerDE.set("right", "Richtig!");
localizerDE.set("2ndChance", "2. Chance!");
localizerDE.set("Country", "Land");
localizerDE.set("country", "Land");
localizerDE.set("State", "Bundesland");
localizerDE.set("state", "Bundesland");
localizerDE.set("Oblast", "Oblast");
localizerDE.set("nameQuestion", "Wie heißt dieses ");
localizerDE.set("?", "?");
localizerDE.set("findQuestion", "Wo liegt ");
localizerDE.set("mapNotFound", "Karte mit diesem Namen nicht gefunden!");
localizerDE.set("nonUnique", "Multipler Eintrag! Eineindeutigkeit verletzt!");

function local(key) {
	// Intercept grammatical problems here
	if (localizer.has(key)) return localizer.get(key);
	else return key;
}