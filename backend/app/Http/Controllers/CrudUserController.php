<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class CrudUserController extends Controller
{
     // Đăng ký người dùng
    public function signup(Request $request)
    {
        try {
            $request->validate([
                'username' => 'required|string|max:50|unique:users',
                'email' => 'required|email|max:100|unique:users',
                'password' => 'required|string|min:6|max:100|confirmed',
                'role' => 'required|exists:roles,name',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $errors = $e->errors();
            $translated = [];

            foreach ($errors as $field => $messages) {
                $translated[$field] = array_map(function ($msg) {
                    return match (true) {
                        str_contains($msg, 'The username has already been taken') => 'Tên người dùng đã tồn tại.',
                        str_contains($msg, 'The email has already been taken') => 'Email đã được đăng ký.',
                        str_contains($msg, 'The password confirmation does not match') => 'Xác nhận mật khẩu không khớp.',
                        str_contains($msg, 'The password must be at least') => 'Mật khẩu phải có ít nhất 6 ký tự.',
                        default => $msg,
                    };
                }, $messages);
            }

            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $translated
            ], 422);
        }

        // Tạo người dùng
        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'avatar' => 'default.png',
        ]);

        // Gán vai trò
        $role = Role::where('name', $request->role)->first();
        if ($role) {
            $user->roles()->attach($role->id);
        }

        return response()->json([
            'message' => 'Đăng ký thành công!',
            'user' => $user->load('roles'),
        ], 201);
    }

   

   
}