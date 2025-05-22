import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPasswordRequest = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
        withCredentials: true,
      });

      const response = await axios.post('http://127.0.0.1:8000/api/forgot-password', {
        email,
      }, {
        withCredentials: true,
      });

      // setStatus('Email đã được gửi. Vui lòng kiểm tra hộp thư của bạn.');
      toast.success('Email khôi phục mật khẩu đã được gửi!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      const errorMessage = error.response?.data.message || error.message;
      // setStatus('Gửi thất bại: ' + errorMessage);
      toast.error('Gửi thất bại: ' + errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="box">
      <div className="title">
        <h3>Quên mật khẩu</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email của bạn</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Gửi yêu cầu</button>
        {/* {status && <p style={{ marginTop: '10px' }}>{status}</p>} */}
      </form>
      <ToastContainer />
    </div>
  );
};

export default ForgotPasswordRequest;