var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        // TODO: PhoneGap API angucken - alles eventgesteuert? default geschichten deaktiviert?
    },
    
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('pause', this.onPause, false);
    },
    
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        //document.addEventListener("backbutton", app.goBack, false);
    },
    
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    	if (id == 'deviceready') {
    		app.init();
    	}
    },
    
    onPause: function() {
    	gameConfig.saveConfig();
    },
    
    init: function() {
    	StatusBar.overlaysWebView(false);
        var parentElement = document.getElementById('deviceready');
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');        
        console.log('Received Event: ' + 'deviceready');
        app.currentView = 'welcomeMenu';
        app.lastView = 'welcomeMenu';
        app.showView('welcomeMenu');
        
        document.addEventListener("backbutton", app.goBack, false);

		// OpenDataBase for Saves
		db = window.openDatabase("MapDingens", "1.0", "MapDingens DB", 500000);
		db.transaction(createMapTable, dbError, nullHandler);
		
		//alert("pre_init");
        editor.init();
        //alert("editor");
        game.init();
        //alert("game");
        result.init();
        //alert("result");
        gameConfig.init();
        //alert("gameConfig");
        achievement.init();
        
        var achScroller = document.getElementById("achievementScroller");
        //var achMain 	= document.getElementById("achievementButtons");
        achScroller.style.height = "calc(100% - 60px)";   
    },
    
    canvasTest: function() {
        var c = document.getElementById("myCanvas");
        var ctx = c.getContext("2d");
        ctx.moveTo(0,0);
        ctx.lineTo(200,100);
        ctx.stroke();
    },
    
    navigateTo: function(pageName) {
    	app.hideAllViews();
    	app.showView(pageName);
    	app.lastView = app.currentView;
    	app.currentView = pageName;
    },
    
    showView: function(viewName) {
    	document.getElementById(viewName).style.display = "block";   	
    },
    
    showOverlay: function(id) {
    	app.hideOverlays();
    	document.getElementById(id).style.display = "inline";
    },
    
    hideAllViews: function () {
    	var views = document.getElementsByClassName("view");
    	var i;
    	for (i = 0; i < views.length; i++) {
    		views[i].style.display = "none";
    	}    	
    },
    show: function (id) {
    	document.getElementById(id).style.display = "inline";
    },
    hideOverlays: function() {
    	var overlays = document.getElementsByClassName("overlay");
    	var i;
    	for (i = 0; i < overlays.length; i++) {
    		overlays[i].style.display = "none";
    	}    
    },
    goBack: function() {
    	if (app.currentView == "preferencesMenu") gameConfig.saveConfig();
    	app.navigateTo(app.lastView);
    }
}
