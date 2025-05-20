import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FlashMessage from './FlashMessage';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    city: '',
    bio: '',
    avatar: null,
  });
  const [errors, setErrors] = useState({});
  const [flashMessage, setFlashMessage] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/user', { withCredentials: true });
        const user = response.data;
        setFormData({
          username: user.username || '',
          email: user.email || '',
          phone: user.phone || '',
          city: user.city || '',
          bio: user.bio || '',
          avatar: null,
        });
      } catch (error) {
        setFlashMessage({ type: 'error', message: 'Vui lòng đăng nhập để chỉnh sửa hồ sơ.' });
        setTimeout(() => navigate('/login'), 3000);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('city', formData.city);
    data.append('bio', formData.bio);
    if (formData.avatar) {
      data.append('avatar', formData.avatar);
    }
    data.append('_method', 'PUT');

    try {
      const response = await axios.post('http://localhost:8000/api/user', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      setFlashMessage({ type: 'success', message: response.data.message });
      setErrors({});
      setTimeout(() => navigate('/profile'), 3000);
    } catch (error) {
      console.error('Update profile error:', error.response ? error.response.data : error.message);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        setFlashMessage({ type: 'error', message: 'Vui lòng kiểm tra các trường nhập.' });
      } else {
        setFlashMessage({ type: 'error', message: error.response?.data?.error || 'Có lỗi xảy ra khi cập nhật hồ sơ.' });
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Chỉnh Sửa Hồ Sơ</h2>

      {flashMessage.message && (
        <FlashMessage type={flashMessage.type} message={flashMessage.message} setFlashMessage={setFlashMessage} />
      )}

      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Cập Nhật Thông Tin</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-8">
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Tên người dùng:</label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    className="form-control"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  {errors.username && <span className="text-danger">{errors.username[0]}</span>}
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email:</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && <span className="text-danger">{errors.email[0]}</span>}
                </div>
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Số điện thoại:</label>
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="VD: 0123456789"
                  />
                  {errors.phone && <span className="text-danger">{errors.phone[0]}</span>}
                </div>
                <div className="mb-3">
                  <label htmlFor="city" className="form-label">Thành phố:</label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    className="form-control"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="VD: Hà Nội"
                  />
                  {errors.city && <span className="text-danger">{errors.city[0]}</span>}
                </div>
                <div className="mb-3">
                  <label htmlFor="bio" className="form-label">Giới thiệu:</label>
                  <textarea
                    name="bio"
                    id="bio"
                    className="form-control"
                    rows="4"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Giới thiệu về bạn..."
                  />
                  {errors.bio && <span className="text-danger">{errors.bio[0]}</span>}
                </div>
              </div>
              <div className="col-md-4 text-center">
                <div className="mb-3">
                  <label htmlFor="avatar" className="form-label">Ảnh đại diện:</label>
                  <img
                    src={formData.avatar ? URL.createObjectURL(formData.avatar) : (formData.avatar !== 'default.png' ? `http://localhost:8000/storage/${formData.avatar}` : '/images/default-avatar.png')}
                    alt="Avatar"
                    className="img-fluid rounded-circle mb-3"
                    style={{ maxWidth: '150px', height: 'auto' }}
                  />
                  <input
                    type="file"
                    name="avatar"
                    id="avatar"
                    className="form-control"
                    onChange={handleChange}
                    accept="image/*"
                  />
                  {errors.avatar && <span className="text-danger">{errors.avatar[0]}</span>}
                </div>
              </div>
            </div>
            <div className="text-end">
              <button type="submit" className="btn btn-primary me-2">Cập Nhật</button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/profile')}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;