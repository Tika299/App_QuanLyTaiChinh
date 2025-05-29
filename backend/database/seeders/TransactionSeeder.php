<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Transaction::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $users = User::all();

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
                ['Lương', 6000000, 'Lương tháng 1'],
                ['Ăn uống', 200000, 'Ăn trưa'],
                ['Trọ', 2000000, 'Tiền thuê nhà'],
                ['Di chuyển', 100000, 'Xăng xe'],
                ['Giải trí', 180000, 'Vé xem phim'],
            ],
            5 => [
                ['Lương', 6200000, 'Lương tháng 2'],
                ['Mua sắm', 400000, 'Mua quần áo'],
                ['Ăn uống', 300000, 'Tiệc bạn bè'],
                ['Bảo hiểm', 300000, 'Bảo hiểm y tế'],
                ['Di chuyển', 150000, 'Gửi xe'],
            ],
            6 => [
                ['Thưởng', 1000000, 'Thưởng quý 1'],
                ['Ăn uống', 250000, 'Ăn buffet'],
                ['Trọ', 2000000, 'Tiền thuê nhà'],
                ['Giải trí', 200000, 'Mua sách'],
                ['Di chuyển', 180000, 'Xăng xe'],
            ],
        ];

        $monthlyData2024 = [
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
        ];

        foreach ($users as $user) {
            $categories = Category::where('user_id', $user->id)->get()->keyBy('name');
            $transactions = [];

            foreach ($monthlyData as $month => $items) {
                foreach ($items as $index => [$catName, $amount, $description]) {
                    if (!isset($categories[$catName])) {
                        continue;
                    }

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
            
            foreach ($monthlyData2024 as $month => $items) {
                foreach ($items as $index => [$catName, $amount, $description]) {
                    if (!isset($categories[$catName])) {
                        continue;
                    }

                    $transactions[] = [
                        'user_id' => $user->id,
                        'category_id' => $categories[$catName]->id,
                        'name' => $catName,
                        'amount' => $amount,
                        'description' => $description,
                        'created_at' => Carbon::create(2024, $month, 1 + $index * 5, 10, 0, 0),
                        'updated_at' => now(),
                    ];
                }
            }

            if (!empty($transactions)) {
                Transaction::insert($transactions);
            }
        }
    }
}
