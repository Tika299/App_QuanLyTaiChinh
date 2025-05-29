<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    const MAX_RECORDS = 1000; // 1 admin + 9 user

    public function run(): void
    {
        // Xóa toàn bộ dữ liệu bảng users
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        User::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Tạo tài khoản admin
        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'email' => 'admin@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('123456'),
                'remember_token' => Str::random(10),
                'avatar' => 'default.png',
                'balance' => 1000000,
            ]
        );

        // Tạo 9 user ngẫu nhiên
        for ($i = 2; $i <= self::MAX_RECORDS; $i++) {
            User::updateOrCreate(
                ['username' => 'user' . $i],
                [
                    'email' => "user{$i}@gmail.com",
                    'email_verified_at' => now(),
                    'password' => Hash::make('123456'),
                    'remember_token' => Str::random(10),
                    'avatar' => 'default.png',
                    'balance' => rand(100000, 1000000),
                ]
            );
        }
    }
}
