<?php
/**
 * OLC Lotto Gas — One-Click Deploy Script
 * Upload this single file to public_html and visit it in your browser.
 * DELETE THIS FILE AFTER DEPLOYMENT.
 */

set_time_limit(300);
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<!DOCTYPE html><html><head><title>OLC Deploy</title>";
echo "<style>body{font-family:monospace;background:#0a0a0f;color:#4DF8F2;padding:40px;}";
echo "h1{color:#F8C959;} .ok{color:#4DF8F2;} .err{color:#D64D4D;} pre{background:#1f2533;padding:20px;border-radius:10px;}</style></head><body>";
echo "<h1>⛽ OLC Lotto Gas — Deploy Script</h1><pre>";

$baseDir = __DIR__;
$zipUrl = 'https://github.com/oslimitedco/olc-lotto-gas/archive/refs/heads/main.zip?t=' . time();
$zipFile = $baseDir . '/olc-deploy.zip';
$extractDir = $baseDir . '/olc-extract';

// Files to NEVER overwrite if they already exist on server
$skipFiles = ['config/db.php'];

// Step 1: Download
echo "📥 Downloading from GitHub...\n";
$zip = @file_get_contents($zipUrl);
if ($zip === false) {
    echo "<span class='err'>❌ Failed to download. Trying cURL...</span>\n";
    $ch = curl_init($zipUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $zip = curl_exec($ch);
    curl_close($ch);
    if ($zip === false) {
        echo "<span class='err'>❌ cURL also failed. Check server connectivity.</span>\n";
        exit;
    }
}
file_put_contents($zipFile, $zip);
echo "<span class='ok'>✅ Downloaded (" . round(strlen($zip)/1024) . " KB)</span>\n\n";

// Step 2: Extract
echo "📦 Extracting...\n";
$zipObj = new ZipArchive();
if ($zipObj->open($zipFile) === true) {
    $zipObj->extractTo($extractDir);
    $zipObj->close();
    echo "<span class='ok'>✅ Extracted</span>\n\n";
} else {
    echo "<span class='err'>❌ Failed to extract ZIP</span>\n";
    exit;
}

// Step 3: Find the subfolder
echo "📂 Moving files to public_html...\n";
$subfolder = null;
$items = scandir($extractDir);
foreach ($items as $item) {
    if ($item === '.' || $item === '..') continue;
    $path = $extractDir . '/' . $item;
    if (is_dir($path)) {
        $subfolder = $path;
        break;
    }
}

if (!$subfolder || !is_dir($subfolder)) {
    echo "<span class='err'>❌ Could not find extracted subfolder</span>\n";
    exit;
}

echo "  Found subfolder: " . basename($subfolder) . "\n";

// Recursive copy function — tracks base dir for correct relative paths
function recursiveCopy($src, $dst, $baseSrc, $skipFiles) {
    $count = 0;
    $dir = opendir($src);
    if (!is_dir($dst)) mkdir($dst, 0755, true);
    while (($file = readdir($dir)) !== false) {
        if ($file === '.' || $file === '..') continue;
        $srcPath = $src . '/' . $file;
        $dstPath = $dst . '/' . $file;
        if (is_dir($srcPath)) {
            $count += recursiveCopy($srcPath, $dstPath, $baseSrc, $skipFiles);
        } else {
            // Compute path relative to the base source directory
            $relativePath = str_replace($baseSrc . '/', '', $srcPath);
            if (in_array($relativePath, $skipFiles) && file_exists($dstPath)) {
                echo "  ⏭️ Skipped: $relativePath (preserved)\n";
                continue;
            }
            copy($srcPath, $dstPath);
            $count++;
        }
    }
    closedir($dir);
    return $count;
}

$moved = recursiveCopy($subfolder, $baseDir, $subfolder, $skipFiles);
echo "<span class='ok'>✅ Moved $moved files</span>\n\n";

// Step 4: Cleanup
echo "🧹 Cleaning up...\n";
if (file_exists($zipFile)) unlink($zipFile);
if (is_dir($extractDir)) {
    function rrmdir($dir) {
        foreach (scandir($dir) as $item) {
            if ($item === '.' || $item === '..') continue;
            $path = $dir . '/' . $item;
            is_dir($path) ? rrmdir($path) : unlink($path);
        }
        rmdir($dir);
    }
    rrmdir($extractDir);
}
echo "<span class='ok'>✅ Cleaned up temp files</span>\n\n";

// Step 5: Check files
echo "🔍 Verifying deployment...\n";
$critical = ['index.php', 'config/db.php', 'assets/css/style.css', 'assets/js/app.js', 'admin/login.php'];
$allGood = true;
foreach ($critical as $f) {
    $fullPath = $baseDir . '/' . $f;
    if (file_exists($fullPath)) {
        $size = filesize($fullPath);
        echo "  <span class='ok'>✅ $f ($size bytes)</span>\n";
    } else {
        echo "  <span class='err'>❌ $f MISSING</span>\n";
        $allGood = false;
    }
}

echo "\n";
if ($allGood) {
    echo "<span class='ok'>🎉 Deployment complete!</span>\n";
    echo "\n";
    echo "Next steps:\n";
    echo "1. Visit <a href='setup.php' style='color:#F8C959;'>setup.php</a> to initialize the database\n";
    echo "2. <b>DELETE this deploy.php file!</b>\n";
    echo "\n";
    echo "Visit your site: <a href='/' style='color:#4DF8F2;'>https://oslimitedco.com</a>\n";
} else {
    echo "<span class='err'>⚠️ Some files are missing. Check the errors above.</span>\n";
}

echo "</pre></body></html>";
