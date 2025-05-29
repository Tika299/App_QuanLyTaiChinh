<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Models\Role;
use Illuminate\Auth\AuthenticationException;

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

            $user = User::create([
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'avatar' => 'default.png',
            ]);

            $role = Role::where('name', $request->role)->first();
            if ($role) {
                $user->roles()->attach($role->id);
            } else {
                throw new \Exception('Vai trò không hợp lệ trong cơ sở dữ liệu.');
            }

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

            Log::warning('Lỗi xác thực khi đăng ký', [
                'input_data' => $request->all(),
                'errors' => $translated,
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $translated,
            ], 422);
        } catch (\Exception $e) {
            Log::error('Lỗi hệ thống khi đăng ký', [
                'input_data' => $request->all(),
                'error_message' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.',
            ], 500);
        }
    }

    // Đăng nhập
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                throw new ValidationException('Thông tin đăng nhập không chính xác.');
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Đăng nhập thành công!',
                'user' => $user,
                'token' => $token,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Lỗi xác thực khi đăng nhập', [
                'input_data' => $request->all(),
                'error_message' => $e->getMessage(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => $e->getMessage() ?: 'Email hoặc mật khẩu không đúng.',
            ], 422);
        } catch (\Exception $e) {
            Log::error('Lỗi hệ thống khi đăng nhập', [
                'input_data' => $request->all(),
                'error_message' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.',
            ], 500);
        }
    }

    // Đăng xuất
    public function logout(Request $request)
    {
        try {
            // Xóa tất cả token của người dùng, không chỉ token hiện tại
            $request->user()->tokens()->delete();
            return response()->json(['message' => 'Đăng xuất thành công!']);
        } catch (\Exception $e) {
            Log::error('Lỗi hệ thống khi đăng xuất', [
                'user_id' => $request->user()->id ?? 'unknown',
                'error_message' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.',
            ], 500);
        }
    }




    // Lấy danh sách người dùng
    public function getUsers(Request $request)
    {
        try {
            $users = User::with('roles:id,name')
                ->select('id', 'username', 'email', 'phone', 'city', 'bio', 'avatar', 'updated_at')
                ->paginate(2);

            $users->getCollection()->transform(function ($user) {
                $user->avatar = $user->avatar ?: 'default.png';
                return $user;
            });

            return response()->json($users);
        } catch (\Exception $e) {
            Log::error('Lỗi hệ thống khi lấy danh sách người dùng', [
                'error_message' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Có lỗi xảy ra khi lấy danh sách người dùng.',
            ], 500);
        }
    }

    // Lấy thông tin một người dùng
    public function getUser($id)
    {
        try {
            $user = User::with('roles:id,name')
                ->select('id', 'username', 'email', 'phone', 'city', 'bio', 'avatar', 'updated_at')
                ->findOrFail($id);

            $user->avatar = $user->avatar ?: 'default.png';

            return response()->json($user);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Không tìm thấy người dùng', [
                'user_id' => $id,
                'error_message' => $e->getMessage(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Người dùng không tồn tại. Vui lòng kiểm tra lại.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Lỗi hệ thống khi lấy thông tin người dùng', [
                'user_id' => $id,
                'error_message' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Có lỗi xảy ra khi lấy thông tin người dùng.',
            ], 500);
        }
    }



    // Cập nhật người dùng

    public function updateUser(Request $request, $id)
    {
        try {
            $currentUser = Auth::guard('sanctum')->user();
            if (!$currentUser) {
                throw new AuthenticationException('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
            }

            $isAdmin = $currentUser->roles()->where('name', 'admin')->exists();
            if (!$isAdmin && $currentUser->id != $id) {
                return response()->json([
                    'message' => 'Bạn không có quyền cập nhật thông tin của người dùng này.',
                ], 403);
            }

            $request->validate([
                'username' => 'required|string|max:50|unique:users,username,' . $id,
                'email' => 'required|email|max:100|unique:users,email,' . $id,
                'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'password' => 'nullable|string|min:6|confirmed',
                'phone' => 'nullable|string|max:20',
                'city' => 'nullable|string|max:255',
                'bio' => 'nullable|string|max:1000',
                'reset_avatar' => 'nullable|in:0,1',
                'updated_at' => 'nullable|date',
            ]);

            $user = User::findOrFail($id);

            // Log dữ liệu nhận được để debug
            Log::info('Received update request', [
                'user_id' => $id,
                'request_data' => $request->all(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            // Kiểm tra xem có thay đổi dữ liệu chính không
            $originalData = $user->only(['username', 'email', 'phone', 'city', 'bio']);
            $newData = [
                'username' => $request->username,
                'email' => $request->email,
                'phone' => $request->phone,
                'city' => $request->city,
                'bio' => $request->bio,
            ];

            $hasMainDataChanges = false;
            foreach ($newData as $key => $value) {
                if ($value !== $originalData[$key]) {
                    $hasMainDataChanges = true;
                    break;
                }
            }

            // Tạm thời bỏ kiểm tra xung đột updated_at để debug
            /*
            $requestUpdatedAt = $request->input('updated_at');
            if ($hasMainDataChanges && $requestUpdatedAt && $user->updated_at && $requestUpdatedAt !== $user->updated_at->toDateTimeString()) {
                return response()->json([
                    'message' => 'Dữ liệu đã thay đổi. Vui lòng tải lại trang trước khi cập nhật.',
                ], 409);
            }
            */

            // Kiểm tra xem có bất kỳ thay đổi nào không
            $hasChanges = $hasMainDataChanges;
            if ($request->filled('password') || $request->hasFile('avatar') || $request->input('reset_avatar') === '1') {
                $hasChanges = true;
            }

            if (!$hasChanges) {
                return response()->json([
                    'message' => 'Không có thay đổi nào để cập nhật.',
                ], 400);
            }

            $updateData = $newData;

            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            if ($request->input('reset_avatar') === '1') {
                if ($user->avatar && $user->avatar !== 'default.png') {
                    if (Storage::disk('public')->exists('avatars/' . $user->avatar)) {
                        Storage::disk('public')->delete('avatars/' . $user->avatar);
                    }
                    $updateData['avatar'] = null;
                }
            } elseif ($request->hasFile('avatar')) {
                if ($user->avatar && $user->avatar !== 'default.png') {
                    if (Storage::disk('public')->exists('avatars/' . $user->avatar)) {
                        Storage::disk('public')->delete('avatars/' . $user->avatar);
                    }
                }
                $file = $request->file('avatar');
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $file->storeAs('avatars', $filename, 'public');
                $updateData['avatar'] = $filename;
            }

            // Cập nhật thủ công updated_at để đảm bảo
            $updateData['updated_at'] = now();

            $user->update($updateData);

            if ($request->has('role')) {
                if (!$isAdmin) {
                    return response()->json([
                        'message' => 'Bạn không có quyền thay đổi vai trò.',
                    ], 403);
                }

                $role = Role::where('name', $request->role)->first();
                if ($role) {
                    $user->roles()->sync([$role->id]);
                } else {
                    throw new \Exception('Vai trò không hợp lệ trong cơ sở dữ liệu.');
                }
            }

            return response()->json([
                'message' => 'Cập nhật người dùng thành công!',
                'user' => $user->load('roles'),
            ]);
        } catch (AuthenticationException $e) {
            Log::warning('Phiên đăng nhập không hợp lệ khi cập nhật người dùng', [
                'user_id' => $id,
                'error_message' => $e->getMessage(),
                'token' => $request->bearerToken(),
                'timestamp' => now()->toDateTimeString(),
            ]);
            return response()->json([
                'message' => 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
            ], 401);
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

            Log::warning('Lỗi xác thực khi cập nhật người dùng', [
                'user_id' => $id,
                'input_data' => $request->all(),
                'errors' => $translated,
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $translated,
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Không tìm thấy người dùng để cập nhật', [
                'user_id' => $id,
                'error_message' => $e->getMessage(),
                'timestamp' => now()->toDateTimeString(),
            ]);
            return response()->json([
                'message' => 'Người dùng không tồn tại. Vui lòng tải lại trang.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Lỗi hệ thống khi cập nhật người dùng', [
                'user_id' => $id,
                'input_data' => $request->all(),
                'error_message' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
                'timestamp' => now()->toDateTimeString(),
            ]);
            return response()->json([
                'message' => 'Có lỗi xảy ra khi cập nhật. Vui lòng thử lại sau.',
            ], 500);
        }
    }

    // Xóa người dùng
    public function deleteUser($id)
    {
        try {
            $user = User::findOrFail($id);

            if ($user->avatar && $user->avatar !== 'default.png') {
                if (Storage::disk('public')->exists('avatars/' . $user->avatar)) {
                    Storage::disk('public')->delete('avatars/' . $user->avatar);
                }
            }

            $user->delete();

            return response()->json(['message' => 'Xóa người dùng thành công!']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Không thể xóa người dùng: ID không tồn tại', [
                'user_id' => $id,
                'error_message' => $e->getMessage(),
                'timestamp' => now()->toDateTimeString(),
            ]);
            return response()->json([
                'message' => 'Hãy tải lại trang để xóa.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Lỗi hệ thống khi xóa người dùng', [
                'user_id' => $id,
                'error_message' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
                'timestamp' => now()->toDateTimeString(),
            ]);
            return response()->json([
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage(),
            ], 500);
        }
    }
}