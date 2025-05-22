import React, { useState, useEffect, useRef } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  BarElement,
  ArcElement,
  Legend,
} from 'chart.js';
import axios from 'axios';
import Header from './Header';
import Slider from './Slider';

// Register Chart.js components
ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  BarElement,
  ArcElement,
  Legend
);

// Animated number counter component
const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 2000;
    const increment = end / (duration / 16);

    const animate = () => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        return;
      }
      setDisplayValue(Math.floor(start));
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{displayValue.toLocaleString()}₫</span>;
};

const Dashboard = () => {
  const [timeFrame, setTimeFrame] = useState('month');
  const [financeData, setFinanceData] = useState({
    income: [],
    expenses: [],
    categories: [],
    transactions: [],
    labels: [],
  });
  const [compareData, setCompareData] = useState(null);
  const [selectedPeriods, setSelectedPeriods] = useState({
    period1: '',
    period2: '',
    type: 'month',
  });
  const [toasts, setToasts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [periodOptions, setPeriodOptions] = useState({
    month: [],
    week: [],
  });
  const [selectedYear, setSelectedYear] = useState(null);
  const chartRef = useRef(null);
  const itemsPerPage = 5;

  // Hàm thêm toast
  const addToast = (message, type = 'danger') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  // Hàm xóa toast
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Hàm lấy dữ liệu từ API
  const fetchFinanceData = async (frame, year = null) => {
    try {
      await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
        withCredentials: true,
      });

      const token = localStorage.getItem('token');
      if (!token) {
        addToast('Vui lòng đăng nhập lại.');
        window.location.href = '/';
        return;
      }

      const url = year
        ? `http://127.0.0.1:8000/api/finance?type=${frame}&year=${year}`
        : `http://127.0.0.1:8000/api/finance?type=${frame}`;

      const response = await axios.get(url, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });

      let filteredData = response.data;
      if (frame === 'year' && !year) {
        const allowedYears = ['2024', '2025'];
        filteredData = {
          labels: response.data.labels.filter((label) =>
            allowedYears.includes(label)
          ),
          income: response.data.income.slice(0, response.data.labels.length).filter((_, i) =>
            allowedYears.includes(response.data.labels[i])
          ),
          expenses: response.data.expenses.slice(0, response.data.labels.length).filter((_, i) =>
            allowedYears.includes(response.data.labels[i])
          ),
          categories: response.data.categories,
          transactions: response.data.transactions.filter((t) =>
            allowedYears.some((year) => t.date.startsWith(year))
          ),
        };
      }

      // Xử lý dữ liệu tuần, chỉ lấy các tuần có dữ liệu (tối đa 25 tuần)
      if (frame === 'week') {
        const weeks = [...new Set(response.data.labels)]
          .filter((label) => {
            if (year && !label.includes(year)) return false;
            const [, weekNum] = label.split('-W');
            const weekNumber = parseInt(weekNum, 10);
            return weekNumber <= 25; // Chỉ lấy đến tuần 25
          })
          .map((label) => {
            const [, weekNum] = label.split('-W');
            const weekNumber = parseInt(weekNum, 10);
            return {
              value: label,
              label: `Tuần ${weekNumber} (${label.split('-W')[0]})`,
              weekNum: weekNumber,
              year: label.split('-W')[0],
            };
          })
          .sort((a, b) => {
            // Sắp xếp theo năm trước, sau đó theo tuần
            if (a.year !== b.year) return a.year.localeCompare(b.year);
            return a.weekNum - b.weekNum;
          });

        filteredData = {
          ...response.data,
          labels: weeks.map((w) => w.label),
          income: weeks.map((w) => response.data.income[response.data.labels.indexOf(w.value)] || 0),
          expenses: weeks.map((w) => response.data.expenses[response.data.labels.indexOf(w.value)] || 0),
        };

        setPeriodOptions((prev) => ({ ...prev, week: weeks }));
      } else if (frame === 'month') {
        const months = [...new Set(response.data.labels)]
          .filter((label) => (year ? label.includes(year) : true))
          .map((label) => {
            const [month, year] = label.split('/');
            return {
              value: `${year}-${month.padStart(2, '0')}`,
              label: `Tháng ${parseInt(month)}/${year}`,
            };
          })
          .sort((a, b) => a.value.localeCompare(b.value));
        setPeriodOptions((prev) => ({ ...prev, month: months }));
      }

      setFinanceData(filteredData);
      setCurrentPage(1);
    } catch (err) {
      addToast('Không thể tải dữ liệu tài chính: ' + (err.response?.data?.message || err.message));
      setFinanceData({ income: [], expenses: [], categories: [], transactions: [], labels: [] });
    }
  };

  // Hàm xử lý nhấp vào biểu đồ
  const handleChartClick = (event) => {
    if (timeFrame !== 'year') return;

    const chart = chartRef.current;
    if (!chart) return;

    const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
    if (elements.length > 0) {
      const index = elements[0].index;
      const year = financeData.labels[index];
      setSelectedYear(year);
      fetchFinanceData('month', year);
      setTimeFrame('month');
    }
  };

  // Tải dữ liệu ban đầu
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchFinanceData('month');
      await fetchFinanceData('week');
      fetchFinanceData(timeFrame);
    };
    loadInitialData();
  }, []);

  // Tải dữ liệu khi timeFrame thay đổi
  useEffect(() => {
    if (!selectedYear) {
      fetchFinanceData(timeFrame);
    }
  }, [timeFrame]);

  // Hàm so sánh hai khoảng thời gian
  const comparePeriods = async () => {
    if (!selectedPeriods.period1 || !selectedPeriods.period2) {
      addToast('Vui lòng chọn cả hai khoảng thời gian.');
      return;
    }

    if (selectedPeriods.period1 === selectedPeriods.period2) {
      addToast('Vui lòng chọn hai khoảng thời gian khác nhau.');
      return;
    }

    try {
      await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
        withCredentials: true,
      });

      const token = localStorage.getItem('token');
      if (!token) {
        addToast('Vui lòng đăng nhập lại.');
        window.location.href = '/';
        return;
      }

      const response = await axios.get(
        `http://127.0.0.1:8000/api/finance/compare?type=${selectedPeriods.type}&period1=${selectedPeriods.period1}&period2=${selectedPeriods.period2}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (
        response.data &&
        response.data.period1 &&
        response.data.period2 &&
        typeof response.data.period1.income === 'number' &&
        typeof response.data.period1.expenses === 'number' &&
        typeof response.data.period2.income === 'number' &&
        typeof response.data.period2.expenses === 'number'
      ) {
        setCompareData(response.data);
      } else {
        addToast('Dữ liệu so sánh không hợp lệ.');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message.includes('Định dạng tuần không hợp lệ')
          ? 'Không thể so sánh: Vui lòng chọn tuần hợp lệ (YYYY-WWW).'
          : err.response?.data?.message.includes('Định dạng tháng không hợp lệ')
          ? 'Không thể so sánh: Vui lòng chọn tháng hợp lệ (YYYY-MM).'
          : err.response?.data?.message.includes('khác nhau')
          ? 'Không thể so sánh: Vui lòng chọn hai khoảng thời gian khác nhau.'
          : 'Không thể so sánh: ' + (err.response?.data?.message || err.message);
      addToast(errorMessage);
    }
  };

  // Khởi tạo Bootstrap Toast
  useEffect(() => {
    const toastElements = document.querySelectorAll('.toast');
    toastElements.forEach((toastEl) => {
      const bootstrapToast = new window.bootstrap.Toast(toastEl);
      bootstrapToast.show();
    });
  }, [toasts]);

  // Tổng quan tài chính
  const totalIncome = financeData.income.reduce((sum, val) => sum + val, 0);
  const totalExpenses = financeData.expenses.reduce((sum, val) => sum + val, 0);
  const balance = totalIncome - totalExpenses;

  // Dữ liệu biểu đồ Line Chart
  const getLabels = () => financeData.labels || [];

  const lineChartData = {
    labels: getLabels(),
    datasets: [
      {
        label: 'Thu nhập',
        data: financeData.income,
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.4)',
        borderWidth: 4,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(255, 255, 255, 1)',
        pointBorderColor: 'rgba(16, 185, 129, 1)',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 12,
      },
      {
        label: 'Chi tiêu',
        data: financeData.expenses,
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.4)',
        borderWidth: 4,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(255, 255, 255, 1)',
        pointBorderColor: 'rgba(239, 68, 68, 1)',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 12,
      },
    ],
  };

  // Xử lý danh mục để loại bỏ trùng lặp
  const uniqueCategories = Object.values(
    financeData.categories.reduce((acc, category) => {
      if (category && category.name) {
        if (acc[category.name]) {
          acc[category.name].value += category.value;
        } else {
          acc[category.name] = { name: category.name, value: category.value };
        }
      }
      return acc;
    }, {})
  );

  // Dữ liệu biểu đồ Pie Chart (danh mục)
  const pieChartData = {
    labels: uniqueCategories.map((cat) => cat.name),
    datasets: [
      {
        data: uniqueCategories.map((cat) => cat.value),
        backgroundColor: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  // Dữ liệu biểu đồ Bar Chart (so sánh)
  const barChartData = compareData
    ? {
        labels: [compareData.period1.label, compareData.period2.label],
        datasets: [
          {
            label: 'Thu nhập',
            data: [compareData.period1.income, compareData.period2.income],
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1,
          },
          {
            label: 'Chi tiêu',
            data: [compareData.period1.expenses, compareData.period2.expenses],
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1,
          },
        ],
      }
    : null;

  // Tùy chọn biểu đồ
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 14, family: 'Helvetica, sans-serif', weight: '600' },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#333',
        },
      },
      title: {
        display: true,
        text: selectedYear
          ? `Thu nhập & Chi tiêu ${timeFrame === 'week' ? 'Hàng tuần' : 'Hàng tháng'} năm ${selectedYear}`
          : timeFrame === 'week'
          ? 'Thu nhập & Chi tiêu Hàng tuần'
          : timeFrame === 'year'
          ? 'Thu nhập & Chi tiêu Hàng năm'
          : 'Thu nhập & Chi tiêu Hàng tháng',
        font: { size: 22, family: 'Helvetica, sans-serif', weight: '700' },
        padding: { top: 10, bottom: 20 },
        color: '#1a1a1a',
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleFont: { size: 14, family: 'Helvetica, sans-serif', weight: 'bold' },
        bodyFont: { size: 12, family: 'Helvetica, sans-serif' },
        padding: 12,
        cornerRadius: 10,
        boxPadding: 8,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y}₫`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)', borderDash: [5, 5], drawBorder: false },
        ticks: {
          font: { size: 12, family: 'Helvetica, sans-serif' },
          color: '#555',
          padding: 10,
          callback: (value) => `${value}₫`,
        },
        title: {
          display: true,
          text: 'Số tiền (₫)',
          font: { size: 14, family: 'Helvetica, sans-serif', weight: '600' },
          color: '#333',
          padding: 10,
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 12, family: 'Helvetica, sans-serif' },
          color: '#555',
          padding: 10,
          callback: (value, index) => {
            const label = financeData.labels[index];
            if (timeFrame === 'week') {
              const weekNum = label.match(/Tuần (\d+)/)?.[1];
              return weekNum ? `W${weekNum}` : label;
            }
            return label;
          },
        },
        title: {
          display: true,
          text: timeFrame === 'week' ? 'Tuần' : timeFrame === 'year' ? 'Năm' : 'Tháng',
          font: { size: 14, family: 'Helvetica, sans-serif', weight: '600' },
          color: '#333',
          padding: 10,
        },
      },
    },
    interaction: { mode: 'nearest', intersect: false, axis: 'x' },
    animation: { duration: 1500, easing: 'easeInOutQuart' },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { size: 14, family: 'Helvetica, sans-serif', weight: '600' },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#333',
        },
      },
      title: {
        display: true,
        text: 'Phân loại chi tiêu',
        font: { size: 22, family: 'Helvetica, sans-serif', weight: '700' },
        padding: { top: 10, bottom: 20 },
        color: '#1a1a1a',
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleFont: { size: 14, family: 'Helvetica, sans-serif', weight: 'bold' },
        bodyFont: { size: 12, family: 'Helvetica, sans-serif' },
        padding: 12,
        cornerRadius: 10,
        boxPadding: 8,
        callbacks: {
          label: (context) =>
            `${context.label}: ${context.parsed}₫ (${(
              (context.parsed / context.dataset.data.reduce((a, b) => a + b, 0)) * 100
            ).toFixed(2)}%)`,
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 14, family: 'Helvetica, sans-serif', weight: '600' },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#333',
        },
      },
      title: {
        display: true,
        text: `So sánh ${selectedPeriods.type === 'month' ? 'Tháng' : 'Tuần'}`,
        font: { size: 22, family: 'Helvetica, sans-serif', weight: '700' },
        padding: { top: 10, bottom: 20 },
        color: '#1a1a1a',
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleFont: { size: 14, family: 'Helvetica, sans-serif', weight: 'bold' },
        bodyFont: { size: 12, family: 'Helvetica, sans-serif' },
        padding: 12,
        cornerRadius: 10,
        boxPadding: 8,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y}₫`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)', borderDash: [5, 5], drawBorder: false },
        ticks: {
          font: { size: 12, family: 'Helvetica, sans-serif' },
          color: '#555',
          padding: 10,
          callback: (value) => `${value}₫`,
        },
        title: {
          display: true,
          text: 'Số tiền (₫)',
          font: { size: 14, family: 'Helvetica, sans-serif', weight: '600' },
          color: '#333',
          padding: 10,
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 12, family: 'Helvetica, sans-serif' },
          color: '#555',
          padding: 10,
        },
        title: {
          display: true,
          text: selectedPeriods.type === 'month' ? 'Tháng' : 'Tuần',
          font: { size: 14, family: 'Helvetica, sans-serif', weight: '600' },
          color: '#333',
          padding: 10,
        },
      },
    },
    animation: { duration: 1500, easing: 'easeInOutQuart' },
  };

  // Phân trang cho lịch sử giao dịch
  const totalItems = financeData.transactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = financeData.transactions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Sidebar */}
      <div style={{ width: '245px', backgroundColor: '#f8f9fa' }}>
        <Slider />
      </div>

      {/* Main content */}
      <div className="flex-grow-1">
        <Header />
        <div className="p-4">
          {/* Toast Container */}
          <div
            className="toast-container position-fixed top-0 end-0 p-3"
            style={{ zIndex: 1050 }}
          >
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`toast bg-${toast.type} text-white`}
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                data-bs-autohide="true"
                data-bs-delay="5000"
              >
                <div className="toast-header">
                  <strong className="me-auto">Thông báo</strong>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    data-bs-dismiss="toast"
                    aria-label="Close"
                    onClick={() => removeToast(toast.id)}
                  ></button>
                </div>
                <div className="toast-body">{toast.message}</div>
              </div>
            ))}
          </div>

          {/* Chart and Summary Row */}
          <div className="row g-4 mb-4">
            {/* Chart */}
            <div className="col-md-8">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="card-title text-dark">Biểu đồ thu chi</h4>
                    <select
                      className="form-select w-auto"
                      value={timeFrame}
                      onChange={(e) => {
                        setTimeFrame(e.target.value);
                        setSelectedYear(null);
                      }}
                    >
                      <option value="week">Tuần</option>
                      <option value="month">Tháng</option>
                      <option value="year">Năm</option>
                    </select>
                  </div>
                  <div style={{ width: '100%', height: '400px' }}>
                    <Line
                      ref={chartRef}
                      data={lineChartData}
                      options={chartOptions}
                      onClick={handleChartClick}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="col-md-4">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-body">
                  <h4 className="card-title mb-4 text-dark">Tổng quan tài chính</h4>
                  <div className="d-flex flex-column gap-3">
                    <div
                      className="card bg-success text-white shadow-sm border-0"
                      style={{
                        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                        border: '2px solid transparent',
                        borderRadius: '12px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                        e.currentTarget.style.borderColor = '#059669';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-money-bill-wave me-3 fs-4"></i>
                          <div>
                            <h6 className="card-subtitle mb-2 text-white">Tổng thu nhập</h6>
                            <h4 className="card-title mb-0 text-white">
                              <AnimatedNumber value={totalIncome} />
                            </h4>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="card bg-danger text-white shadow-sm border-0"
                      style={{
                        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                        border: '2px solid transparent',
                        borderRadius: '12px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                        e.currentTarget.style.borderColor = '#dc2626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-shopping-cart me-3 fs-4"></i>
                          <div>
                            <h6 className="card-subtitle mb-2 text-white">Tổng chi tiêu</h6>
                            <h4 className="card-title mb-0 text-white">
                              <AnimatedNumber value={totalExpenses} />
                            </h4>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="card bg-primary text-white shadow-sm border-0"
                      style={{
                        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                        border: '2px solid transparent',
                        borderRadius: '12px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                        e.currentTarget.style.borderColor = '#2563eb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-wallet me-3 fs-4"></i>
                          <div>
                            <h6 className="card-subtitle mb-2 text-white">Số dư</h6>
                            <h4 className="card-title mb-0 text-white">
                              <AnimatedNumber value={balance} />
                            </h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compare Periods */}
          <div className="card shadow-sm mb-4 border-0">
            <div className="card-body">
              <h4 className="card-title mb-4 text-dark">So sánh khoảng thời gian</h4>
              <div className="d-flex gap-3 mb-4 align-items-end">
                <div>
                  <label className="form-label">Loại</label>
                  <select
                    className="form-select"
                    value={selectedPeriods.type}
                    onChange={(e) =>
                      setSelectedPeriods({ ...selectedPeriods, type: e.target.value, period1: '', period2: '' })
                    }
                  >
                    <option value="month">Tháng</option>
                    <option value="week">Tuần</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Khoảng thời gian 1</label>
                  <select
                    className="form-select"
                    value={selectedPeriods.period1}
                    onChange={(e) => setSelectedPeriods({ ...selectedPeriods, period1: e.target.value })}
                  >
                    <option value="">Chọn</option>
                    {periodOptions[selectedPeriods.type].map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Khoảng thời gian 2</label>
                  <select
                    className="form-select"
                    value={selectedPeriods.period2}
                    onChange={(e) => setSelectedPeriods({ ...selectedPeriods, period2: e.target.value })}
                  >
                    <option value="">Chọn</option>
                    {periodOptions[selectedPeriods.type].map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="btn btn-primary" onClick={comparePeriods}>
                  So sánh
                </button>
              </div>
              {barChartData && (
                <div style={{ width: '100%', height: '400px' }}>
                  <Bar data={barChartData} options={barChartOptions} />
                </div>
              )}
            </div>
          </div>

          {/* Spending Categories */}
          <div className="mb-4">
            <h4 className="mb-4 text-dark">Phân loại chi tiêu</h4>
            <div className="row g-3 mb-4">
              {uniqueCategories.map((category, index) => (
                <div key={`${category.name}-${index}`} className="col-md-3 col-sm-6">
                  <div
                    className={`card text-white ${
                      category.name === 'Ăn uống'
                        ? 'bg-danger'
                        : category.name === 'Giải trí'
                        ? 'bg-warning'
                        : category.name === 'Di chuyển'
                        ? 'bg-success'
                        : 'bg-primary'
                    } shadow-sm h-100 border-0`}
                    style={{
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      cursor: 'pointer',
                      borderRadius: '12px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.03)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div className="card-body d-flex align-items-center">
                      <i
                        className={`${
                          category.name === 'Ăn uống'
                            ? 'fas fa-utensils'
                            : category.name === 'Giải trí'
                            ? 'fas fa-gamepad'
                            : category.name === 'Di chuyển'
                            ? 'fas fa-car'
                            : 'fas fa-ellipsis-h'
                        } me-3 fs-3`}
                      ></i>
                      <div>
                        <h5 className="card-title mb-1">{category.name}</h5>
                        <p className="card-text mb-0">{category.value.toLocaleString()}₫</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <div style={{ width: '100%', height: '300px' }}>
                  <Pie data={pieChartData} options={pieChartOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="mt-5">
            <h4 className="mb-4 text-dark">Lịch sử thu/chi</h4>
            <div className="card shadow-sm border-0">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover table-bordered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="px-4 py-3">Ngày</th>
                        <th className="px-4 py-3">Loại</th>
                        <th className="px-4 py-3">Danh mục</th>
                        <th className="px-4 py-3">Số tiền</th>
                        <th className="px-4 py-3">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTransactions.map((row, index) => (
                        <tr
                          key={index}
                          style={{
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e9ecef')}
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f8f9fa')
                          }
                        >
                          <td className="px-4 py-3">{row.date}</td>
                          <td className="px-4 py-3">
                            <span className={`badge ${row.type === 'Thu' ? 'bg-success' : 'bg-danger'}`}>
                              {row.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">{row.category}</td>
                          <td className="px-4 py-3">{row.amount}₫</td>
                          <td className="px-4 py-3">{row.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <nav aria-label="Transaction history pagination" className="mt-3">
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Trước
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <li
                          key={page}
                          className={`page-item ${currentPage === page ? 'active' : ''}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Sau
                        </button>
                      </li>
                    </ul>
                    <div className="text-center">
                      Trang {currentPage} / {totalPages}
                    </div>
                  </nav>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;