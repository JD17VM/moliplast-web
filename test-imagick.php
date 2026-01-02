<?php
echo "Versión PHP: " . phpversion() . "<br>";
echo "Imagick instalado: " . (extension_loaded('imagick') ? 'SÍ ✅' : 'NO ❌') . "<br>";
if (class_exists('Imagick')) {
    echo "Clase Imagick disponible: SÍ ✅<br>";
    $imagick = new Imagick();
    echo "Versión Imagick: " . $imagick->getVersion()['versionString'];
} else {
    echo "Clase Imagick disponible: NO ❌";
}
?>