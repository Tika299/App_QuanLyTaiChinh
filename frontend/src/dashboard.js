import React, { useState, useEffect } from 'react';
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
  });
  const [compareData, setCompareData] = useState(null);
  const [selectedPeriods, setSelectedPeriods] = useState({
    period1: '',
    period2: '',
    type: 'month',
  });
  const [error, setError] = useState(null);

  // Hàm lấy dữ liệu từ API
  const fetchFinanceData = async (frame) => {
    try {
      await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
        withCredentials: true,
      });

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập lại.');
        window.location.href = '/';
        return;
      }

      const response = await axios.get(`http://127.0.0.1:8000/api/finance?type=${frame}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });

      setFinanceData(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu tài chính: ' + (err.response?.data?.message || err.message));
      setFinanceData({ income: [], expenses: [], categories: [], transactions: [] });
    }
  };

  // Hàm so sánh hai khoảng thời gian
  const comparePeriods = async () => {
    if (!selectedPeriods.period1 || !selectedPeriods.period2) {
      setError('Vui lòng chọn cả hai khoảng thời gian.');
      return;
    }

    try {
      await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
        withCredentials: true,
      });

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập lại.');
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

      setCompareData(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể so sánh: ' + (err.response?.data?.message || err.message));
      setCompareData(null);
    }
  };

  // Tải dữ liệu khi timeFrame thay đổi
  useEffect(() => {
    fetchFinanceData(timeFrame);
  }, [timeFrame]);

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

  // Dữ liệu biểu đồ Pie Chart (danh mục)
  const pieChartData = {
    labels: financeData.categories.map((cat) => cat.name),
    datasets: [
      {
        data: financeData.categories.map((cat) => cat.value),
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
        text:
          timeFrame === 'week'
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
          label: (context) => `${context.label}: ${context.parsed}₫ (${context.dataset.data[context.dataIndex] / context.dataset.data.reduce((a, b) => a + b, 0) * 100}%)`,
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

  // Tùy chọn dropdown so sánh
  const periodOptions = {
    month: financeData.income.map((_, i) => ({ value: `2025-${i + 1}`, label: `Tháng ${i + 1}` })),
    week: financeData.income.map((_, i) => ({ value: `week-${i + 1}`, label: `Tuần ${i + 1}` })),
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
          {/* Error Message */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

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
                      onChange={(e) => setTimeFrame(e.target.value)}
                    >
                      <option value="week">Tuần</option>
                      <option value="month">Tháng</option>
                      <option value="year">Năm</option>
                    </select>
                  </div>
                  <div style={{ width: '100%', height: '400px' }}>
                    <Line data={lineChartData} options={chartOptions} />
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
              {financeData.categories.map((category) => (
                <div key={category.name} className="col-md-3 col-sm-6">
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
                        <p className="card-text mb-0">{category.percent}%</p>
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
                      {financeData.transactions.map((row, index) => (
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
                          <td className="px-4 py-3">{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;