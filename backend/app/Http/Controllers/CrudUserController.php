<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use App\Models\Role;

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


    // Đăng nhập
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email hoặc mật khẩu không đúng.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công!',
            'user' => $user,
            'token' => $token,
        ]);
    }

    // Đăng xuất
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Đăng xuất thành công!']);
    }

    // Lấy danh sách người dùng
    public function getUsers(Request $request)
    {
        $users = User::with('roles:id,name')
            ->select('id', 'username', 'email', 'avatar')
            ->paginate(2);

        $users->getCollection()->transform(function ($user) {
            $user->avatar = $user->avatar ?: 'default.png';
            return $user;
        });

        return response()->json($users);
    }



    // Lấy thông tin một người dùng
    public function getUser($id)
    {
        $user = User::with('roles:id,name')
            ->select('id', 'username', 'email', 'avatar')
            ->findOrFail($id);

        $user->avatar = $user->avatar ?: 'default.png';

        return response()->json($user);
    }

    public function updateUser(Request $request, $id)
    {
        $request->validate([
            'username' => 'required|string|max:50|unique:users,username,' . $id,
            'email' => 'required|email|max:100|unique:users,email,' . $id,
            'role' => 'required|exists:roles,name',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'password' => 'nullable|string|min:6|confirmed',
        ]);

        $user = User::findOrFail($id);

        $user->username = $request->username;
        $user->email = $request->email;

        // Nếu có mật khẩu mới
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        // Nếu có ảnh avatar mới
        if ($request->hasFile('avatar')) {
            // Xoá ảnh cũ (nếu không phải default)
            if ($user->avatar && $user->avatar !== 'default.png') {
                Storage::disk('public')->delete('avatars/' . $user->avatar);
            }

            // Tạo tên file ảnh mới để tránh cache
            $file = $request->file('avatar');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

            // Lưu ảnh vào thư mục public/avatars
            $file->storeAs('avatars', $filename, 'public');

            // Gán tên ảnh mới vào user
            $user->avatar = $filename;
        }

        $user->save();

        // Cập nhật quyền (role)
        $role = Role::where('name', $request->role)->first();
        if ($role) {
            $user->roles()->sync([$role->id]);
        }

        return response()->json([
            'message' => 'Cập nhật người dùng thành công!',
            'user' => $user->load('roles'),
        ]);
    }




    // Xóa người dùng
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);

        if ($user->avatar && $user->avatar !== 'default.png') {
            Storage::disk('public')->delete('avatars/' . $user->avatar);
        }

        $user->delete();

        return response()->json(['message' => 'Xóa người dùng thành công!']);
    }
}