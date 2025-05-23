<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;

class FinanceController extends Controller
{
    /**
     * Danh sách các danh mục thu nhập
     */
    private $incomeCategories = ['Lương', 'Thưởng', 'Thu nhập khác'];

    /**
     * Lấy thống kê tài chính theo khoảng thời gian
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFinance(Request $request)
    {
        $user = $request->user();
        $type = $request->query('type', 'month');

        // Định dạng thời gian dựa trên type
        $dateFormat = match ($type) {
            'year' => '%Y',
            'week' => '%Y-W%V',
            'month' => '%Y-%m',
            default => '%Y-%m',
        };

        // Query thống kê thu nhập và chi tiêu
        $query = Transaction::select(
            DB::raw("DATE_FORMAT(transactions.created_at, '$dateFormat') as period"),
            DB::raw("SUM(CASE WHEN categories.name IN ('" . implode("','", $this->incomeCategories) . "') THEN transactions.amount ELSE 0 END) as income"),
            DB::raw("SUM(CASE WHEN categories.name NOT IN ('" . implode("','", $this->incomeCategories) . "') THEN transactions.amount ELSE 0 END) as expenses")
        )
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $user->id)
            ->where(function ($query) use ($user) {
                $query->where('categories.user_id', $user->id)
                      ->orWhereNull('categories.user_id');
            });

        $transactions = $query
            ->groupBy('period')
            ->orderBy('period', 'desc')
            ->get();

        $labels = $transactions->pluck('period')->toArray();
        $income = $transactions->pluck('income')->map(fn($val) => (float) $val)->toArray();
        $expenses = $transactions->pluck('expenses')->map(fn($val) => (float) $val)->toArray();

        // Query danh mục chi tiêu
        $categoriesQuery = Transaction::select(
            'categories.name',
            DB::raw('SUM(transactions.amount) as value'),
            DB::raw('ROUND(SUM(transactions.amount) / SUM(SUM(transactions.amount)) OVER() * 100, 2) as percent')
        )
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $user->id)
            ->where(function ($query) use ($user) {
                $query->where('categories.user_id', $user->id)
                      ->orWhereNull('categories.user_id');
            })
            ->whereNotIn('categories.name', $this->incomeCategories)
            ->groupBy('categories.id', 'categories.name');

        $categories = $categoriesQuery
            ->get()
            ->map(fn($cat) => [
                'name' => $cat->name,
                'value' => (float) $cat->value,
                'percent' => (float) $cat->percent,
            ])
            ->toArray();

        // Query lịch sử giao dịch
        $transactionsHistoryQuery = Transaction::select(
            DB::raw("DATE_FORMAT(transactions.created_at, '%Y-%m-%d') as date"),
            'categories.name as category',
            'transactions.amount',
            'transactions.description'
        )
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $user->id)
            ->where(function ($query) use ($user) {
                $query->where('categories.user_id', $user->id)
                      ->orWhereNull('categories.user_id');
            })
            ->orderBy('transactions.created_at', 'desc')
            ->take(50);

        $transactionsHistory = $transactionsHistoryQuery
            ->get()
            ->map(fn($t) => [
                'date' => $t->date,
                'type' => in_array($t->category, $this->incomeCategories) ? 'Thu' : 'Chi',
                'category' => $t->category,
                'amount' => (float) $t->amount,
                'description' => $t->description ?: '',
            ])
            ->toArray();

        return response()->json([
            'labels' => $labels,
            'income' => $income,
            'expenses' => $expenses,
            'categories' => $categories,
            'transactions' => $transactionsHistory,
        ], 200);
    }

    /**
     * So sánh tài chính giữa hai khoảng thời gian
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function compareFinance(Request $request)
    {
        $user = $request->user();
        $type = $request->query('type', 'month');
        $period1 = $request->query('period1');
        $period2 = $request->query('period2');

        // Validate input
        $validator = Validator::make($request->all(), [
            'period1' => 'required|string',
            'period2' => 'required|string|different:period1',
        ], [
            'period1.required' => 'Vui lòng chọn khoảng thời gian thứ nhất.',
            'period2.required' => 'Vui lòng chọn khoảng thời gian thứ hai.',
            'period2.different' => 'Vui lòng chọn hai khoảng thời gian khác nhau.',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $periods = [
            'period1' => $period1,
            'period2' => $period2,
        ];

        $result = [];

        foreach ($periods as $key => $period) {
            $query = Transaction::join('categories', 'transactions.category_id', '=', 'categories.id')
                ->where('transactions.user_id', $user->id)
                ->where(function ($query) use ($user) {
                    $query->where('categories.user_id', $user->id)
                          ->orWhereNull('categories.user_id');
                });

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
                $query->whereYear('transactions.created_at', $year)
                      ->whereRaw('WEEK(transactions.created_at, 1) = ?', [$week - 1]);

                $label = "Tuần $week ($year)";
            } elseif ($type === 'year') {
                if (!preg_match('/^\d{4}$/', $period)) {
                    return response()->json(['message' => 'Định dạng năm không hợp lệ. Kỳ vọng: YYYY'], 422);
                }
                $query->whereYear('transactions.created_at', $period);
                $label = "Năm $period";
            } else {
                return response()->json(['message' => 'Loại thống kê không hợp lệ'], 422);
            }

            $data = $query
                ->select(
                    DB::raw("SUM(CASE WHEN categories.name IN ('" . implode("','", $this->incomeCategories) . "') THEN transactions.amount ELSE 0 END) as income"),
                    DB::raw("SUM(CASE WHEN categories.name NOT IN ('" . implode("','", $this->incomeCategories) . "') THEN transactions.amount ELSE 0 END) as expenses")
                )
                ->first();

            $result[$key] = [
                'label' => $label,
                'income' => (float) ($data->income ?? 0),
                'expenses' => (float) ($data->expenses ?? 0),
            ];
        }

        return response()->json($result, 200);
    }
}