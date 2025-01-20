<?php

namespace App\Models\Softlink;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Precio extends Model
{
    protected $connection = 'externa';
    protected $table = 'precios'; // Nombre de la tabla en la base de datos externa
}
