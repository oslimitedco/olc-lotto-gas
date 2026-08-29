<?php
/**
 * OLC Lotto Gas — One-Click Deploy Script
 * Upload this single file to public_html and visit it in your browser.
 * It will download the code from GitHub and set everything up.
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
$zipUrl = 'https://github.com/oslimitedco/olc-lotto-gas/archive/refs/heads/main.zip';
$zipFile = $baseDir . '/olc-deploy.zip';
$extractDir = $baseDir . '/olc-extract';

// Step 1: Download
echo "📥 Downloading from GitHub...\n";
$zip = file_get_contents($zipUrl);
if ($zip === false) {
    echo "<span class='err'>❌ Failed to download. Check if allow_url_fopen is enabled.</span>\n";
    exit;
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

// Step 3: Move files to base directory
echo "📂 Moving files to public_html...\n";
$subfolder = $extractDir . '/olc-lotto-gas-main';
if (!is_dir($subfolder)) {
    // Try other possible names
    $dirs = glob($extractDir . '/*', GLOB_ONLYDIR);
    $subfolder = !empty($dirs) ? $dirs[0] : null;
}

if ($subfolder && is_dir($subfolder)) {
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($subfolder, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );
    
    $moved = 0;
    foreach ($files as $file) {
        $dest = $baseDir . '/' . $file->getSubPathname();
        if ($file->isDir()) {
            if (!is_dir($dest)) mkdir($dest, 0755, true);
        } else {
            copy($file->getRealPath(), $dest);
            $moved++;
        }
    }
    echo "<span class='ok'>✅ Moved $moved files</span>\n\n";
} else {
    echo "<span class='err'>❌ Could not find extracted subfolder</span>\n";
}

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
$critical = ['index.php', 'config/db.php', 'assets/css/style.css', 'assets/js/app.js'];
$allGood = true;
foreach ($critical as $f) {
    if (file_exists($baseDir . '/' . $f)) {
        $size = filesize($baseDir . '/' . $f);
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
    echo "1. Edit <b>config/db.php</b> with your MySQL credentials\n";
    echo "2. Visit <a href='setup.php' style='color:#F8C959;'>setup.php</a> to initialize the database\n";
    echo "3. <b>DELETE this deploy.php file!</b>\n";
    echo "\n";
    echo "Visit your site: <a href='/' style='color:#4DF8F2;'>https://oslimitedco.com</a>\n";
} else {
    echo "<span class='err'>⚠️ Some files are missing. Check the errors above.</span>\n";
}

echo "</pre></body></html>";
