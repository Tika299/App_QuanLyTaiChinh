import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import Chart from 'react-apexcharts'; // Import Chart từ react-apexcharts
import Slider from './Slider';
import Header from './Header';

function Home() {
    // Khai báo state cho biểu đồ trong App
    const [state, setState] = useState({
        series: [
            {
                name: 'Desktops',
                data: [10, 41, 35, 51, 49, 62, 69],
            },
        ],
        options: {
            chart: {
                height: 350,
                type: 'line',
                zoom: {
                    enabled: false,
                },
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: 'straight',
            },
            title: {
                text: 'Product Trends by Month',
                align: 'left',
            },
            grid: {
                row: {
                    colors: ['#f3f3f3', 'transparent'],
                    opacity: 0.5,
                },
            },
            xaxis: {
                categories: ['Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sad', 'Sun'],
            },
        },
    });

    return (
        <div className="d-flex">
            {<Slider />}
            <div className='wapper'>
                {<Header />}
                <main className='d-flex'>
                    <div className='content'>
                        <div className='manage-money'>
                            <div className='box-money me-5'>
                                <h2>Số dư</h2>
                                <p>1000000đ</p>
                            </div>
                            <div className='box-money me-5'>
                                <h2 style={{ color: 'green' }}>Thu</h2>
                                <p>1000000đ</p>
                            </div>
                            <div className='box-money'>
                                <h2 style={{ color: 'red' }}>Chi</h2>
                                <p>1000000đ</p>
                            </div>
                        </div>
                        <div className='filter'>
                            <button type="button" class="btn my-btn me-3">Week</button>
                            <button type="button" class="btn my-btn">Month</button>
                        </div>
                        <div>
                            <div id="chart">
                                <Chart options={state.options} series={state.series} type="line" height={350} />
                            </div>
                            <div id="html-dist"></div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Home;