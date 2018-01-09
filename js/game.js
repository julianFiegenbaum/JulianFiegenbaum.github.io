"use strict";

var mapDingensAnimationTimer = null;
var defaultLineColor = '#E51A4B';
var defaultFillColor = "rgba(229, 26, 75, 0.2)";
var defaultCountryColor = "#FDF5E6";

var game = {
		background:	null,
		backgroundImg: null,
		backgroundCtx: null,
		backgroundScale: 1.0,
		blueprintWidth: 2007,
		blueprintHeight: 1961,
		backgroundWidth: 2007,
		backgroundHeight: 1961,
		backgroundOffX: 0,
		backgroundOffY: 0,
		listOfEntries: new Array(),
		listOfRelevantEntries: new Array(),
		currentNodeList: null,
		currentEntry: null,
		mapNameInput: null,
		dragTime: 0,
		dragX: 0,
		dragY: 0,
		pinchScale: 1,
		pinchPos: new pos(0, 0),
		currentQuestion: null,
		questionDisplay: null,
		listOfQuestions: null,
		wrongList: new Array(),
		currentQuestionIndex: -1,
		questionText: null,
		numberMultipleChoice: 6,
		holdTime: 0,
		holdPos: new pos(0,0),
		holdEntry: null,
		timeDelta: 20,
		holdThreshold: 450,
		holding: false,
		mapOffset: new pos(0,0),
		pointIndicator: null,
		maxPoints: 0,
		currentPoints: 0,
		helpMode: false,
		fakeEntryList: null,
		correcting: false,
		correctAnswerTime: 0,
		rightTime: 0,
		righting: false,
		rightOffset: 0,
		wrongTime: 0,
		wronging: false,
		wrongMessage: "",
		wrongOffset: 0,
		secondChanceTime: 0,
		secondChancing: false,
		zooming: false,
		zoomTime: 0,
		zoomPos: new pos(0,0),
		guiPanel: null,
		gameType: "",
		lastTime: 0,
		questionsSkipped: 0,
		questionsAnswered: 0,
		winTime: 0,
		winning: false,
		resultImage: null,
		resultBtn: null,
		winOverlay: null,
		winCanvas: null,
		winCtx: null,
		
		/**
		 * Basically a constructor for the singleton game
		 */
		init: function() {	
			// Remember some GUI elements from the DOM
			game.questionText 	= document.getElementById("gameQuestionText");
			game.background 	= document.getElementById("gameBackground");
			game.backgroundImg 	= document.getElementById("gameBackgroundImg");
			game.backgroundCtx 	= game.background.getContext("2d");
			game.guiPanel		= document.getElementById("gameQuestionPanel");
			game.resultBtn		= document.getElementById("gameResultButton");
			game.winOverlay		= document.getElementById("winOverlay");
			game.winCanvas		= document.getElementById("winCanvas");
			game.winCtx			= game.winCanvas.getContext("2d");
			
			// Register events
			window.addEventListener('resize', function(e){rescaleProportions.call(game, 150, 150)});
			window.addEventListener('orientationchange', function(e){rescaleProportions.call(game, 150, 150)});
			game.background.addEventListener("wheel", function(e) {
				game.pinchPos = new pos(e.clientX, e.clientY);
				zoomBackgroundWheel.call(game, e);
			}, false);	
			
			// Activate touch events with hamer.js
			// Create hammer objects for Managing and different event types
			var hammertime = 	new Hammer.Manager(this.background);
			var pinchHammer = 	new Hammer.Pinch({ threshold: 0 });
			var panHammer =		new Hammer.Pan();
			var tapHammer =		new Hammer.Tap({ threshold: 10 });
			var dblTapHammer =	new Hammer.Tap({ event: 'dbltap', taps: 2, threshold: 50, posThreshold: 50});
			var pressHammer = 	new Hammer.Press({time: 10});
			var swipeHammer =	new Hammer.Swipe({velocity: 1.3});

			// Some events should not exclude others
			panHammer.recognizeWith(pinchHammer);
			dblTapHammer.recognizeWith(tapHammer);
			swipeHammer.recognizeWith(panHammer);
			//panHammer.requireFailure(swipeHammer); NOT NEEDED
			
			// Add hammers
			hammertime.add(pinchHammer);
			hammertime.add(panHammer);
			hammertime.add(tapHammer);
			hammertime.add(dblTapHammer);
			hammertime.add(pressHammer);
			hammertime.add(swipeHammer);
			
			// Event behaviour
			hammertime.on('pinchstart', function(ev) { game.stopSkippableAnimations(); game.pinchScale = ev.scale; startPan.call(game, ev);});
			hammertime.on('pinch', 		function(ev) { 
				game.stopSkippableAnimations();
				game.pinchPos = new pos(ev.center.x, ev.center.y);
				pinchBackgroundWheel.call(game, ev);
				endPan.call(game, ev)
			});
			hammertime.on('panstart', 	function(ev) { game.stopSkippableAnimations(); startPan.call(game, ev);});
			hammertime.on('pan', 		function(ev) { game.holding = false; endPan.call(game, ev);});
			hammertime.on('pinchend', 	function(ev) {
				game.stopSkippableAnimations();
				// Stop jerky pan at end of pinch, by delaying pan activation
				game.dragTime = Date.now();	// This will be checked by the panningHandler
			});
			hammertime.on('press', 		function(ev){
				// If we toucg the screeny we don't want to see thingies
				game.stopSkippableAnimations();
				
				// Skip if question doesn't require pointing at the map
				if (game.currentQuestion.getType() != 'find') return;
				
				// Otherwise check, which country was clicked
				game.holdPos = new pos(ev.center.x, ev.center.y);
				var pt = new pos(game.reverseX(game.holdPos.getX()), game.reverseY(game.holdPos.getY()));
				game.holdEntry = game.getEntryByCoordinate(pt);
				
				if (game.holdEntry != null) {
					//alert(game.holdEntry.getName())
					game.holdTime = 0;
					game.holding = true;
				}

			});
			hammertime.on('pressup', 	function(ev){
				game.holding = false;
			});
			hammertime.on('tap', 		function(ev){
				game.stopSkippableAnimations();
			});
			hammertime.on('swipedown', 	function(ev){
				game.stopSkippableAnimations();
				if (gameConfig.swipeDownToZoomOut) {
					zoomOut.call(game);
					centerBackground.call(game);	
				}
			});
			hammertime.on('dbltap',		function(ev){
				var x = game.reverseX(ev.center.x); // Remember the values first, because the projection changes with zoom...		
				var y = game.reverseY(ev.center.y);
				quickZoom.call(game, game.backgroundScale*2.5);
				centerAt.call(game, x, y);
				game.zoomPos = new pos(ev.center.x, ev.center.y);
				game.zoomTime = 0;
				game.zooming = true;
			 });
			
			// Adjust size of GUI and other graphical elementszo
			rescaleProportions.call(game, 150, 150);			
			game.backgroundCtx.lineCap="round";
			game.backgroundCtx.lineJoin = "round";
		},
		
		/**
		 * helper to end Animations that should be interrupted by tapping/gestures
		 */
		stopSkippableAnimations: function() {
			game.holding = false;
			game.wronging = false;
			game.righting = false;
			if (game.correcting) game.stopCorrectAnswerFlash();
			game.updateBackground(); // Overwrite animation remnants
		},
		
		repeatProblems: function() {
			game.resetStats();
			game.gameType = "repeat"
			// Change view and BackgroundImage
			app.navigateTo('gameMenu');
			
			// Prepare Quiz data
			game.createQuestions(game.wrongList);
			//game.linkEntries();
			game.wrongList = new Array();
			game.currentQuestionIndex = -1;
			zoomOut.call(game);
			centerBackground.call(game);
			game.nextQuestion();
			
			// Start Animations
			clearInterval(mapDingensAnimationTimer);
			mapDingensAnimationTimer = setInterval(game.progressTime, game.timeDelta);
			game.lastTime = Date.now();
		},
		
		resetStats: function() {
			game.maxPoints = 0;
			game.currentPoints = 0;
			game.questionsSkipped = 0;
			game.questionsAnswered = 0;
			game.wronging = false;
			game.helpMode = false;
			game.holding = false;
			game.correcting = false;
			game.zooming = false;
			game.righting = false;
			game.secondChancing = false;
			game.winning = false;
		},
		/**
		 * Starts the game. Called by the 'Start Game' button.
		 * Defers to startGameCallback for parts that need to wait for loaded data and images.
		 */
		startGame: function() {
			game.resetStats();
			game.gameType = gameConfig.gameType;
			game.backgroundImg.onload = "";
			game.backgroundImg.src = "";
			
			//if loaded from SQL the callback needs to be called by the successful transaction after the loadMapCallback (data interpretation)
			switch(game.gameType) {
		    case "africa":
		    	game.backgroundImg.onload = function() {game.loadMapFromJson(africaAsJson);game.startGameCallback();}
		    	game.backgroundImg.src = "img/africa_outline.png";
		        break;
		    case "europe":
		    	game.backgroundImg.onload = function() {game.loadMapFromJson(europeAsJson);game.startGameCallback();}
		    	game.backgroundImg.src = "img/europa_outline.png";
		        break;
		    case "asia":
		    	game.backgroundImg.onload = function() {game.loadMapFromJson(asiaAsJson);game.startGameCallback();}
		    	game.backgroundImg.src = "img/asia_outline.png";
		        break;
		    case "sa":
		    	game.backgroundImg.onload = function() {game.loadMapFromJson(saAsJson);game.startGameCallback();}
		    	game.backgroundImg.src = "img/south_america_outline.png";
		        break;
		    case "na":
		    	game.backgroundImg.onload = function() {game.loadMapFromJson(naAsJson);game.startGameCallback();}
		    	game.backgroundImg.src = "img/north_america_outline.png";
		        break;
		    case "germany":
		    	game.backgroundImg.onload = function() {game.loadMapFromJson(germanyAsJson);game.startGameCallback();}
		    	game.backgroundImg.src = "img/germany_outline.png";
		        break;
		    case "oceania":
		    	game.backgroundImg.onload = function() {game.loadMapFromJson(oceaniaAsJson);game.startGameCallback();}
		    	game.backgroundImg.src = "img/oceania_outline.png";
		        break;
		    case "middleEast":
		    	game.backgroundImg.onload = function() {game.loadMapFromJson(middleEastAsJson);game.startGameCallback();}
		    	game.backgroundImg.src = "img/middle_east_outline.png";
		        break;
		    default:
		    	game.backgroundImg.onload = function() {game.loadMapFromJson(europeAsJson);game.startGameCallback();}
	    		game.backgroundImg.src = "img/europa_outline.png";
			}
		},
		
		/**
		 * Takes care of setting up a game. The part that needs data and images to be loaded.
		 */		
		startGameCallback: function() {
			// Change view and BackgroundImage
			app.navigateTo('gameMenu');
			game.blueprintWidth 	= game.backgroundImg.naturalWidth;
			game.blueprintHeight 	= game.backgroundImg.naturalHeight;
			
			// Prepare Quiz data
			game.wrongList = new Array();
			game.createRelevantEntries();			
			game.createQuestions(game.listOfRelevantEntries);
			game.linkEntries();
			game.currentQuestionIndex = -1;
			zoomOut.call(game);
			centerBackground.call(game);
			game.nextQuestion();
			
			// Start Animations
			clearInterval(mapDingensAnimationTimer);
			mapDingensAnimationTimer = setInterval(game.progressTime, game.timeDelta);
			game.lastTime = Date.now();
		},
		
		/**
		 * Linked entries are referred to by their name. To quicken things later that should use a direct reference.
		 * These direct references are set up in this method.
		 */
		linkEntries: function() {
			for (var i = 0; i < game.listOfEntries.length; i++) {
				if (game.listOfEntries[i].getWithout() != null) {			
					game.listOfEntries[i].setWithout(game.getEntryByName(game.listOfEntries[i].getWithout()));
				}
				if (game.listOfEntries[i].getAdditional() != null) {			
					game.listOfEntries[i].setAdditional(game.getEntryByName(game.listOfEntries[i].getAdditional()));
				}
			}
		},
				
		/**
		 * Sort out the entries that should not be shown in the questions/fake answers
		 */
		createRelevantEntries: function() {
			game.listOfRelevantEntries = new Array();
			for (var i = 0; i < game.listOfEntries.length; i++) {
				if (game.listOfEntries[i].getCategory() != "dummy" && game.listOfEntries[i].getCategory() != "whole") {
					game.listOfRelevantEntries.push(game.listOfEntries[i]);
				}
			}
		},
		
		/**
		 * Create list of questions for this game
		 */
		createQuestions: function(templateList) {
			game.listOfQuestions = new Array();
			var random;
			for (var i = 0; i < templateList.length; i++) {
				random = getRandomInt(0,100);
				var name = templateList[i].getName();
				var category = templateList[i].getCategory();
				if (random < gameConfig.nameFindRatio) {
					game.listOfQuestions.push(new Question(local("findQuestion") + local(name) 		+ local("?"), name, "find", templateList[i]));
					game.maxPoints = game.maxPoints + 2;
				} else if (random >= gameConfig.nameFindRatio) {
					game.listOfQuestions.push(new Question(local("nameQuestion") + local(category) 	+ local("?"), name, "name", templateList[i]));
					game.maxPoints = game.maxPoints + 1;
				}
			}
			game.listOfQuestions = shuffleArray(game.listOfQuestions);
		},
		
		/**
		 * Progresses all the animation and animation-linked happenings.
		 */
		progressTime: function() {	
			// Acquire time delta
			var t = Date.now() - game.lastTime;
			game.lastTime = Date.now();
			
			// Clear former animations
			game.updateBackground();
			
			// Context for all animations
			game.backgroundCtx.strokeStyle = '#E51A4B';
			game.backgroundCtx.fillStyle = '#E51A4B';
			game.backgroundCtx.lineWidth = 2;
			game.backgroundCtx.font = "bold 30px Arial";
			
			// Do the animations
			game.callAnimations(t);
		},
		
		callAnimations: function(t) {
			//if (!(game.holding || game.zooming || game.righting || game.wronging || game.correcting)) return; //|| game.secondChancing
			if (game.holding) {
				game.progressHoldTime(t);
			}
			if (game.zooming) {
				game.progressZoomTime(t);
			}
			if (game.righting) {
				game.progressRightTime(t);
			}
			if (game.wronging) {
				game.progressWrongTime(t);
			}
			if (game.secondChancing) {
				game.progressSecondChanceTime(t);
			}
			if (game.correcting) {
				game.progressCorrectAnswerTime(t);
			}
			if (game.winning) {
				game.progressWinTime(t);
			}
		},
		
		/**
		 * Progress animation of "You have answered correctly!" feedback
		 * @param t the time delta since last frame
		 */
		progressRightTime: function(t) {
			// Increase Animation time
			game.rightTime = game.rightTime + t;
			
			// Some repeating values
			var waitTime = 1000;
			var offX = getStringWidth(local("right"));
			var rightTimeThreshold = game.background.width + waitTime + offX;
			var halfway = (game.background.width - offX)/2;
			// Check if Animation is over
			if (game.rightTime > rightTimeThreshold) {
				game.rightTime = 0;
				game.righting = false;
				return;
			// Animate feedback
			} else {
				var left = game.rightTime - offX/2;
				
				if (game.rightTime >  game.background.width/2 && game.rightTime < game.background.width/2 + waitTime) {
					left = halfway;
				} else if (game.rightTime >= game.background.width/2 + waitTime) {
					left = game.rightTime - offX/2 - waitTime;
				}
				
				var top = 70;
				game.backgroundCtx.fillText(local("right"), left, top);
			}
		},
		
		/**
		 * Progress animation of "You have answered incorrectly!" feedback
		 * @param t the time delta since last frame
		 */
		progressWrongTime: function(t) {
			// Increase Animation time
			game.wrongTime = game.wrongTime + t;
			
			// Some repeating values
			var waitTime = gameConfig.showWrongTime;
			var offX = game.wrongOffset;
			var wrongTimeThreshold = game.background.width + waitTime + offX;
			var halfway = (game.background.width - offX)/2;

			// Check if Animation is over
			if (game.wrongTime > wrongTimeThreshold) {
				game.wrongTime = 0;
				game.wronging = false;
				game.stopCorrectAnswerFlash();
				return;
			// Animate feedback
			} else {
				var left = game.wrongTime - offX/2;
				if (game.wrongTime > game.background.width/2  && game.wrongTime < game.background.width/2 + waitTime) {
					left = halfway;
				} else if (game.wrongTime >= game.background.width/2 + waitTime) {
					left = game.wrongTime - offX/2 - waitTime;
				}
				var top = 70;
				game.backgroundCtx.fillText(game.wrongMessage, left, top);
			}
		},
		
		/**
		 * Progress animation of zooming feedback
		 * @param t the time delta since last frame
		 */
		progressZoomTime: function(t) {
			// Increase Animation time
			game.zoomTime = game.zoomTime + t;

			// Check if Animation is over
			if (game.zoomTime > 450) {
				game.zoomTime = 0;
				game.zooming = false;
				return;
			// Animate zoom animation
			} else {
				game.backgroundCtx.beginPath();
				var width = game.zoomTime / 5;
				var radius = width;
				game.backgroundCtx.arc(game.zoomPos.getX(), game.zoomPos.getY(), radius, 0, 2 * Math.PI, false);
				/*game.backgroundCtx.moveTo(game.zoomPos.getX() - width, game.zoomPos.getY() - width);
				game.backgroundCtx.lineTo(game.zoomPos.getX() + width, game.zoomPos.getY() - width);
				game.backgroundCtx.lineTo(game.zoomPos.getX() + width, game.zoomPos.getY() + width);
				game.backgroundCtx.lineTo(game.zoomPos.getX() - width, game.zoomPos.getY() + width);
				game.backgroundCtx.lineTo(game.zoomPos.getX() - width, game.zoomPos.getY() - width);*/
				game.backgroundCtx.stroke();
			}
		},

		/**
		 * Blink the 2nd chance feedback
		 * @param t the time delta since last frame
		 */
		progressSecondChanceTime: function(t) {
			// Increase Animation time
			game.secondChanceTime = game.secondChanceTime + t;
	
			// Draw blinking text "2. Chance!"
			game.secondChanceTime = game.secondChanceTime%800;
			if (game.secondChanceTime < 400) {
				var secondChanceOffset = getStringWidth(local("2ndChance"));
				var left = game.background.width/2 - secondChanceOffset/2;
				var top = 70;
				game.backgroundCtx.fillText(local("2ndChance"), left, top);
			}
		},
		
		/**
		 * Blink the correct answer for a short period of time
		 * @param t the time delta since last frame
		 */
		progressCorrectAnswerTime: function(t) {
			// Increase Animation time
			game.correctAnswerTime = game.correctAnswerTime + t;

			// Check if Animation is over
			if (game.correctAnswerTime > 3600) {
				game.stopCorrectAnswerFlash();
				return;
			}
			
			// Draw blinking outline of country
			game.correctAnswerTime = game.correctAnswerTime%800;
			if (game.correctAnswerTime >= 400) {
				game.drawNodeListByEntry(game.currentEntry, defaultLineColor, defaultFillColor);
			}
		},
		
		
		progressWinTime: function(t) {
			game.winTime = game.winTime + t;
			// Check if Animation is over
			if (game.winTime > 4000) {
				
				//game.winTime = 0;
				//game.winning = false;
				//return;
			}
			
			// Draw blinking outline of country
			var maxWidth = Math.min(game.winCanvas.width, game.winCanvas.height)*0.9;
			var width = Math.min(game.winTime / 7, maxWidth);
			game.winCtx.clearRect(0, 0, game.winCanvas.width, game.winCanvas.height);
			game.winCanvas.width 		= window.innerWidth;
			game.winCanvas.height 		= window.innerHeight;
			game.winCtx.drawImage(game.resultImage, 0, 0, 437, 437, (game.winCanvas.width - width)/2, (game.winCanvas.height*0.9 - width)/2, width, width);
		},
		
		/**
		 * Blink the correct answer for a short period of time
		 * @param t the time delta since last frame
		 */
		progressHoldTime: function(t) {
			// Increase Animation time
			game.holdTime = game.holdTime + t;
			
			// Check if Animation is over
			if (game.holdTime > gameConfig.holdTime) {
				game.holding = false;
				if (game.holdEntry.getName() == game.currentEntry.getName()) game.rightAnswer();
				else game.wrongAnswer();
				
				// OLD DRAWING VARIANT FOR POINTING POSITION INSTEAD OF COUNTRY SPECIFIC HOLDING
				//var pt = new pos(game.reverseX(game.holdPos.getX()), game.reverseY(game.holdPos.getY()));
				//game.tryAnswerPos(pt);
			}		
			// OLD DRAWING VARIANT FOR POINTING POSITION INSTEAD OF COUNTRY SPECIFIC HOLDING
			// Draw incrementally smaller and more opaque circle
			/*var radius = Math.max(1, game.holdThreshold - game.holdTime)/5;
		    game.backgroundCtx.beginPath();
		    if (game.holdPos != null) game.backgroundCtx.arc(game.holdPos.getX(), game.holdPos.getY(), radius, 0, 2 * Math.PI, false);*/
			// END OLD
			
			var alpha = Math.max(0, Math.min(1.0, game.holdTime/gameConfig.holdTime));
			var color = "rgba(229, 26, 75, " + alpha + ")";
		    game.drawNodeListByEntry(game.holdEntry, defaultLineColor, color);

		    // Block jerky panning when aborting
			//game.dragTime = Date.now();	// This will be checked by the panningHandler
		},
		
		/**
		 * Helper to stop the correctAnswer animation
		 */
		stopCorrectAnswerFlash: function(){
			game.correctAnswerTime = 0;
			if (game.correcting) {
				game.correcting = false;
				game.nextQuestion();
			}
		},
		
		nextQuestion: function() {
			// Progress questions
			game.currentQuestionIndex++;
			
			// Game over?
			if (game.currentQuestionIndex >= game.listOfQuestions.length) {
				game.win();
				return;
			} else {
			// Prepare next Question otherwise!
				game.currentQuestion = game.listOfQuestions[game.currentQuestionIndex];
				game.currentEntry = game.getEntryByName(game.currentQuestion.getCorrectElement());
				game.currentNodeList = game.currentEntry.getNodeList();
				game.updateQuestionGUI();
			}
			
			// Reset state of Helping
			game.helpMode = false;
			
			// Reset 2. Chance
			game.secondChancing = false;
			
			// Display Changes
			game.updateBackground();
		},
		
		updateQuestionGUI: function() {
			// Clear slate
			game.clearQuestionPanel();
			
			// Create Text-Panel for Question
		    var d = document.createElement("div");
		    d.classList.add("question-element");
		    d.classList.add("question-paragraph");
			var text = document.createTextNode(game.currentQuestion.getText());
			d.appendChild(text);
			game.questionText.appendChild(d);
			
			// Some questions demand a different GUI
			if (game.currentQuestion.getType() == "find") {
				if (gameConfig.zoomOutAfterQuestion) {
					zoomOut.call(game);
					centerBackground.call(game);	
				}
			} else if (game.currentQuestion.getType() == "name") {
				//TODO: Make zoom depend on size of entry/map
				if (gameConfig.zoomOutAfterQuestion) {
					if (gameConfig.zoomToName) {
						quickZoom.call(game, 0.3);
						centerAt.call(game, game.currentEntry.getNodeList()[0].x, game.currentEntry.getNodeList()[0].y)
					} else {
						zoomOut.call(game);
						centerBackground.call(game);	
					}
				}
				//TODO: Center at middle of entry instead of first node
				// Create fake answers from all possibilities...
				var possibleAnswers = game.createFakeAnswers(game.numberMultipleChoice);
				var rightIndex = getRandomInt(0, possibleAnswers.length-1)
				//... and insert correct answer at random position
				possibleAnswers.splice(rightIndex, 0, game.currentEntry);
				for (var i = 0; i < possibleAnswers.length; i++) {
					game.createButtonForEntry(possibleAnswers[i]);
				}
			}
		},
		
		createFakeAnswers: function(amount) {
			var fakeAnswerList = Object.create(game.listOfRelevantEntries);
			var fakeResults = new Array();
			var rndIndex;
			
			// Kick out the correct answer
			var removeIndex = fakeAnswerList.indexOf(game.currentEntry);
			fakeAnswerList.splice(removeIndex, 1);
			// Pick other options and kick them out until enough have been picked
			for (var i = 0; i < Math.min(amount - 1, fakeAnswerList.length); i++) {
				rndIndex = getRandomInt(0, fakeAnswerList.length - 1);
				fakeResults.push(fakeAnswerList[rndIndex]);
				fakeAnswerList.splice(rndIndex, 1);
			}
			return fakeResults;
		},
		
		/**
		 * Check whether a name represents a correct answer 
		 * @param pt the name that represents the answer
		 */
		tryName: function(e) {
			if (game.currentQuestion.getType() != "name") return;
			if (e.target.answerValue == game.currentEntry.getName()) {
				game.rightAnswer();
			} else {
				game.wrongAnswer();
			}
		},
		
		/**
		 * Add a button to the question panel
		 * @param entry the entry that shall be represented by the Button
		 */
		createButtonForEntry: function(entry) {
		    // Create Panel
		    var b = document.createElement("button");
		    b.classList.add("question-element");
		    b.classList.add("question-button");
		    //b.addEventListener("click", game.tryName, false);
		    b.addEventListener("touchstart", game.tryName, false);
		    b.answerValue = entry.getName();
		    
			var text = document.createTextNode(local(entry.getName()));
			b.appendChild(text);
			game.guiPanel.appendChild(b);
		},
		
		/**
		 * Remove buttons from the question panel
		 */
		clearQuestionPanel: function() {
	        var items = document.querySelectorAll('.question-element');

	        for(var i = 0, l = items.length; i < l; i++) {
	        	// remove via parent.removeChild() as node.remove() is poorly supported (don't know about cordova though)
	        	var child = items[i];
	        	var parent = child.parentNode;
	        	parent.removeChild(child);
	        }
		},
		
		/**
		 * Win a game. Meaning all answers were tried.
		 */
		win: function() {
			//alert("Das waren alle Fragen. Du hast " + game.currentPoints + " von " + game.maxPoints + " Punkten erreicht! " + judgeString);
			game.winning = true;
			game.winTime = 0;
			game.resultBtn.style.display="inline";
			game.winOverlay.style.display="inline";
			
			var score = game.currentPoints/game.maxPoints;
			if 		(score == 1) 	{
				game.resultImage = result.goldPlusImg;
				achievement.reportSucces(new Success("win", game.gameType));
			}
			else if (score >= 0.9) 	game.resultImage = result.goldImg;
			else if (score >= 0.7) 	game.resultImage = result.silverPlusImg;
			else if (score >= 0.4) 	game.resultImage = result.silverImg;
			else if (score >= 0.2) 	game.resultImage = result.bronzePlusImg;
			else					game.resultImage = result.bronzeImg;

			//game.endGame();
		},
		
		/**
		 * Liquidate game properly
		 */
		endGame: function() {
			// Cancel Animations
			game.righting = false;
			game.wronging = false;
			game.secondChancing = false;
			game.helpMode = false;
			
			clearInterval(mapDingensAnimationTimer);
			game.currentPoints = 0;
			game.maxPoints = 0;
			app.navigateTo("welcomeMenu");
		},
		
		/**
		 * Check whether a position represents a correct answer 
		 * @param pt the point that represents the answer
		 */
		tryAnswerPos: function(pt) {
			if (game.currentQuestion.getType() == "find") {
				// Did we hit the correct Entry or one of its 'additional'?
				if (isPointInPoly(game.currentNodeList, pt) || recursiveIsPointInPoly(game.currentEntry, pt, NamedEntry.prototype.getAdditional)) {
					// But you could also have clicked on an enclave, which shouldn't count...
					// Check if there is an entry in 'without'
					if  (recursiveIsPointInPoly(game.currentEntry, pt, NamedEntry.prototype.getWithout)) {
						game.wrongAnswer();
					} else {
						game.rightAnswer();
					}
				// If you didn't hit it's wrong anyways
				} else {
					game.wrongAnswer();
				}
			}
		},
		
		/**
		 * Handle what has to happen, if an answer is right
		 */
		rightAnswer: function() {
			//alert("Richtig! Das ist " + game.currentQuestion.getCorrectElement() + "!");
			game.questionsAnswered++;
			game.righting = true;
			game.rightTime = 0;
			game.currentPoints = game.currentPoints + 1;
			// Grant an additional point, if in find Mode without help
			//TODO adjust exact points
			if (game.currentQuestion.getType() == 'find' && !game.helpMode) {
				game.currentPoints = game.currentPoints + 1;
			}
			game.nextQuestion();
		},
		
		skipAnswer: function() {
			game.questionsSkipped++;
			game.nextQuestion();
		},
		
		startWrongAnimation: function() {
			game.wrongMessage = local(game.currentQuestion.getCorrectElement());
			game.wrongOffset = getStringWidth(game.wrongMessage);
			game.wrongTime = 0;
			game.wronging = true;
			game.righting = false;
		},
		
		/**
		 * Handle what has to happen, if an answer is wrong
		 */
		wrongAnswer: function() {
			// Handling of wrong answers depends on type of Answer. It would not make sense to allow 6 tries for 6 choices after all. 
			game.secondChancing = false;
			// In 'find' mode we want to give the player a chance to call upon characteristics of countries by actively excluding choices.
			if (game.currentQuestion.getType() == 'find' && !game.helpMode) {
				// Add wrong entries to a List, for later repetition
				game.wrongList.push(game.currentEntry);
				// Activate helpMode and animate 2. Chance
				//alert("Leider falsch :( Versuche es noch einmal mit etwas Hilfe!");
				game.helpMode = true;
				game.secondChancing = true;
				game.secondChanceTime = 0;
				// Create Wrong alternatives to display together with right ones
				if(gameConfig.zoomOutAfterQuestion) {
					zoomOut.call(game);
					centerBackground.call(game);
				}
				game.fakeEntryList = new Array();
				var possibleAnswers = game.createFakeAnswers(game.numberMultipleChoice);
				for (var i = 0; i < possibleAnswers.length; i++) {
					game.fakeEntryList.push(possibleAnswers[i]);
					
				}
			// Otherwise fail question and proceed without adding Points.
			} else if (game.currentQuestion.getType() == 'name') {
				// Add wrong entries to a List, for later repetition
				game.wrongList.push(game.currentEntry);
				//alert("Das war leider falsch. " + game.currentQuestion.getCorrectElement() + " wäre die richtige Antwort gewesen...");
				game.startWrongAnimation();
				game.correctAnswerTime = 0;
				game.correcting = true;
				game.clearQuestionPanel();
			// Otherwise fail question and proceed without adding Points. Different feedback.
			} else {
				//alert("Das war leider falsch. Schau her, wo sich " + game.currentQuestion.getCorrectElement() + " befunden hätte:");
				game.startWrongAnimation();
				game.helpMode = false;
				//TODO: make zoom depend on size of entry/map
				quickZoom.call(game, 0.3);
				//TODO: center at middle of entry instead of first node
				centerAt.call(game, game.currentEntry.getNodeList()[0].x, game.currentEntry.getNodeList()[0].y)
				// Start flash of correct country
				game.correctAnswerTime = 0;
				game.correcting = true;
			}
			game.updateBackground();
		},
		
		// TODO: This is not exactly distribution sweeping or something...
		getEntryByCoordinate: function(pt){
			for(var i = 0; i < game.listOfRelevantEntries.length; i++) {
				if (isPointInPoly(game.listOfRelevantEntries[i].getNodeList(), pt) || recursiveIsPointInPoly(game.listOfRelevantEntries[i], pt, NamedEntry.prototype.getAdditional)){
					if  (!recursiveIsPointInPoly(game.listOfRelevantEntries[i], pt, NamedEntry.prototype.getWithout)) {
						return game.listOfRelevantEntries[i];
					}
				}
			}
			return null;
		},
		
		getEntryByName: function(name){
			for(var i = 0; i < game.listOfEntries.length; i++) {
				if (name == game.listOfEntries[i].getName()) {
					return game.listOfEntries[i];
				}
			}
			return null;
		},
		
		loadMap: function(mapName) {
			db.transaction(function(tx) {loadMap(tx, mapName, function(tx, results) {game.loadMapCallback(tx, results); game.startGameCallback();})}, dbQuerrySuccess);
		},
		
		loadMapCallback: function(tx, results) {
	    	var mapAsJson;  
	        var len = results.rows.length;
	        if (len == 0) {
	        	alert(local("mapNotFound"));
	        	return;
	        }
	        if (len > 1) {
	        	alert(local("nonUnique"));
	        }
	        mapAsJson = results.rows.item(0).EntriesJson;
	        game.loadMapFromJson(mapAsJson);
		},
		
		/**
		 * Loads a map from a JSON string in GAME
		 * @param mapAsJson The map data as a JSON string
		 */
		loadMapFromJson: function(mapAsJson){
	        var untypedJsonData = JSON.parse(mapAsJson);
	        game.listOfEntries = new Array();
	    	for (var i = 0; i < untypedJsonData.length; i++) {
	    		game.listOfEntries.push(NamedEntry.fromJson(untypedJsonData[i]));
	    	}
	    	game.currentNodeList = game.listOfEntries[0].getNodeList();
	    	game.updateBackground();
		},

		/**
		 * Refers mostly to the "inherited" updateBackground() in graphics.js, but adds game-specific elements: 
		 * i.e. outlines dependent on game state
		 */
		updateBackground: function() {
			// First redraw background
			updateBackground.call(game);
			if (game.secondChancing) {
				game.progressSecondChanceTime(0);
			}
			if (game.currentQuestion != null) {
				// If it is a "find" question...
				if (game.currentQuestion.getType() == "find"){
					//... and Help was asked for... 
					if (game.helpMode && game.fakeEntryList != null) {
						//... draw a bunch of incorrect outlines...
						for (var i = 0; i < game.fakeEntryList.length; i++) {
							game.drawNodeListByEntry(game.fakeEntryList[i], defaultLineColor, defaultFillColor);
						}
						//... and draw the correct outline (last so it doesn't get the rare overdraw...
						game.drawNodeListByEntry(game.currentEntry, defaultLineColor, defaultFillColor);
					}
					//... or don't draw any outlines at all.
					return;
					
				// Otherwise we know the outline of the country and want to know something about it.
				} else {
					// But for the flashing effect when correcting we want to hide the outline anyway
					if (!game.correcting) game.drawNodeListByEntry(game.currentEntry, defaultLineColor, defaultFillColor);
				}
			}
		},
		
		/**
		 * Helper to draw all the 'additional' and all the 'without' entries
		 * @param ent The entry to process
		 * @param func The function to process the entry
		 * @param lineColor	Color of the line
		 * @param fillColor Color of filling
		 */
		// Usually i would have made this an inner function, but in JS it would be created/destroyed every time the outer function is called
		recursiveDrawNodeList: function(ent, func, lineColor, fillColor) {
			if (func.call(ent) != null) {
				drawNodeList.call(game, func.call(ent).getNodeList(), lineColor, fillColor);
				game.recursiveDrawNodeList(func.call(ent), func, lineColor, fillColor);
			}
		},
		
		/**
		 * 
		 * @param entry The entry which nodelist should be drawn including without and additional entries
		 */
		drawNodeListByEntry: function(entry, lineColor, fillColor) {
			game.backgroundCtx.save();
			game.backgroundCtx.beginPath();
			//game.backgroundCtx.lineCap="round";
			game.backgroundCtx.lineWidth = Math.min(30, Math.max(1, 9 * game.backgroundScale));
			game.backgroundCtx.strokeStyle = lineColor;
			var filling = false;
			if (fillColor != null) {
				game.backgroundCtx.fillStyle = fillColor;
				filling = true;
			}
			// Draw the current Entry
			drawNodeList.call(game, entry.getNodeList(), lineColor, fillColor);
			// Draw Entries that are linked via "additional"
			game.recursiveDrawNodeList(entry, NamedEntry.prototype.getAdditional, lineColor, fillColor);
			// And overdraw Entries that are linked via "without" with the backgroundColor
			// TODO: Maybe fill with actual background taken from canvas
			if (filling) this.backgroundCtx.fill();
			game.backgroundCtx.stroke();
			
			game.backgroundCtx.beginPath();
			game.recursiveDrawNodeList(entry, NamedEntry.prototype.getWithout, lineColor, defaultCountryColor);
			game.backgroundCtx.fillStyle = defaultCountryColor;
			game.backgroundCtx.fill();
			game.backgroundCtx.stroke();
			
			game.backgroundCtx.restore();
		},
		
		// For easier reading these replace "function.call(game, xyz);"
		reverseX: reverseX,
		reverseY: reverseY,
		projectX: projectX,
		projectY: projectY
}

