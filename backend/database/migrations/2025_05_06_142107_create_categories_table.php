<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Gắn với user
            $table->string('name'); // Tên danh mục: Lương, Ăn uống,...
            $table->enum('type', ['income', 'expense'])->default('expense'); // Thu hoặc Chi
            $table->string('color', 7)->nullable(); // Mã màu HEX, ví dụ: #FF0000
            $table->timestamps(); // created_at và updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
