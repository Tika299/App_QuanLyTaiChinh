<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class FinanceController extends Controller
{
    /**
     * Danh sách các danh mục thu nhập
     */
    private $incomeCategories = ['Lương', 'Thưởng', 'Thu nhập khác'];

    /**
     * Lấy thống kê tài chính theo khoảng thời gian
     */
    public function getFinance(Request $request)
    {
        $user = $request->user();
        $type = $request->query('type', 'month');
        $year = $request->query('year');

        $dateFormat = match ($type) {
            'year' => '%Y',
            'week' => '%Y-W%V',
            'month' => '%Y-%m',
            default => '%Y-%m',
        };

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

        if ($year) {
            $query->whereYear('transactions.created_at', $year);
        } else {
            $query->where('transactions.created_at', '<=', Carbon::now());
        }

        $transactions = $query->groupBy('period');

        if ($type === 'week') {
            $transactions = $transactions->orderByRaw("STR_TO_DATE(CONCAT(period, '-1'), '%Y-W%V-%w') ASC");
        } else {
            $transactions = $transactions->orderBy('period', 'asc');
        }

        $transactions = $transactions->get();

        // Debug raw periods
        $rawPeriods = $transactions->pluck('period')->toArray();
        Log::debug("Raw periods from query: " . json_encode($rawPeriods));

        $labels = $transactions->pluck('period')->toArray();
        $income = $transactions->pluck('income')->map(fn($val) => (float) ($val ?? 0))->toArray();
        $expenses = $transactions->pluck('expenses')->map(fn($val) => (float) ($val ?? 0))->toArray();

        $periodOptions = [];
        $currentDate = Carbon::now();
        if ($type === 'week') {
            $weeks = Transaction::select(DB::raw("DATE_FORMAT(created_at, '%Y-W%V') as period"))
                ->where('user_id', $user->id)
                ->where('created_at', '<=', $currentDate)
                ->groupBy('period')
                ->orderByRaw("STR_TO_DATE(CONCAT(period, '-1'), '%Y-W%V-%w') ASC")
                ->get()
                ->pluck('period')
                ->map(function ($period) {
                    [$year, $weekStr] = explode('-W', $period);
                    $week = sprintf('%02d', (int) $weekStr);
                    return [
                        'value' => "$year-W$week",
                        'label' => "Tuần $week-$year",
                    ];
                })
                ->toArray();

            $currentWeek = $currentDate->format('o-\WW');
            $periodOptions = array_filter($weeks, fn($w) => $w['value'] <= $currentWeek);
            Log::debug("Generated week options: " . json_encode($periodOptions));
        } elseif ($type === 'month') {
            $months = Transaction::select(DB::raw("DATE_FORMAT(created_at, '%Y-%m') as period"))
                ->where('user_id', $user->id)
                ->where('created_at', '<=', $currentDate)
                ->groupBy('period')
                ->orderBy('period', 'asc')
                ->get()
                ->pluck('period')
                ->map(function ($period) {
                    [$year, $month] = explode('-', $period);
                    return [
                        'value' => $period,
                        'label' => "Tháng $month/$year",
                    ];
                })
                ->toArray();

            $currentMonth = $currentDate->format('Y-m');
            $periodOptions = array_filter($months, fn($m) => $m['value'] <= $currentMonth);
        }

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
            ->sortByDesc('value')
            ->values()
            ->toArray();

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
            ->where('transactions.created_at', '<=', $currentDate)
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
            'period_options' => array_values($periodOptions),
        ], 200);
    }

    /**
     * So sánh tài chính giữa hai khoảng thời gian
     */
    public function compareFinance(Request $request)
    {
        $user = $request->user();
        $type = $request->query('type', 'month');
        $period1 = $request->query('period1');
        $period2 = $request->query('period2');

        Log::debug("Raw query parameters: " . json_encode($request->query()));

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
            $period = trim($period);
            Log::debug("Processing period after trim: $period");

            $query = Transaction::join('categories', 'transactions.category_id', '=', 'categories.id')
                ->where('transactions.user_id', $user->id)
                ->where(function ($query) use ($user) {
                    $query->where('categories.user_id', $user->id)
                        ->orWhereNull('categories.user_id');
                });

            if ($type === 'month') {
                if (!preg_match('/^\d{4}-\d{2}$/', $period)) {
                    Log::debug("Month validation failed for period: $period");
                    return response()->json(['message' => 'Định dạng tháng không hợp lệ. Kỳ vọng: YYYY-MM'], 422);
                }
                [$year, $month] = explode('-', $period);
                $month = str_pad($month, 2, '0', STR_PAD_LEFT);
                $query->whereYear('transactions.created_at', $year)
                    ->whereMonth('transactions.created_at', $month);
                $monthLabel = Carbon::createFromFormat('m', $month)->translatedFormat('F');
                $label = "$monthLabel $year";
            } elseif ($type === 'week') {
                Log::debug("Validating week format for: $period");
                if (!preg_match('/^\d{4}-W\d{2}$/', $period)) {
                    Log::debug("Validation failed for period: $period - Does not match YYYY-WWW pattern");
                    return response()->json(['message' => 'Định dạng tuần không hợp lệ. Kỳ vọng: YYYY-WWW'], 422);
                }

                [$year, $weekStr] = explode('-W', $period);
                $week = (int) $weekStr;

                if (!is_numeric($year) || $week < 1 || $week > 53) {
                    Log::debug("Invalid year or week number: year=$year, week=$week");
                    return response()->json(['message' => 'Định dạng tuần không hợp lệ. Kỳ vọng: YYYY-WWW với tuần từ 01 đến 53'], 422);
                }

                try {
                    $date = Carbon::create($year, 1, 1)->startOfYear()->addWeeks($week - 1)->startOfWeek(Carbon::MONDAY);
                    $startOfWeek = $date->copy()->startOfWeek(Carbon::MONDAY);
                    $endOfWeek = $date->copy()->endOfWeek(Carbon::SUNDAY);

                    Log::debug("Week range for $period: $startOfWeek to $endOfWeek");
                    $query->whereBetween('transactions.created_at', [$startOfWeek, $endOfWeek]);
                    $label = "Tuần $week-$year";
                } catch (\Exception $e) {
                    Log::error("Carbon parsing error for period $period: " . $e->getMessage());
                    return response()->json(['message' => 'Không thể so sánh: Định dạng tuần không hợp lệ'], 422);
                }
            } elseif ($type === 'year') {
                if (!preg_match('/^\d{4}$/', $period)) {
                    Log::debug("Year validation failed for period: $period");
                    return response()->json(['message' => 'Định dạng năm không hợp lệ. Kỳ vọng: YYYY'], 422);
                }
                $query->whereYear('transactions.created_at', $period);
                $label = "Năm $period";
            } else {
                Log::debug("Invalid type: $type");
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