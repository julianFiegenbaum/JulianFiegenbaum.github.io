var gameConfigGUI = {
	typeSelector1: null,
	typeSelector2: null,
	customMapPanel: null,
	editorCheckbox: null,
	swipeDownCheckbox: null,
	zoomToNameCheckbox: null,
	zoomOutAfterCheckbox: null,
	nameFindRange: null,
	holdTimeRange: null,
	
	init: function() {
		gameConfigGUI.typeSelector1			= document.getElementById("mapSelector1");
		gameConfigGUI.typeSelector2			= document.getElementById("mapSelector2");
		gameConfigGUI.customSelector		= document.getElementById("customMapInput");
		gameConfigGUI.customMapPanel		= document.getElementById("customMapPanel");
		gameConfigGUI.editorCheckbox		= document.getElementById("editorCheck");
		gameConfigGUI.swipeDownCheckbox		= document.getElementById("swipeToZoomCheck");
		gameConfigGUI.zoomOutAfterCheckbox	= document.getElementById("zoomOutAfterCheck");
		gameConfigGUI.nameFindRange			= document.getElementById("nameFindRatioRange");
		gameConfigGUI.holdTimeRange			= document.getElementById("holdThresholdRange");
		gameConfigGUI.editorButton			= document.getElementById("btnEditor");
		gameConfigGUI.zoomToNameCheckbox	= document.getElementById("zoomToNameCheck");
	}
}

var gameConfig = {
	gameType: "europe",
	zoomOutAfterQuestion: true,
	swipeDownToZoomOut:true,
	editorVisibility: true,
	zoomToName: false,
	holdTime: 450,
	nameFindRatio: 5,
	showWrongTime: 1800,
	profile: "mainProfile",
	
	init: function() {
		// GUI elements that change the gameConfig or are affected by the config
		gameConfigGUI.init();
		gameConfig.loadConfig();
	},
	
	setMapType: function(input) {
		gameConfig.gameType = input.value;
		if (input.value == "custom") 	gameConfig.displayCustomMapPanel();
		else 							customMapPanel.style.display = "none";
		gameConfigGUI.typeSelector1.value = input.value;
		gameConfigGUI.typeSelector2.value = input.value;
	},
	
	setZoomOutAfterQuestion: function(i) {
		gameConfig.zoomOutAfterQuestion = i.checked;
	},
	
	setSwipeDownToZoomOut: function(i) {
		gameConfig.swipeDownToZoomOut = i.checked;
	},
	setZoomToName: function(i) {
		gameConfig.zoomToName = i.checked;
	},
	setEditorVisibility: function(i) {
		gameConfig.editorVisibility = i.checked;
		if (gameConfig.editorVisibility) 	gameConfig.editorButton.style.display = 'inline';
		else 								gameConfig.editorButton.style.display = 'none';
	},
	
	setHoldTime: function(i) {
		gameConfig.holdTime = i.value;
	},
	
	setNameFindRatio: function(i) {
		gameConfig.nameFindRatio=i.value*10;
	},
	
	/**
	 * Make the GUI to match the gameConfig values.
	 * This assumes values are correct and the GUI needs to be adjusted.
	 */ 
	updateGUI: function() {
		// Last selected map
		if (gameConfig.gameType == "custom") {
			gameConfig.displayCustomMapPanel();
		}
		else {
			customMapPanel.style.display = "none";
		}
		
		gameConfigGUI.typeSelector1.value 				= gameConfig.gameType;
		gameConfigGUI.typeSelector2.value 				= gameConfig.gameType;
		// Checkboxes and Ranges
		gameConfigGUI.swipeDownCheckbox.checked			= gameConfig.swipeDownToZoomOut;
		gameConfigGUI.zoomOutAfterCheckbox.checked		= gameConfig.zoomOutAfterQuestion;
		gameConfigGUI.nameFindRange.value				= gameConfig.nameFindRatio/10;
		gameConfigGUI.holdTimeRange.value				= gameConfig.holdTime;
		gameConfigGUI.zoomToNameCheckbox.checked		= gameConfig.zoomToName;
		
		// And whether or not the editor button should be visible
		gameConfigGUI.editorCheckbox.checked			= gameConfig.editorVisibility;
		
		if (gameConfig.editorVisibility) {
			gameConfig.editorButton.style.display = 'inline';
		}
		else {
			gameConfig.editorButton.style.display = 'none';
		}
	},
	
	displayCustomMapPanel: function() {
		// Clear <select> of previous stuff
		while (gameConfigGUI.customSelector.hasChildNodes()) {
			gameConfigGUI.customSelector.removeChild(gameConfigGUI.customSelector.firstChild);
		}
		db.transaction(function(tx) {getMaps(tx, gameConfig.loadMapsCallback)}, dbQuerrySuccess);
		gameConfigGUI.customMapPanel.style.display = "block";
	},
	
	createCustomMapEntry: function(entry) {
		var name;
		if (entry == null) {
			name = "-- keine eigene Karte --"
		} else {
			name = entry;
		}
		
		var o 		= document.createElement("option");
		var text 	= document.createTextNode(name);
		o.appendChild(text);
		gameConfigGUI.customSelector.appendChild(o);
	},
	
	loadMapsCallback: function(tx, results){
    	var mapAsJson;
        var len = results.rows.length;
        if (len == 0) {
        	gameConfig.createCustomMapEntry(null);
        	return;
        }
        for (var i = 0; i < results.rows.length; i++) {
        	gameConfig.createCustomMapEntry(results.rows.item(i).MapName);
        }
	},
	
	deleteCustomMap: function(i) {
		alert("Löschen noch nicht eingebaut. Sind nur wenige kB - keine Sorge.")
	},
	
	loadConfig:	function() {
		db.transaction(function(tx) {loadConfig(tx, gameConfig.profile, gameConfig.loadConfigCallback)}, dbQuerrySuccess);
	},
	
	loadConfigCallback: function(tx, results) {
		var configAsJson; 
        var len = results.rows.length;
        if (len == 0) {
        	Console.log("Profil '" + gameConfig.profile + "' nicht gefunden. Nutze Initialwerte.");
        	
        }
        if (len > 1) {
        	alert("Multipler Eintrag! Eineindeutigkeit verletzt!");
        }
        
        configAsJson = results.rows.item(0).ConfigJson;
        gameConfig.loadConfigFromJson(configAsJson);
	},
	
	loadConfigFromJson: function(configAsJson) {
        var untypedJsonData = JSON.parse(configAsJson);
        gameConfig.gameType				= untypedJsonData.gameType;
        gameConfig.zoomOutAfterQuestion	= untypedJsonData.zoomOutAfterQuestion;
        gameConfig.swipeDownToZoomOut	= untypedJsonData.swipeDownToZoomOut;
        gameConfig.editorVisibility		= untypedJsonData.editorVisibility;
        gameConfig.holdTime				= untypedJsonData.holdTime;
        gameConfig.nameFindRatio		= untypedJsonData.nameFindRatio;
        gameConfig.showWrongTime		= untypedJsonData.showWrongTime;
        gameConfig.zoomToName			= untypedJsonData.zoomToName;
        gameConfig.updateGUI();
	},
	
	saveConfig:	function() {
		/*var configWithoutGUI = {        
			gameType: gameConfig.gameType,
			zoomOutAfterQuestion: 	gameConfig.zoomOutAfterQuestion,
			swipeDownToZoomOut: 	gameConfig.swipeDownToZoomOut,
			editorVisibility: 		gameConfig.editorVisibility,
			holdTime: 				gameConfig.holdTime,
			nameFindRatio: 			gameConfig.nameFindRatio,
			showWrongTime:  		gameConfig.showWrongTime,
			zoomToName:				gameConfig.zoomToName
		}*/
		var configAsJson = JSON.stringify(gameConfig);
		db.transaction(function(tx) {saveConfig(tx, gameConfig.profile, configAsJson)}, dbError, nullHandler);
	}
}
