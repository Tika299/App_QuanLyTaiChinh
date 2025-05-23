import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

function Slider() {
    const location = useLocation();
    const [userData, setUserData] = useState({ username: "User", role: null, avatar: null });
    const [error, setError] = useState(null);

    // Hàm lấy URL avatar
    const getAvatarUrl = (avatar) =>
        avatar && avatar !== 'null' && avatar !== 'undefined'
            ? `http://127.0.0.1:8000/storage/avatars/${avatar}`
            : 'http://127.0.0.1:8000/storage/avatars/default.png';

    // Hàm kiểm tra đường dẫn hiện tại để thêm class active
    const isActive = (path) =>
        location.pathname === path ? "nav-link active" : "nav-link text-white";

    // Lấy thông tin người dùng
    useEffect(() => {
        const fetchUserData = async () => {
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

                const response = await axios.get('http://127.0.0.1:8000/api/user', {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${token}` },
                });
                const roleName = response.data.roles?.[0]?.name || null;
                setUserData({
                    username: response.data.username || "User",
                    role: roleName,
                    avatar: response.data.avatar || null,
                });
            } catch (err) {
                setError('Không thể tải thông tin người dùng: ' + (err.response?.data?.message || err.message));
                setUserData({ username: "User", role: null, avatar: null });
                window.location.href = '/';
            }
        };

        fetchUserData();
    }, []);

    return (
        <div
            className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark"
            style={{ width: 245, height: '100%' }}
        >
            <Link
                to="/"
                className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
            >
                <svg className="bi me-2" width={40} height={32}>
                    <use xlinkHref="#bootstrap" />
                </svg>
                <span className="fs-4">Sidebar</span>
            </Link>
            <hr />
            <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item">
                    <Link to="/Home" className={isActive("/Home")}>
                        <svg className="bi me-2" width={16} height={16}>
                            <use xlinkHref="#home" />
                        </svg>
                        Home
                    </Link>
                </li>
                <li>
                    <Link to="/dashboard" className={isActive("/dashboard")}>
                        <svg className="bi me-2" width={16} height={16}>
                            <use xlinkHref="#speedometer2" />
                        </svg>
                        Dashboard
                    </Link>
                </li>
                <li>
                    <Link to="/transactions" className={isActive("/transactions")}>
                        <svg className="bi me-2" width={16} height={16}>
                            <use xlinkHref="#table" />
                        </svg>
                        Orders
                    </Link>
                </li>
                <li>
                    <Link to="/goals" className={isActive("/goals")}>
                        <svg className="bi me-2" width={16} height={16}>
                            <use xlinkHref="#grid" />
                        </svg>
                        Products
                    </Link>
                </li>
                <li>
                    <Link to="/products" className={isActive("/products")}>
                        <svg className="bi me-2" width={16} height={16}>
                            <use xlinkHref="#people-circle" />
                        </svg>
                        Customers
                    </Link>
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
                        src={getAvatarUrl(userData.avatar)}
                        alt={userData.username}
                        width={32}
                        height={32}
                        className="rounded-circle me-2"
                    />
                    <strong>{userData.username}</strong>
                </a>
                <ul
                    className="dropdown-menu dropdown-menu-dark text-small shadow"
                    aria-labelledby="dropdownUser1"
                >
                    <li>
                        <Link className="dropdown-item" to="/new-project">New project...</Link>
                    </li>
                    <li>
                        <Link className="dropdown-item" to="/settings">Settings</Link>
                    </li>
                    <li>
                        <Link className="dropdown-item" to="/profile">Profile</Link>
                    </li>
                    {userData.role === 'admin' && (
                        <li>
                            <Link className="dropdown-item" to="/userlist">UserList</Link>
                        </li>
                    )}
                    <li>
                        <hr className="dropdown-divider" />
                    </li>
                    <li>
                        <Link className="dropdown-item text-danger" to="/logout">Sign out</Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default Slider;