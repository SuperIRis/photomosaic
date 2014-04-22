/*  ===================
    PhotoMosaic - JS
    By @SuperIRis
    Last updated 15-04-2014
    =================== */
;
'use strict';
function PhotoMosaic (photosURLsArray, backgroundImageURL, canvasId, settings){
	//photosURLsArray is a collection of image paths
	//if it has less photos than the required by the background, they are repeated
	//if it has more photos than the required by the background, only some will be shown
	this.settings = {};
	//
	//DEFAULTS
	//
	//settings.opacity = background opacity (sometimes it helps the mosaic look more realistic)
	this.settings.opacity = 0.8;
	//settings.showSpeed = number of squares in mask that dissappear at the same time (high number equals high speed)
	this.settings.showSpeed = 20;
	//settings.showSmoothness = speed at which squares in mask reduce opacity (low number equals slow speed but the effect is more noticeable)
	this.settings.showSmoothness=.2;
	//settings.maskColor = color of squares in mask
	this.settings.maskColor = 'black';
	//settings.randomPhotos shuffles the photosURLsArray so they show everytime in a different position 
	//if there are more photos than needed, settings.randomPhotos allows to show different photos everytime (if it is false, last ones will never show up)
	this.settings.randomPhotos = true;
	//
	//EVENTS
	//
	//PhotoMosaic dispatches a single event when everything is complete and the mask is not showing anymore
	//event = onComplete
	for (var a in settings){
		this.settings[a] = settings[a];
	}
	this.photosURLs = photosURLsArray;
	this.backgroundImageURL = backgroundImageURL;
	this.backgroundImageObject = new Image();
	this.canvasId = canvasId;
	this.canvas = document.getElementById(canvasId);
	this.rasterCollection = [];
	this.elementsToSwap = [];
	this.maskRectangles = [];
	this.missingPhotos = [];
	this.rasters = [];
	this.loadImages();
}
PhotoMosaic.prototype.onImageLoaded = function(index){
	this.photosLoaded ++;
	this.checkIfPhotosLoaded();
}
PhotoMosaic.prototype.onImageError = function(index){
	//if the image can't load, we add index to temporary array this.missingPhotos
	this.photosLoaded++;
	this.missingPhotos.push(index);
	this.checkIfPhotosLoaded();
	
}
PhotoMosaic.prototype.loadImages = function(){
	var _this = this, tempImg;
	this.photosLoaded = 0;
	this.photos = [];
	for (var i = 0, limit = this.photosURLs.length; i<limit; i++){
		tempImg = new Image();
		tempImg.onload = (function(i){ return function(){ _this.onImageLoaded(i);}})(i);
		tempImg.onerror = (function(i){ return function(){ _this.onImageError(i);}})(i);
		tempImg.src = this.photosURLs[this.photos.length];
		this.photos.push(tempImg);
	}
}
PhotoMosaic.prototype.checkIfPhotosLoaded = function(){
	var _this=this;
	if(this.photosLoaded == this.photosURLs.length){
		//all images are loaded, check if any missing photo is stored and remove it
		if(this.missingPhotos.length>0){
			for(var i=0, limit=this.missingPhotos.length; i<limit; i++){
				this.photos.splice(this.missingPhotos[i]-i,1);
			}
		}
		
		this.backgroundImageObject.onload = function(){
			//check if images are enough or too much
			var horizontalImages = Math.ceil(_this.backgroundImageObject.width/_this.photos[0].width),
				verticalImages = Math.ceil(_this.backgroundImageObject.height/_this.photos[0].height),
				totalImages = horizontalImages*verticalImages;
			
			if(totalImages<_this.photos.length){
				_this.photos.slice(totalImages-1, totalImages-_this.photos.length);
			}
			else if(totalImages>_this.photos.length){
				var i = 0;
				while(totalImages>_this.photos.length){
					if(i<_this.photos.length){
						_this.photos.push(_this.photos[i]);
						i++;
					}
					else{
						i=0;
					}	
				}
				_this.photos.sort(function() { return 0.5 - Math.random() });
			}
			
			_this.initialSetup();
		}
		this.backgroundImageObject.onerror = function(){
			console.error("Background image URL is invalid");
		}
		this.backgroundImageObject.src = this.backgroundImageURL;		
	}
}
PhotoMosaic.prototype.initialSetup = function(){
	//Create Paper project
	var _this = this;
  	paper.setup(this.canvas);
  	this.baseLayer = new paper.Layer();
  	//Create background base photo inside baseLayer
  	this.background = new paper.Raster(this.backgroundImageURL);
	this.background.onLoad = function(){_this.backgroundSetup();};
	
}
PhotoMosaic.prototype.backgroundSetup = function(){
	//on load of background photo, generate mosaic
	var _this = this,
		newWidth = 0,
		newHeight = 0,
		adjustedScale = 1,
		adjustedMargin,
		clipGroup,
		boundsRect;
	//width is either size of canvas or size of background image
	this.baseWidth = this.canvas.offsetWidth > this.background.width ? this.background.width : this.canvas.offsetWidth;
	//finalwidth is cropped depending on how many photos fit inside it
	newWidth =  Math.floor(this.baseWidth/this.photos[0].width)*this.photos[0].width;
	adjustedScale = newWidth/this.baseWidth;
	newHeight = Math.floor(this.background.height*adjustedScale);
	newHeight =  Math.floor(newHeight/_this.photos[0].height)*_this.photos[0].height;
	//setting a mask that has the exact size
	boundsRect = new paper.Path.Rectangle({
		point:new paper.Point(0,0),
		size:[newWidth, newHeight]
	});
	this.background.position = this.canvas.offsetWidth<this.background.width ? new paper.Point( this.canvas.offsetWidth/2,(this.background.height*adjustedScale)/2  ) : new paper.Point((this.background.width*adjustedScale)/2,(this.background.height*adjustedScale)/2);
	//cropping image excedent (ideally the image would match with the size of the photos)
	clipGroup = new paper.Group([boundsRect,this.background]);
	clipGroup.clipped = true;
	//adjusting canvas position so it centers
	adjustedMargin = this.canvas.offsetWidth-newWidth;
	adjustedMargin = (this.canvas.offsetWidth/2)-(adjustedMargin/2)
	this.canvas.style.marginLeft="-"+adjustedMargin+"px";
	//background ready! lets create mask
	this.createMask();
}
PhotoMosaic.prototype.setPhotos = function(){
	//Generate mosaic over the background photo, only to fill it, no more
	var _this = this,
		avatarX=0,
		avatarY=0;
	this.photoLayer = new paper.Layer();
	for (var i = 0, limit = this.photos.length; i<limit; i++){
		
		if(avatarX+(this.photos[i].width) > this.background.parent.firstChild.bounds.width){
			avatarX=this.photos[i].width/2;
			avatarY+=this.photos[i].height;
			//if it exceeds the exact fit bounds we set in backgroundSetup, it's over
			if(avatarY>this.background.parent.firstChild.bounds.height){
				break;
			}
		}
		else if(i==0){
			avatarX = this.photos[i].width/2;
			avatarY = this.photos[i].height/2
		}
		else{
			avatarX+=this.photos[i].width;
		}
		this.rasters[i] = new paper.Raster(this.photos[i]);
		this.rasters[i].blendMode = "overlay";
		this.rasters[i].position = new paper.Point(avatarX, avatarY);
	}
	this.totalPhotos = this.rasters.length;
	this.background.opacity=this.settings.opacity;
	this.flatten();
	this.maskLayer.activate();
	paper.view.draw();		
	paper.view.onFrame = function(){_this.showPhotos()};

}
PhotoMosaic.prototype.flatten = function(){
	//we flatten so the animations to show are faster (it only draws a big image, not a bunch of small ones)
	if(this.flattened){
		this.flattened.remove();
		this.flattened = null;
	}
	this.flattened = this.photoLayer.rasterize();
	this.photoLayer.visible = false;
	this.flattened.blendMode = "overlay";
	this.baseLayer.addChild(this.flattened);

}
PhotoMosaic.prototype.unflatten = function(){
	//we unflatten so the images are again accesible for interaction or individual animation
	if(this.flattened){
		this.flattened.remove();
		this.flattened = null;
	}
	this.photoLayer.visible = true;
}
PhotoMosaic.prototype.createMask = function(){
	//create color mosaic overlay for mask effect
	var _this = this,
		rectX=0,
		rectY=0;
	this.maskLayer = new paper.Layer();
	for (var i = 0, limit = this.photos.length; i<limit; i++){
		if(rectX+(this.photos[i].width*2) > this.baseWidth){
			rectX=0;
			rectY+=this.photos[i].height;
			if((rectY+this.photos[i].height)>this.background.height){
				break;
			}
		}
		else if(i==0){
			rectX = 0;
			rectY = 0;
		}
		else{
			rectX+=this.photos[i].width;
		}
		this.maskRectangles.push(new paper.Path.Rectangle({point:[rectX, rectY], size:[this.photos[i].width+1,this.photos[i].height+1], fillColor:this.settings.maskColor}));
	}
	paper.view.draw();
	//wait so browser doesn't stop for too long
	setTimeout(function(){
		_this.setPhotos();
	},100);
};

PhotoMosaic.prototype.showPhotos = function(){
	if(typeof this.goneRectangles == "undefined"){
		this.goneRectangles = [];
		for (this.i = 0; this.i<this.settings.showSpeed; this.i++){
			this.tempIndex = Math.round(Math.random()*this.maskRectangles.length);
			this.goneRectangles.push(this.maskRectangles[this.tempIndex]);
			this.maskRectangles.splice(this.tempIndex,1);
		}
	}
	if(this.maskRectangles.length<=0 && this.goneRectangles.length<=0){
		paper.view.onFrame = null;
		this.finalSetup();
		return;
	}
	if(this.goneRectangles.length<this.settings.showSpeed && this.maskRectangles.length>0){
		for (this.i = 0; this.i<this.settings.showSpeed-this.goneRectangles.length; this.i++){
			if(this.maskRectangles.length>0){
				this.tempIndex = Math.round(Math.random()*this.maskRectangles.length);
				this.goneRectangles.push(this.maskRectangles[this.tempIndex]);
				this.maskRectangles.splice(this.tempIndex,1);
			}
		}
	}
	this.limit = this.goneRectangles.length
	for (this.i=0; this.i<this.limit; this.i++){
		if(this.goneRectangles[this.i] == undefined){
			continue;
		}
		this.goneRectangles[this.i].opacity-=this.settings.showSmoothness;
		if(this.goneRectangles[this.i].opacity<=0.1){
			this.goneRectangles[this.i].opacity = 0;
			this.goneRectangles[this.i].visible = false;
			this.limit--;
		}
		
	}
	this.limit = this.goneRectangles.length;
	for (this.i=0; this.i<this.limit; this.i++){
		if(this.goneRectangles[this.i] == undefined || this.goneRectangles[this.i].opacity == 0){
			this.goneRectangles.splice(this.i,1);
		}
		
	}
};
PhotoMosaic.prototype.finalSetup = function(){
	//if you want to put some kind of mouse listener to each photo or maybe change them dynamically in certain circumstances, unflatten first
	this.unflatten();
	if (document.createEventObject){
        // dispatch for IE
        var evt = document.createEventObject();
        return this.canvas.fireEvent("onComplete")
    }
    else{
        // dispatch for firefox + others
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("onComplete", true, true ); // event type,bubbling,cancelable
        return !this.canvas.dispatchEvent(evt);
    }
}

PhotoMosaic.prototype.updateItem = function(index, photoURL){
	//change item at index square
	var _this = this,
		boundaries,
		newImage;
	if(!this.rasters[index]){
		console.error("There's no item at update index "+index, this.rasters.length)
		return;
	}
	newImage = new Image();
	newImage.onload = function(){
		_this.elementsToSwap.push({"index":_this.elementsToSwap.length-1,"photoIndex":index, "shown":false, "imageObject":newImage});
		if(!paper.view.onFrame){
			paper.view.onFrame = function () {_this.swapElement();}
		}
	}
	newImage.onerror = function(){
		console.error("The image supplied can't load");
	}
	newImage.src = photoURL;
}
PhotoMosaic.prototype.swapElement = function(){
	if(this.elementsToSwap.length==0){
		paper.view.onFrame = null;
		return;
	}
	//check every element to swap (so there's no problem if multiple elements are meant to swap at the same time)
	for (var i=0, limit=this.elementsToSwap.length; i<limit; i++){
		
		if(this.elementsToSwap[i].finish){
			continue;
		}
		//if mask is not covering image and new image isn't set, show mask
		if(this.maskLayer.children[this.elementsToSwap[i].photoIndex].opacity<1 && !this.elementsToSwap[i].shown){
			this.maskLayer.children[this.elementsToSwap[i].photoIndex].visible = true;
			this.maskLayer.children[this.elementsToSwap[i].photoIndex].opacity+=.1;
		}
		//if mask is completely covering image, change it to new one
		else if(this.maskLayer.children[this.elementsToSwap[i].photoIndex].opacity>=.9 && !this.elementsToSwap[i].shown){
			this.maskLayer.children[this.elementsToSwap[i].photoIndex].opacity = 1;
			this.rasters[this.elementsToSwap[i].photoIndex].setImage(this.elementsToSwap[i].imageObject);
			this.elementsToSwap[i].shown = true;
		}
		//if mask is showing and new image is set, hide mask
		else if(this.maskLayer.children[this.elementsToSwap[i].photoIndex].opacity >.1 && this.elementsToSwap[i].shown){
			this.maskLayer.children[this.elementsToSwap[i].photoIndex].opacity-=.1;
		}
		//show new image, hide mask completely, finish swapping
		else if (this.maskLayer.children[this.elementsToSwap[i].photoIndex].opacity <=.1 && this.elementsToSwap[i].shown){
			this.maskLayer.children[this.elementsToSwap[i].photoIndex].opacity=0;
			this.maskLayer.children[this.elementsToSwap[i].photoIndex].visible = false;
			this.elementsToSwap[i].finish = true;
		}
	}
	for(i=0; i<limit; i++){
		if(this.elementsToSwap[i].finish){
			this.elementsToSwap.splice(i, 1);
			i++;
			limit--;
		}
	}
};


