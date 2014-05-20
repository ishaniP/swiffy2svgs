<?php

$postdata = file_get_contents("php://input");

$svgs = explode('|', $postdata);

$svgFiles = array();

for ($i = 0; $i < count($svgs); $i++) {

	$xml = new DOMDocument();
	$xml->loadXML($svgs[$i]);

	$svgFiles[$i] = 'svgs/svgframe' . ($i + 1)  . '.svg';

	$xml->save($svgFiles[$i]);
}

$result = create_zip($svgFiles,'svgFiles.zip');

echo 'svgFiles.zip';

function create_zip($files = array(),$destination = '',$overwrite = true) {
	//if the zip file already exists and overwrite is false, return false
	if(file_exists($destination) && !$overwrite) { return false; }
	//vars
	$valid_files = array();
	//if files were passed in...
	if(is_array($files)) {
		//cycle through each file
		foreach($files as $file) {
			//make sure the file exists
			if(file_exists($file)) {
				$valid_files[] = $file;
			}
		}
	}
	//if we have good files...
	if(count($valid_files)) {
		//create the archive
		$zip = new ZipArchive();
		if($zip->open($destination,$overwrite ? ZIPARCHIVE::OVERWRITE : ZIPARCHIVE::CREATE) !== true) {
			return false;
		}
		//add the files
		foreach($valid_files as $file) {
			$zip->addFile($file,$file);
		}
		//debug
		//echo 'The zip archive contains ',$zip->numFiles,' files with a status of ',$zip->status;
		
		//close the zip -- done!
		$zip->close();
		
		//check to make sure the file exists
		return file_exists($destination);
	}
	else
	{
		return false;
	}
}

function cleanData() {
	// Maybe there should be a cleaning function but at the moment all files are overwritten and
	// the zip only takes the files array.. so no need.
}

?>