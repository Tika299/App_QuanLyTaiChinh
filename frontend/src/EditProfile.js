import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Header';
import Slider from './Slider';

const normalizeToHalfWidth = (value) => {
  if (!value) return value;
  const fullWidthMap = {
    '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
    '５': '5', '６': '6', '７': '7', '８': '8', '９': '9',
  };
  return value.replace(/[０-９]/g, (match) => fullWidthMap[match]);
};

const EditProfile = () => {
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    email: '',
    phone: '',
    city: '',
    bio: '',
    avatar: null,
    current_avatar: null,
    reset_avatar: false,
    updated_at: '',
  });
  const [userId, setUserId] = useState(null);
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const getAvatarUrl = useCallback((avatar) => {
    if (!avatar || avatar === 'null' || avatar === 'undefined') {
      return 'http://127.0.0.1:8000/storage/avatars/default.png';
    }
    const cleanAvatar = avatar.split('?')[0];
    return `http://127.0.0.1:8000/storage/avatars/${cleanAvatar}?t=${Date.now()}`;
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', { withCredentials: true });
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
          phone: normalizeToHalfWidth(user.phone) || '',
          city: user.city || '',
          bio: user.bio || '',
          avatar: null,
          current_avatar: user.avatar || null,
          reset_avatar: false,
          updated_at: user.updated_at || '',
        });
        console.log('Fetched user data:', user);
      } catch (error) {
        console.error('Fetch user error:', error.response ? error.response.data : error.message);
        toast.error('Vui lòng đăng nhập để chỉnh sửa hồ sơ.', { position: 'top-right', autoClose: 3000 });
        setTimeout(() => navigate('/login'), 3000);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleChange = useCallback((e) => {
    const { name, value, files } = e.target;
    const normalizedValue = name === 'phone' ? normalizeToHalfWidth(value) : value;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : normalizedValue,
      reset_avatar: name === 'avatar' && files ? false : prev.reset_avatar,
    }));
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[name];
      return newErrors;
    });
    if (name === 'avatar' && files) {
      setImageError(false);
    }
  }, []);

  const handleResetAvatar = useCallback(() => {
    if (window.confirm('Bạn có chắc muốn đặt lại ảnh đại diện về mặc định?')) {
      setFormData((prev) => ({
        ...prev,
        avatar: null,
        reset_avatar: true,
      }));
      setImageError(false);
      handleSubmit(true);
    }
  }, []);

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleSubmit = useCallback(
    async (confirmed) => {
      if (!confirmed) {
        setShowConfirm(false);
        return;
      }

      setShowConfirm(false);
      setErrors({});

      // Kiểm tra xem dữ liệu có thay đổi ở tab khác không khi nhấn Lưu
      const storedData = localStorage.getItem('userUpdated');
      if (storedData) {
        const updatedData = JSON.parse(storedData);
        if (updatedData.userId === userId && updatedData.updatedAt !== formData.updated_at) {
          toast.warn('Nội dung không khớp. Hãy tải lại trang.', {
            position: 'top-right',
            autoClose: 3000,
          });
          return;
        }
      }

      if (!formData.username.trim()) {
        setErrors({ username: ['Tên người dùng là bắt buộc.'] });
        toast.error('Tên người dùng là bắt buộc.', { position: 'top-right', autoClose: 3000 });
        return;
      }
      if (formData.username.length > 50) {
        setErrors({ username: ['Tên người dùng không được vượt quá 50 ký tự.'] });
        toast.error('Tên người dùng không được vượt quá 50 ký tự.', { position: 'top-right', autoClose: 3000 });
        return;
      }
      if (!formData.email.trim()) {
        setErrors({ email: ['Email là bắt buộc.'] });
        toast.error('Email là bắt buộc.', { position: 'top-right', autoClose: 3000 });
        return;
      }
      if (formData.email.length > 100) {
        setErrors({ email: ['Email không được vượt quá 100 ký tự.'] });
        toast.error('Email không được vượt quá 100 ký tự.', { position: 'top-right', autoClose: 3000 });
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setErrors({ email: ['Email không hợp lệ.'] });
        toast.error('Email không hợp lệ.', { position: 'top-right', autoClose: 3000 });
        return;
      }
      if (formData.phone && !/^\d{0,20}$/.test(formData.phone)) {
        setErrors({ phone: ['Số điện thoại chỉ được chứa chữ số và tối đa 20 ký tự.'] });
        toast.error('Số điện thoại không hợp lệ.', { position: 'top-right', autoClose: 3000 });
        return;
      }
      if (formData.city && formData.city.length > 255) {
        setErrors({ city: ['Thành phố không được vượt quá 255 ký tự.'] });
        toast.error('Thành phố không được vượt quá 255 ký tự.', { position: 'top-right', autoClose: 3000 });
        return;
      }
      if (formData.bio && formData.bio.length > 1000) {
        setErrors({ bio: ['Giới thiệu không được vượt quá 1000 ký tự.'] });
        toast.error('Giới thiệu không được vượt quá 1000 ký tự.', { position: 'top-right', autoClose: 3000 });
        return;
      }
      if (formData.avatar instanceof File && !formData.reset_avatar) {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        const maxSize = 2 * 1024 * 1024;
        if (!validTypes.includes(formData.avatar.type)) {
          setErrors({ avatar: ['File phải là JPEG, PNG, JPG hoặc GIF.'] });
          toast.error('File phải là JPEG, PNG, JPG hoặc GIF.', { position: 'top-right', autoClose: 3000 });
          return;
        }
        if (formData.avatar.size > maxSize) {
          setErrors({ avatar: ['File phải nhỏ hơn 2MB.'] });
          toast.error('File phải nhỏ hơn 2MB.', { position: 'top-right', autoClose: 3000 });
          return;
        }
      }

      const previousAvatar = formData.current_avatar;
      const previousResetAvatar = formData.reset_avatar;

      try {
        const token = localStorage.getItem('token');
        if (!token || !userId) {
          throw new Error('Vui lòng đăng nhập lại.');
        }

        const formDataToSend = new FormData();
        formDataToSend.append('username', formData.username);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('phone', formData.phone || '');
        formDataToSend.append('city', formData.city || '');
        formDataToSend.append('bio', formData.bio || '');
        if (formData.avatar instanceof File && !formData.reset_avatar) {
          formDataToSend.append('avatar', formData.avatar);
        }
        if (formData.reset_avatar) {
          formDataToSend.append('reset_avatar', '1');
        }
        formDataToSend.append('_method', 'PUT');
        formDataToSend.append('updated_at', formData.updated_at || '');

        const config = {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        };

        console.log('Sending update request:', {
          username: formData.username,
          email: formData.email,
          updated_at: formData.updated_at,
          reset_avatar: formData.reset_avatar,
        });

        const response = await axios.post(`http://127.0.0.1:8000/api/update/${userId}`, formDataToSend, config);
        console.log('Update response:', response.data);

        toast.success(response.data.message, { position: 'top-right', autoClose: 3000 });

        if (response.data.user) {
          setFormData((prev) => ({
            ...prev,
            username: response.data.user.username || prev.username,
            email: response.data.user.email || prev.email,
            phone: normalizeToHalfWidth(response.data.user.phone) || prev.phone,
            city: response.data.user.city || prev.city,
            bio: response.data.user.bio || prev.bio,
            current_avatar: response.data.user.avatar || null,
            updated_at: response.data.user.updated_at || prev.updated_at,
            reset_avatar: false,
            avatar: null,
          }));

          localStorage.setItem('userUpdated', JSON.stringify({
            userId: userId,
            updatedAt: response.data.user.updated_at,
          }));
        }

        setErrors({});
        setTimeout(() => navigate('/profile'), 3000);
      } catch (error) {
        console.error('Update profile error:', error.response ? error.response.data : error.message);
        setFormData((prev) => ({
          ...prev,
          current_avatar: previousAvatar,
          reset_avatar: previousResetAvatar,
        }));

        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', { position: 'top-right', autoClose: 3000 });
          setTimeout(() => navigate('/login'), 3000);
        } else if (error.response && error.response.status === 409) {
          toast.error('Nội dung không khớp. Hãy tải lại trang.', { position: 'top-right', autoClose: 3000 });
        } else if (error.response && error.response.data && error.response.data.errors) {
          setErrors(error.response.data.errors);
          if (error.response.data.errors.username) {
            toast.error('Tên người dùng đã tồn tại. Vui lòng chọn tên khác.', { position: 'top-right', autoClose: 3000 });
          } else if (error.response.data.errors.email) {
            toast.error('Email đã tồn tại. Vui lòng chọn email khác.', { position: 'top-right', autoClose: 3000 });
          } else if (error.response.data.errors.avatar) {
            toast.error('File ảnh không hợp lệ. Vui lòng chọn file JPEG/PNG/JPG/GIF dưới 2MB.', {
              position: 'top-right',
              autoClose: 3000,
            });
          } else {
            toast.error(Object.values(error.response.data.errors).flat()[0], { position: 'top-right', autoClose: 3000 });
          }
        } else {
          toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.', {
            position: 'top-right',
            autoClose: 3000,
          });
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

            <div className="card shadow-sm border-0">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Cập Nhật Thông Tin</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleConfirmSubmit} noValidate>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Tên người dùng:</label>
                    <input
                      type="text"
                      className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      maxLength="50"
                    />
                    {errors.username && <div className="invalid-feedback">{errors.username[0]}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email:</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      maxLength="100"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email[0]}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Số điện thoại:</label>
                    <input
                      type="text"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="VD: 0987654321"
                      maxLength="20"
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone[0]}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="city" className="form-label">Thành phố:</label>
                    <input
                      type="text"
                      className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="VD: Hà Nội"
                      maxLength="255"
                    />
                    {errors.city && <div className="invalid-feedback">{errors.city[0]}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="bio" className="form-label">Giới thiệu:</label>
                    <textarea
                      className={`form-control ${errors.bio ? 'is-invalid' : ''}`}
                      id="bio"
                      name="bio"
                      rows="4"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Giới thiệu về bạn..."
                      maxLength="1000"
                    />
                    {errors.bio && <div className="invalid-feedback">{errors.bio[0]}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="avatar" className="form-label">Ảnh đại diện:</label>
                    <div className="mb-2">
                      <img
                        src={getAvatarUrl(formData.current_avatar)}
                        alt="Avatar hiện tại"
                        className="img-fluid rounded"
                        style={{ maxWidth: '150px', maxHeight: '150px', border: '2px solid #e9ecef' }}
                        onError={() => setImageError(true)}
                      />
                      {!imageError && formData.current_avatar && (
                        <p className="text-muted mt-1">Tên ảnh: {formData.current_avatar}</p>
                      )}
                    </div>
                    <input
                      type="file"
                      className={`form-control ${errors.avatar ? 'is-invalid' : ''}`}
                      id="avatar"
                      name="avatar"
                      accept="image/*"
                      onChange={handleChange}
                    />
                    {errors.avatar && <div className="invalid-feedback">{errors.avatar[0]}</div>}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm mt-2"
                      onClick={handleResetAvatar}
                      disabled={!formData.current_avatar}
                    >
                      Xóa ảnh
                    </button>
                  </div>
                  {formData.updated_at && (
                    <div className="mb-3">
                      <p className="text-muted">
                        Cập nhật lần cuối: {new Date(formData.updated_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  )}
                  <button type="submit" className="btn btn-primary">Cập Nhật</button>
                </form>
              </div>
            </div>

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
            <ToastContainer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;