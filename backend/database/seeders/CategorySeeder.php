<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\User;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        Category::truncate(); // Xóa dữ liệu cũ

        $categoryNames = [
            'Lương',
            'Ăn uống',
            'Trọ',
            'Di chuyển',
            'Giải trí',
            'Mua sắm',
            'Bảo hiểm',
            'Thưởng',
            'Thu nhập khác',
        ];
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

        $users = User::all();

        foreach ($users as $user) {
            foreach ($categoryNames as $name) {
                Category::create([
                    'user_id' => $user->id,
                    'name' => $name,
                ]);
            }
        }

        // Tùy chọn: tạo các danh mục chung không thuộc user nào
        foreach ($categoryNames as $name) {
            Category::create([
                'user_id' => null,
                'name' => $name,
            ]);
        }
    }
}