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
        $request->validate([
            'username' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
            'role' => 'required|in:user,admin',
        ]);

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'avatar' => 'default.png',
        ]);

        return response()->json([
            'message' => 'Đăng ký thành công!',
            'user' => $user,
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
        $users = User::select('id', 'username', 'email', 'role', 'avatar')->paginate(2);
        $users->getCollection()->transform(function ($user) {
            $user->avatar = $user->avatar ?: 'default.png';
            return $user;
        });
        return response()->json($users);
    }

    // Lấy thông tin một người dùng
    public function getUser($id)
    {
        $user = User::select('id', 'username', 'email', 'role', 'avatar')->findOrFail($id);
        $user->avatar = $user->avatar ?: 'default.png';
        return response()->json($user);
    }

    // Cập nhật người dùng
    public function updateUser(Request $request, $id)
    {
        $request->validate([
            'username' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $id,
            'role' => 'required|in:user,admin',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = User::findOrFail($id);
        $user->username = $request->username;
        $user->email = $request->email;
        $user->role = $request->role;

        if ($request->hasFile('avatar')) {
            if ($user->avatar && $user->avatar !== 'default.png') {
                Storage::disk('public')->delete('avatars/' . $user->avatar);
            }
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = basename($avatarPath);
        }

        $user->save();

        return response()->json([
            'message' => 'Cập nhật người dùng thành công!',
            'user' => $user,
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