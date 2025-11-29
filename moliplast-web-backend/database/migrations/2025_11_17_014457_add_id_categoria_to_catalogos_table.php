<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('catalogos', function (Blueprint $table) {
            $table->unsignedBigInteger('id_categoria')->nullable()->after('id');
            $table->foreign('id_categoria')->references('id')->on('categorias')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('catalogos', function (Blueprint $table) {
            $table->dropForeign(['id_categoria']);
            $table->dropColumn('id_categoria');
        });
    }
};