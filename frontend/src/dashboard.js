import React, { useEffect, useRef } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
} from 'chart.js';
import Header from './Header';
import Slider from './Slider';

// Đăng ký các thành phần Chart.js
Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);

const Dashboard = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    const myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
        datasets: [
          {
            label: 'Thu nhập',
            data: [1200, 1900, 3000, 2500, 3200, 2800],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
          },
          {
            label: 'Chi tiêu',
            data: [200, 1900, 5000, 500, 200, 800],
            borderColor: 'rgba(231, 55, 0, 1)',
            backgroundColor: 'rgba(231, 55, 0, 0.2)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      myChart.destroy();
    };
  }, []);

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: '245px', backgroundColor: '#f8f9fa' }}>
        <Slider />
      </div>

      {/* Main content */}
      <div className="flex-grow-1">
        <Header />

        <div className="p-4">
          {/* Biểu đồ */}
          <h4>Biểu đồ thu chi</h4>
          <div style={{ width: '100%', maxWidth: '800px', height: '400px' }}>
            <canvas ref={chartRef}></canvas>
          </div>
          

          {/* Phân loại */}
          <h4 className="mt-5">Phân loại chi tiêu</h4>
          <div className="d-flex gap-3 mt-3 flex-wrap ">
            <div style={{ width: '200px', height: '100px', backgroundColor: 'red' }} className="rounded text-white d-flex align-items-center justify-content-center">
              Ăn uống
            </div>
            <div style={{ width: '200px', height: '100px', backgroundColor: 'orange' }} className="rounded text-white d-flex align-items-center justify-content-center">
              Giải trí
            </div>
            <div style={{ width: '200px', height: '100px', backgroundColor: 'green' }} className="rounded text-white d-flex align-items-center justify-content-center">
              Di chuyển
            </div>
            <div style={{ width: '200px', height: '100px', backgroundColor: 'blue' }} className="rounded text-white d-flex align-items-center justify-content-center">
              Khác
            </div>
          </div>

          {/* Lịch sử thu chi */}
          <div className="mt-5">
            <h4>Lịch sử thu/chi</h4>
            <table className="table table-bordered mt-3">
              <thead className="table-light">
                <tr>
                  <th>Ngày</th>
                  <th>Loại</th>
                  <th>Danh mục</th>
                  <th>Số tiền</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2025-04-01</td>
                  <td><span className="badge bg-success">Thu</span></td>
                  <td>Lương</td>
                  <td>3,000₫</td>
                  <td>Nhận lương tháng 4</td>
                </tr>
                <tr>
                  <td>2025-04-03</td>
                  <td><span className="badge bg-danger">Chi</span></td>
                  <td>Ăn uống</td>
                  <td>200₫</td>
                  <td>Cafe + ăn trưa</td>
                </tr>
                <tr>
                  <td>2025-04-05</td>
                  <td><span className="badge bg-danger">Chi</span></td>
                  <td>Giải trí</td>
                  <td>5,000₫</td>
                  <td>Mua vé concert</td>
                </tr>
                <tr>
                  <td>2025-04-06</td>
                  <td><span className="badge bg-success">Thu</span></td>
                  <td>Freelance</td>
                  <td>1,500₫</td>
                  <td>Dự án thiết kế web</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
