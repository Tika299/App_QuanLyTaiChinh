<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $userId = 1; // Giả định user_id = 1 từ UserSeeder

        $categories = [
            // Danh mục thu nhập
            [
                'user_id' => $userId,
                'type' => 'income',
                'name' => 'Lương',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'type' => 'income',
                'name' => 'Thưởng',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'type' => 'income',
                'name' => 'Thu nhập khác',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Danh mục chi tiêu
            [
                'user_id' => $userId,
                'type' => 'expense',
                'name' => 'Ăn uống',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'type' => 'expense',
                'name' => 'Mua sắm',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'type' => 'expense',
                'name' => 'Bảo hiểm',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'type' => 'expense',
                'name' => 'Trọ',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'type' => 'expense',
                'name' => 'Di chuyển',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'type' => 'expense',
                'name' => 'Giải trí',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        Category::insert($categories);
    }
}
