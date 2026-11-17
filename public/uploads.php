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

$reqWidth = isset($_GET['w']) ? intval($_GET['w']) : (isset($_GET['thumb']) ? 600 : 0);
$reqQuality = isset($_GET['q']) ? max(10, min(100, intval($_GET['q']))) : 82;

// Check local thumbs cache if a thumbnail was requested
if ($reqWidth > 0) {
    $thumbDir = __DIR__ . '/uploads/thumbs';
    $thumbPath = $thumbDir . '/' . $reqWidth . '_' . $file;
    if (file_exists($thumbPath) && filesize($thumbPath) > 0) {
        header("Content-Type: image/webp");
        header("Cache-Control: public, max-age=31536000, immutable");
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, OPTIONS");
        readfile($thumbPath);
        exit;
    }
}

// Check if original file exists on local filesystem
$localOriginal = __DIR__ . '/uploads/' . $file;
$data = null;
$contentType = null;

if (file_exists($localOriginal) && filesize($localOriginal) > 0) {
    $data = file_get_contents($localOriginal);
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $contentType = ($ext === 'webp') ? 'image/webp' : (($ext === 'png') ? 'image/png' : 'image/jpeg');
} else {
    // Fetch from backend API
    $apiUrl = "https://api.airaproperties.in/uploads/" . rawurlencode($file);
    if ($reqWidth > 0) {
        $apiUrl .= "?w=" . $reqWidth . "&thumb=1&q=" . $reqQuality;
    }

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

    if ($httpCode !== 200 || $data === false) {
        header("Location: https://api.airaproperties.in/uploads/" . rawurlencode($file), true, 301);
        exit;
    }
}

// If thumbnail was requested and we have image data, attempt to resize and cache with GD
if ($reqWidth > 0 && $data) {
    $srcImg = @imagecreatefromstring($data);
    if ($srcImg) {
        $origW = imagesx($srcImg);
        if ($origW > $reqWidth) {
            $scaled = imagescale($srcImg, $reqWidth);
            if ($scaled) {
                imagedestroy($srcImg);
                $srcImg = $scaled;
            }
        }
        if (function_exists('imagewebp')) {
            $thumbDir = __DIR__ . '/uploads/thumbs';
            if (!is_dir($thumbDir)) {
                @mkdir($thumbDir, 0755, true);
            }
            $thumbPath = $thumbDir . '/' . $reqWidth . '_' . $file;
            @imagewebp($srcImg, $thumbPath, $reqQuality);

            header("Content-Type: image/webp");
            header("Cache-Control: public, max-age=31536000, immutable");
            header("Access-Control-Allow-Origin: *");
            header("Access-Control-Allow-Methods: GET, OPTIONS");
            imagewebp($srcImg, null, $reqQuality);
            imagedestroy($srcImg);
            exit;
        }
        imagedestroy($srcImg);
    }
}

// Default output if not resized
if ($contentType) {
    header("Content-Type: " . $contentType);
}
header("Cache-Control: public, max-age=31536000, immutable");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
echo $data;
exit;
