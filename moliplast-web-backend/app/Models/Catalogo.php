<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Catalogo extends Model
{

    protected $table = 'catalogos';


    protected $fillable = [
        'id_categoria',
        'enlace_documento',
        'nombre',
        'enlace_imagen_portada',
        'estatus',
    ];

    protected $casts = [
        'estatus' => 'boolean', // Convierte el valor a booleano (true/false)
    ];

    // Relación con Categoria
    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'id_categoria');
    }

    use HasFactory;
}
