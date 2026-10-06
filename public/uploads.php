<?php
$file = basename($_GET['file'] ?? '');
if (!$file) {
    http_response_code(404);
    echo "File not specified";
    exit;
}

// Disallow path traversal
if (strpos($file, '..') !== false || strpos($file, '/') !== false || strpos($file, '\\') !== false) {
    http_response_code(403);
    echo "Forbidden";
    exit;
}

$apiUrl = "https://api.airaproperties.in/uploads/" . rawurlencode($file);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
$data = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

if ($httpCode === 200 && $data !== false) {
    if ($contentType) {
        header("Content-Type: " . $contentType);
    }
    header("Cache-Control: public, max-age=31536000, immutable");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, OPTIONS");
    echo $data;
    exit;
}

// Fallback: 301 redirect to API if direct fetch failed
header("Location: " . $apiUrl, true, 301);
exit;
