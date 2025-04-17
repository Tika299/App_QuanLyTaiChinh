<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use App\Models\Category;
use Illuminate\Http\Request;

class GoalController extends Controller
{
    // Hiển thị tất cả mục tiêu và danh mục
    public function index()
    {
        // Lấy tất cả các mục tiêu và danh mục
        $goals = Goal::all();
        $categories = Category::all();

        // Trả về view 'exe.manage' với dữ liệu goals và categories
        return view('exe.manage', compact('goals', 'categories'));
    }


    // Hiển thị form thêm mục tiêu
    public function create()
    {
        $categories = Category::all();
        return view('goals.create', compact('categories'));
    }
    public function createGoal()
{
    // Kiểm tra xem danh mục đã tồn tại chưa, nếu chưa thì thêm
    $category = Category::firstOrCreate([
        'name' => 'Tiết Kiệm',
    ]);

    // Tạo mục tiêu và gắn danh mục vào mục tiêu
    Goal::create([
        'name' => 'Mục tiêu tiết kiệm',
        'type' => 'income',
        'category_id' => $category->id,
        'target_amount' => 10000,
        'due_date' => '2025-12-31',
        'note' => 'Lập kế hoạch tiết kiệm',
    ]);

    // Redirect sang trang danh sách mục tiêu
    return redirect()->route('goals.index')->with('success', 'Mục tiêu đã được tạo thành công!');
}

    // Lưu mục tiêu mới
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'type' => 'required|in:income,expense',
            'category_id' => 'nullable|exists:categories,id',
            'target_amount' => 'required|numeric',
            'due_date' => 'required|date',
            'note' => 'nullable|string',
        ]);

        Goal::create([
            'name' => $request->input('name'),
            'type' => $request->input('type'),
            'category_id' => $request->input('category_id'),
            'target_amount' => $request->input('target_amount'),
            'due_date' => $request->input('due_date'),
            'note' => $request->input('note'),
        ]);

        return redirect()->route('goals.index')->with('success', 'Đã thêm mục tiêu!');
    }

    // Cập nhật mục tiêu
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
            'category_id' => 'required|exists:categories,id',
            'target_amount' => 'required|numeric|min:0',
            'due_date' => 'required|date|after:today',
            'note' => 'nullable|string',
        ]);

        // Lấy mục tiêu cần sửa từ ID
        $goal = Goal::findOrFail($id);
        $goal->update([
            'name' => $request->name,
            'type' => $request->type,
            'category_id' => $request->category_id,
            'target_amount' => $request->target_amount,
            'due_date' => $request->due_date,
            'note' => $request->note,
        ]);

        return redirect()->route('goals.index')->with('success', 'Mục tiêu đã được cập nhật!');
    }


    // Xóa mục tiêu
    public function destroy($id)
    {
        $goal = Goal::findOrFail($id);
        $goal->delete();

        return redirect()->route('goals.index')->with('success', 'Mục tiêu đã được xóa!');
    }
}
