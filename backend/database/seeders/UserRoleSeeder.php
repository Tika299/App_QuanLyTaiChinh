<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserRoleSeeder extends Seeder
{
    const MAX_RECORDS = 10; // 1 admin + 9 user

    public function run(): void
    {
        // Xóa bảng user_role trước khi gán lại
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('user_role')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Gán role admin cho user_id = 1
        DB::table('user_role')->insert([
            [
                'user_id' => 1,
                'role_id' => 1, // Admin
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // Gán role member cho user từ id 2 đến 10
        for ($i = 2; $i <= self::MAX_RECORDS; $i++) {
            DB::table('user_role')->insert([
                [
                    'user_id' => $i,
                    'role_id' => 2, // Member
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }
    }
}