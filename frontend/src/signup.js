import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SignupForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [role, setRole] = useState('');

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu và xác nhận mật khẩu không khớp.');
      return;
    }

    try {
      await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
        withCredentials: true,
      });

      const response = await axios.post(
        'http://127.0.0.1:8000/api/signup',
        {
          username,
          email,
          password,
          password_confirmation: confirmPassword,
          role,
        },
        {
          withCredentials: true,
        }
      );

      // Hiển thị toast thành công với nút chuyển trang
      toast.success(
        <div>
          Đăng ký thành công!<br />
          <button
            onClick={() => {
              toast.dismiss();
              navigate('/');
            }}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              backgroundColor: '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Chuyển đến đăng nhập
          </button>
        </div>,
        {
          position: 'top-right',
          autoClose: false,
          closeOnClick: false,
          pauseOnHover: true
        }
      );

      console.log('Đăng ký thành công:', response.data);
    } catch (error) {
      console.error('Lỗi đăng ký:', error.response?.data || error.message);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstKey = Object.keys(errors)[0];
        setErrorMessage(errors[firstKey][0]);
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        toast.error('Đăng ký thất bại!', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    }
  };

  return (
    <div className="box">
      <div className="title">
        <h3>Đăng Ký</h3>
      </div>

      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <form onSubmit={handleSignUp}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Nhập tên Người Dùng</label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

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

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">Nhập lại Password</label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="role" className="form-label">Chọn vai trò</label>
          <select
            className="form-select"
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">-- Chọn vai trò --</option>
            <option value="user">Người dùng</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary">Đăng Ký</button>
        <br />
        <p>Đã có tài khoản?</p>
        <Link to="/">Đăng Nhập</Link>
      </form>

      <ToastContainer />
    </div>
  );
}

export default SignupForm;
