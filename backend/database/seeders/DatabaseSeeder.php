<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Transaction;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Lấy user đã đăng ký
        $user = User::where('email', 'thuatnguyenvan262005@gmail.com')->first();

        if (!$user) {
            throw new \Exception('Không tìm thấy user với email. Vui lòng đăng ký user trước.');
        }

        // Tạo danh mục
        $categories = [
            ['user_id' => $user->id, 'name' => 'Lương', 'color' => '#10B981', 'type' => 'income'],
            ['user_id' => $user->id, 'name' => 'Thưởng', 'color' => '#34D399', 'type' => 'income'],
            ['user_id' => $user->id, 'name' => 'Đầu tư', 'color' => '#6EE7B7', 'type' => 'income'],
            ['user_id' => $user->id, 'name' => 'Ăn uống', 'color' => '#EF4444', 'type' => 'expense'],
            ['user_id' => $user->id, 'name' => 'Giải trí', 'color' => '#F59E0B', 'type' => 'expense'],
            ['user_id' => $user->id, 'name' => 'Di chuyển', 'color' => '#3B82F6', 'type' => 'expense'],
            ['user_id' => $user->id, 'name' => 'Mua sắm', 'color' => '#8B5CF6', 'type' => 'expense'],
            ['user_id' => $user->id, 'name' => 'Hóa đơn', 'color' => '#EC4899', 'type' => 'expense'],
        ];
        Category::insert($categories);

        // Lấy ID danh mục vừa tạo
        $categoryIds = Category::whereIn('name', [
            'Lương', 'Thưởng', 'Đầu tư', 'Ăn uống', 'Giải trí', 'Di chuyển', 'Mua sắm', 'Hóa đơn'
        ])
            ->pluck('id', 'name')
            ->toArray();

        // Tạo 15 giao dịch thu/chi từ tháng 1 đến tháng 6, 2025
        $transactions = [
            // Tháng 1
            [
                'user_id' => $user->id,
                'category_id' => $categoryIds['Lương'],
                'amount' => 6000.00,
                'name' => 'Lương tháng 1',
                'description' => 'Nhận lương tháng 1',
                'created_at' => '2025-01-01 09:00:00',
            ],
            [
                'user_id' => $user->id,
                'category_id' => $categoryIds['Ăn uống'],
                'amount' => 200.00,
                'name' => 'Ăn trưa',
                'description' => 'Ăn trưa ở quán cơm',
                'created_at' => '2025-01-05 12:30:00',
            ],
            [
                'user_id' => $user->id,
                'category_id' => $categoryIds['Hóa đơn'],
                'amount' => 150.00,
                'name' => 'Hóa đơn điện',
                'description' => 'Thanh toán hóa đơn điện tháng 1',
                'created_at' => '2025-01-10 15:00:00',
            ],
            // Tháng 2
            [
                'user_id' => $user->id,
                'category_id' => $categoryIds['Lương'],
                'amount' => 6200.00,
                'name' => 'Lương tháng 2',
                'description' => 'Nhận lương tháng 2',
                'created_at' => '2025-02-01 09:00:00',
            ],
            [
                'user_id' => $user->id,
                'category_id' => $categoryIds['Giải trí'],
                'amount' => 250.00,
                'name' => 'Vé xem phim',
                'description' => 'Xem phim tại rạp CGV',
                'created_at' => '2025-02-15 19:00:00',
            ],
            // Tháng 3
            [
                'user_id' => $user->id,
                'category_id' => $categoryIds['Thưởng'],
                'amount' => 1000.00,
                'name' => 'Thưởng quý 1',
                'description' => 'Thưởng hiệu suất quý 1',
                'created_at' => '2025-03-01 10:00:00',
            ],
            [
                'user_id' => $user->id,
                'category_id' => $categoryIds['Di chuyển'],
                'amount' => 180.00,
                'name' => 'Xăng xe',
                'description' => 'Đổ xăng xe máy',
                'created_at' => '2025-03-07 08:00:00',
            ],
            // Tháng 4
            [
                'user_id' => $user->id,
                'category_id' => $categoryIds['Lương'],
                'amount' => 6300.00,
                'name' => 'Lương tháng 4',
                'description' => 'Nhận lương tháng 4',
                'created_at' => '2025-04-01 09:00:00',
            ],
            [
                'user_id' => $user->id,
                'category_id' => $categoryIds['Mua sắm'],
                'amount' => 500.00,
                'name' => 'Mua quần áo',
                'description' => 'Mua quần áo mùa hè',
                'created_at' => '2025-04-10 14:00:00',
            ],
            [
                'user_id' => $user->id,
                'category_id' => $categoryIds['Ăn uống'],
                'amount' => 300.00,
                'name' => 'Ăn tối',
                'description' => 'Ăn tối ở nhà hàng',
                'created_at' => '2025-04-15 19:30:00',
            ],
            // Tháng 5
            [
                'user_id' => $user->id,
                'category_id' => $categoryIds['Lương'],
                'amount' => 6500.00,
                'name' => 'Lương tháng 5',
                'description' => 'Nhận lương tháng 5',
                'created_at' => '2025-05-01 09:00:00',
            ],
            [
                'user_id' => $user->id,
                'category_id' => $categoryIds['Giải trí'],
                'amount' => 300.00,
                'name' => 'Vé hòa nhạc',
                'description' => 'Mua vé hòa nhạc',
                'created_at' => '2025-05-20 20:00:00',
            ],
            [
                'user_id' => $user->id,
                'category_id' => $categoryIds['Hóa đơn'],
                'amount' => 200.00,
                'name' => 'Hóa đơn nước',
                'description' => 'Thanh toán hóa đơn nước tháng 5',
                'created_at' => '2025-05-25 16:00:00',
            ],
            // Tháng 6
            [
                'user_id' => $user->id,
                'category_id' => $categoryIds['Đầu tư'],
                'amount' => 800.00,
                'name' => 'Lợi nhuận đầu tư',
                'description' => 'Lợi nhuận từ cổ phiếu',
                'created_at' => '2025-06-01 10:00:00',
            ],
            [
                'user_id' => $user->id,
                'category_id' => $categoryIds['Di chuyển'],
                'amount' => 220.00,
                'name' => 'Sửa xe',
                'description' => 'Sửa xe máy',
                'created_at' => '2025-06-10 10:00:00',
            ],
            // Tháng 6/2024
            [
                'user_id' => $user->id,
                'category_id' => $categoryIds['Đầu tư'],
                'amount' => 800.00,
                'name' => 'Lợi nhuận đầu tư',
                'description' => 'Lợi nhuận từ cổ phiếu',
                'created_at' => '2024-06-01 10:00:00',
            ],
            [
                'user_id' => $user->id,
                'category_id' => $categoryIds['Di chuyển'],
                'amount' => 220.00,
                'name' => 'Sửa xe',
                'description' => 'Sửa xe máy',
                'created_at' => '2024-06-10 10:00:00',
            ],
        ];
        Transaction::insert($transactions);
    }
}