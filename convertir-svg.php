<?php
// Archivo: public_html/convertir-svg.php
// URL: https://moliplast.com/convertir-svg.php

header('Content-Type: application/json');

// Validación de seguridad
$allowedIP = ['179.7.180.191', '::1']; // Solo localhost o agrega la IP de tu servidor
if (!in_array($_SERVER['REMOTE_ADDR'], $allowedIP) && $_SERVER['REMOTE_ADDR'] !== $_SERVER['SERVER_ADDR']) {
    http_response_code(403);
    echo json_encode(['error' => 'Acceso denegado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Recibir el path del SVG
$data = json_decode(file_get_contents('php://input'), true);
$svgPath = $data['svg_path'] ?? null;

if (!$svgPath || !file_exists($svgPath)) {
    http_response_code(400);
    echo json_encode(['error' => 'Archivo SVG no encontrado', 'path' => $svgPath]);
    exit;
}

try {
    // Leer SVG
    $svgContent = file_get_contents($svgPath);
    
    // Convertir con Imagick
    $imagick = new Imagick();
    $imagick->readImageBlob($svgContent);
    $imagick->setImageFormat('png');
    $imagick->resizeImage(400, 400, Imagick::FILTER_LANCZOS, 1);
    $imagick->setImageBackgroundColor('white');
    $imagick->setImageAlphaChannel(Imagick::ALPHACHANNEL_REMOVE);
    
    // Guardar temporal
    $tempDir = '/home/moliplas/public_html/api/storage/app/temp';
    if (!file_exists($tempDir)) {
        mkdir($tempDir, 0755, true);
    }
    
    $tempPngPath = $tempDir . '/qr_temp_' . uniqid() . '.png';
    $imagick->writeImage($tempPngPath);
    $imagick->clear();
    $imagick->destroy();
    
    // Devolver la ruta del PNG generado
    echo json_encode([
        'success' => true,
        'png_path' => $tempPngPath
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error al convertir',
        'message' => $e->getMessage()
    ]);
}
?>