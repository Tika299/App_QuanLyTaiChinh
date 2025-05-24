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

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Kiểm tra trống
    if (!username || !email || !password || !confirmPassword) {
      toast.warn('Vui lòng điền đầy đủ thông tin.', { position: 'top-right' });
      return;
    }

    // Ràng buộc độ dài
    if (username.length > 50) {
      toast.warn('Tên người dùng không được vượt quá 50 ký tự.', { position: 'top-right' });
      return;
    }
    if (email.length > 100) {
      toast.warn('Email không được vượt quá 100 ký tự.', { position: 'top-right' });
      return;
    }
    if (password.length < 6) {
      toast.warn('Mật khẩu phải có ít nhất 6 ký tự.', { position: 'top-right' });
      return;
    }
    if (password.length > 100) {
      toast.warn('Mật khẩu không được vượt quá 100 ký tự.', { position: 'top-right' });
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu và xác nhận mật khẩu không khớp.', { position: 'top-right' });
      return;
    }

    try {
      await axios.get('http://localhost/sanctum/csrf-cookie', {
        withCredentials: true,
      });

      const response = await axios.post(
        'http://localhost/api/signup',
        {
          username,
          email,
          password,
          password_confirmation: confirmPassword,
          role: 'member', // Fixed to 'member' for public signup
        },
        { withCredentials: true }
      );

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
              cursor: 'pointer',
            }}
          >
            Chuyển đến đăng nhập
          </button>
        </div>,
        {
          position: 'top-right',
          autoClose: false,
          closeOnClick: false,
          pauseOnHover: true,
        }
      );
    } catch (error) {
      console.error('Lỗi đăng ký:', error.response?.data || error.message);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstKey = Object.keys(errors)[0];
        const message = errors[firstKey][0];

        let vietnameseMessage = message;
        if (message.includes('The email has already been taken')) {
          vietnameseMessage = 'Email đã được đăng ký.';
        } else if (message.includes('The username has already been taken')) {
          vietnameseMessage = 'Tên người dùng đã tồn tại.';
        }

        toast.error(vietnameseMessage, { position: 'top-right' });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message, { position: 'top-right' });
      } else {
        toast.error('Đăng ký thất bại!', { position: 'top-right' });
      }
    }
  };

  return (
    <div className="box">
      <div className="title">
        <h3>Đăng Ký</h3>
      </div>

      <form onSubmit={handleSignUp}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Tên người dùng</label>
          <input
            type="text"
            className="form-control"
            id="username"
            maxLength={50}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            maxLength={100}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Mật khẩu</label>
          <input
            type="password"
            className="form-control"
            id="password"
            maxLength={100}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">Nhập lại mật khẩu</label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            maxLength={100}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
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
