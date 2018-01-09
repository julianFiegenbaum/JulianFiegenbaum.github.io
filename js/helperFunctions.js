"use strict";

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min +1)) + min; 
}

/**
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 */
function shuffleArray(ar) {
    var j, x, i;
    var a = ar;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
    return a;
}

function isPointInPoly(poly, pt){
	//alert("Is (" + pt.x + "," + pt.y + ") in " + JSON.stringify(poly) + "?")
	for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
		((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) && (c = !c);
	return c;
}

function recursiveIsPointInPoly(ent, pt, func) {
	if (func.call(ent) != null) {
		// If point is inside stop recursion and return true
		if( isPointInPoly(func.call(ent).getNodeList(), pt) ) return true;
		// Otherwise check next
		else return recursiveIsPointInPoly(func.call(ent), pt, func);
	} else return false;
}

function getStringWidth (st) {
	//game.backgroundCtx.lineWidth = 2;
	//game.backgroundCtx.font = "bold 30px Arial";
	//alert(st + ": " + game.backgroundCtx.measureText(st).width)
	return game.backgroundCtx.measureText(st).width;
	/*while (app.stringHelper.firstChild) {
		app.stringHelper.removeChild(app.stringHelper.firstChild);
	}
	var text = document.createTextNode(st);
	app.stringHelper.appendChild(text);
	return app.stringHelper.clientWidth + 1;*/
}