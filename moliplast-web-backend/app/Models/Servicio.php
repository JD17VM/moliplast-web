<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Servicio extends Model
{
    protected $table = 'servicios';

    protected $fillable = [
        'titulo',
        'descripcion',
        'enlace_imagen',
        'estatus',
    ];

    protected $casts = [
        'estatus' => 'boolean', // Convierte el valor a booleano (true/false)
    ];

    use HasFactory;
}
