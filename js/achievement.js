"use strict";

var achievementGUI = {
	achievementPanel: null,
	germany: null,
	africa: null,
	europe: null,
	sleep: null,
	
	init: function() {
		achievementGUI.achievementPanel = document.getElementById("achievementsPanel");
		achievementGUI.germany	= document.getElementById("achievementGermany");
		achievementGUI.africa	= document.getElementById("achievementAfrica");
		achievementGUI.europe	= document.getElementById("achievementEurope");
		achievementGUI.sleep	= document.getElementById("achievementSleep");
		achievementGUI.time1	= document.getElementById("achievementSpeed1");
		achievementGUI.time2	= document.getElementById("achievementSpeed2");
		//achievementGUI.marathon	= document.getElementById("achievementMarathon");

	}
}

var achievement = {
	germany:	false,
	europe:		false,
	usa:		false,
	africa:		false,
	marathon:	false,
	time1:		false,
	time2:		false,
	sleep:		false,
	sea:		false,
	middleEast:	false,
	asia:		false,
	
	init: function() {
		achievementGUI.init();
		achievement.loadAchievements();
	},
	
	reportSucces: function(id) {
		switch (id.getType()) {
		case "win":
			//alert("test - game " + id.getData() + " won");
			switch(id.getData()) {
				case "germany":
					achievement.germany = true;
					break;
				case "europe":
					achievement.europe = true;
					break;
				case "africa":
					achievement.africa = true;
					break;
				case "usa":
					achievement.usa = true;
					break;
				case "sea":
					achievement.sea = true;
					break;
				case "asia":
					achievement.asia = true;
					break;
				case "middleEast":
					achievement.middleEast = true;
					break;
			}
			break;
		}
		achievement.updateGUI();
		achievement.saveAchievements();
	},
	
	reportFailure: function(id) {
		
	},
	
	resolveGameWin: function(id) {
		
	},	
	loadAchievements: function() {
		db.transaction(function(tx) {loadAchievements(tx, gameConfig.profile, achievement.loadAchievementsCallback)}, dbQuerrySuccess);
	},
	
	saveAchievements: function() {
		var achAsJson = JSON.stringify(achievement);
		db.transaction(function(tx) {saveAchievements(tx, gameConfig.profile, achAsJson)}, dbError, nullHandler);
	},
	
	loadAchievementsCallback: function(tx, results) {
        var len = results.rows.length;
        if (len == 0) {
        	alert("no achievements entry found in profile. use default.")
        } else {
        	//alert(results.rows.item(0).AchievementsJson)
            var untypedJsonAch = JSON.parse(results.rows.item(0).AchievementsJson);
        	
        	achievement.germany 	= untypedJsonAch.germany;
        	achievement.europe 		= untypedJsonAch.europe;
        	achievement.usa 		= untypedJsonAch.usa;
        	achievement.africa 		= untypedJsonAch.africa;
        	achievement.marathon 	= untypedJsonAch.marathon;
        	achievement.time1 		= untypedJsonAch.time1;
        	achievement.time2 		= untypedJsonAch.time2;
        	achievement.sleep 		= untypedJsonAch.sleep;
        }
        //alert(JSON.stringify(achievement));
        achievement.updateGUI();
	},
	
	setFlagByName: function(name, val) {
		switch(name) {
		case "achievementGermany":
			achievement.germany = val;
			break;
		case "achievementEurope":
			achievement.europe = val;
			break;
		case "achievementAfrica":
			achievement.africa = val;
			break;
		case "achievementUsa":
			achievement.usa = val;
			break;
		case "achievementSea":
			achievement.sea = val;
			break;
		case "achievementAsia":
			achievement.asia = val;
			break;
		case "achievementMiddleEast":
			achievement.middleEast = val;
			break;
		case "achievementSleep":
			achievement.sleep = val;
			break;
		case "achievementMarathon":
			achievement.marathon = val;
			break;
		case "achievementSpeed1":
			achievement.time1 = val;
			break;
		case "achievementSpeed2":
			achievement.time2 = val;
			break;
		}
	},
	
	updateGUI: function() {
		if (achievement.germany) {
			achievement.enableAchievement(achievementGUI.germany);
		}
		else {
			achievement.disableAchievement(achievementGUI.germany);
		}
	
		if (achievement.africa) {
			achievement.enableAchievement(achievementGUI.africa);
		}
		else {
			achievement.disableAchievement(achievementGUI.africa);
		}
		
		if (achievement.europe) {
			achievement.enableAchievement(achievementGUI.europe);
		}
		else {
			achievement.disableAchievement(achievementGUI.europe);
		}
		
		if (achievement.sleep) {
			achievement.enableAchievement(achievementGUI.sleep);
		}
		else {
			achievement.disableAchievement(achievementGUI.sleep);
		}
		
		if (achievement.time1) {achievement.enableAchievement(achievementGUI.time1);} else {achievement.disableAchievement(achievementGUI.time1);}
	},
	
	toggleAchievement: function(ref){
		if (!ref) return;
		if (ref.classList.contains("achievement-disabled")) {
			achievement.enableAchievement(ref);
		} else {
			achievement.disableAchievement(ref);
		}
	},
	
	enableAchievement: function(ref) {
		if (!ref) return;
		ref.classList.remove("achievement-disabled");
		var image = document.getElementById(ref.id + "Img");
		image.src = image.getAttribute('enabledSrc');

		//TODO: this is GUI manipulation. Saving the data should be somewhere else
		achievement.setFlagByName(ref.id, true);
		achievement.saveAchievements();
	},
	
	disableAchievement: function(ref) {
		if (!ref) return;
		ref.classList.add("achievement-disabled");
		var image = document.getElementById(ref.id + "Img");
		image.src = "img/achievements/disabled.png";

		//TODO: this is GUI manipulation. Saving the data should be somewhere else
		achievement.setFlagByName(ref.id, false);
		achievement.saveAchievements();
	},
	
	
	
	//TODO: If i ever come around to making achievements via Json file.
	createGUI: function() {
		// Create List
		var achievementList = achievement.createAchievementList();
		// Clear previous
		while(achievementGUI.achievementPanel.hasChildNodes()) {
			achievementGUI.achievementPanel.removeChild(achievementGUI.achievementPanel.firstChild);
		}
		// For every entry create an optical representation
		for (var i = 0; i < achievementList.length; i++){
			createAchievementPanel(achievementList[i]);
		}
	},
	createAchievementPanel: function(id) {
	    var d = document.createElement("div");
	    d.classList.add("achievement");
	    	    
	    var i = document.createElement("img");
	    i.classList.add("achievement-img");
	    
	    //TODO: replace  string literals with localized achievement description fetched from Json
	    var cap  = document.createElement("p");
		var text1 = document.createTextNode("Überschrift");
		cap.appendChild(text1);
		
	    var cap  = document.createElement("p");
		var text2 = document.createTextNode("Beschreibungstext");
		cap.appendChild(text2);
		
		//TODO: Append to panel
	},
	createAchievementList: function() {
		var achievementList = new Array();
		//TODO: Read Json here
		return achievementList;
	}
}
