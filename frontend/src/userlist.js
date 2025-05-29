import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const normalizeToHalfWidth = (value) => {
  if (!value) return value;
  const fullWidthMap = {
    '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
    '５': '5', '６': '6', '７': '7', '８': '8', '９': '9',
  };
  return value.replace(/[０-９]/g, (match) => fullWidthMap[match]);
};

// ViewModal component
const ViewModal = ({ selectedUser }) => {
  const getAvatarUrl = useCallback((avatar) => {
    if (!avatar || avatar === 'null' || avatar === 'undefined' || avatar === 'default.png') {
      return 'http://127.0.0.1:8000/storage/avatars/default.png';
    }
    const cleanAvatar = avatar.split('?')[0];
    return `http://127.0.0.1:8000/storage/avatars/${cleanAvatar}?t=${Date.now()}`;
  }, []);

  return (
    <div className="modal fade" id="viewModal" tabIndex="-1" aria-labelledby="viewModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="viewModalLabel" style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>
              Chi tiết người dùng
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {selectedUser ? (
              <div>
                <p><strong>ID:</strong> {normalizeToHalfWidth(String(selectedUser.id))}</p>
                <p><strong>Tên người dùng:</strong> {normalizeToHalfWidth(selectedUser.username) || 'N/A'}</p>
                <p><strong>Email:</strong> {normalizeToHalfWidth(selectedUser.email) || 'N/A'}</p>
                <p><strong>Số điện thoại:</strong> {normalizeToHalfWidth(selectedUser.phone) || 'N/A'}</p>
                <p><strong>Thành phố:</strong> {selectedUser.city || 'N/A'}</p>
                <p><strong>Giới thiệu:</strong> {selectedUser.bio || 'N/A'}</p>
                <p><strong>Vai trò:</strong> {selectedUser.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
                <p><strong>Avatar:</strong></p>
                <img
                  src={getAvatarUrl(selectedUser.avatar)}
                  alt={selectedUser.username || 'Avatar'}
                  className="img-fluid"
                  style={{ maxWidth: '100px' }}
                />
              </div>
            ) : (
              <p>Đang tải...</p>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// EditModal component
const EditModal = ({ editForm, handleEditChange, handleEditSubmit, handleResetAvatar, errors, isSubmitting, imageError }) => {
  useEffect(() => {
    const editModalEl = document.getElementById('editModal');
    if (editModalEl && !window.bootstrap.Modal.getInstance(editModalEl)) {
      new window.bootstrap.Modal(editModalEl);
    }
  }, []);

  const getAvatarUrl = useCallback((avatar) => {
    if (!avatar || avatar === 'null' || avatar === 'undefined' || avatar === 'default.png') {
      return 'http://127.0.0.1:8000/storage/avatars/default.png';
    }
    const cleanAvatar = avatar.split('?')[0];
    return `http://127.0.0.1:8000/storage/avatars/${cleanAvatar}?t=${Date.now()}`;
  }, []);

  return (
    <div className="modal fade" id="editModal" tabIndex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="editModalLabel" style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>
              Sửa người dùng
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleEditSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="editId" className="form-label">ID</label>
                <input
                  type="text"
                  className={`form-control ${errors?.id ? 'is-invalid' : ''}`}
                  id="editId"
                  name="id"
                  value={normalizeToHalfWidth(editForm.id) || ''}
                  onChange={handleEditChange}
                  disabled
                />
                {errors?.id && <div className="invalid-feedback">{errors.id[0]}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="editUsername" className="form-label">Tên người dùng</label>
                <input
                  type="text"
                  className={`form-control ${errors?.username ? 'is-invalid' : ''}`}
                  id="editUsername"
                  name="username"
                  value={editForm.username || ''}
                  onChange={handleEditChange}
                  maxLength="50"
                  required
                />
                {errors?.username && <div className="invalid-feedback">{errors.username[0]}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="editEmail" className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-control ${errors?.email ? 'is-invalid' : ''}`}
                  id="editEmail"
                  name="email"
                  value={editForm.email || ''}
                  onChange={handleEditChange}
                  maxLength="100"
                  required
                />
                {errors?.email && <div className="invalid-feedback">{errors.email[0]}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="editRole" className="form-label">Vai trò</label>
                <select
                  className={`form-select ${errors?.role ? 'is-invalid' : ''}`}
                  id="editRole"
                  name="role"
                  value={editForm.role || 'member'}
                  onChange={handleEditChange}
                  required
                >
                  <option value="member">Người dùng</option>
                  <option value="admin">Quản trị viên</option>
                </select>
                {errors?.role && <div className="invalid-feedback">{errors.role[0]}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="editAvatar" className="form-label">Ảnh đại diện</label>
                <div className="mb-2">
                  <img
                    src={getAvatarUrl(editForm.current_avatar)}
                    alt="Current Avatar"
                    className="img-fluid rounded"
                    style={{ maxWidth: '150px', maxHeight: '150px', border: '2px solid #e9ecef' }}
                    onError={() => imageError(true)}
                  />
                  {!imageError && editForm.current_avatar && editForm.current_avatar !== 'default.png' && (
                    <p className="text-muted mt-1">Tên ảnh: {editForm.current_avatar}</p>
                  )}
                </div>
                <input
                  type="file"
                  className={`form-control ${errors?.avatar ? 'is-invalid' : ''}`}
                  id="editAvatar"
                  name="avatar"
                  accept="image/*"
                  onChange={handleEditChange}
                />
                {errors?.avatar && <div className="invalid-feedback">{errors.avatar[0]}</div>}
                <button
                  type="button"
                  className="btn btn-danger btn-sm mt-2"
                  onClick={handleResetAvatar}
                  disabled={isSubmitting || !editForm.current_avatar || editForm.current_avatar === 'default.png'}
                >
                  Xóa ảnh
                </button>
              </div>
              {editForm.updated_at && (
                <div className="mb-3">
                  <p className="text-muted">
                    Cập nhật lần cuối: {new Date(editForm.updated_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
              <input
                type="hidden"
                name="updated_at"
                value={editForm.updated_at || ''}
              />
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// UserList component
const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    id: '',
    username: '',
    email: '',
    phone: '',
    city: '',
    bio: '',
    role: 'member',
    avatar: null,
    current_avatar: 'default.png',
    updated_at: '',
    reset_avatar: false,
  });
  const [editErrors, setEditErrors] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const isFetching = useRef(false);
  const prevUsers = useRef([]);
  const navigate = useNavigate();

  const getAvatarUrl = useCallback(
    (avatar) =>
      avatar && avatar !== 'null' && avatar !== 'undefined' && avatar !== 'default.png'
        ? `http://127.0.0.1:8000/storage/avatars/${avatar.split('?')[0]}?t=${Date.now()}`
        : 'http://127.0.0.1:8000/storage/avatars/default.png',
    []
  );

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại.', { position: 'top-right', autoClose: 3000 });
        navigate('/login');
        return;
      }
      try {
        await axios.get('http://127.0.0.1:8000/api/user', {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          withCredentials: true,
        });
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          toast.error('Vui lòng đăng nhập lại.', { position: 'top-right', autoClose: 3000 });
          navigate('/login');
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const fetchUsers = useCallback(
    async (page = 1) => {
      if (isFetching.current) return;
      isFetching.current = true;
      setLoading(true);
      setError(null);

      try {
        await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', { withCredentials: true });
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Vui lòng đăng nhập lại.', { position: 'top-right', autoClose: 3000 });
          navigate('/login');
          return;
        }

        const config = {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Cache-Control': 'no-cache',
          },
        };

        const response = await axios.get(`http://127.0.0.1:8000/api/listuser?page=${page}`, config);
        console.log('fetchUsers raw response:', response.data); // Debug raw API response
        const newUsers = (response.data.data || []).map((user) => ({
          ...user,
          id: normalizeToHalfWidth(String(user.id)),
          username: normalizeToHalfWidth(user.username),
          email: normalizeToHalfWidth(user.email),
          phone: normalizeToHalfWidth(user.phone ?? user.phone_number ?? '') || '', // Fallback to phone_number
          city: user.city ?? user.location ?? '', // Fallback to location
          bio: user.bio ?? user.notes ?? '', // Fallback to notes
          role: user.roles && user.roles.length > 0 ? user.roles[0].name : 'member',
          updated_at: user.updated_at || '',
          avatar: user.avatar || 'default.png',
        }));
        console.log('fetchUsers processed users:', newUsers); // Debug processed users

        if (JSON.stringify(newUsers) !== JSON.stringify(prevUsers.current)) {
          setUsers(newUsers);
          prevUsers.current = newUsers;
        }
        setLastPage(response.data.last_page || 1);
      } catch (err) {
        const errorMessage = err.response
          ? `Lỗi ${err.response.status}: ${err.response.data?.message || err.response.statusText}`
          : `Lỗi kết nối: ${err.message}`;
        console.error('fetchUsers error:', err.response ? err.response.data : err.message);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          toast.error('Vui lòng đăng nhập lại.', { position: 'top-right', autoClose: 3000 });
          navigate('/login');
        } else {
          toast.error(errorMessage, { position: 'top-right', autoClose: 3000 });
        }
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, fetchUsers]);

  const handleView = useCallback(
    async (id) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Vui lòng đăng nhập lại.', { position: 'top-right', autoClose: 3000 });
          navigate('/login');
          return;
        }

        const config = {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Cache-Control': 'no-cache' },
        };

        const response = await axios.get(`http://127.0.0.1:8000/api/listuser/${id}`, config);
        console.log('handleView raw response:', response.data); // Debug raw API response
        const user = response.data.user || response.data;
        const selectedUserData = {
          id: normalizeToHalfWidth(String(user.id)),
          username: normalizeToHalfWidth(user.username) || '',
          email: normalizeToHalfWidth(user.email) || '',
          phone: normalizeToHalfWidth(user.phone ?? user.phone_number ?? '') || '',
          city: user.city ?? user.location ?? '',
          bio: user.bio ?? user.notes ?? '',
          avatar: user.avatar || 'default.png',
          role: user.roles && user.roles.length > 0 ? user.roles[0].name : 'member',
          updated_at: user.updated_at || '',
        };
        console.log('handleView selectedUser:', selectedUserData); // Debug processed user data
        setSelectedUser(selectedUserData);
      } catch (err) {
        console.error('handleView error:', err.response ? err.response.data : err.message);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          toast.error('Vui lòng đăng nhập lại.', { position: 'top-right', autoClose: 3000 });
          navigate('/login');
        } else {
          toast.error('Không thể tải thông tin người dùng: ' + (err.response?.data?.message || err.message), {
            position: 'top-right',
            autoClose: 3000,
          });
        }
      }
    },
    [navigate]
  );

  const handleEdit = useCallback(
    async (user) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Vui lòng đăng nhập lại.', { position: 'top-right', autoClose: 3000 });
          navigate('/login');
          return;
        }

        const config = {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Cache-Control': 'no-cache',
          },
        };

        const response = await axios.get(`http://127.0.0.1:8000/api/listuser/${user.id}`, config);
        console.log('handleEdit raw response:', response.data); // Debug raw API response
        const latestUser = response.data.user || response.data;

        setEditForm({
          id: normalizeToHalfWidth(String(latestUser.id)),
          username: normalizeToHalfWidth(latestUser.username) || '',
          email: normalizeToHalfWidth(latestUser.email) || '',
          phone: normalizeToHalfWidth(latestUser.phone ?? latestUser.phone_number ?? '') || '',
          city: latestUser.city ?? latestUser.location ?? '',
          bio: latestUser.bio ?? latestUser.notes ?? '',
          role: latestUser.roles?.[0]?.name || 'member',
          avatar: null,
          current_avatar: latestUser.avatar || 'default.png',
          updated_at: latestUser.updated_at || '',
          reset_avatar: false,
        });
        setEditErrors(null);
        setImageError(false);

        const editModalEl = document.getElementById('editModal');
        if (editModalEl) {
          const modal = new window.bootstrap.Modal(editModalEl);
          modal.show();
        }
      } catch (err) {
        console.error('handleEdit error:', err.response ? err.response.data : err.message);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          toast.error('Vui lòng đăng nhập lại.', { position: 'top-right', autoClose: 3000 });
          navigate('/login');
        } else {
          toast.error('Không thể tải dữ liệu người dùng: ' + (err.response?.data?.message || err.message), {
            position: 'top-right',
            autoClose: 3000,
          });
        }
      }
    },
    [navigate]
  );

  const handleEditChange = useCallback((e) => {
    const { name, value, files } = e.target;
    const normalizedValue = name === 'username' || name === 'email' || name === 'phone' ? normalizeToHalfWidth(value) : value;
    setEditForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : normalizedValue,
      reset_avatar: name === 'avatar' && files ? false : prev.reset_avatar,
    }));
    setEditErrors((prevErrors) => {
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
      setEditForm((prev) => ({
        ...prev,
        avatar: null,
        current_avatar: 'default.png',
        reset_avatar: true,
      }));
      setImageError(false);
    }
  }, []);

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleEditSubmit = useCallback(
  async (confirmed) => {
    if (!confirmed) {
      setShowConfirm(false);
      return;
    }

    setShowConfirm(false);
    setIsSubmitting(true);
    setEditErrors(null);

    const storedData = localStorage.getItem('userUpdated');
    if (storedData) {
      const updatedData = JSON.parse(storedData);
      if (updatedData.userId === editForm.id && updatedData.updatedAt !== editForm.updated_at) {
        toast.warn('Nội dung không khớp. Hãy tải lại trang.', {
          position: 'top-right',
          autoClose: 3000,
        });
        setIsSubmitting(false);
        return;
      }
    }

      if (!editForm.id) {
        setEditErrors({ id: ['ID là bắt buộc.'] });
        toast.error('ID là bắt buộc.', { position: 'top-right', autoClose: 3000 });
        setIsSubmitting(false);
        return;
      }
      if (!editForm.username.trim()) {
        setEditErrors({ username: ['Tên người dùng là bắt buộc.'] });
        toast.error('Tên người dùng là bắt buộc.', { position: 'top-right', autoClose: 3000 });
        setIsSubmitting(false);
        return;
      }
      if (editForm.username.length > 50) {
        setEditErrors({ username: ['Tên người dùng không được vượt quá 50 ký tự.'] });
        toast.error('Tên người dùng không được vượt quá 50 ký tự.', { position: 'top-right', autoClose: 3000 });
        setIsSubmitting(false);
        return;
      }
      if (!editForm.email.trim()) {
        setEditErrors({ email: ['Email là bắt buộc.'] });
        toast.error('Email là bắt buộc.', { position: 'top-right', autoClose: 3000 });
        setIsSubmitting(false);
        return;
      }
      if (editForm.email.length > 100) {
        setEditErrors({ email: ['Email không được vượt quá 100 ký tự.'] });
        toast.error('Email không được vượt quá 100 ký tự.', { position: 'top-right', autoClose: 3000 });
        setIsSubmitting(false);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email)) {
        setEditErrors({ email: ['Email không hợp lệ.'] });
        toast.error('Email không hợp lệ.', { position: 'top-right', autoClose: 3000 });
        setIsSubmitting(false);
        return;
      }
      if (editForm.phone && !/^\d{0,20}$/.test(editForm.phone)) {
        setEditErrors({ phone: ['Số điện thoại chỉ được chứa chữ số và tối đa 20 ký tự.'] });
        toast.error('Số điện thoại không hợp lệ.', { position: 'top-right', autoClose: 3000 });
        setIsSubmitting(false);
        return;
      }
      if (editForm.city && editForm.city.length > 255) {
        setEditErrors({ city: ['Thành phố không được vượt quá 255 ký tự.'] });
        toast.error('Thành phố không được vượt quá 255 ký tự.', { position: 'top-right', autoClose: 3000 });
        setIsSubmitting(false);
        return;
      }
      if (editForm.bio && editForm.bio.length > 1000) {
        setEditErrors({ bio: ['Giới thiệu không được vượt quá 1000 ký tự.'] });
        toast.error('Giới thiệu không được vượt quá 1000 ký tự.', { position: 'top-right', autoClose: 3000 });
        setIsSubmitting(false);
        return;
      }
      if (editForm.avatar instanceof File && !editForm.reset_avatar) {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        const maxSize = 2 * 1024 * 1024;
        if (!validTypes.includes(editForm.avatar.type)) {
          setEditErrors({ avatar: ['File phải là JPEG, PNG, JPG hoặc GIF.'] });
          toast.error('File phải là JPEG, PNG, JPG hoặc GIF.', { position: 'top-right', autoClose: 3000 });
          setIsSubmitting(false);
          return;
        }
        if (editForm.avatar.size > maxSize) {
          setEditErrors({ avatar: ['File phải nhỏ hơn 2MB.'] });
          toast.error('File phải nhỏ hơn 2MB.', { position: 'top-right', autoClose: 3000 });
          setIsSubmitting(false);
          return;
        }
      }

      const previousAvatar = editForm.current_avatar;
    const previousResetAvatar = editForm.reset_avatar;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập lại.');
      }

      const formData = new FormData();
      formData.append('username', editForm.username);
      formData.append('email', editForm.email);
      formData.append('phone', editForm.phone || '');
      formData.append('city', editForm.city || '');
      formData.append('bio', editForm.bio || '');
      formData.append('role', editForm.role);
      if (editForm.avatar instanceof File && !editForm.reset_avatar) {
        formData.append('avatar', editForm.avatar);
      }
      if (editForm.reset_avatar) {
        formData.append('reset_avatar', '1');
      }
      formData.append('updated_at', editForm.updated_at || '');
      formData.append('_method', 'PUT');

      const postConfig = {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          'Cache-Control': 'no-cache',
        },
      };

      console.log('Sending update request:', {
        username: editForm.username,
        email: editForm.email,
        phone: editForm.phone,
        city: editForm.city,
        bio: editForm.bio,
        role: editForm.role,
        updated_at: editForm.updated_at,
        reset_avatar: editForm.reset_avatar,
      });

      const response = await axios.post(`http://127.0.0.1:8000/api/update/${editForm.id}`, formData, postConfig);
      console.log('Update response:', response.data);

      toast.success('Cập nhật người dùng thành công!', { position: 'top-right', autoClose: 3000 });

      if (response.data.user) {
        setEditForm((prev) => ({
          ...prev,
          username: response.data.user.username || prev.username,
          email: response.data.user.email || prev.email,
          phone: normalizeToHalfWidth(response.data.user.phone) || prev.phone,
          city: response.data.user.city || prev.city,
          bio: response.data.user.bio || prev.bio,
          role: response.data.user.roles?.[0]?.name || prev.role,
          current_avatar: response.data.user.avatar || 'default.png',
          updated_at: response.data.user.updated_at || prev.updated_at,
          reset_avatar: false,
          avatar: null,
        }));

        localStorage.setItem('userUpdated', JSON.stringify({
          userId: editForm.id,
          updatedAt: response.data.user.updated_at,
        }));
      }

      setEditErrors(null);
      setImageError(false);
      await fetchUsers(currentPage);

      const editModalEl = document.getElementById('editModal');
      if (editModalEl) {
        const modal = window.bootstrap.Modal.getInstance(editModalEl) || new window.bootstrap.Modal(editModalEl);
        modal.hide();
        document.querySelector('.modal-backdrop')?.remove();
        document.body.classList.remove('modal-open');
      }
    } catch (err) {
      console.error('Update user error:', err.response ? err.response.data : err.message);
      setEditForm((prev) => ({
        ...prev,
        current_avatar: previousAvatar, // Revert to previous avatar on error
        reset_avatar: previousResetAvatar, // Revert reset_avatar flag
      }));

      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', { position: 'top-right', autoClose: 3000 });
        navigate('/login');
      } else if (err.response?.status === 409) {
        toast.error('Nội dung không khớp. Hãy tải lại trang.', { position: 'top-right', autoClose: 3000 });
      } else if (err.response?.status === 422 && err.response.data?.errors) {
        setEditErrors(err.response.data.errors);
        if (err.response.data.errors.avatar) {
          // Differentiate between avatar validation and deletion errors
          const errorMessage = err.response.data.errors.avatar[0].includes('delete')
            ? 'Không thể xóa ảnh đại diện. Vui lòng thử lại.'
            : 'File ảnh không hợp lệ. Vui lòng chọn file JPEG/PNG/JPG/GIF dưới 2MB.';
          toast.error(errorMessage, { position: 'top-right', autoClose: 3000 });
        } else if (err.response.data.errors.username) {
          toast.error('Tên người dùng đã tồn tại. Vui lòng chọn tên khác.', { position: 'top-right', autoClose: 3000 });
        } else if (err.response.data.errors.email) {
          toast.error('Email đã tồn tại. Vui lòng chọn email khác.', { position: 'top-right', autoClose: 3000 });
        } else {
          toast.error(Object.values(err.response.data.errors).flat()[0], { position: 'top-right', autoClose: 3000 });
        }
      } else {
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật người dùng.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  },
  [editForm, fetchUsers, currentPage, navigate]
);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Vui lòng đăng nhập lại.', { position: 'top-right', autoClose: 3000 });
          navigate('/login');
          return;
        }

        const config = {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Cache-Control': 'no-cache' },
        };

        await axios.delete(`http://127.0.0.1:8000/api/delete/${id}`, config);
        toast.success('Xóa người dùng thành công!', { position: 'top-right', autoClose: 3000 });
        fetchUsers(currentPage);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          toast.error('Vui lòng đăng nhập lại.', { position: 'top-right', autoClose: 3000 });
          navigate('/login');
        } else {
          toast.error('Không thể xóa người dùng: ' + (err.response?.data?.message || err.message), {
            position: 'top-right',
            autoClose: 3000,
          });
        }
      }
    },
    [fetchUsers, currentPage, navigate]
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(lastPage, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

    if (startPage > 2) {
      pageNumbers.unshift('...');
      pageNumbers.unshift(1);
    } else if (startPage === 2) pageNumbers.unshift(1);

    if (endPage < lastPage - 1) {
      pageNumbers.push('...');
      pageNumbers.push(lastPage);
    } else if (endPage === lastPage - 1) pageNumbers.push(lastPage);

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="p-4" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <div className="container">
        <h2 className="mb-4">Danh sách người dùng</h2>

        <div className="card shadow-sm border-0">
          
          <div className="card-body">
            <div className="mb-3 d-flex justify-content-between">
              <button className="btn btn-secondary" onClick={handleGoHome}>
                Quay lại Home
              </button>
              <button className="btn btn-danger" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
              <p>Đang tải dữ liệu...</p>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-striped table-bordered">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Tên người dùng</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Avatar</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 && (
                        <tr>
                          <td colSpan="9" className="text-center">
                            Không có người dùng nào
                          </td>
                        </tr>
                      )}
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.username || 'N/A'}</td>
                          <td>{user.email || 'N/A'}</td>
                          <td>{user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</td>
                          <td>
                            <img
                              src={getAvatarUrl(user.avatar)}
                              alt={user.username || 'Avatar'}
                              style={{ maxWidth: '50px', borderRadius: '50%' }}
                            />
                          </td>
                          <td>
                            <button
                              className="btn btn-info btn-sm me-2"
                              data-bs-toggle="modal"
                              data-bs-target="#viewModal"
                              onClick={() => handleView(user.id)}
                            >
                              Xem
                            </button>
                            <button
                              className="btn btn-warning btn-sm me-2"
                              data-bs-toggle="modal"
                              data-bs-target="#editModal"
                              onClick={() => handleEdit(user)}
                            >
                              Sửa
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(user.id)}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {users.length > 0 && lastPage > 1 && (
                  <nav aria-label="User list pagination" className="mt-3">
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Trước
                        </button>
                      </li>
                      {pageNumbers.map((page, index) => (
                        <li
                          key={index}
                          className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}
                        >
                          {page === '...' ? (
                            <span className="page-link">...</span>
                          ) : (
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </button>
                          )}
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === lastPage ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === lastPage}
                        >
                          Sau
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>

        <ViewModal selectedUser={selectedUser} />
        <EditModal
          editForm={editForm}
          handleEditChange={handleEditChange}
          handleEditSubmit={handleConfirmSubmit}
          handleResetAvatar={handleResetAvatar}
          errors={editErrors}
          isSubmitting={isSubmitting}
          imageError={setImageError}
        />

        {showConfirm && (
          <div className="modal" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Xác nhận cập nhật</h5>
                  <button type="button" className="btn-close" onClick={() => setShowConfirm(false)}></button>
                </div>
                <div className="modal-body">
                  <p>Bạn có chắc muốn cập nhật thông tin người dùng không?</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                    Hủy
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => handleEditSubmit(true)}>
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
  );
};

export default UserList;