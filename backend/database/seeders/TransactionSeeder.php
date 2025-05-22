<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\User;
use Carbon\Carbon;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        Transaction::truncate(); // Xóa dữ liệu cũ

        $users = User::all(); // Lấy 10 người dùng
        $monthlyData = [
            1 => [
                ['Lương', 6000000, 'Lương tháng 1'],
                ['Ăn uống', 200000, 'Ăn trưa'],
                ['Trọ', 2000000, 'Tiền thuê nhà'],
                ['Di chuyển', 100000, 'Xăng xe'],
                ['Giải trí', 180000, 'Vé xem phim'],
            ],
            2 => [
                ['Lương', 6200000, 'Lương tháng 2'],
                ['Mua sắm', 400000, 'Mua quần áo'],
                ['Ăn uống', 300000, 'Tiệc bạn bè'],
                ['Bảo hiểm', 300000, 'Bảo hiểm y tế'],
                ['Di chuyển', 150000, 'Gửi xe'],
            ],
            3 => [
                ['Thưởng', 1000000, 'Thưởng quý 1'],
                ['Ăn uống', 250000, 'Ăn buffet'],
                ['Trọ', 2000000, 'Tiền thuê nhà'],
                ['Giải trí', 200000, 'Mua sách'],
                ['Di chuyển', 180000, 'Xăng xe'],
            ],
            4 => [
                ['Lương', 6300000, 'Lương tháng 4'],
                ['Mua sắm', 500000, 'Quần áo hè'],
                ['Ăn uống', 300000, 'Ăn tối'],
                ['Bảo hiểm', 300000, 'Bảo hiểm xe'],
                ['Di chuyển', 150000, 'Gửi xe'],
            ],
            5 => [
                ['Lương', 6500000, 'Lương tháng 5'],
                ['Giải trí', 300000, 'Vé hòa nhạc'],
                ['Trọ', 2000000, 'Tiền thuê nhà'],
                ['Mua sắm', 450000, 'Mua giày'],
                ['Ăn uống', 280000, 'Cafe bạn bè'],
            ],
            6 => [
                ['Thu nhập khác', 800000, 'Thu nhập phụ'],
                ['Ăn uống', 260000, 'Ăn trưa nhà hàng'],
                ['Di chuyển', 220000, 'Sửa xe'],
                ['Giải trí', 320000, 'Netflix 3 tháng'],
                ['Bảo hiểm', 300000, 'Bảo hiểm sức khỏe'],
            ],
        ];

        foreach ($users as $user) {
            $categories = Category::where('user_id', $user->id)->get()->keyBy('name');
            $transactions = [];

            foreach ($monthlyData as $month => $items) {
                foreach ($items as $index => [$catName, $amount, $description]) {
                    $transactions[] = [
                        'user_id' => $user->id,
                        'category_id' => $categories[$catName]->id,
                        'name' => $catName,
                        'amount' => $amount,
                        'description' => $description,
                        'created_at' => Carbon::create(2025, $month, 1 + $index * 5, 10, 0, 0),
                        'updated_at' => now(),
                    ];
                }
            }

            Transaction::insert($transactions);
        }
    }
}