<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinanceController extends Controller
{
    public function getFinance(Request $request)
    {
        $type = $request->query('type', 'month');
        $user = $request->user();

        // Xác định định dạng thời gian
        if ($type === 'year') {
            $dateFormat = '%Y';
        } elseif ($type === 'week') {
            $dateFormat = '%x-W%v'; // ISO week: "2025-W18"
        } else {
            $dateFormat = '%m/%Y'; // "05/2025"
        }

        // Lấy thu nhập và chi tiêu theo thời gian
        $transactions = Transaction::select(
            DB::raw("DATE_FORMAT(transactions.created_at, '$dateFormat') as period"),
            DB::raw("SUM(CASE WHEN categories.type = 'income' THEN transactions.amount ELSE 0 END) as income"),
            DB::raw("SUM(CASE WHEN categories.type = 'expense' THEN transactions.amount ELSE 0 END) as expenses")
        )
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $user->id)
            ->where('categories.user_id', $user->id)
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        $labels = $transactions->pluck('period')->toArray();
        $income = $transactions->pluck('income')->map(fn($val) => (float) $val)->toArray();
        $expenses = $transactions->pluck('expenses')->map(fn($val) => (float) $val)->toArray();

        // Lấy danh mục chi tiêu
        $categories = Transaction::select(
            'categories.name',
            'categories.color',
            DB::raw('SUM(transactions.amount) as value'),
            DB::raw('ROUND(SUM(transactions.amount) / SUM(SUM(transactions.amount)) OVER() * 100, 2) as percent')
        )
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $user->id)
            ->where('categories.user_id', $user->id)
            ->where('categories.type', 'expense')
            ->groupBy('categories.id', 'categories.name', 'categories.color')
            ->get()
            ->map(fn($cat) => [
                'name' => $cat->name,
                'value' => (float) $cat->value,
                'percent' => (float) $cat->percent,
                'color' => $cat->color,
            ])
            ->toArray();

        // Lấy lịch sử giao dịch
        $transactionsHistory = Transaction::select(
            DB::raw("DATE_FORMAT(transactions.created_at, '%Y-%m-%d') as date"),
            'categories.type as type',
            'categories.name as category',
            'transactions.amount',
            'transactions.description'
        )
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $user->id)
            ->where('categories.user_id', $user->id)
            ->orderBy('transactions.created_at', 'desc')
            ->take(10)
            ->get()
            ->map(fn($t) => [
                'date' => $t->date,
                'type' => $t->type === 'income' ? 'Thu' : 'Chi',
                'category' => $t->category,
                'amount' => (float) $t->amount,
                'description' => $t->description,
            ])
            ->toArray();

        return response()->json([
            'labels' => $labels,
            'income' => $income,
            'expenses' => $expenses,
            'categories' => $categories,
            'transactions' => $transactionsHistory,
        ]);
    }

    public function compareFinance(Request $request)
    {
        $type = $request->query('type', 'month');
        $period1 = $request->query('period1');
        $period2 = $request->query('period2');
        $user = $request->user();

        if (!$period1 || !$period2) {
            return response()->json(['message' => 'Vui lòng chọn cả hai khoảng thời gian'], 422);
        }

        $periods = [
            'period1' => $period1,
            'period2' => $period2,
        ];

        $result = [];

        foreach ($periods as $key => $period) {
            $query = Transaction::join('categories', 'transactions.category_id', '=', 'categories.id')
                ->where('transactions.user_id', $user->id)
                ->where('categories.user_id', $user->id);

            if ($type === 'month') {
                [$year, $month] = explode('-', $period);
                $query->whereYear('transactions.created_at', $year)
                    ->whereMonth('transactions.created_at', $month);

                // Gán nhãn đẹp hơn
                $monthLabel = now()->setMonth((int) $month)->translatedFormat('F'); // Ví dụ: Tháng 5 -> "May"
                $label = "$monthLabel $year"; // VD: "May 2025"
            } elseif ($type === 'week') {
                [$year, $weekStr] = explode('-W', $period);
                $week = (int) $weekStr;

                $query->whereYear('transactions.created_at', $year)
                    ->whereRaw('WEEK(transactions.created_at, 1) = ?', [$week]);

                $label = "Tuần $week ($year)";
            } else {
                return response()->json(['message' => 'Loại thống kê không hợp lệ'], 422);
            }

            $data = $query
                ->select(
                    DB::raw("SUM(CASE WHEN categories.type = 'income' THEN transactions.amount ELSE 0 END) as income"),
                    DB::raw("SUM(CASE WHEN categories.type = 'expense' THEN transactions.amount ELSE 0 END) as expenses")
                )
                ->first();

            $result[$key] = [
                'label' => $label,
                'income' => (float) ($data->income ?? 0),
                'expenses' => (float) ($data->expenses ?? 0),
            ];
        }

        return response()->json($result);
    }

}