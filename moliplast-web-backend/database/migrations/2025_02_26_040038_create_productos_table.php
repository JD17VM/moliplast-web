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
        Schema::create('productos', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('id_categoria')->nullable(); // Clave foránea a "categoria"
            $table->unsignedBigInteger('id_subcategoria')->nullable(); // Clave foránea a "subcategoria"
            $table->unsignedBigInteger('id_subsubcategoria')->nullable(); // Clave foránea a "subsubcategoria"

            $table->string('nombre', 100);
            $table->string('descripcion', 200)->nullable();
            $table->string('imagen_1', 50);
            $table->string('imagen_2', 50)->nullable();
            $table->string('imagen_3', 50)->nullable();
            $table->string('imagen_4', 50)->nullable();
            $table->string('enlace_ficha_tecnica', 50)->nullable();
            $table->text('texto_markdown')->nullable();
            $table->boolean('destacados')->default(0);
            $table->string('enlace_imagen_qr', 50);

            $table->boolean('estatus')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};