// Global Object 
var db;

// GenericHAndler for Errors
function dbError(error) {
	alert('Datenbankfehler: "' + error.message + '", code: ' + error.code + '"');
}

// Generic Handler for Successful querries
function dbQuerrySuccess(tx, results) {
	alert("DEBUGGING: querry success " + results.rows.length);
}

// Nullhandler to fill in stuff
function nullHandler(){};

// CREATE TABLE IF NOT YET EXISTANT
function createMapTable(tx) {
	//tx.executeSql('DROP TABLE IF EXISTS User');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Map(MapName TEXT NOT NULL PRIMARY KEY, EntriesJson TEXT NOT NULL)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Achievement(ProfileName TEXT NOT NULL PRIMARY KEY, AchievementsJson TEXT NOT NULL)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS GameConfig(ProfileName TEXT NOT NULL PRIMARY KEY, ConfigJson TEXT NOT NULL)');
}

// FOR EDITOR AND GAME
function saveMap(tx, mapName, mapAsJson) {
	//alert ('("' + pP.getAccountName() + '"' + ', ' + bI(pP.getPregnant()) + ', ' + bI(pP.getVeganProd()) + ', ' + bI(pP.getVegan()) + ', ' + bI(pP.getVeggie()) + ', ' + 0 + ', ' + 100 + ', ' + pP.getMinProt() + ', ' + pP.getMaxProt() + ', ' + pP.getMinFat() + ', ' + bI(pP.getMaxFat()) + ', ' + pP.getMinCarb() + ', ' + pP.getMaxCarb() + ', ' + pP.getMinSugar() + ', ' + pP.getMaxSugar() + ', NULL, NULL' + ', ' + bI(pP.getHalal()) + ', ' + bI(pP.getKoscher()) + ', ' + bI(pP.getOrthodox()) + ', ' + bI(pP.getKoscher()) + ', NULL)');
	//var preg, veganP, veganProd, veggie, minKCal, maxKCal, minProt, maxProt, minFat, maxFat, minCarb, maxCarb, minSugar, maxSugar, Bio, Gen, Halal, Koscher, Orthodox, Hindu, Ingredients;
	tx.executeSql('INSERT OR REPLACE INTO Map(MapName, EntriesJson) VALUES (?, ?)', [mapName, mapAsJson]);
}
function loadMap(tx, mapName, callBackSuccess) {
	//alert("SELECT * FROM PersonalPref WHERE UserName = '" + uname + "'");
	tx.executeSql("SELECT * FROM Map WHERE MapName = ?", [mapName], callBackSuccess, dbError);
}

// FOR GAMECONFIG
function saveConfig(tx, configName, configAsJson) {
	tx.executeSql('INSERT OR REPLACE INTO GameConfig(ProfileName, ConfigJson) VALUES (?, ?)', [configName, configAsJson]);
}
function loadConfig(tx, configName, callBackSuccess) {
	tx.executeSql("SELECT * FROM GameConfig WHERE ProfileName = ?", [configName], callBackSuccess, dbError);
}
 
// FOR PREFERENCES
function getMaps(tx, callBackSuccess) {
	tx.executeSql("SELECT * FROM Map", [], callBackSuccess, dbError);
}
function resetDB(tx) {
	 tx.executeSql('DROP TABLE Map');
	 tx.executeSql('DROP TABLE GameConfig');
}

//FOR ACHIEVEMENTS
function saveAchievements(tx, configName, achAsJson) {
	tx.executeSql('INSERT OR REPLACE INTO Achievement(ProfileName, AchievementsJson) VALUES (?, ?)', [configName, achAsJson]);
}
function loadAchievements(tx, configName, callBackSuccess) {
	tx.executeSql("SELECT * FROM Achievement WHERE ProfileName = ?", [configName], callBackSuccess, dbError);
}

//Helperfunction to convert Boolean into Integer for SQLite
function bI(x) {
	if (x == true)  return 1;
	if (x == false) return 0;
	if (x) return 1;
	return 0;
}