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
                'color' => '#4CAF50', // Xanh lá - biểu thị thu nhập tích cực
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'type' => 'income',
                'name' => 'Thưởng',
                'color' => '#66BB6A', // Xanh lá nhạt
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'type' => 'income',
                'name' => 'Thu nhập khác',
                'color' => '#81C784', // Xanh lá sáng
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Danh mục chi tiêu
            [
                'user_id' => $userId,
                'type' => 'expense',
                'name' => 'Ăn uống',
                'color' => '#FF5722', // Cam đậm - chi tiêu hàng ngày
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'type' => 'expense',
                'name' => 'Mua sắm',
                'color' => '#F06292', // Hồng - chi tiêu không thiết yếu
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'type' => 'expense',
                'name' => 'Bảo hiểm',
                'color' => '#0288D1', // Xanh dương - chi phí cố định
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'type' => 'expense',
                'name' => 'Trọ',
                'color' => '#0288D1', // Xanh dương - chi phí cố định
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'type' => 'expense',
                'name' => 'Di chuyển',
                'color' => '#7B1FA2', // Tím - chi phí đi lại
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'type' => 'expense',
                'name' => 'Giải trí',
                'color' => '#FFCA28', // Vàng - chi tiêu tùy chọn
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        Category::insert($categories);
    }
}