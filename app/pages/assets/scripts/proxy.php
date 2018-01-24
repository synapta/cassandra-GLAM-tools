<?php
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);

	//echo file_get_contents($_POST['http://it.wikipedia.org/wiki/JavaScript_Object_Notation']);
	
	header('Access-Control-Allow-Origin: *');
	header('Content-Type: application/json');

	if (!isset($_GET['url'])) {
	    die(); // Don't do anything if we don't have a URL to work with
	}
	$url = urldecode($_GET['url']);
	$url = 'https://' . str_replace('https://', '', $url); // Avoid accessing the file system

	//$id = $doc->getElementById('#content')

?>

<?php echo file_get_contents($url);?>