import React, { useState } from 'react';
import axios from 'axios';

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

      setStatus('Email đã được gửi. Vui lòng kiểm tra hộp thư của bạn.');
    } catch (error) {
      setStatus(' Gửi thất bại: ' + (error.response?.data.message || error.message));
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
        {status && <p style={{ marginTop: '10px' }}>{status}</p>}
      </form>
    </div>
  );
};

export default ForgotPasswordRequest;
