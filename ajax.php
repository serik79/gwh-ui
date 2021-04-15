<?php
/**
 * HELPERS:
 * https://stackoverflow.com/questions/35091757/parse-javascript-fetch-in-php
 * https://stackoverflow.com/questions/2731297/file-get-contentsphp-input-or-http-raw-post-data-which-one-is-better-to
 *
 *
 *
 * URLs:
 * "https://google-webfonts-helper.herokuapp.com/api/fonts/modern-antiqua?subsets=latin,latin-ext"  (/api/fonts/[id]?subsets=latin,latin-ext)
 *
 * "https://google-webfonts-helper.herokuapp.com/api/fonts/lato?download=zip&subsets=latin,latin-ext&variants=regular,700&formats=woff"  (/api/fonts/[id]?download=zip&subsets=latin&formats=woff,woff2&variants=regular)
 * "https://google-webfonts-helper.herokuapp.com/api/fonts/el-messiri?download=zip&subsets=latin,cyrillic&variants=regular,700&formats=woff2"
 *
 */

$json = file_get_contents('php://input');
//$font_path = dirname(__FILE__) . DIRECTORY_SEPARATOR  . 'assets' . DIRECTORY_SEPARATOR  . 'fonts';

if ($json) {
	if ($json = json_decode($json, true)) {
		if ($json['action'] === 'get_font') {
			echo getResponse($json);
//			var_dump(getResponse($json));
		}
		if ($json['action'] === 'delete_font') {
			echo deleteFont($json);
		}
	} else die(json_encode(array("error" => "In the body is not a JSON!")));
} else die(json_encode(array("error" => "Body in your fetch is empty!")));

die();

function deleteFont($request) {
//	global $font_path;
	$font_path = dirname(__FILE__) . DIRECTORY_SEPARATOR  . 'assets' . DIRECTORY_SEPARATOR  . 'fonts';
	if (array_key_exists('font', $request)) {
		for ($i = 0; $i < count($request['font']); $i++) {
			$file = $font_path . DIRECTORY_SEPARATOR  . $request['font'][$i];
			if (file_exists($file)) {
				unlink($file);
			}
		}
		die(json_encode(array(
			"success" => 'File(s) '.implode(", ", $request['font']).' was(were) deleted!!!'
		)));
	}
	
	return 'File wasn`t deleted!!!';
}

function getResponse($request) {
//	global $font_path;
	$google_webfonts_helper_url = 'https://google-webfonts-helper.herokuapp.com/api/fonts';
	$font_path = dirname(__FILE__) . DIRECTORY_SEPARATOR  . 'assets' . DIRECTORY_SEPARATOR  . 'fonts';
	$download = false;
	
	if (array_key_exists('font', $request)) {
		$url = $google_webfonts_helper_url . '/' . $request['font'];
		$output = parse_url($request['font']);
		parse_str(parse_url($request['font'], PHP_URL_QUERY), $output_query);
		if (array_key_exists('download', $output_query) && $output_query['download'] == 'zip' && $output_query['formats'] == 'woff2') {
			$download = true;
		}
	} else $url = $google_webfonts_helper_url;
	
	$ch = curl_init();
	
	$c_options = array(
		CURLOPT_URL => $url,
		CURLOPT_RETURNTRANSFER => 1,
		CURLOPT_SSL_VERIFYHOST => 0,
		CURLOPT_SSL_VERIFYPEER => 0
	);
	
	curl_setopt_array($ch, $c_options);
	
	/**
	 *      https://gist.github.com/thagxt/d9b4388156aeb7f1d66b108d728470d2
	 *      https://stackoverflow.com/questions/8889025/unzip-a-file-with-php
	 */
	if ($download) {
		$zip_file = $font_path . DIRECTORY_SEPARATOR  . 'temp.zip';
		
		/** create "fonts" directory if not exist */
		if (!is_dir($font_path)) {
			mkdir($font_path, 0755, true);
		}
		
		$temp_file = fopen($zip_file, 'w+');
		
		/** If your need to get headers */
		/*global $responseHeaders;
		function readHeader($ch, $header)
		{
			global $responseHeaders;
			$url = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
			$responseHeaders[$url][] = $header;
			return strlen($header);
		}
		curl_setopt($ch, CURLOPT_HEADERFUNCTION, 'readHeader');*/
		
		/** set this to 8 hours so we dont timeout on big files */
//		curl_setopt($ch, CURLOPT_TIMEOUT, 28800);
//		curl_setopt($ch, CURLOPT_TIMEOUT, -1); # optional: -1 = unlimited, 3600 = 1 hour
		
		curl_setopt($ch, CURLOPT_FILE, $temp_file);
		
		curl_exec($ch) or die(json_encode(array("error" => curl_error($ch))));
		
		/** FIXME: maybe it string isn't necessary */
		if(curl_getinfo($ch, CURLINFO_HTTP_CODE) != 200) die(json_encode(array("error" => 'In the CURLINFO_HTTP_CODE Something went wrong!')));
		
		fclose($temp_file);
		curl_close($ch);
		
		/** Open the Zip file */
		$zip = new ZipArchive;
		
		if(!$zip->open($zip_file)) die(json_encode(array("error" => 'Error reading zip-archive!')));
		
		/** get the names of the extracted files */
		$filenames = [];
		for ($i = 0; $i < $zip->numFiles; $i++) {
			$filenames[] = $zip->getNameIndex($i);
		}
		
		/** Extract Zip File */
		$zip->extractTo($font_path);
		$zip->close();
		
		/** Delete Zip File */
		unlink($zip_file);
		
//		parse_str(parse_url($url/*, PHP_URL_QUERY*/), $info);
//		$info = parse_url($url);
		
		/*die(json_encode(array(
			"success" => 'Your file was downloaded and extracted, go check!!!',
			"filenames" => $filenames,
			"obj" => $info,
			"info" => $request['info']
		)));*/
		
		die(json_encode(array(
			"success" => 'Your file was downloaded and extracted, go check!!!',
			"font" => [
				"id" =>  $output['path'],
				"family" =>  $request['info']['family'],
				"variants" => [
					$output_query['variants'] => [
						"subsets" => array_key_exists('subsets', $output_query) ? $output_query['subsets'] : '',
						"files" => $filenames
					]
				]
			]
		)));
	}
	
	$response = curl_exec($ch) or die(json_encode(array("error" => curl_error($ch))));
	
	curl_close($ch);
	
	return $response;
}
