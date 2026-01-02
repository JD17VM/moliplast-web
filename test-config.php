<?php
echo "<pre>";
echo "Ruta actual: " . __DIR__ . "\n";
echo "PHP Binary: " . PHP_BINARY . "\n";
echo "Loaded ini: " . php_ini_loaded_file() . "\n";
echo "Scan dir: " . php_ini_scanned_files() . "\n";
echo "Imagick: " . (extension_loaded('imagick') ? 'SÍ' : 'NO') . "\n";
echo "GD: " . (extension_loaded('gd') ? 'SÍ' : 'NO') . "\n";
echo "</pre>";
?>