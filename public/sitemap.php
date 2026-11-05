<?php
// Dynamic sitemap generator for Aira Properties
header('Content-Type: application/xml; charset=utf-8');

$baseUrl = 'https://airaproperties.in';
$today = date('Y-m-d');

// Static core public pages
$staticPages = [
    ['loc' => '/', 'changefreq' => 'daily', 'priority' => '1.0'],
    ['loc' => '/services', 'changefreq' => 'weekly', 'priority' => '0.8'],
    ['loc' => '/builders', 'changefreq' => 'weekly', 'priority' => '0.8'],
    ['loc' => '/partner-with-us', 'changefreq' => 'monthly', 'priority' => '0.7'],
    ['loc' => '/app', 'changefreq' => 'monthly', 'priority' => '0.7'],
    ['loc' => '/contact-us', 'changefreq' => 'monthly', 'priority' => '0.6'],
    ['loc' => '/privacy', 'changefreq' => 'yearly', 'priority' => '0.5'],
    ['loc' => '/terms', 'changefreq' => 'yearly', 'priority' => '0.5'],
    ['loc' => '/refund', 'changefreq' => 'yearly', 'priority' => '0.5'],
    ['loc' => '/data-deletion', 'changefreq' => 'yearly', 'priority' => '0.3'],
];

// District / Location landing pages
$districts = [
    'Wayanad', 'Kozhikode', 'Kannur', 'Kasaragod', 'Malappuram',
    'Palakkad', 'Thrissur', 'Ernakulam', 'Idukki', 'Kottayam',
    'Alappuzha', 'Pathanamthitta', 'Kollam', 'Thiruvananthapuram'
];

foreach ($districts as $d) {
    $staticPages[] = [
        'loc' => '/location/' . rawurlencode($d),
        'changefreq' => 'daily',
        'priority' => '0.8'
    ];
}

// Fetch all active public properties from API
$properties = [];
$apiUrl = 'https://api.airaproperties.in/api/properties?status=Active';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 6);
$response = curl_exec($ch);
curl_close($ch);

if ($response) {
    $data = json_decode($response, true);
    if (is_array($data)) {
        $properties = $data;
    }
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

// Render static pages
foreach ($staticPages as $page) {
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars($baseUrl . $page['loc']) . "</loc>\n";
    echo "    <lastmod>" . $today . "</lastmod>\n";
    echo "    <changefreq>" . $page['changefreq'] . "</changefreq>\n";
    echo "    <priority>" . $page['priority'] . "</priority>\n";
    echo "  </url>\n";
}

// Render property detail pages
foreach ($properties as $prop) {
    if (!isset($prop['id'])) continue;
    $propId = $prop['id'];
    $lastmod = $today;
    if (!empty($prop['updatedAt'])) {
        $lastmod = date('Y-m-d', strtotime($prop['updatedAt']));
    } elseif (!empty($prop['createdAt'])) {
        $lastmod = date('Y-m-d', strtotime($prop['createdAt']));
    }
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars($baseUrl . '/property/' . $propId) . "</loc>\n";
    echo "    <lastmod>" . $lastmod . "</lastmod>\n";
    echo "    <changefreq>daily</changefreq>\n";
    echo "    <priority>0.9</priority>\n";
    echo "  </url>\n";
}

echo '</urlset>';
?>