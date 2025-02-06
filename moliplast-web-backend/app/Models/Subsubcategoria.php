<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subsubcategoria extends Model
{
    protected $table = 'subsubcategorias';

    protected $fillable = [
        'id_subcategoria',
        'nombre',
        'estatus',
    ];

    protected $casts = [
        'estatus' => 'boolean',
    ];

    public function subcategoria()
    {
        return $this->belongsTo(Subcategoria::class);
    }

    /*
    public function subcategoria()
    {
        return $this->belongsTo(Subcategoria::class, 'id_subcategoria', 'id');
    }
    */

    use HasFactory;
}
