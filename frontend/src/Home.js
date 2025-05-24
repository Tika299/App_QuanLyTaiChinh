import React, { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Chart from 'react-apexcharts';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import Slider from './Slider';
import Header from './Header';

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

    // Cấu hình biểu đồ ApexCharts
    const chartOptions = {
        chart: {
            height: 400,
            type: 'line',
            zoom: { enabled: false },
            toolbar: { show: false },
        },
        dataLabels: { enabled: false },
        stroke: {
            curve: 'smooth',
            width: 4,
        },
        colors: ['#10B981', '#EF4444'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 90, 100],
            },
        },
        markers: {
            size: 6,
            hover: {
                size: 12,
            },
            colors: ['#ffffff'],
            strokeColors: ['#10B981', '#EF4444'],
            strokeWidth: 3,
        },
        title: {
            text: `Thu nhập & Chi tiêu ${timeFrame === 'week' ? 'Hàng tuần' : 'Hàng tháng'}`,
            align: 'left',
            style: {
                fontSize: '22px',
                fontWeight: '700',
                fontFamily: 'Helvetica, sans-serif',
                color: '#1a1a1a',
            },
        },
        grid: {
            show: true,
            borderColor: '#e5e7eb',
            xaxis: {
                lines: {
                    show: false,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        xaxis: {
            categories: financeData.labels,
            labels: {
                style: {
                    fontSize: '12px',
                    fontFamily: 'Helvetica, sans-serif',
                    colors: '#555',
                },
            },
            title: {
                text: timeFrame === 'week' ? 'Tuần' : 'Tháng',
                style: {
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'Helvetica, sans-serif',
                    color: '#333',
                },
            },
        },
        yaxis: {
            labels: {
                formatter: (value) => `${value.toLocaleString()}₫`,
                style: {
                    fontSize: '12px',
                    fontFamily: 'Helvetica, sans-serif',
                    colors: '#555',
                },
            },
            title: {
                text: 'Số tiền (₫)',
                style: {
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'Helvetica, sans-serif',
                    color: '#333',
                },
            },
            min: 0,
        },
        tooltip: {
            style: {
                fontFamily: 'Helvetica, sans-serif',
            },
            y: {
                formatter: (value, { seriesIndex, dataPointIndex, w }) => {
                    return `${w.config.series[seriesIndex].name}: ${value.toLocaleString()}₫`;
                },
            },
            theme: 'dark',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
        },
        legend: {
            position: 'top',
            horizontalAlign: 'center',
            fontSize: '14px',
            fontFamily: 'Helvetica, sans-serif',
            fontWeight: '600',
            labels: { colors: '#333' },
        },
    };

    // Lấy dữ liệu từ API
    const fetchFinanceData = async (frame) => {
        try {
            await axios.get('http://localhost/sanctum/csrf-cookie', { withCredentials: true });
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Vui lòng đăng nhập lại.');
                navigate('/login');
                return;
            }

            const response = await axios.get(`http://localhost/api/finance?type=${frame}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('Raw API labels:', response.data.labels);

            // Format labels and sort them
            let labels = response.data.labels.map((label, index) => {
                if (frame === 'week') {
                    if (!label || !label.includes('-W')) {
                        console.warn(`Invalid label format at index ${index}: ${label}`);
                        return `Tuần Không Xác Định`;
                    }
                    const [year, weekNum] = label.split('-W');
                    const week = parseInt(weekNum, 10);
                    if (isNaN(week) || week < 1 || week > 53) {
                        console.warn(`Invalid week number at index ${index}: ${weekNum}`);
                        return `Tuần Không Hợp Lệ-${year}`;
                    }
                    return { label: `Tuần ${week}-${year}`, year, week };
                }
                return { label, year: 0, week: 0 };
            });

            // Sort labels for weekly data
            if (frame === 'week') {
                labels.sort((a, b) => {
                    if (a.label === 'Tuần Không Xác Định' || b.label === 'Tuần Không Xác Định') return 0;
                    return a.year - b.year || a.week - b.week;
                });
            }

            // Extract sorted labels
            const sortedLabels = labels.map(item => item.label);

            console.log('Formatted and sorted labels:', sortedLabels);

            setFinanceData({
                balance: response.data.income.reduce((sum, val) => sum + val, 0) - response.data.expenses.reduce((sum, val) => sum + val, 0),
                income: response.data.income.reduce((sum, val) => sum + val, 0),
                expenses: response.data.expenses.reduce((sum, val) => sum + val, 0),
                series: [
                    { name: 'Thu nhập', data: response.data.income },
                    { name: 'Chi tiêu', data: response.data.expenses },
                ],
                labels: sortedLabels,
            });
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu: ' + (error.response?.data?.message || error.message));
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
                                <Chart
                                    options={chartOptions}
                                    series={financeData.series}
                                    type="line"
                                    height={400}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
