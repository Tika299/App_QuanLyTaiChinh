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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
                withCredentials: true,
            });

            const response = await axios.post(
                'http://127.0.0.1:8000/api/login',
                {
                    email,
                    password,
                },
                {
                    withCredentials: true,
                }
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
            setError(error.response?.data?.message || 'Đăng nhập thất bại');
            const errorMessage = error.response?.data.message || error.message;
            toast.error('Gửi thất bại: ' + errorMessage, {
                position: 'top-right',
                autoClose: 3000,
            });
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
                        onChange={(e) => setEmail(e.target.value)}
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
                        onChange={(e) => setPassword(e.target.value)}
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
                <button type="submit" className="btn btn-primary">
                    Đăng nhập
                </button>
                <br />
                <p>Chưa có tài khoản?</p>
                <Link to="/signup">Đăng ký</Link>
            </form>

            <ToastContainer />
        </div>
    );
};

export default LoginForm;
