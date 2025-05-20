<?php
namespace App\Http\Controllers;
use App\Models\Goal;
use App\Models\Category;
use Illuminate\Http\Request;

class GoalController extends Controller
{
    public function index(Request $request)
    {
        $goals = Goal::with('category')->paginate(10);
        return response()->json($goals);
    }

    public function store(Request $request)
{
    try {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'target_amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'note' => 'nullable|string',
        ]);

        $goal = Goal::create($validated);
        return response()->json(['message' => 'Đã thêm mục tiêu!', 'goal' => $goal], 201);
    } catch (\Illuminate\Validation\ValidationException $e) {
        \Log::error('Validation error: ' . json_encode($e->errors()));
        return response()->json(['errors' => $e->errors()], 422);
    } catch (\Exception $e) {
        \Log::error('Store error: ' . $e->getMessage());
        return response()->json(['error' => 'Có lỗi xảy ra: ' . $e->getMessage()], 500);
    }
}

    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'category_id' => 'required|exists:categories,id',
                'target_amount' => 'required|numeric|min:0',
                'due_date' => 'required|date',
                'note' => 'nullable|string',
            ]);

            $goal = Goal::findOrFail($id);
            $goal->update($validated);
            return response()->json(['message' => 'Mục tiêu đã được cập nhật!', 'goal' => $goal]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error: ' . json_encode($e->errors()));
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Update error: ' . $e->getMessage());
            return response()->json(['error' => 'Có lỗi xảy ra: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $goal = Goal::findOrFail($id);
            $goal->delete();
            return response()->json(['message' => 'Mục tiêu đã được xóa!']);
        } catch (\Exception $e) {
            \Log::error('Destroy error: ' . $e->getMessage());
            return response()->json(['error' => 'Có lỗi xảy ra: ' . $e->getMessage()], 500);
        }
    }

    public function deleteAll(Request $request)
    {
        try {
            Goal::truncate();
            return response()->json(['message' => 'Đã xóa tất cả mục tiêu!']);
        } catch (\Exception $e) {
            \Log::error('Delete all error: ' . $e->getMessage());
            return response()->json(['error' => 'Có lỗi xảy ra: ' . $e->getMessage()], 500);
        }
    }
}