(function(){
	//var photos = ["test-images/testimg0.jpeg", "test-images/testimg1.jpeg", "test-images/testimg2.jpeg", "test-images/testimg3.png", "test-images/testimg4.png", "test-images/testimg5.png", "test-images/testimg6.png", "test-images/testimg7.png", "test-images/testimg8.jpeg", "test-images/testimg9.png", "test-images/testimg10.jpg", "test-images/testimg11.jpg", "test-images/testimg12.jpg", "test-images/testimg13.jpg", "test-images/testimg14.jpg", "test-images/testimg15.jpg", "test-images/testimg16.jpg"],
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