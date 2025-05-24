import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const emailFromURL = searchParams.get('email');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password_confirmation, setPasswordConfirmation] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (emailFromURL) {
      setEmail(emailFromURL);
    }
  }, [emailFromURL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.get('http://localhost/sanctum/csrf-cookie', { withCredentials: true });

      const response = await axios.post('http://localhost/api/reset-password', {
        token,
        email,
        password,
        password_confirmation,
      }, {
        withCredentials: true,
      });

      setStatus(' Mật khẩu đã được đặt lại!');
    } catch (error) {
      setStatus('Có lỗi: ' + (error.response?.data.message || error.message));
    }
  };

  return (
    <div className="box">
      <div className="title">
        <h3>Đặt lại mật khẩu</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Email</label>
          <input type="email" className="form-control" value={email} readOnly />
        </div>
        <div className="mb-3">
          <label>Mật khẩu mới</label>
          <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Xác nhận lại</label>
          <input type="password" className="form-control" value={password_confirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary">Đặt lại</button>
        {status && <p>{status}</p>}
      </form>
    </div>
  );
};

export default ResetPassword;
