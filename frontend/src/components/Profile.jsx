import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FlashMessage from './FlashMessage';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [flashMessage, setFlashMessage] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/user', { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        setFlashMessage({ type: 'error', message: 'Vui lòng đăng nhập để xem hồ sơ.' });
        setTimeout(() => navigate('/login'), 3000);
      }
    };
    fetchUser();
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Hồ Sơ Người Dùng</h2>

      {flashMessage.message && (
        <FlashMessage type={flashMessage.type} message={flashMessage.message} setFlashMessage={setFlashMessage} />
      )}

      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Thông Tin Cá Nhân</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 text-center">
              <img
                src={user.avatar && user.avatar !== 'default.png' ? `http://localhost:8000/storage/${user.avatar}` : '/images/default-avatar.png'}
                alt="Avatar"
                className="img-fluid rounded-circle mb-3"
                style={{ maxWidth: '150px', height: 'auto', border: '2px solid #e9ecef' }}
              />
            </div>
            <div className="col-md-9">
              <p><strong>Tên người dùng:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Vai trò:</strong> {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}</p>
              <p><strong>Số điện thoại:</strong> {user.phone || 'Chưa cập nhật'}</p>
              <p><strong>Thành phố:</strong> {user.city || 'Chưa cập nhật'}</p>
              <p><strong>Giới thiệu:</strong> {user.bio || 'Chưa cập nhật'}</p>
              <p><strong>Ngày đăng ký:</strong> {new Date(user.created_at).toLocaleString('vi-VN')}</p>
            </div>
          </div>
        </div>
        <div className="card-footer text-end">
          <button className="btn btn-primary me-2" onClick={() => navigate('/profile/edit')}>
            Chỉnh Sửa Hồ Sơ
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/goals')}>
            Quản Lý Mục Tiêu
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;