import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FlashMessage from './FlashMessage';
import Header from './Header';
import Slider from './Slider';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [flashMessage, setFlashMessage] = useState({ type: '', message: '' });
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }

    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setFlashMessage({ type: 'error', message: 'Vui lòng đăng nhập để xem hồ sơ.' });
        setTimeout(() => navigate('/login'), 3000);
        return false;
      }
      return true;
    };

    if (!checkAuth()) return;

    const fetchUser = async () => {
      if (isFetching) return;
      setIsFetching(true);
      try {
        const token = localStorage.getItem('token');
        const config = {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        };
        const response = await axios.get('http://localhost/api/user', {
          ...config,
          signal: controller.signal,
        });
        const data = response.data;
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          console.log('User data:', data);
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        } else {
          throw new Error('Dữ liệu từ API trống hoặc không hợp lệ.');
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Request aborted');
        } else if (error.response && error.response.status === 401) {
          console.log('Unauthorized error:', error.response.data);
          setFlashMessage({ type: 'error', message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' });
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 3000);
        } else if (!storedUser) {
          console.log('Fetch user error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });
          setFlashMessage({
            type: 'error',
            message: error.response?.data?.message || error.message || 'Có lỗi xảy ra khi lấy thông tin hồ sơ.',
          });
        }
      } finally {
        setIsFetching(false);
      }
    };

    fetchUser();

    return () => {
      controller.abort();
    };
  }, [navigate]);

  if (!user || (Object.keys(user).length === 0 && !localStorage.getItem('user'))) return null;

  const avatarUrl =
    user.avatar && typeof user.avatar === 'string' && user.avatar.trim() !== ''
      ? `http://localhost/storage/avatars/${user.avatar}`
      : 'http://localhost/storage/avatars/default.png';

  const formattedRole = user.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'User';

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <div style={{ width: '245px', backgroundColor: '#f8f9fa' }}>
        <Slider />
      </div>
      <div className="flex-grow-1">
        <Header />
        <div className="p-4">
          <div className="container">
            <h2 className="mb-4">Hồ Sơ Người Dùng</h2>

            {flashMessage.message && (
              <FlashMessage
                type={flashMessage.type}
                message={flashMessage.message}
                setFlashMessage={setFlashMessage}
              />
            )}

            <div className="card shadow-sm border-0">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Thông Tin Cá Nhân</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 text-center">
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="img-fluid rounded-circle mb-3"
                      style={{ maxWidth: '150px', height: 'auto', border: '2px solid #e9ecef' }}
                      onError={(e) => {
                        if (e.target.src !== 'http://localhost/storage/avatars/default.png') {
                          e.target.src = 'http://localhost/storage/avatars/default.png';
                        }
                      }}
                    />
                  </div>
                  <div className="col-md-9">
                    <p><strong>Tên người dùng:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Vai trò:</strong> {formattedRole}</p>
                    <p><strong>Số điện thoại:</strong> {user.phone || 'Chưa cập nhật'}</p>
                    <p><strong>Thành phố:</strong> {user.city || 'Chưa cập nhật'}</p>
                    <p><strong>Giới thiệu:</strong> {user.bio || 'Chưa cập nhật'}</p>
                    <p><strong>Ngày đăng ký:</strong> {new Date(user.created_at).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
              </div>
              <div className="card-footer text-end">
                <button className="btn btn-primary me-2" onClick={() => navigate('/editProfile')}>
                  Chỉnh Sửa Hồ Sơ
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/goals')}>
                  Quản Lý Mục Tiêu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;