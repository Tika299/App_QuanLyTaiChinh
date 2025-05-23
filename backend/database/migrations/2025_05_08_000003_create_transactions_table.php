<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('name', 50);
            $table->decimal('amount', 10, 2);
            $table->text('description')->nullable();
            $table->timestamps(); // Tạo created_at và updated_at tự động
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
