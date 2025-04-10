import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import Chart from 'react-apexcharts'; // Import Chart từ react-apexcharts

function Home() {
    // Khai báo state cho biểu đồ trong App
    const [state, setState] = useState({
        series: [
            {
                name: 'Desktops',
                data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
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
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
            },
        },
    });

    return (
        <div className="d-flex">
            <div
                className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark"
                style={{ width: 280 }}
            >
                <a
                    href="/"
                    className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
                >
                    <svg className="bi me-2" width={40} height={32}>
                        <use xlinkHref="#bootstrap" />
                    </svg>
                    <span className="fs-4">Sidebar</span>
                </a>
                <hr />
                <ul className="nav nav-pills flex-column mb-auto">
                    <li className="nav-item">
                        <a href="#" className="nav-link active" aria-current="page">
                            <svg className="bi me-2" width={16} height={16}>
                                <use xlinkHref="#home" />
                            </svg>
                            Home
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-link text-white">
                            <svg className="bi me-2" width={16} height={16}>
                                <use xlinkHref="#speedometer2" />
                            </svg>
                            Dashboard
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-link text-white">
                            <svg className="bi me-2" width={16} height={16}>
                                <use xlinkHref="#table" />
                            </svg>
                            Orders
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-link text-white">
                            <svg className="bi me-2" width={16} height={16}>
                                <use xlinkHref="#grid" />
                            </svg>
                            Products
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-link text-white">
                            <svg className="bi me-2" width={16} height={16}>
                                <use xlinkHref="#people-circle" />
                            </svg>
                            Customers
                        </a>
                    </li>
                </ul>
                <hr />
                <div className="dropdown">
                    <a
                        href="#"
                        className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
                        id="dropdownUser1"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <img
                            src="https://github.com/mdo.png"
                            alt=""
                            width={32}
                            height={32}
                            className="rounded-circle me-2"
                        />
                        <strong>mdo</strong>
                    </a>
                    <ul
                        className="dropdown-menu dropdown-menu-dark text-small shadow"
                        aria-labelledby="dropdownUser1"
                    >
                        <li>
                            <a className="dropdown-item" href="#">
                                New project...
                            </a>
                        </li>
                        <li>
                            <a className="dropdown-item" href="#">
                                Settings
                            </a>
                        </li>
                        <li>
                            <a className="dropdown-item" href="#">
                                Profile
                            </a>
                        </li>
                        <li>
                            <hr className="dropdown-divider" />
                        </li>
                        <li>
                            <a className="dropdown-item" href="#">
                                Sign out
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className='wapper'>
                <header className="">
                    <nav className="navbar navbar-light bg-light">
                        <div className="container-fluid">
                            <a className="navbar-brand" href="#">
                                <img
                                    src="/docs/5.0/assets/brand/bootstrap-logo.svg"
                                    alt=""
                                    width={40}
                                    height={34}
                                />
                            </a>
                            <form className="d-flex">
                                <input
                                    className="form-control me-2"
                                    type="search"
                                    placeholder="Search"
                                    aria-label="Search"
                                />
                                <button className="btn btn-outline-success" type="submit">
                                    Search
                                </button>
                            </form>
                            <div className="my-css">
                                <button
                                    className="navbar-toggler"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#navbarNavDropdown"
                                    aria-controls="navbarNavDropdown"
                                    aria-expanded="false"
                                    aria-label="Toggle navigation"
                                >
                                    <span className="navbar-toggler-icon" />
                                </button>
                            </div>
                        </div>
                    </nav>
                </header>
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