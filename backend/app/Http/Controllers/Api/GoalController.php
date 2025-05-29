<?php

namespace App\Http\Controllers\Api;

use App\Models\Goal;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\AuthenticationException;

class GoalController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = Auth::guard('sanctum')->user();
            if (!$user) {
                throw new AuthenticationException('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
            }

            $perPage = 10;
            $goals = Goal::with('category')
                ->where('user_id', $user->id)
                ->paginate($perPage);

            return response()->json($goals);
        } catch (AuthenticationException $e) {
            Log::warning('Phiên đăng nhập không hợp lệ khi lấy danh sách mục tiêu', [
                'user_id' => $user->id ?? 'unknown',
                'error_message' => $e->getMessage(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
            ], 401);
        } catch (\Exception $e) {
            Log::error('Lỗi hệ thống khi lấy danh sách mục tiêu', [
                'user_id' => $user->id ?? 'unknown',
                'error_message' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Có lỗi xảy ra khi lấy danh sách mục tiêu. Vui lòng thử lại sau.',
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $user = Auth::guard('sanctum')->user();
            if (!$user) {
                throw new AuthenticationException('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'target_amount' => 'required|numeric|min:0',
                'current_amount' => 'nullable|numeric|min:0',
                'contribution_period' => 'required|in:daily,weekly,monthly',
                'contribution_type' => 'required|in:fixed,flexible',
                'deadline' => 'nullable|date|after:today',
                'category_id' => 'required|exists:categories,id',
                'note' => 'nullable|string|max:1000',
            ]);

            $validated['user_id'] = $user->id;
            $validated['current_amount'] = $validated['current_amount'] ?? 0;

            $goal = Goal::create($validated);
            return response()->json(['message' => 'Đã thêm mục tiêu!', 'goal' => $goal->load('category')], 201);
        } catch (AuthenticationException $e) {
            Log::warning('Phiên đăng nhập không hợp lệ khi tạo mục tiêu', [
                'user_id' => $user->id ?? 'unknown',
                'error_message' => $e->getMessage(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
            ], 401);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $errors = $e->errors();
            Log::warning('Lỗi xác thực khi tạo mục tiêu', [
                'user_id' => $user->id ?? 'unknown',
                'input_data' => $request->all(),
                'errors' => $errors,
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $errors,
            ], 422);
        } catch (\Exception $e) {
            Log::error('Lỗi hệ thống khi tạo mục tiêu', [
                'user_id' => $user->id ?? 'unknown',
                'input_data' => $request->all(),
                'error_message' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Có lỗi xảy ra khi tạo mục tiêu. Vui lòng thử lại sau.',
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $user = Auth::guard('sanctum')->user();
            if (!$user) {
                throw new AuthenticationException('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'target_amount' => 'required|numeric|min:0',
                'current_amount' => 'nullable|numeric|min:0',
                'contribution_period' => 'required|in:daily,weekly,monthly',
                'contribution_type' => 'required|in:fixed,flexible',
                'deadline' => 'nullable|date|after:today',
                'category_id' => [
                    'required',
                    'exists:categories,id,user_id,' . $user->id,
                ],
                'updated_at' => 'required|date',
                'note' => 'nullable|string|max:1000',
            ]);

            $goal = Goal::where('user_id', $user->id)->findOrFail($id);

            if ($goal->updated_at->toDateTimeString() !== $validated['updated_at']) {
                return response()->json([
                    'message' => 'Hãy tải lại trang để cập nhật.',
                ], 409);
            }

            $validated['current_amount'] = $validated['current_amount'] ?? $goal->current_amount;

            $goal->update($validated);
            return response()->json(['message' => 'Mục tiêu đã được cập nhật!', 'goal' => $goal->load('category')]);
        } catch (AuthenticationException $e) {
            Log::warning('Phiên đăng nhập không hợp lệ khi cập nhật mục tiêu', [
                'user_id' => $user->id ?? 'unknown',
                'goal_id' => $id,
                'error_message' => $e->getMessage(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
            ], 401);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $errors = $e->errors();
            Log::warning('Lỗi xác thực khi cập nhật mục tiêu', [
                'user_id' => $user->id ?? 'unknown',
                'goal_id' => $id,
                'input_data' => $request->all(),
                'errors' => $errors,
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $errors,
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Không tìm thấy mục tiêu để cập nhật', [
                'user_id' => $user->id ?? 'unknown',
                'goal_id' => $id,
                'error_message' => $e->getMessage(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Mục tiêu không tồn tại. Vui lòng tải lại trang.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Lỗi hệ thống khi cập nhật mục tiêu', [
                'user_id' => $user->id ?? 'unknown',
                'goal_id' => $id,
                'input_data' => $request->all(),
                'error_message' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Có lỗi xảy ra khi cập nhật mục tiêu. Vui lòng thử lại sau.',
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $user = Auth::guard('sanctum')->user();
            if (!$user) {
                throw new AuthenticationException('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
            }

            $goal = Goal::where('user_id', $user->id)->findOrFail($id);
            $goal->delete();

            return response()->json(['message' => 'Xóa mục tiêu thành công!']);
        } catch (AuthenticationException $e) {
            Log::warning('Phiên đăng nhập không hợp lệ khi xóa mục tiêu', [
                'user_id' => $user->id ?? 'unknown',
                'goal_id' => $id,
                'error_message' => $e->getMessage(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
            ], 401);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Không thể xóa mục tiêu: ID không tồn tại', [
                'user_id' => $user->id ?? 'unknown',
                'goal_id' => $id,
                'error_message' => $e->getMessage(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Hãy tải lại trang để xóa.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Lỗi hệ thống khi xóa mục tiêu', [
                'user_id' => $user->id ?? 'unknown',
                'goal_id' => $id,
                'error_message' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Có lỗi xảy ra khi xóa mục tiêu. Vui lòng thử lại sau.',
            ], 500);
        }
    }

    public function deleteAll(Request $request)
    {
        try {
            $user = Auth::guard('sanctum')->user();
            if (!$user) {
                throw new AuthenticationException('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
            }

            Goal::where('user_id', $user->id)->delete();
            return response()->json(['message' => 'Xóa tất cả mục tiêu thành công!']);
        } catch (AuthenticationException $e) {
            Log::warning('Phiên đăng nhập không hợp lệ khi xóa tất cả mục tiêu', [
                'user_id' => $user->id ?? 'unknown',
                'error_message' => $e->getMessage(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
            ], 401);
        } catch (\Exception $e) {
            Log::error('Lỗi hệ thống khi xóa tất cả mục tiêu', [
                'user_id' => $user->id ?? 'unknown',
                'error_message' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'message' => 'Có lỗi xảy ra khi xóa tất cả mục tiêu. Vui lòng thử lại sau.',
            ], 500);
        }
    }
}