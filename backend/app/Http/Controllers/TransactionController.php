<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $userId = auth()->id();
            if (!$userId) {
                return response()->json(['error' => 'Không tìm thấy người dùng hiện tại.'], 401);
            }

            $locDanhMuc = $request->query('danhMuc', 'Tất cả');
            $locNgay = $request->query('ngay', '');

            $query = Transaction::where('user_id', $userId)->with('category');

            if ($locDanhMuc !== 'Tất cả') {
                $query->whereHas('category', function ($q) use ($locDanhMuc) {
                    $q->where('type', $locDanhMuc === 'Thu nhập' ? 'income' : 'expense');
                });
            }

            if ($locNgay) {
                $query->whereDate('created_at', $locNgay);
            }

            $transactions = $query->get()->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'ten' => $transaction->name,
                    'soTien' => $transaction->amount,
                    'category_id' => $transaction->category->id,
                    'category_name' => $transaction->category->name,
                    'category_color' => $transaction->category->color,
                    'danhMuc' => $transaction->category->type === 'income' ? 'Thu nhập' : 'Chi tiêu',
                    'ngay' => $transaction->created_at->format('Y-m-d'),
                    'moTa' => $transaction->description,
                ];
            });

            return response()->json($transactions);
        } catch (\Exception $e) {
            Log::error('Lỗi trong index: ' . $e->getMessage());
            return response()->json(['error' => 'Lỗi server: ' . $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'ten' => 'required|string|max:50',
                'soTien' => [
                    'required',
                    'numeric',
                    'gt:0',
                    'max:99999999.99', // Giới hạn tối đa 99,999,999.99
                ],
                'category_id' => ['required', 'exists:categories,id,user_id,' . auth()->id()],
                'ngay' => 'required|date|before_or_equal:today',
                'moTa' => 'nullable|string',
            ], [
                'soTien.max' => 'Vui lòng nhập lại, đã vượt quá số 0 tối thiểu 8 chữ số.',
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()->first()], 422);
            }

            $userId = auth()->id();
            if (!$userId) {
                return response()->json(['error' => 'Không tìm thấy người dùng hiện tại.'], 401);
            }

            $category = Category::where('user_id', $userId)
                ->findOrFail($request->category_id);

            $ten = strtolower($request->ten);
            if (
                (str_contains($ten, 'thu') && $category->type === 'expense') ||
                (str_contains($ten, 'chi') && $category->type === 'income')
            ) {
                return response()->json(['error' => 'Loại giao dịch không phù hợp với tên'], 422);
            }

            $transaction = Transaction::create([
                'user_id' => $userId,
                'category_id' => $category->id,
                'name' => $request->ten,
                'amount' => $request->soTien,
                'description' => $request->moTa,
                'created_at' => $request->ngay,
            ]);

            return response()->json([
                'id' => $transaction->id,
                'ten' => $transaction->name,
                'soTien' => $transaction->amount,
                'category_id' => $category->id,
                'category_name' => $category->name,
                'danhMuc' => $category->type === 'income' ? 'Thu nhập' : 'Chi tiêu',
                'ngay' => $transaction->created_at->format('Y-m-d'),
                'moTa' => $transaction->description,
            ], 201);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Danh mục không tồn tại: ' . $e->getMessage());
            return response()->json(['error' => 'Danh mục không tồn tại hoặc không thuộc về người dùng.'], 422);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '22003') {
                Log::error('Số tiền vượt quá giới hạn: ' . $e->getMessage());
                return response()->json(['error' => 'Vui lòng nhập lại, đã vượt quá số 0 tối thiểu 8 chữ số.'], 422);
            }
            Log::error('Lỗi trong store: ' . $e->getMessage());
            return response()->json(['error' => 'Lỗi server: ' . $e->getMessage()], 500);
        } catch (\Exception $e) {
            Log::error('Lỗi trong store: ' . $e->getMessage());
            return response()->json(['error' => 'Lỗi server: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $userId = auth()->id();
            if (!$userId) {
                return response()->json(['error' => 'Không tìm thấy người dùng hiện tại.'], 401);
            }

            $transaction = Transaction::where('user_id', $userId)->with('category')->findOrFail($id);
            return response()->json([
                'id' => $transaction->id,
                'ten' => $transaction->name,
                'soTien' => $transaction->amount,
                'danhMuc' => $transaction->category->type === 'income' ? 'Thu nhập' : 'Chi tiêu',
                'ngay' => $transaction->created_at->format('Y-m-d'),
                'moTa' => $transaction->description,
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi trong show: ' . $e->getMessage());
            return response()->json(['error' => 'Lỗi server: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $userId = auth()->id();
            if (!$userId) {
                return response()->json(['error' => 'Không tìm thấy người dùng hiện tại.'], 401);
            }

            $transaction = Transaction::where('user_id', $userId)->findOrFail($id);

            $validator = Validator::make($request->all(), [
                'ten' => 'required|string|max:50',
                'soTien' => [
                    'required',
                    'numeric',
                    'gt:0',
                    'max:99999999.99', // Giới hạn tối đa 99,999,999.99
                ],
                'category_id' => ['required', 'exists:categories,id,user_id,' . $userId],
                'ngay' => 'required|date|before_or_equal:today',
                'moTa' => 'nullable|string',
            ], [
                'soTien.max' => 'Vui lòng nhập lại, đã vượt quá số 0 tối thiểu 8 chữ số.',
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()->first()], 422);
            }

            $category = Category::where('user_id', $userId)
                ->findOrFail($request->category_id);

            $ten = strtolower($request->ten);
            if (
                (str_contains($ten, 'thu') && $category->type === 'expense') ||
                (str_contains($ten, 'chi') && $category->type === 'income')
            ) {
                return response()->json(['error' => 'Loại giao dịch không phù hợp với tên'], 422);
            }

            $transaction->update([
                'category_id' => $category->id,
                'name' => $request->ten,
                'amount' => $request->soTien,
                'description' => $request->moTa,
                'created_at' => $request->ngay,
            ]);

            // Reload the transaction with category relationship
            $updatedTransaction = Transaction::where('user_id', $userId)->with('category')->findOrFail($id);

            return response()->json([
                'id' => $updatedTransaction->id,
                'ten' => $updatedTransaction->name,
                'soTien' => $updatedTransaction->amount,
                'category_id' => $category->id,
                'category_name' => $category->name,
                'danhMuc' => $category->type === 'income' ? 'Thu nhập' : 'Chi tiêu',
                'ngay' => $updatedTransaction->created_at->format('Y-m-d'),
                'moTa' => $updatedTransaction->description,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Giao dịch hoặc danh mục không tồn tại: ' . $e->getMessage());
            return response()->json(['error' => 'Giao dịch hoặc danh mục không tồn tại.'], 404);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '22003') {
                Log::error('Số tiền vượt quá giới hạn: ' . $e->getMessage());
                return response()->json(['error' => 'Vui lòng nhập lại, đã vượt quá số 0 tối thiểu 8 chữ số.'], 422);
            }
            Log::error('Lỗi trong update: ' . $e->getMessage());
            return response()->json(['error' => 'Lỗi server: ' . $e->getMessage()], 500);
        } catch (\Exception $e) {
            Log::error('Lỗi trong update: ' . $e->getMessage());
            return response()->json(['error' => 'Lỗi server: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $userId = auth()->id();
            if (!$userId) {
                return response()->json(['error' => 'Không tìm thấy người dùng hiện tại.'], 401);
            }

            $transaction = Transaction::where('user_id', $userId)->findOrFail($id);
            $transaction->delete();
            return response()->json(['message' => 'Giao dịch đã được xóa']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Giao dịch không tồn tại: ' . $e->getMessage());
            return response()->json(['error' => 'Giao dịch không tồn tại.'], 404);
        } catch (\Exception $e) {
            Log::error('Lỗi trong destroy: ' . $e->getMessage());
            return response()->json(['error' => 'Lỗi server: ' . $e->getMessage()], 500);
        }
    }

    public function getCategories(Request $request)
    {
        try {
            $userId = auth()->id();
            $type = $request->query('type', 'all');

            $query = Category::where('user_id', $userId);
            if ($type !== 'all') {
                $query->where('type', $type);
            }

            $categories = $query->get()->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'type' => $category->type === 'income' ? 'Thu nhập' : 'Chi tiêu',
                ];
            });

            return response()->json($categories);
        } catch (\Exception $e) {
            Log::error('Lỗi trong getCategories: ' . $e->getMessage());
            return response()->json(['error' => 'Lỗi server: ' . $e->getMessage()], 500);
        }
    }
}