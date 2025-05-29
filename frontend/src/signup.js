import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Hàm chuyển đổi full-width sang half-width
const normalizeToHalfWidth = (value) => {
  if (!value) return value;
  const fullWidthMap = {
    '０': '0',
    '１': '1',
    '２': '2',
    '３': '3',
    '４': '4',
    '５': '5',
    '６': '6',
    '７': '7',
    '８': '8',
    '９': '9',
  };
  return value.replace(/[０-９]/g, (match) => fullWidthMap[match]);
};

function SignupForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  // Xử lý nhập username và giới hạn ký tự
  const handleUsernameChange = (e) => {
    const input = normalizeToHalfWidth(e.target.value); // Chuẩn hóa full-width
    if (input.length > 50) {
      toast.error('Tên người dùng không được vượt quá 50 ký tự.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    setUsername(input);
  };

  // Xử lý nhập email và giới hạn ký tự
  const handleEmailChange = (e) => {
    const input = normalizeToHalfWidth(e.target.value); // Chuẩn hóa full-width
    if (input.length > 100) {
      toast.error('Email không được vượt quá 100 ký tự.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    setEmail(input);
  };

  // Xử lý nhập password và giới hạn ký tự
  const handlePasswordChange = (e) => {
    const input = e.target.value; // Không chuẩn hóa để giữ nguyên ký tự
    if (input.length > 50) {
      toast.error('Mật khẩu không được vượt quá 50 ký tự.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    setPassword(input);
  };

  // Xử lý nhập confirm password và giới hạn ký tự
  const handleConfirmPasswordChange = (e) => {
    const input = e.target.value; // Không chuẩn hóa để giữ nguyên ký tự
    if (input.length > 50) {
      toast.error('Xác nhận mật khẩu không được vượt quá 50 ký tự.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    setConfirmPassword(input);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Kiểm tra trống
    if (!username || !email || !password || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email không hợp lệ', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    // Kiểm tra mật khẩu và xác nhận mật khẩu
    if (password !== confirmPassword) {
      toast.error('Mật khẩu và xác nhận mật khẩu không khớp.', {
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
        'http://127.0.0.1:8000/api/signup',
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

        toast.error(vietnameseMessage, { position: 'top-right', autoClose: 3000 });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message, { position: 'top-right', autoClose: 3000 });
      } else {
        toast.error('Đăng ký thất bại!', { position: 'top-right', autoClose: 3000 });
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
            value={username}
            onChange={handleUsernameChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
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
          <label htmlFor="password" className="form-label">Mật khẩu</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">Nhập lại mật khẩu</label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
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