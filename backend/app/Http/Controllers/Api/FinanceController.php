<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FinanceController extends Controller
{
    public function getFinance(Request $request)
    {
        $type = $request->query('type', 'month');
        $user = $request->user();
        $currentYear = Carbon::now()->year; // 2025

        // Xác định định dạng thời gian
        if ($type === 'year') {
            $dateFormat = '%Y';
        } elseif ($type === 'week') {
            $dateFormat = '%x-W%v'; // ISO week: "2025-W18"
        } else {
            $dateFormat = '%m/%Y'; // "05/2025"
        }

        // Lấy thu nhập và chi tiêu theo thời gian
        $query = Transaction::select(
            DB::raw("DATE_FORMAT(transactions.created_at, '$dateFormat') as period"),
            DB::raw("SUM(CASE WHEN categories.type = 'income' THEN transactions.amount ELSE 0 END) as income"),
            DB::raw("SUM(CASE WHEN categories.type = 'expense' THEN transactions.amount ELSE 0 END) as expenses")
        )
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $user->id)
            ->where('categories.user_id', $user->id);

        // Chỉ giới hạn năm hiện tại cho week và month
        if ($type === 'week' || $type === 'month') {
            $query->whereYear('transactions.created_at', $currentYear);
        }

        $transactions = $query
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        $labels = $transactions->pluck('period')->toArray();
        $income = $transactions->pluck('income')->map(fn($val) => (float) $val)->toArray();
        $expenses = $transactions->pluck('expenses')->map(fn($val) => (float) $val)->toArray();

        // Lấy danh mục chi tiêu
        $categoriesQuery = Transaction::select(
            'categories.name',
            'categories.color',
            DB::raw('SUM(transactions.amount) as value'),
            DB::raw('ROUND(SUM(transactions.amount) / SUM(SUM(transactions.amount)) OVER() * 100, 2) as percent')
        )
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $user->id)
            ->where('categories.user_id', $user->id)
            ->where('categories.type', 'expense');

        if ($type === 'week' || $type === 'month') {
            $categoriesQuery->whereYear('transactions.created_at', $currentYear);
        }

        $categories = $categoriesQuery
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
        $transactionsHistoryQuery = Transaction::select(
            DB::raw("DATE_FORMAT(transactions.created_at, '%Y-%m-%d') as date"),
            'categories.type as type',
            'categories.name as category',
            'transactions.amount',
            'transactions.description'
        )
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $user->id)
            ->where('categories.user_id', $user->id);

        if ($type === 'week' || $type === 'month') {
            $transactionsHistoryQuery->whereYear('transactions.created_at', $currentYear);
        }

        $transactionsHistory = $transactionsHistoryQuery
            ->orderBy('transactions.created_at', 'desc')
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
        $currentYear = Carbon::now()->year; // 2025

        if (!$period1 || !$period2) {
            return response()->json(['message' => 'Vui lòng chọn cả hai khoảng thời gian'], 422);
        }

        if ($period1 === $period2) {
            return response()->json(['message' => 'Vui lòng chọn hai khoảng thời gian khác nhau'], 422);
        }

        $periods = [
            'period1' => $period1,
            'period2' => $period2,
        ];

        $result = [];

        foreach ($periods as $key => $period) {
            $query = Transaction::join('categories', 'transactions.category_id', '=', 'categories.id')
                ->where('transactions.user_id', $user->id)
                ->where('categories.user_id', $user->id)
                ->whereYear('transactions.created_at', $currentYear);

            if ($type === 'month') {
                if (!preg_match('/^\d{4}-\d{2}$/', $period)) {
                    return response()->json(['message' => 'Định dạng tháng không hợp lệ. Kỳ vọng: YYYY-MM'], 422);
                }
                [$year, $month] = explode('-', $period);
                $month = (int) $month;
                $query->whereYear('transactions.created_at', $year)
                      ->whereMonth('transactions.created_at', $month);

                $monthLabel = Carbon::createFromFormat('m', $month)->translatedFormat('F');
                $label = "$monthLabel $year";
            } elseif ($type === 'week') {
                if (!preg_match('/^\d{4}-W\d{2}$/', $period)) {
                    return response()->json(['message' => 'Định dạng tuần không hợp lệ. Kỳ vọng: YYYY-WWW'], 422);
                }
                [$year, $weekStr] = explode('-W', $period);
                $week = (int) $weekStr;
                // Bỏ kiểm tra $week > 6 để cho phép tuần 22, 24
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