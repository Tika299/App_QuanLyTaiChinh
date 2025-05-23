<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Category; // Thêm model Category
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

        // Tạo danh mục mặc định cho người dùng mới
        $defaultCategories = [
            ['name' => 'Lương', 'type' => 'income', 'color' => '#10B981'],
            ['name' => 'Thưởng', 'type' => 'income', 'color' => '#3B82F6'],
            ['name' => 'Thu nhập khác', 'type' => 'income', 'color' => '#F59E0B'],
            ['name' => 'Ăn uống', 'type' => 'expense', 'color' => '#EF4444'],
            ['name' => 'Mua sắm', 'type' => 'expense', 'color' => '#F59E0B'],
        ];

        foreach ($defaultCategories as $category) {
            Category::create([
                'user_id' => $user->id,
                'name' => $category['name'],
                'type' => $category['type'],
                'color' => $category['color'],
            ]);
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
        try {
            $request->validate([
                'username' => 'required|string|max:50|unique:users,username,' . $id,
                'email' => 'required|email|max:100|unique:users,email,' . $id,
                'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'password' => 'nullable|string|min:6|confirmed',
                'phone' => 'nullable|string|max:20',
                'city' => 'nullable|string|max:255',
                'bio' => 'nullable|string|max:1000',
            ]);

            $user = User::findOrFail($id);
            $currentUser = Auth::guard('sanctum')->user();

            // Cập nhật thông tin cá nhân
            $user->username = $request->username;
            $user->email = $request->email;
            $user->phone = $request->phone;
            $user->city = $request->city;
            $user->bio = $request->bio;

            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
            }

            if ($request->hasFile('avatar')) {
                if ($user->avatar && $user->avatar !== 'default.png') {
                    Storage::disk('public')->delete('avatars/' . $user->avatar);
                }
                $file = $request->file('avatar');
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $file->storeAs('avatars', $filename, 'public');
                $user->avatar = $filename;
            }

            $user->save();

            // Chỉ admin được sửa role
            if ($request->has('role')) {
                $userRole = $currentUser->roles()->where('name', 'admin')->first();
                if (!$userRole) {
                    return response()->json([
                        'message' => 'Bạn không có quyền thay đổi vai trò.',
                    ], 403);
                }

                $role = Role::where('name', $request->role)->first();
                if ($role) {
                    $user->roles()->sync([$role->id]);
                } else {
                    return response()->json([
                        'message' => 'Vai trò không hợp lệ.',
                    ], 400);
                }
            }

            return response()->json([
                'message' => 'Cập nhật người dùng thành công!',
                'user' => $user->load('roles'),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $errors = $e->errors();
            $translated = [];

            foreach ($errors as $field => $messages) {
                $translated[$field] = array_map(function ($msg) {
                    return match (true) {
                        str_contains($msg, 'The username has already been taken') => 'Tên người dùng đã tồn tại.',
                        str_contains($msg, 'The email has already been taken') => 'Email đã được đăng ký.',
                        str_contains($msg, 'The username field is required') => 'Tên người dùng là bắt buộc.',
                        str_contains($msg, 'The email field is required') => 'Email là bắt buộc.',
                        str_contains($msg, 'The email must be a valid email address') => 'Email không hợp lệ.',
                        default => $msg,
                    };
                }, $messages);
            }

            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $translated
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage(),
            ], 500);
        }
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