<?php

namespace App\Http\Controllers\Api;

use App\Models\Goal;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;

class GoalController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $perPage = 10;
            $goals = Goal::with('category')
                ->where('user_id', $user->id)
                ->paginate($perPage);

            return response()->json($goals);
        } catch (\Exception $e) {
            Log::error('Fetch goals error: ' . $e->getMessage());
            return response()->json(['error' => 'Có lỗi xảy ra khi lấy danh sách mục tiêu.'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $user = $request->user();
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'target_amount' => 'required|numeric|min:0',
                'current_amount' => 'nullable|numeric|min:0',
                'contribution_period' => 'required|in:daily,weekly,monthly',
                'contribution_type' => 'required|in:fixed,flexible',
                'deadline' => 'nullable|date|after:today',
               'category_id' => 'required|exists:categories,id',
            ]);

            $validated['user_id'] = $user->id;
            $validated['current_amount'] = $validated['current_amount'] ?? 0;

            $goal = Goal::create($validated);
            return response()->json(['message' => 'Đã thêm mục tiêu!', 'goal' => $goal->load('category')], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error: ' . json_encode($e->errors()));
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Store error: ' . $e->getMessage(), ['exception' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Có lỗi xảy ra: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $user = $request->user();
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'target_amount' => 'required|numeric|min:0',
                'current_amount' => 'nullable|numeric|min:0',
                'contribution_period' => 'required|in:daily,weekly,monthly',
                'contribution_type' => 'required|in:fixed,flexible',
                'deadline' => 'nullable|date|after:today',
               'category_id' => 'required|exists:categories,id',
            ]);

            $goal = Goal::where('user_id', $user->id)->findOrFail($id);

            $validated['current_amount'] = $validated['current_amount'] ?? $goal->current_amount;

            $goal->update($validated);
            return response()->json(['message' => 'Mục tiêu đã được cập nhật!', 'goal' => $goal->load('category')]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error: ' . json_encode($e->errors()));
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Update error: ' . $e->getMessage());
            return response()->json(['error' => 'Có lỗi xảy ra: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $user = request()->user();
            $goal = Goal::where('user_id', $user->id)->findOrFail($id);
            $goal->delete();
            return response()->json(['message' => 'Mục tiêu đã được xóa!']);
        } catch (\Exception $e) {
            Log::error('Destroy error: ' . $e->getMessage());
            return response()->json(['error' => 'Có lỗi xảy ra: ' . $e->getMessage()], 500);
        }
    }

    public function deleteAll(Request $request)
    {
        try {
            $user = $request->user();
            Goal::where('user_id', $user->id)->delete();
            return response()->json(['message' => 'Đã xóa tất cả mục tiêu!']);
        } catch (\Exception $e) {
            Log::error('Delete all error: ' . $e->getMessage());
            return response()->json(['error' => 'Có lỗi xảy ra: ' . $e->getMessage()], 500);
        }
    }
}