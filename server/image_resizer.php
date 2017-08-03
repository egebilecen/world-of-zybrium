<?php
	/*
	 # Coded by XMA
	*/
	$dosya = $argv[1];

	$image = @imagecreatefrompng($dosya);

	if( !$image )
	{
		echo 'Image cannot find.';
	}
	else
	{
		//header('Content-Type: image/png');
		$new_size   = imagescale($image,396,704,IMG_NEAREST_NEIGHBOUR);
		$image_data = imagepng($new_size, $dosya);

		if( $image_data )
			echo 'Image successfully resized!';
		else
			echo 'An error occured while writing new data to image file.';
	}	
?>