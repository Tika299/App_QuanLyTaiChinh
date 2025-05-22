<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaction;
use App\Models\Category;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $userId = 1; // Giả định user_id = 1 từ UserSeeder

        // Lấy danh mục để liên kết
        $categories = Category::where('user_id', $userId)->get()->keyBy('name');

        $transactions = [
            // Giao dịch thu nhập
            [
                'user_id' => $userId,
                'category_id' => $categories['Lương']->id,
                'name' => 'Lương tháng 5',
                'amount' => 15000000,
                'description' => 'Lương tháng 5/2025',
                'created_at' => '2025-05-01 08:00:00',
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'category_id' => $categories['Thưởng']->id,
                'name' => 'Thưởng dự án',
                'amount' => 5000000,
                'description' => 'Thưởng hoàn thành dự án sớm',
                'created_at' => '2025-05-03 09:00:00',
                'updated_at' => now(),
            ],
            // Giao dịch chi tiêu
            [
                'user_id' => $userId,
                'category_id' => $categories['Ăn uống']->id,
                'name' => 'Mua thực phẩm',
                'amount' => 500000,
                'description' => 'Mua đồ ăn cho tuần',
                'created_at' => '2025-05-02 12:00:00',
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'category_id' => $categories['Mua sắm']->id,
                'name' => 'Mua quần áo',
                'amount' => 1200000,
                'description' => 'Mua quần áo mùa hè',
                'created_at' => '2025-05-04 15:00:00',
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'category_id' => $categories['Bảo hiểm']->id,
                'name' => 'Phí bảo hiểm y tế',
                'amount' => 800000,
                'description' => 'Thanh toán bảo hiểm y tế hàng năm',
                'created_at' => '2025-05-05 10:00:00',
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'category_id' => $categories['Trọ']->id,
                'name' => 'Tiền thuê nhà',
                'amount' => 4000000,
                'description' => 'Tiền thuê nhà tháng 5',
                'created_at' => '2025-05-01 09:00:00',
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'category_id' => $categories['Di chuyển']->id,
                'name' => 'Đổ xăng xe',
                'amount' => 200000,
                'description' => 'Đổ xăng cho xe máy',
                'created_at' => '2025-05-06 08:00:00',
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'category_id' => $categories['Giải trí']->id,
                'name' => 'Xem phim',
                'amount' => 150000,
                'description' => 'Vé xem phim cuối tuần',
                'created_at' => '2025-05-07 18:00:00',
                'updated_at' => now(),
            ],
        ];

        Transaction::insert($transactions);
    }
}