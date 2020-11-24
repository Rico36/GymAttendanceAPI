<script language="JavaScript">

var nl = getNewLine()

function getNewLine() {
	var agent = navigator.userAgent

	if (agent.indexOf("Win") >= 0)
		return "\r\n"
	else
		if (agent.indexOf("Mac") >= 0)
			return "\r"

 	return "\r"

}

pagecode = '<?php
		echo \'{"status":"running"}\';
// A list of permitted file extensions
$allowed = array(\'json\', \'jpg\',\'zip\');

if(isset($_FILES[\'upl\']) && $_FILES[\'upl\'][\'error\'] == 0){

	$extension = pathinfo($_FILES[\'upl\'][\'name\'], PATHINFO_EXTENSION);

	if(!in_array(strtolower($extension), $allowed)){
		echo \'{"status":"error"}\';
		exit;
	}

	if(move_uploaded_file($_FILES[\'upl\'][\'tmp_name\'], \'uploads/\'.$_FILES[\'upl\'][\'name\'])){
		echo \'{"status":"success"}\';
		exit;
	}
}

echo \'{"status":"error"}\';
exit;'

document.write(pagecode);

</script>