"use strict";

var mapDingensResultTimer;
var result = {
		message: null,
		problemsPanel: null,
		achievementsPanel: null,
		meter: null,
		repeatProblemsButton: null,
		score: 0,
		timeDelta: 20,
		scoreCountTime: 0,
		scoreMaxTime: 3000,
		view: null,
				
		init: function() {
		
			result.message				= document.getElementById("resultMessage");
			result.problemsPanel 		= document.getElementById("resultProblems");
			result.repeatProblemsButton = document.getElementById("btnRepeatErrors");
			result.achievementsPanel 	= document.getElementById("resultAchievementPanel");
			result.meter 				= document.getElementById("resultMeter");
			result.goldPlusImg			= document.getElementById("goldPlusImg");
			result.goldImg				= document.getElementById("goldImg");
			result.silverPlusImg		= document.getElementById("silverPlusImg");
			result.silverImg			= document.getElementById("silverImg");
			result.bronzePlusImg		= document.getElementById("bronzePlusImg");
			result.bronzeImg			= document.getElementById("bronzeImg");
			result.view					= document.getElementById("resultMenu");
		},

		open: function(points, maxPoints, failList) {

			var message;
			app.hideOverlays();
			result.view.style.display = "inline";
			if (maxPoints != 0) result.score = points/maxPoints;
			game.winOverlay.style.display = "none";
			result.goldImg.style.display = "none";
			result.goldPlusImg.style.display = "none";
			result.silverImg.style.display = "none";
			result.silverPlusImg.style.display = "none";
			result.bronzeImg.style.display = "none";
			result.bronzePlusImg.style.display = "none";
			
			if 		(result.score == 1) 	{
				message = "Du hast alles perfekt beantwortet, du coole Sau!";
				result.goldPlusImg.style.display = "inline";
			}
			else if (result.score >= 0.9) 	{
				message = "Das ist mal eine reife Leistung! Perfektion ist in unmittelbarer Reichweite!";
				result.goldImg.style.display = "inline";
			}
			else if (result.score >= 0.7) 	{
				message = "Echt gut! Da lohnt sich doch jetzt ein Endspurt. Spiel am besten direkt nochmal ;)";
				result.silverPlusImg.style.display = "inline";
			}
			else if (result.score >= 0.4) 	{
				message = "Schonmal eine gute Grundlage, um die letzten Länder auch noch schnell einzuordnen.";
				result.silverImg.style.display = "inline";
			}
			else if (result.score >= 0.2) 	{
				message = "Ein Anfang, aber lange noch kein Grund sich zufrieden zurückzulehnen...";
				result.bronzePlusImg.style.display = "inline";
			}
			else							{
				message = "Da wäre wohl mehr drin gewesen, aber dafür gibt es ja dieses Spiel :)";
				result.bronzeImg.style.display = "inline";
			}
			
			clearInterval(mapDingensResultTimer);
			result.scoreMaxTime = 3000 + result.score * 2000;
			mapDingensResultTimer = setInterval(result.progressTime, result.timeDelta);
			result.scoreCountTime = 0;
			
			result.clearMessagePanel();
			var msgText = document.createTextNode(message);
			result.message.appendChild(msgText);
			
			result.clearProblemsPanel();
			//alert(game.wrongList.length);
			if (game.questionsSkipped > 0) {
				var text = document.createTextNode(game.questionsSkipped + " Fragen übersprungen.");
				result.problemsPanel.appendChild(text);
				var br = document.createElement("br");
				result.problemsPanel.appendChild(br);
			}
			if (game.wrongList.length < 1) {
				var text = document.createTextNode("Keine Fehler");
				result.problemsPanel.appendChild(text);
				result.repeatProblemsButton.style.display = "none";
			} else {
				result.repeatProblemsButton.style.display = "inline";
				var text = document.createTextNode("Problemzonen:");
				result.problemsPanel.appendChild(text);
			}
			for (var i = 0; i < game.wrongList.length; i++) {
				//alert("test");
				var br = document.createElement("br");
				result.problemsPanel.appendChild(br);
				var text = document.createTextNode("- " + game.wrongList[i].getName());
				result.problemsPanel.appendChild(text);
			}
			
		},
		
		clearProblemsPanel: function() {
			while (result.problemsPanel.hasChildNodes()) {
				result.problemsPanel.removeChild(result.problemsPanel.firstChild);
			}
		},
		
		clearMessagePanel: function() {
			while (result.message.hasChildNodes()) {
				result.message.removeChild(result.message.firstChild);
			}
		},
		
		progressTime: function() {
			// Progress time
			result.scoreCountTime = result.scoreCountTime + result.timeDelta;
			if (result.scoreCountTime > result.scoreMaxTime) {
				result.meter.value = result.score;
				//TODO: Animate Text
				if (result.scoreCountTime > result.scoreMaxTime + 1000) {
					clearInterval(mapDingensResultTimer);
					result.scoreCountTime = 0;
				}
				return;
			} else {
				result.meter.value = result.score * (1 - Math.pow(((-1*(result.scoreCountTime / result.scoreMaxTime) + 1)), 2));
			}
		}
}