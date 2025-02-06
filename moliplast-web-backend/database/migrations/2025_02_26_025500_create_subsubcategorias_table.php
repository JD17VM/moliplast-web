<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subsubcategorias', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_subcategoria'); // Clave foránea a la tabla "subcategoria"
            $table->string('nombre', 50);
            $table->boolean('estatus')->default(1);
            $table->timestamps();

            // Definir la clave foránea
            $table->foreign('id_subcategoria')->references('id')->on('subcategorias');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subsubcategorias');
    }
};
