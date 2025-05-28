import React, { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import Slider from './Slider';
import Header from './Header';

// Register Chart.js components
ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
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

function Home() {
  const [financeData, setFinanceData] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    series: [
      { name: 'Thu nhập', data: [] },
      { name: 'Chi tiêu', data: [] },
    ],
    labels: [],
  });
  const [timeFrame, setTimeFrame] = useState('week');
  const location = useLocation();
  const navigate = useNavigate();

  // Hàm định dạng nhãn tuần
  const formatWeekLabel = (label) => {
    if (!label) return 'Không xác định';
    if (label.includes('-W')) {
      const [year, week] = label.split('-W');
      const weekNumber = parseInt(week, 10);
      if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 53) {
        return `Tuần không hợp lệ-${year}`;
      }
      return `Tuần ${weekNumber}-${year}`;
    }
    return label;
  };

  // Lấy dữ liệu từ API và lọc chỉ năm hiện tại (2025)
  const fetchFinanceData = async (frame) => {
    try {
      await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', { withCredentials: true });
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }

      const response = await axios.get(`http://127.0.0.1:8000/api/finance?type=${frame}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache' // Ngăn cache để đảm bảo dữ liệu mới
        },
      });

      console.log('Raw API labels:', response.data.labels);
      console.log('Raw API income:', response.data.income);
      console.log('Raw API expenses:', response.data.expenses);

      // Lấy năm hiện tại (2025)
      const currentYear = 2025;

      // Format và lọc labels chỉ giữ năm 2025
      let labels = response.data.labels.map((label, index) => {
        if (frame === 'week') {
          if (!label || !label.includes('-W')) {
            console.warn(`Invalid label format at index ${index}: ${label}`);
            return null;
          }
          const [year, weekNum] = label.split('-W');
          const yearNum = parseInt(year, 10);
          const week = parseInt(weekNum, 10);
          if (isNaN(yearNum) || isNaN(week) || week < 1 || week > 53) {
            console.warn(`Invalid year or week number at index ${index}: ${year}-${weekNum}`);
            return null;
          }
          return yearNum === currentYear ? { label: formatWeekLabel(label), rawLabel: label, year: yearNum, week } : null;
        } else { // month
          if (!label || !label.match(/^\d{4}-\d{2}$/)) {
            console.warn(`Invalid month format at index ${index}: ${label}`);
            return null;
          }
          const [year, month] = label.split('-');
          const yearNum = parseInt(year, 10);
          const monthNum = parseInt(month, 10);
          if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
            console.warn(`Invalid year or month at index ${index}: ${year}-${month}`);
            return null;
          }
          return yearNum === currentYear ? { label, rawLabel: label, year: yearNum, month: monthNum } : null;
        }
      }).filter(item => item !== null);

      // Sắp xếp labels
      if (frame === 'week') {
        labels.sort((a, b) => a.week - b.week);
      } else {
        labels.sort((a, b) => a.month - b.month);
      }

      // Lọc dữ liệu tương ứng với nhãn đã sắp xếp
      const filteredIncome = labels.map(item =>
        response.data.income[response.data.labels.indexOf(item.rawLabel)] || 0
      );
      const filteredExpenses = labels.map(item =>
        response.data.expenses[response.data.labels.indexOf(item.rawLabel)] || 0
      );

      // Extract sorted and formatted labels
      const sortedLabels = labels.map(item => item.label);

      console.log('Filtered and sorted labels for 2025:', sortedLabels);
      console.log('Filtered income:', filteredIncome);
      console.log('Filtered expenses:', filteredExpenses);

      setFinanceData({
        balance: filteredIncome.reduce((sum, val) => sum + val, 0) - filteredExpenses.reduce((sum, val) => sum + val, 0),
        income: filteredIncome.reduce((sum, val) => sum + val, 0),
        expenses: filteredExpenses.reduce((sum, val) => sum + val, 0),
        series: [
          { name: 'Thu nhập', data: filteredIncome },
          { name: 'Chi tiêu', data: filteredExpenses },
        ],
        labels: sortedLabels,
      });
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu: ' + (error.response?.data?.message || error.message));
      console.error('Fetch error:', error);
      // Đặt giá trị mặc định nếu lỗi
      setFinanceData({
        balance: 0,
        income: 0,
        expenses: 0,
        series: [
          { name: 'Thu nhập', data: [] },
          { name: 'Chi tiêu', data: [] },
        ],
        labels: [],
      });
    }
  };

  // Fetch data on mount and when timeFrame changes
  useEffect(() => {
    fetchFinanceData(timeFrame);
  }, [timeFrame, navigate]);

  // Handle refresh query parameter
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('refresh') === 'true') {
      fetchFinanceData(timeFrame);
      navigate('/Home', { replace: true }); // Clear query parameter
    }
  }, [location.search, timeFrame, navigate]);

  // Dữ liệu biểu đồ Line Chart (tương tự Dashboard)
  const lineChartData = {
    labels: financeData.labels,
    datasets: [
      {
        label: 'Thu nhập',
        data: financeData.series[0].data,
        borderColor: 'rgba(16, 185, 129, 1)', // Màu xanh emerald
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
        data: financeData.series[1].data,
        borderColor: 'rgba(239, 68, 68, 1)', // Màu đỏ
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

  // Tùy chọn biểu đồ (tương tự Dashboard)
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 14, family: 'Helvetica, sans-serif', weight: '600' },
          color: '#333',
        },
      },
      title: {
        display: true,
        text: `Thu nhập & Chi tiêu ${timeFrame === 'week' ? 'Hàng tuần' : 'Hàng tháng'}`,
        font: { size: 22, family: 'Helvetica, sans-serif', weight: '700' },
        color: '#1a1a1a',
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleFont: { size: 14, family: 'Helvetica, sans-serif', weight: 'bold' },
        bodyFont: { size: 12, family: 'Helvetica, sans-serif' },
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y.toLocaleString()}₫`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value.toLocaleString()}₫`,
          font: { size: 12, family: 'Helvetica, sans-serif' },
          color: '#555',
        },
        title: {
          display: true,
          text: 'Số tiền (₫)',
          font: { size: 14, family: 'Helvetica, sans-serif', weight: '600' },
          color: '#333',
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 12, family: 'Helvetica, sans-serif' },
          color: '#555',
        },
        title: {
          display: true,
          text: timeFrame === 'week' ? 'Tuần' : 'Tháng',
          font: { size: 14, family: 'Helvetica, sans-serif', weight: '600' },
          color: '#333',
        },
      },
    },
  };

  const handleFilter = (frame) => {
    setTimeFrame(frame);
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <div style={{ width: '245px', backgroundColor: '#f8f9fa' }}>
        <Slider />
      </div>
      <div className="flex-grow-1">
        <Header />
        <div className="p-4">
          <div className="row g-4 mb-4">
            <div className="col-md-4">
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
                        <AnimatedNumber value={financeData.balance} />
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
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
                      <h6 className="card-subtitle mb-2 text-white">Thu nhập</h6>
                      <h4 className="card-title mb-0 text-white">
                        <AnimatedNumber value={financeData.income} />
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
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
                      <h6 className="card-subtitle mb-2 text-white">Chi tiêu</h6>
                      <h4 className="card-title mb-0 text-white">
                        <AnimatedNumber value={financeData.expenses} />
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="card-title text-dark">Biểu đồ thu chi</h4>
                <div className="btn-group">
                  <button
                    type="button"
                    className={`btn btn-primary ${timeFrame === 'week' ? 'active' : ''}`}
                    onClick={() => handleFilter('week')}
                  >
                    Tuần
                  </button>
                  <button
                    type="button"
                    className={`btn btn-primary ${timeFrame === 'month' ? 'active' : ''}`}
                    onClick={() => handleFilter('month')}
                  >
                    Tháng
                  </button>
                </div>
              </div>
              <div style={{ width: '100%', height: '400px' }}>
                <Line data={lineChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;