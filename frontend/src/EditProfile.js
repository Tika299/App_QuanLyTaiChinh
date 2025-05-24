import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FlashMessage from './FlashMessage';
import Header from './Header';
import Slider from './Slider';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    email: '',
    phone: '',
    city: '',
    bio: '',
    avatar: null,
  });
  const [userId, setUserId] = useState(null);
  const [errors, setErrors] = useState({});
  const [flashMessage, setFlashMessage] = useState({ type: '', message: '' });
  const [imageError, setImageError] = useState(false); // Theo dõi lỗi tải ảnh
  const [showConfirm, setShowConfirm] = useState(false); // State cho modal xác nhận
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
          withCredentials: true,
        });
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Vui lòng đăng nhập lại.');
        }
        const response = await axios.get('http://127.0.0.1:8000/api/user', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        const user = response.data;
        if (!user.username || !user.email) {
          throw new Error('Dữ liệu người dùng không đầy đủ.');
        }
        setUserId(user.id);
        setFormData({
          id: user.id,
          username: user.username || '',
          email: user.email || '',
          phone: user.phone || '',
          city: user.city || '',
          bio: user.bio || '',
          avatar: user.avatar || null,
        });
      } catch (error) {
        console.error('Fetch user error:', error.response ? error.response.data : error.message);
        setFlashMessage({ type: 'error', message: 'Vui lòng đăng nhập để chỉnh sửa hồ sơ.' });
        setTimeout(() => navigate('/login'), 3000);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleChange = useCallback((e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    console.log(`Updated ${name}:`, files ? files[0] : value);
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[name];
      return newErrors;
    });
    if (name === 'avatar' && files) {
      setImageError(false); // Reset lỗi khi chọn ảnh mới
    }
  }, []);

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true); // Hiển thị modal xác nhận
  };

  const handleSubmit = useCallback(
    async (confirmed) => {
      if (!confirmed) {
        setShowConfirm(false); // Đóng modal nếu không xác nhận
        return;
      }

      setShowConfirm(false); // Đóng modal sau khi xác nhận
      setErrors(null);

      try {
        const token = localStorage.getItem('token');
        if (!token || !userId) {
          throw new Error('Vui lòng đăng nhập lại.');
        }

        const formDataToSend = new FormData();
        if (formData.username !== '') formDataToSend.append('username', formData.username);
        if (formData.email !== '') formDataToSend.append('email', formData.email);
        if (formData.phone !== '') formDataToSend.append('phone', formData.phone);
        if (formData.city !== '') formDataToSend.append('city', formData.city);
        if (formData.bio !== '') formDataToSend.append('bio', formData.bio);
        if (formData.avatar instanceof File) {
          console.log('Avatar:', formData.avatar);
          formDataToSend.append('avatar', formData.avatar);
        }
        formDataToSend.append('_method', 'PUT');

        const config = {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        };

        console.log('Gửi yêu cầu: PUT /api/update/' + userId);
        console.log('FormData:', [...formDataToSend.entries()]);
        const response = await axios.post(`http://127.0.0.1:8000/api/update/${userId}`, formDataToSend, config);

        console.log('Phản hồi:', response.data);
        setFlashMessage({ type: 'success', message: response.data.message });
        setErrors({});
        setTimeout(() => navigate('/profile'), 3000);
      } catch (error) {
        console.error('Update profile error:', error.response ? error.response.data : error.message);
        if (error.response && error.response.data && error.response.data.errors) {
          console.log('Chi tiết lỗi:', error.response.data.errors);
          setErrors(error.response.data.errors);
          setFlashMessage({ type: 'error', message: 'Vui lòng kiểm tra các trường nhập.' });
        } else {
          setFlashMessage({ type: 'error', message: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.' });
        }
      }
    },
    [formData, userId, navigate]
  );

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <div style={{ width: '245px', backgroundColor: '#f8f9fa' }}>
        <Slider />
      </div>
      <div className="flex-grow-1">
        <Header />
        <div className="p-4">
          <div className="container">
            <h2 className="mb-4">Chỉnh Sửa Hồ Sơ</h2>

            {flashMessage.message && (
              <FlashMessage type={flashMessage.type} message={flashMessage.message} setFlashMessage={setFlashMessage} />
            )}

            <div className="card shadow-sm border-0">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Cập Nhật Thông Tin</h5>
              </div>
              <div className="card-body">
                {errors && (
                  <div className="alert alert-danger mb-3">
                    {Object.values(errors).flat().map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                )}
                <form onSubmit={handleConfirmSubmit} noValidate>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Tên người dùng:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      maxLength="50"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      maxLength="100"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Số điện thoại:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="VD: 0987654321"
                      maxLength="20"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="city" className="form-label">Thành phố:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="VD: Hà Nội"
                      maxLength="255"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="bio" className="form-label">Giới thiệu:</label>
                    <textarea
                      className="form-control"
                      id="bio"
                      name="bio"
                      rows="4"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Giới thiệu về bạn..."
                      maxLength="1000"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="avatar" className="form-label">Ảnh đại diện:</label>
                    {formData.avatar && typeof formData.avatar === 'string' && formData.avatar.trim() !== '' && !imageError ? (
                      <div className="mb-2">
                        <img
                          src={`http://127.0.0.1:8000/storage/avatars/${formData.avatar}`}
                          alt="Avatar hiện tại"
                          className="img-fluid rounded"
                          style={{ maxWidth: '150px', maxHeight: '150px', border: '2px solid #e9ecef' }}
                          onError={() => setImageError(true)}
                        />
                        {!imageError && <p className="text-muted mt-1">Tên ảnh: {formData.avatar}</p>}
                      </div>
                    ) : (
                      <p className="text-muted mb-2">Chưa có ảnh đại diện.</p>
                    )}
                    <input
                      type="file"
                      className="form-control"
                      id="avatar"
                      name="avatar"
                      accept="image/*"
                      onChange={handleChange}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">Cập Nhật</button>
                </form>
              </div>
            </div>

            {/* Modal xác nhận */}
            {showConfirm && (
              <div className="modal" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Xác nhận cập nhật</h5>
                      <button type="button" className="btn-close" onClick={() => setShowConfirm(false)}></button>
                    </div>
                    <div className="modal-body">
                      <p>Bạn có chắc muốn cập nhật thông tin hồ sơ không?</p>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                        Hủy
                      </button>
                      <button type="button" className="btn btn-primary" onClick={() => handleSubmit(true)}>
                        Xác nhận
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;