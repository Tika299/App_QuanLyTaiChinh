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
            'Lương',
            'Thưởng',
            'Đầu tư',
            'Ăn uống',
            'Giải trí',
            'Di chuyển',
            'Mua sắm',
            'Hóa đơn'
        ])
            ->pluck('id', 'name')
            ->toArray();

        // Tạo 15 giao dịch thu/chi từ tháng 1 đến tháng 6, 2025
        $transactions = [];

        $monthlyData = [
            1 => [
                ['Lương', 6000, 'Lương tháng 1'],
                ['Ăn uống', 200, 'Ăn trưa'],
                ['Hóa đơn', 150, 'Hóa đơn điện'],
                ['Giải trí', 180, 'Mua game'],
                ['Di chuyển', 100, 'Xăng xe'],
            ],
            2 => [
                ['Lương', 6200, 'Lương tháng 2'],
                ['Giải trí', 250, 'Vé xem phim'],
                ['Hóa đơn', 180, 'Hóa đơn nước'],
                ['Ăn uống', 300, 'Tiệc bạn bè'],
                ['Mua sắm', 400, 'Mua quần áo'],
            ],
            3 => [
                ['Thưởng', 1000, 'Thưởng quý 1'],
                ['Di chuyển', 180, 'Xăng xe'],
                ['Hóa đơn', 160, 'Hóa đơn internet'],
                ['Giải trí', 200, 'Mua sách'],
                ['Ăn uống', 250, 'Ăn buffet'],
            ],
            4 => [
                ['Lương', 6300, 'Lương tháng 4'],
                ['Mua sắm', 500, 'Quần áo hè'],
                ['Ăn uống', 300, 'Ăn tối'],
                ['Di chuyển', 150, 'Gửi xe'],
                ['Hóa đơn', 190, 'Hóa đơn điện'],
            ],
            5 => [
                ['Lương', 6500, 'Lương tháng 5'],
                ['Giải trí', 300, 'Vé hòa nhạc'],
                ['Hóa đơn', 200, 'Hóa đơn nước'],
                ['Mua sắm', 450, 'Mua giày'],
                ['Ăn uống', 280, 'Cafe bạn bè'],
            ],
            6 => [
                ['Đầu tư', 800000, 'Lợi nhuận cổ phiếu'],
                ['Di chuyển', 220, 'Sửa xe'],
                ['Ăn uống', 260, 'Ăn trưa nhà hàng'],
                ['Giải trí', 320, 'Netflix 3 tháng'],
                ['Hóa đơn', 210, 'Internet tháng 6'],
            ],
            7 => [
                ['Lương', 6600, 'Lương tháng 7'],
                ['Ăn uống', 270, 'Đi ăn hải sản'],
                ['Di chuyển', 190, 'Grab đi làm'],
                ['Mua sắm', 380, 'Mua balo mới'],
                ['Hóa đơn', 180, 'Hóa đơn điện'],
            ],
            8 => [
                ['Thưởng', 1200, 'Thưởng tháng 8'],
                ['Giải trí', 340, 'Đi xem kịch'],
                ['Ăn uống', 310, 'Trà sữa nhóm bạn'],
                ['Hóa đơn', 170, 'Hóa đơn gas'],
                ['Di chuyển', 200, 'Taxi công tác'],
            ],
            9 => [
                ['Lương', 6700, 'Lương tháng 9'],
                ['Đầu tư', 500000, 'Bán coin lời'],
                ['Ăn uống', 240, 'Bún bò Huế'],
                ['Giải trí', 250, 'Mua sách mới'],
                ['Di chuyển', 210, 'Bảo dưỡng xe'],
            ],
            10 => [
                ['Lương', 6800, 'Lương tháng 10'],
                ['Mua sắm', 600, 'Mua điện thoại'],
                ['Hóa đơn', 220, 'Hóa đơn điện nước'],
                ['Giải trí', 270, 'Tham quan bảo tàng'],
                ['Ăn uống', 290, 'Tiệc sinh nhật'],
            ],
            11 => [
                ['Thưởng', 1500, 'Thưởng tháng 11'],
                ['Di chuyển', 240, 'Đổ xăng'],
                ['Ăn uống', 280, 'Đi ăn BBQ'],
                ['Mua sắm', 320, 'Mua sách tiếng Anh'],
                ['Hóa đơn', 200, 'Tiền mạng'],
            ],
            12 => [
                ['Lương', 7000, 'Lương tháng 12'],
                ['Ăn uống', 350, 'Liên hoan cuối năm'],
                ['Giải trí', 300, 'Xem pháo hoa'],
                ['Di chuyển', 230, 'Grab Tết'],
                ['Hóa đơn', 250, 'Tiền nước cuối năm'],
            ]
        ];

        // Sinh transaction từ dữ liệu trên
        foreach ($monthlyData as $month => $items) {
            foreach ($items as $index => [$catName, $amount, $name]) {
                $transactions[] = [
                    'user_id' => $user->id,
                    'category_id' => $categoryIds[$catName],
                    'amount' => $amount,
                    'name' => $name,
                    'description' => $name,
                    'created_at' => "2025-" . str_pad($month, 2, '0', STR_PAD_LEFT) . "-" . str_pad(1 + $index * 5, 2, '0', STR_PAD_LEFT) . " 10:00:00",
                ];
            }
        }

        Transaction::insert($transactions);

    }
}