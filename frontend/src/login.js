import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // Xử lý nhập email và giới hạn ký tự
    const handleEmailChange = (e) => {
        const input = e.target.value;
        if (input.length > 100) {
            toast.error("Email không được vượt quá 100 ký tự", {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }
        setEmail(input);
    };

    // Xử lý nhập password và giới hạn ký tự
    const handlePasswordChange = (e) => {
        const input = e.target.value;
        if (input.length > 50) {
            toast.error("Mật khẩu không được vượt quá 50 ký tự", {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }
        setPassword(input);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Email không hợp lệ");
            toast.error("Email không hợp lệ", {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            toast.error("Mật khẩu phải có ít nhất 6 ký tự", {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        try {
            await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
                withCredentials: true,
            });

            const response = await axios.post(
                'http://127.0.0.1:8000/api/login',
                { email, password },
                { withCredentials: true }
            );

            console.log('Đăng nhập thành công:', response.data);
            localStorage.setItem('token', response.data.token);

            toast.success('Đăng nhập thành công!', {
                position: 'top-right',
                autoClose: 3000,
            });

            setTimeout(() => {
                navigate('/Home');
            }, 500);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;

            if (!error.response) {
                setError("Không thể kết nối tới máy chủ. Vui lòng thử lại sau.");
                toast.error("Không thể kết nối tới máy chủ. Vui lòng thử lại sau.", {
                    position: 'top-right',
                    autoClose: 3000,
                });
            } else if (errorMessage.includes("These credentials do not match our records")) {
                setError("Email hoặc mật khẩu không đúng");
                toast.error("Email hoặc mật khẩu không đúng", {
                    position: 'top-right',
                    autoClose: 3000,
                });
            } else if (errorMessage.includes("Email chưa được xác thực")) {
                setError("Tài khoản chưa được xác thực. Vui lòng kiểm tra email.");
                toast.error("Tài khoản chưa được xác thực. Vui lòng kiểm tra email.", {
                    position: 'top-right',
                    autoClose: 3000,
                });
            } else {
                setError(errorMessage || 'Đăng nhập thất bại');
                toast.error('Gửi thất bại: ' + errorMessage, {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        }
    };

    return (
        <div className="box">
            <div className="title">
                <h3>Đăng Nhập</h3>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                    />
                </div>

                <div className="mb-3 form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                        Ghi nhớ tôi
                    </label>
                </div>

                <div className="mb-3">
                    <Link to="/password-request">Quên mật khẩu?</Link>
                </div>

                <button type="submit" className="btn btn-primary">Đăng nhập</button>
                <br />
                <p>Chưa có tài khoản?</p>
                <Link to="/signup">Đăng ký</Link>
            </form>

            <ToastContainer />
        </div>
    );
};

export default LoginForm;
