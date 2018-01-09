"use strict";

var bMargin = 0;	// additional background margin, used when zooming out
	
function updateBackground() {
	this.backgroundCtx.save();
	this.backgroundCtx.clearRect(0, 0, this.background.width, this.background.height);
	var actualOffX = this.backgroundOffX;
	var actualOffY = this.backgroundOffY;
	var actualWidth = this.backgroundWidth;
	var actualHeight = this.backgroundHeight;

	if (actualOffX < 0) actualOffX = 0;
	if (actualOffY < 0) actualOffY = 0;
	if (actualWidth  + Math.max(this.backgroundOffX, -this.backgroundOffX) >= this.blueprintWidth)  actualWidth  = Math.min(this.blueprintWidth  - this.backgroundOffX, this.blueprintWidth);
	if (actualHeight + Math.max(this.backgroundOffY, -this.backgroundOffY) >= this.blueprintHeight) actualHeight = Math.min(this.blueprintHeight - this.backgroundOffY, this.blueprintHeight);
	
	var leftClip 	= (actualOffX - this.backgroundOffX)/this.backgroundWidth;
	var rightClip 	= (this.backgroundWidth - actualWidth)/this.backgroundWidth;
	var topClip 	= (actualOffY - this.backgroundOffY)/this.backgroundHeight;
	var bottomClip 	= (this.backgroundHeight - actualHeight)/this.backgroundHeight;
	
	if (actualWidth > 0 && actualHeight > 0)
		this.backgroundCtx.drawImage(this.backgroundImg, actualOffX, actualOffY, actualWidth, actualHeight, leftClip * this.background.width, topClip * this.background.height, this.background.width - rightClip * this.background.width, this.background.height - bottomClip * this.background.height);

	this.backgroundCtx.restore();
};

//
function rescaleProportions(guiWidth, guiHeight) {
	this.guiPanel.style.borderStyle = 'none';
	
	switch(window.orientation) {  
    case -90:
    case 90:
    	if (this.animations) {
    		//alert("animations exist");
        	this.animations.width = window.innerWidth - guiWidth;
        	this.animations.height = window.innerHeight;
    	}
    	this.background.width 		= window.innerWidth - guiWidth;
    	this.background.height 		= window.innerHeight;
  		this.guiPanel.style.left 	= window.innerWidth - guiWidth + "px";
  		this.guiPanel.style.width 	= guiWidth + "px";
  		this.guiPanel.style.height 	= "100%";
  		this.guiPanel.style.top 	= "0px";
  		document.getElementById("gameHowToButton").style.right = (guiWidth + 2) + "px";
  		this.guiPanel.style.borderLeftStyle = "solid";
        break; 
      default:
    	if (this.animations) {
    		//alert("animations exist");
          	this.animations.width = window.innerWidth;
      		this.animations.height = window.innerHeight - guiHeight;
    	}
      	this.background.width = window.innerWidth;
  		this.background.height = window.innerHeight - guiHeight;
  		//this.guiPanel.style.display = "none";
  		this.guiPanel.style.width = "100%";
  		this.guiPanel.style.height = guiHeight + "px";
  		this.guiPanel.style.left = "0px";
  		this.guiPanel.style.top = window.innerHeight - guiHeight + "px";
  		this.guiPanel.style.borderTopStyle = "solid";
  		document.getElementById("gameHowToButton").style.right = "2px";
        break; 
    }
	//alert("width: " + window.innerWidth + ", height: " + window.innerHeight);
				
	// Starting Window of Background should according to GUI element size adjusted for initial scale
	this.backgroundWidth  = this.background.width  / this.backgroundScale;
	this.backgroundHeight = this.background.height / this.backgroundScale;
	this.updateBackground();
};

function centerBackground() {
	centerAt.call(this, this.blueprintWidth/2 - this.mapOffset.x/2, this.blueprintHeight/2  - this.mapOffset.y/2);
};

function zoomOut() {
	var scale = Math.min(this.background.width/(this.blueprintWidth + 2*bMargin), this.background.height/(this.blueprintHeight + 2*bMargin));
	//alert(this.background.width/this.blueprintWidth + ", " + this.background.height/this.blueprintHeight);
	quickZoom.call(this, scale);
};

function drawNodeList(nList, color, fill) {
	//OLD BECAUSE THE ACTUAL STROKE&CONTEXT SHOULD ONLY BE EXECUTED FOR ALLE LISTS AT ONCE
	//this.backgroundCtx.save();
	//this.backgroundCtx.beginPath();
	//this.backgroundCtx.lineWidth = Math.min(30/*5*/, Math.max(1, 8 * this.backgroundScale));
	/*this.backgroundCtx.strokeStyle = color; 
	var filling = false;
	if (fill != null) {
		this.backgroundCtx.fillStyle = fill;
		filling = true;
	}*/


	//only if not empty
	if (nList.length > 1) {
		//move to start without drawing
		this.backgroundCtx.moveTo(		this.projectX(nList[0].getX()), this.projectY(nList[0].getY()));
		//connect all dots
		for (var i = 0; i < nList.length; i++) {
			this.backgroundCtx.lineTo(	this.projectX(nList[i].getX()), this.projectY(nList[i].getY()));
		}
		//Draw Back to the Start and one more to leave no ugly edge
		this.backgroundCtx.lineTo(		this.projectX(nList[0].getX()), this.projectY(nList[0].getY()));
		this.backgroundCtx.lineTo(		this.projectX(nList[1].getX()), this.projectY(nList[1].getY()));
	}

	//OLD BECAUSE THE ACTUAL STROKE&CONTEXT SHOULD ONLY BE EXECUTED FOR ALLE LISTS AT ONCE
	//if (filling) this.backgroundCtx.fill();
	//this.backgroundCtx.stroke();
	//this.backgroundCtx.restore();
};

function projectX(x) {
	var x2 = (x - this.backgroundOffX)*this.backgroundScale;
	return x2;
};
		
function projectY(y) {
	var y2 = (y - this.backgroundOffY)*this.backgroundScale;
	return y2;
};
		
function reverseX(x) {
	var x2 = (x / this.backgroundScale) + this.backgroundOffX;
	return x2;
};
		
function reverseY(y) {
	var y2 = (y / this.backgroundScale) + this.backgroundOffY;
	return y2;
};

function zoomBackgroundWheel(e) {
	var delta = e.wheelDelta / 100.0;//Math.max(-2, Math.min(2, (e.wheelDelta || -e.detail)));			
	if (delta == 0) {
		alert("Mousewheel change of 0, but mousewheel event fired.")
		return;
	} else if (delta > 0) {
		this.backgroundScale =  this.backgroundScale / delta;
	} else {
		delta = delta * -1;
		this.backgroundScale = this.backgroundScale * delta;
	}						
	this.backgroundScale = Math.min(Math.max(0.1, this.backgroundScale), 10);
	hiddenZoomBackground.call(this);
};

function centerAt (x, y) {
	this.backgroundOffX = x - (this.backgroundWidth  /2);  //Math.min(this.blueprintWidth  - this.backgroundWidth, Math.max(-bMargin, x - (this.backgroundWidth /2)));
	this.backgroundOffY = y - (this.backgroundHeight /2);  //Math.min(this.blueprintHeight - this.backgroundHeight, Math.max(-bMargin, y - (this.backgroundHeight/2)));
	this.updateBackground();
};

function quickZoom(scale){
	this.backgroundScale = scale;
	hiddenZoomBackground.call(this);
};

function pinchBackgroundWheel(e) {
	var scaleChange = this.pinchScale / e.scale;
	this.backgroundScale = this.backgroundScale / scaleChange;
	this.pinchScale = e.scale;
	hiddenZoomBackground.call(this);
};

function hiddenZoomBackground() {
	var oldScale;
	var newXOff, newYOff, rescale, pinchRelX, pinchRelY;
	var newRect;
	if (this.backgroundScale > 4) this.backgroundScale = 4;
	oldScale = this.background.width/this.backgroundWidth;
	// Relative scale to previous scale
	rescale = oldScale / this.backgroundScale;
	
	// The mathematician inside of me does not allow for the fringe case of width/height of 0 to be irgnored
	if (this.background.width > 0) pinchRelX = this.pinchPos.getX()/this.background.width;
	else pinchRelX = 0.5;
	if (this.background.height > 0) pinchRelY = this.pinchPos.getY()/this.background.height;
	else pinchRelY = 0.5;

	// Change offsets to keep looking at center
	this.backgroundOffX = this.backgroundOffX - (this.backgroundWidth  * rescale - this.backgroundWidth) *pinchRelX;
	this.backgroundOffY = this.backgroundOffY - (this.backgroundHeight * rescale - this.backgroundHeight)*pinchRelY;
	
	// try for resulting rectangle or get an adjusted one ...
	//newRect = this.tryPlaceRect(this.backgroundOffX, this.backgroundOffY, this.backgroundWidth*rescale, this.backgroundHeight*rescale, this.blueprintWidth, this.blueprintHeight, bMargin, bMargin);		
	
	//... and apply result!
	this.backgroundScale  = this.background.width/(this.backgroundWidth*rescale);
	this.backgroundHeight = this.backgroundHeight*rescale;
	this.backgroundWidth  = this.backgroundWidth*rescale;
	//this.backgroundOffX   = newRect.xOff;
	//this.backgroundOffY   = newRect.yOff;
	
	//paint new
	this.updateBackground();
};

function startDrag(e) {
	hiddenStartDrag.call(this, e.clientX, e.clientY);
};

function startPan (e) {
	hiddenStartDrag.call(this, e.deltaX, e.deltaY);
};

function hiddenStartDrag(X, Y) {
	this.dragX = X;
	this.dragY = Y;
};

function endDrag(e) {
	dragging.call(this, e.clientX, e.clientY);
};

function endPan(e) {
	dragging.call(this, e.deltaX, e.deltaY);
};

function dragging(dX, dY) {
	var d = Date.now();
	if (d - this.dragTime < 50) return;
	this.backgroundOffX = this.backgroundOffX - (dX - this.dragX)/this.backgroundScale; //Math.max(Math.min(this.backgroundOffX - (dX - this.dragX)/this.backgroundScale, this.blueprintWidth  - this.backgroundWidth  + 2*bMargin), -bMargin);
	this.backgroundOffY = this.backgroundOffY - (dY - this.dragY)/this.backgroundScale; //Math.max(Math.min(this.backgroundOffY - (dY - this.dragY)/this.backgroundScale, this.blueprintHeight - this.backgroundHeight + 2*bMargin), -bMargin);	
	this.dragX = dX;
	this.dragY = dY;
	this.updateBackground();
};

function tryPlaceRect(xOff, yOff, innerW, innerH, outerW, outerH, outerXOff, outerYOff){
	var resXOff = xOff;
	var resYOff = yOff;
	var resW = innerW;
	var resH = innerH;
	var rescale = 1.0;						//needs to be 1.0
		
	//check if too high
	if (innerH > outerH) {
		rescale = innerH/outerH;			//how much do we need to change this?
		resH  = outerH;						//change height to fit
		resW  = innerW/rescale; 			//change width, too
	} //now we know the height fits
			
	//check if too wide
	if (resW > outerW) {
		rescale = resW/outerW * rescale;	//adjust rescaling
		resH  = innerH/(resW/outerW); 		//cant use rescale because it compounds both steps of rescaling
		resW  = outerW;						//change width to fit now
	} //now we know the width fits */
			
	//now that we know the inner fits, we can push the offsets to fit inside aswell
	/*if((resW + resXOff > outerW + outerXOff) && ((resXOff < -outerXOff) < -outerXOff)) {
		var overLeft  = resXOff - outerXOff;
		var overRight = resW + resXOff - (outerW + outerXOff);
	} else {*/
		if(resW + resXOff > outerW + outerXOff) resXOff = outerW - resW - outerXOff;
		if(resXOff < -outerXOff) resXOff = -outerXOff; 
	/*}
	if (false) {
		
	} else {*/
		if(resH + resYOff > outerH + outerYOff) resYOff = outerH - resH - outerYOff;
		if(resYOff < -outerYOff) resYOff = -outerYOff;
	/*}*/
			
	var result = {
		xOff: 	resXOff, 
		yOff: 	resYOff,
		width: 	resW, 
		height: resH,
	};
	//alert("xOff: " + resXOff + ", yOff: " + resYOff + ", width: " + resW + ", height: " + resH + ", scale: " + scale);
	return result;
};