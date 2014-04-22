# Photo mosaic

Create a photo mosaic based on a big image formed by smaller ones. It uses an overlay mode, so the small images blend in the background image to give the illusion that they form a big image. 

It uses canvas and PaperJS, so stick to modern browsers :)


## Project Setup

1. Include PaperJS and Photomosaic.js in your project
2. Create a canvas element in your HTML and assign an ID.
3. Gather the URLs of the small photos you are going to use in an array (remember that all the photos must be the same size).
4. Initialize the mosaic with a new instance of the PhotoMosaic object, providing the small photos array, the big image URL, and the canvas id.
```javascript
	var photos = ["test-images/testimg0.jpg", ...],
		mosaic = new PhotoMosaic(photos, "test-images/testback.jpg", "mosaic");

```

If the URLs array you sent can't be loaded, they will not be included in the mosaic but it will still function with the remaining images.

There is an example.html that you can check for functionality. The images are from Google, I hope I don't aggravate anyone by using them for example purposes; if I do tell me and I will take them down.


## Settings

You can include a settings object in the constructor to customize some of the parameters:

> - opacity: background opacity sometimes helps the mosaic look more realistic (defaults to 0.8)
> - showSpeed: number of squares in mask that dissappear at the same time (high number equals high speed) (defaults to 20)
> - showSmoothness: speed at which squares in mask reduce opacity (low number equals slow speed but the effect is more noticeable)(defaults to 0.2)
> - maskColor: color of squares in mask (defaults to 'black')
> - randomPhotos: shuffles the photosURLsArray so they show everytime in a different position. If there are more photos than needed, randomPhotos allows to show different photos everytime (if it is false, last ones will never show up) (defaults to true)

```javascript
	var mosaic = new PhotoMosaic(photos, "test-images/testback.jpg", "mosaic", {
		opacity:1,
		showSpeed:18,
		showSmoothness:0.1,
		maskColor:'white',
		randomPhotos:false
	});

```

## Properties

> - totalPhotos: the number of elements actually showing in the mosaic (maybe more or less than the length of the array you sent to the mosaic)


## Methods

> - updateItem: It hides with animation, changes its source and then animates back again. The parameters are the index of the element you want to change and the URL of the new photo.

This example changes a random photo with a new one.
```javascript
	mosaic.updateItem(Math.round(Math.random()*(mosaic.totalPhotos-1)), "test-images/test-update.jpeg");
```

## Events

> - onComplete: is emitted by the canvas element when the animation of the masks is complete and the mosaic is fully showing)
```javascript
document.getElementById("mosaic").addEventListener("onComplete", function (e) {
		console.log("mosaic complete");
	}, false);
```

## License

GPL