"use strict";

var editor = {
		backID: 0,
		background:	null,
		backgroundImg: null,
		backgroundCtx: null,
		backgroundScale: 1.0,
		blueprintWidth: 2000,
		blueprintHeight: 1810,
		backgroundWidth: 2000,
		backgroundHeight: 1810,
		backgroundOffX: 0,
		backgroundOffY: 0,
		pinchPos: new pos(0,0),
		nodeListPanel: null,
		listOfEntries: new Array(),
		currentNodeList: null,
		currentEntry: null, 
		mapNameInput: null,
		dragTime: 0,
		dragX: 0,
		dragY: 0,
		pinchScale: 1,
		scaleMeter: null,
		mapOffset: new pos(0,0),
		guiPanel: null,
		dragNodeList: false,
		
		init: function() {
			// Remember some GUI elements
			this.background 		= document.getElementById("editorBackground");
			this.backgroundImg 		= document.getElementById("editorBackgroundImg");
			this.nodeListPanel		= document.getElementById("editorNodeListPanel");
			this.backgroundCtx 		= this.background.getContext("2d");
			this.scaleMeter 		= document.getElementById("editorScaleMeter");
			this.scaleMeter.value 	= this.backgroundScale;
			this.mapNameInput		= document.getElementById("editorMapName");
			this.guiPanel			= document.getElementById("editorGuiPanel");
			
			// Register Events
			editor.background.addEventListener("dblclick", 	function(e) {editor.addEditorNode(e), false});
			editor.background.addEventListener("mousedown", 	function(ev) {
				if (ev.ctrlKey) {
					// Check, which country was clicked
					//alert(Object.getOwnPropertyNames(ev))
					var holdPos = new pos(ev.clientX, ev.clientY);
					var pt = new pos(editor.reverseX(holdPos.getX()), editor.reverseY(holdPos.getY()));
					editor.selectEntryByEntry(editor.getEntryByCoordinate(pt));
					editor.updateBackground();
				}
			});
			editor.background.addEventListener("wheel", function(e) {
				editor.pinchPos = new pos(e.clientX, e.clientY);
				zoomBackgroundWheel.call(editor, e);
			}, false);
			// These already get covered by pan - at least in ripple
			//this.background.addEventListener("mousedown", 	function(e){startDrag.call(editor, e)}, false);
			//this.background.addEventListener("mouseup", 	function(e){endDrag.call(editor, e)}, false);
			
			// Activate touch events
			var panHammer = new Hammer.Pan();
			//var pressHammer = new Hammer.Press({time: 10});
			var swipeHammer = new Hammer.Swipe({velocity: 1.3});
			var hammertime = new Hammer.Manager(this.background);
			hammertime.add(new Hammer.Pinch({ threshold: 0 }));
			hammertime.add(panHammer);
			//hammertime.add(pressHammer);
			hammertime.add(swipeHammer);
			swipeHammer.recognizeWith(panHammer);
			hammertime.on('pinchstart', function(ev) { editor.pinchScale = ev.scale;});
			hammertime.on('pinch', 		function(ev) { 
				editor.pinchPos = new pos(ev.center.x, ev.center.y);
				pinchBackgroundWheel.call(editor, ev);
			});
			hammertime.on('panend', 	function(ev) { editor.dragNodeList = false;});
			hammertime.on('panstart', 	function(ev) {
				// Check if we clicked at the current nodelist and want therefore want do drag it instead of the whole map
				var pt = new pos(editor.reverseX(ev.center.x), editor.reverseY(ev.center.y));
				if (isPointInPoly(editor.currentNodeList, pt)) {
					editor.dragNodeList = true;
					editor.dragX = ev.deltaX;
					editor.dragY = ev.deltaY;
				// Otherwise drag whole map
				} else {
					startPan.call(editor, ev);
				}
			});
			hammertime.on('pan', function(ev) {
				// Check if dragging currentNodeList
				if (editor.dragNodeList) {
					// return - since importing the svg is an option this shouldn't normally be necessary
					//return;
					var d = Date.now();
					var dX = (ev.deltaX - editor.dragX)/editor.backgroundScale;
					var dY = (ev.deltaY - editor.dragY)/editor.backgroundScale;
					for (var i = 0; i < editor.currentNodeList.length; i++) {
						editor.currentNodeList[i].x = editor.currentNodeList[i].x + dX;
						editor.currentNodeList[i].y = editor.currentNodeList[i].y + dY;
					}
					editor.dragX = ev.deltaX;
					editor.dragY = ev.deltaY;
					editor.updateBackground();
				// Otherwise drag whole map
				} else {
					endPan.call(editor, ev);
				}
			});
			hammertime.on('pinchend', function(ev) {	
				editor.dragTime = Date.now();
			});	
			hammertime.on('swipedown', function(ev){
				//alert("zoom out swipe");
				zoomOut.call(editor);
				centerBackground.call(editor);		
			});
			
			// Create working Nodelist and keep track of it
			this.newEmptyShape();		// method as called by GUI - takes care of creation and updating GUI etc.
			
			//Adjust size of GUI and other graphical elements
			this.blueprintWidth 	= this.backgroundImg.naturalWidth ;
			this.blueprintHeight 	= this.backgroundImg.naturalHeight ;
			rescaleProportions.call(editor, 300, 300);
			editor.backgroundCtx.lineCap="round";
			editor.backgroundCtx.lineJoin = "round";
		},

		importSVG: function() {
			var xmlDoc;
			//var txt = '<g> <polygon class="fil0 str0" points="18705,12812 18773,12751 18702,12720 18632,12753 18575,12724 18523,12787 18619,12830 "/> <polygon class="fil0 str0" points="18360,12877 18300,12867 18307,12899 "/>  <polygon class="fil0 str0" points="4263,9443 4284,9415 4263,9403 4235,9422 4210,9421 4210,9443 4243,9452 4248,9471 "/> <polygon class="fil0 str0" points="4370,9216 4341,9188 4296,9196 4294,9242 4313,9246 4305,9283 4326,9283 "/></g>';
			//alert(naAsSvg)
			if (window.DOMParser) {
			    var parser = new DOMParser();
			    xmlDoc = parser.parseFromString(oceaniaAsSvg, "text/xml");
			}
			// Internet Explorer
			else {
				//alert("no window.DOMParser - trying IE Version")
			    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
			    xmlDoc.async = false;
			    xmlDoc.loadXML(oceaniaAsSvg);
			}
			
			//Gets house address number
			var importedPolys = xmlDoc.getElementsByTagName("polygon");
			//alert(importedPolys.length);
			for (var i = 0; i < importedPolys.length; i++) {
				//alert(importedPolys[i].getAttribute("points"));
				//importedPolys[i].childNodes[0].nodeValue;
				var unrefinedNodeList = importedPolys[i].getAttribute("points").split(" ");
				var nodeList = new Array();
				for (var j = 0; j < unrefinedNodeList.length; j++) {
					if (unrefinedNodeList[j] != "" && unrefinedNodeList[j] != " ") {
						var nodePair = unrefinedNodeList[j].split(",")
						//alert(nodePair[0] + ", " + nodePair[1])
						nodeList.push(new pos((nodePair[0]/8.466)+514, (nodePair[1]/8.466)-514)); ///8.816)/3 //+/- 514 für querformat
					}
				}
				name = "unnamed";
				if (importedPolys[i].getAttribute("id")) {
					name = importedPolys[i].getAttribute("id");
				}
				editor.newShape(name, "dummy");
				editor.currentEntry.setNodeList(nodeList);
				editor.currentNodeList = nodeList;
			}
		},
		
		/**
		 * 
		 * @param path The path of the image
		 */
		loadBackground: function(path) {
			this.background.src = path
		},

		addEditorNode: function(e) {
			editor.addNode(e);
		},
		
		// TODO: This is not exactly distribution sweeping or something...
		getEntryByCoordinate: function(pt){
			for(var i = 0; i < editor.listOfEntries.length; i++) {
				if (isPointInPoly(editor.listOfEntries[i].getNodeList(), pt)) {
						return editor.listOfEntries[i];
				}
			}
			return null;
		},
		selectEntryByEntry: function(entry) {
			if (entry == null) return;
			//alert(entry.getName());
			for (var i = 0; i < editor.listOfEntries.length; i++) {
				if (editor.listOfEntries[i] == entry) {
					editor.currentEntry = entry;
					editor.currentNodeList = editor.currentEntry.getNodeList();
				}
			}
			var currentNode;
			var ni = document.createNodeIterator(editor.nodeListPanel);

			while(currentNode = ni.nextNode()) {
			    if (currentNode.connectedItem == entry) {
			    	currentNode.focus();
			    }
			}
		},
		addNode: function(e) {
			var xPosition = e.clientX - this.background.offsetLeft;
			var yPosition = e.clientY - this.background.offsetTop;
			this.addToCurrentNodeList(this.reverseX(xPosition), this.reverseY(yPosition));
			this.updateBackground();
		},
		
		removeEditorNode: function() {
			editor.removeNode();
		},
		
		removeNode: function() {
			this.popCurrentNodeList();
			this.updateBackground();
		},
		
		selectByPanelClick: function(e) {
			if (e.target.connectedItem == null) return;
			editor.currentEntry = e.target.connectedItem;
			editor.currentNodeList = e.target.connectedItem.getNodeList();		
			editor.updateBackground();
		},
		 
		saveMap: function() {
			var mapName = editor.mapNameInput.value;
			// Sort by name
			editor.listOfEntries.sort(function(a, b){
				if 		(a.getName() < b.getName()) return -1;
				else if (a.getName() > b.getName()) return 1;
				else return 0;
			});
			var mapAsJson = JSON.stringify(editor.listOfEntries);
			db.transaction(function(tx) {saveMap(tx, mapName, mapAsJson)}, dbError, nullHandler);
		},
		
		loadMap: function() {
			var mapName = editor.mapNameInput.value;
			db.transaction(function(tx) {loadMap(tx, mapName, editor.loadMapCallback)}, dbQuerrySuccess);
		},
		
		loadMapCallback: function(tx, results) {
	    	var mapAsJson;  
	        var len = results.rows.length;
	        if (len == 0) {
	        	alert(local("mapNotFound"));
	        	return;
	        }
	        if (len > 1) {
	        	alert("Multipler Eintrag! Eineindeutigkeit verletzt!");
	        }
	        mapAsJson = results.rows.item(0).EntriesJson;
	        editor.loadMapFromJson(mapAsJson);
		},
		
		loadMapFromJson: function (mapAsJson) {
	        var untypedJsonData = JSON.parse(mapAsJson);
	    	editor.listOfEntries = new Array();
	    	for (var i = 0; i < untypedJsonData.length; i++) {
	    		editor.listOfEntries.push(NamedEntry.fromJson(untypedJsonData[i]));
	    	}
	    	//alert(editor.listOfEntries[0].getName());
	    	editor.currentNodeList = editor.listOfEntries[0].getNodeList();
	    	editor.updateBackground();
	    	editor.updateNodeListPanel();
	    	//alert(mapAsJson);
	    	var text = document.createTextNode(mapAsJson);
	    	document.getElementById("editorMapAsJson").appendChild(text);
		},
		
		updateNodeListPanel: function() {
			editor.clearNodeListPanel();
			for (var i = 0; i < editor.listOfEntries.length; i++) {
				editor.createPanelForEntry(editor.listOfEntries[i]);
			}
		},
		
	    clearNodeListPanel: function() {
	        var items = document.querySelectorAll('.nodeList');

	        for(var i = 0, l = items.length; i < l; i++) {
	        	// remove via parent.removeChild() as node.remove() is poorly supported (don't know about cordova though)
	        	var child = items[i];
	        	var parent = child.parentNode;
	        	parent.removeChild(child);
	        }
	    },
	    
	    newEmptyShape: function() {
	    	editor.newShape("unnamed", "uncategorized");
	    },
	    
		newShape: function(name, category) {
			var entry = new NamedEntry(name, category, "country", false, 0, 0, 0, 0, null, null, new Array(), null, null);
			editor.currentNodeList = entry.getNodeList();
			editor.currentEntry = entry;
			editor.listOfEntries.push(entry);
			editor.createPanelForEntry(entry);
		},
		
		createPanelForEntry: function(entry) {
		    // Create Panel
		    var d = document.createElement("div");
		    d.classList.add("nodeList");
		    d.addEventListener("click", editor.selectByPanelClick, false);
		    d.addEventListener("focus", function() {d.style.border = "2px solid red;"}, false);
		    d.addEventListener("blur", function() {d.style.border = "0px;"}, false);
		    d.connectedItem = entry;
		    
		    // add children
		    // inputName 
		    var inputName = document.createElement("input");
		    inputName.value = entry.getName();
		    inputName.connectedItem = entry;
		    inputName.onchange = function() {inputName.connectedItem.setName(inputName.value);}
		    d.appendChild(inputName);
		    // category
		    var inputCategory = document.createElement("input");
		    inputCategory.value = entry.getCategory();
		    inputCategory.onchange = function() {inputCategory.connectedItem.setCategory(inputCategory.value);}
		    inputCategory.connectedItem = entry;
		    d.appendChild(inputCategory);
		    // without
		    var inputWithout = document.createElement("input");
		    inputWithout.value = entry.getWithout();
		    inputWithout.connectedItem = entry;
		    inputWithout.onchange = function() {inputWithout.connectedItem.setWithout(inputWithout.value);}
		    d.appendChild(inputWithout);
		    // additional
		    var inputAdditional = document.createElement("input");
		    inputAdditional.value = entry.getAdditional();
		    inputAdditional.connectedItem = entry;
		    inputAdditional.onchange = function() {inputAdditional.connectedItem.setAdditional(inputAdditional.value);}
		    d.appendChild(inputAdditional);
		    
		    var inputRemove = document.createElement("button");
		    inputRemove.addEventListener("click", function(){editor.removeEntry(d.connectedItem);}, false);
			var textRemove = document.createTextNode("-");
			inputRemove.appendChild(textRemove);
		    d.appendChild(inputRemove);
		    
		    
		    // add to nodeListPanel
		    editor.nodeListPanel.appendChild(d);
		    editor.updateBackground();
		},
		
		removeEntry: function(entry) {
			var removeIndex = editor.listOfEntries.indexOf(entry);
			alert("Entferne Eintrag: " + removeIndex);
			editor.listOfEntries.splice(removeIndex, 1);
			if(editor.listOfEntries.length < 1) editor.newEmptyShape();
			editor.currentEntry = editor.listOfEntries[0];
			editor.currentNodeList = editor.listOfEntries[0].getNodeList();
			
			// Update the GUI and the map
			editor.updateNodeListPanel();
			editor.updateBackground();
		},
		
		popCurrentNodeList: function() {
			editor.currentNodeList.pop();
		},
		
		updateBackground: function() {
			editor.backgroundCtx.beginPath();
			editor.backgroundCtx.lineWidth = Math.min(5, Math.max(1, 8 * editor.backgroundScale));
			editor.backgroundCtx.strokeStyle = '#E51A4B';
			updateBackground.call(editor);
			drawNodeList.call(editor, editor.currentNodeList, defaultLineColor, null);
			editor.backgroundCtx.stroke();
		},
		
		addToCurrentNodeList: function(x, y) {
			var node = new pos(x,y);
			editor.currentNodeList.push(node);
			//alert("node added: " + node.getX() + ", " + node.getY() + "Number of Nodes: " + editor.currentNodeList.length);
		},
		
		removeCurrentNodeList: function() {
			//TODO: implement
		},
		
		zoomEditorWheel: function(e) {
			editor.zoomBackgroundWheel(e);
			editor.scaleMeter.value = editor.backgroundScale;
		},	
		
		
		editorTouchDrag: function(e) {
			editor.touchDrag(e);
		},
		
		switchBackground: function() {
			if (editor.backID == 0) {
				editor.backgroundImg.src = "img/africa_outline.png";
				editor.backID = 1;
			} else if (editor.backID == 1) {
				editor.backgroundImg.src = "img/germany_outline.png";
				editor.backID = 2;
			} else {
				editor.backgroundImg.src = "img/europa_outline.png";
				editor.backID = 0;
			}
		},
		reverseX: reverseX,
		reverseY: reverseY,
		projectX: projectX,
		projectY: projectY,	
		tryPlaceRect: tryPlaceRect,
		zoomBackgroundWheel: zoomBackgroundWheel,
		startDrag: startDrag
}