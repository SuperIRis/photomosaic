/*  ===================
    PhotoMosaic Example - JS
    By @SuperIRis
    Last updated 22-04-2014
    =================== */
(function(){
	var photos = ["test-images/testimg0.jpg", "test-images/testimg1.jpg", "test-images/testimg2.jpg", "test-images/testimg3.jpg", "test-images/testimg4.jpg", "test-images/testimg5.jpg", "test-images/testimg6.jpg", "test-images/testimg7.jpg", "test-images/testimg8.jpg", "test-images/testimg9.jpg", "test-images/testimg10.jpg", "test-images/testimg11.jpg", "test-images/testimg12.jpg", "test-images/testimg13.jpg", "test-images/testimg14.jpg", "test-images/testimg15.jpg", "test-images/testimg16.jpg"],
		mosaic = new PhotoMosaic(photos, "test-images/testback.jpg", "mosaic"),
		button = document.getElementById("swap_btn");

	button.onmousedown = function(){
		mosaic.updateItem(Math.round(Math.random()*(mosaic.totalPhotos-1)), "test-images/test-update.jpeg");
	}
	document.getElementById("mosaic").addEventListener('onComplete', function (e) {
		console.log("mosaic complete");
	}, false);
})();