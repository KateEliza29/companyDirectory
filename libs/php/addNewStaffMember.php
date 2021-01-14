<?php

	// example use from browser
	// http://localhost/companydirectory/libs/php/insertDepartment.php?name=New%20Department&locationID=1

	// remove next two lines for production
	
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	include("config.php");

	header('Content-Type: application/json; charset=UTF-8');

	$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname);

	if (mysqli_connect_errno()) {
		
		$output['status']['code'] = "300";
		$output['status']['name'] = "failure";
		$output['status']['description'] = "database unavailable";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output);

		exit;

	}	
//ADDED IN STUFF STARTS HERE

	$q = 'SELECT * from personnel where firstName= "' . $_REQUEST['firstName'] . '" AND lastName = "' . $_REQUEST['lastName'] . '"';
	$result = $conn->query($q);

	if(mysqli_num_rows($result) > 0)
	{
		$output['status']['code'] = "202";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "user exists";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	}
	else {
		$query = 'INSERT INTO personnel (firstName, lastName, jobTitle, email, departmentID) VALUES("' . $_REQUEST['firstName'] . '","' . $_REQUEST["lastName"] . '", "' . $_REQUEST["jobTitle"] . '", "' . $_REQUEST["email"] . '", ' . $_REQUEST["department"] . ')';
		$result = $conn->query($query);
		$id = $conn->insert_id;
	
		
		if (!$result) {
	
			$output['status']['code'] = "400";
			$output['status']['name'] = "executed";
			$output['status']['description'] = "query failed";	
			$output['data'] = [];
	
			mysqli_close($conn);
	
			echo json_encode($output); 
	
			exit;
	
		}
	
		$output['status']['code'] = "200";
		$output['status']['name'] = "ok";
		$output['status']['description'] = "success";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = [$id];
	}

	mysqli_close($conn);

	echo json_encode($output); 

?>