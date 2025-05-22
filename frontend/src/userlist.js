import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ViewModal = ({ selectedUser }) => {
  const getAvatarUrl = (avatar) =>
    avatar && avatar !== 'null' && avatar !== 'undefined'
      ? `http://127.0.0.1:8000/storage/avatars/${avatar}`
      : 'http://127.0.0.1:8000/storage/avatars/default.png';

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
                <p><strong>ID:</strong> {selectedUser.id}</p>
                <p><strong>Tên người dùng:</strong> {selectedUser.username}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Vai trò:</strong> {selectedUser.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
                <p><strong>Avatar:</strong></p>
                <img
                  src={getAvatarUrl(selectedUser.avatar)}
                  alt={selectedUser.username}
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

const EditModal = ({ editForm, handleEditChange, handleEditSubmit, errors }) => (
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
          {errors && (
            <div className="alert alert-danger mb-3">
              {Object.values(errors).flat().map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}
          <form onSubmit={handleEditSubmit}>
            <div className="mb-3">
              <label htmlFor="editUsername" className="form-label">Tên người dùng</label>
              <input
                type="text"
                className="form-control"
                id="editUsername"
                name="username"
                value={editForm.username}
                onChange={handleEditChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="editEmail" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="editEmail"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="editRole" className="form-label">Vai trò</label>
              <select
                className="form-select"
                id="editRole"
                name="role"
                value={editForm.role}
                onChange={handleEditChange}
                required
              >
                <option value="user">Người dùng</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="editAvatar" className="form-label">Avatar</label>
              <input
                type="file"
                className="form-control"
                id="editAvatar"
                name="avatar"
                accept="image/*"
                onChange={handleEditChange}
              />
            </div>
            <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
          </form>
        </div>
      </div>
    </div>
  </div>
);

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
    role: 'user',
    avatar: null,
  });
  const [editErrors, setEditErrors] = useState(null);
  const isFetching = useRef(false);
  const prevUsers = useRef([]);
  const navigate = useNavigate();

  const getAvatarUrl = useCallback((avatar) =>
    avatar && avatar !== 'null' && avatar !== 'undefined'
      ? `http://127.0.0.1:8000/storage/avatars/${avatar}`
      : 'http://127.0.0.1:8000/storage/avatars/default.png', []
  );

  const fetchUsers = useCallback(async (page = 1) => {
    if (isFetching.current) return;
    isFetching.current = true;

    try {
      await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
        withCredentials: true,
      });

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập lại.');
        window.location.href = '/';
        return;
      }

      const config = {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get(`http://127.0.0.1:8000/api/listuser?page=${page}`, config);
      const newUsers = response.data.data || [];

      if (JSON.stringify(newUsers) !== JSON.stringify(prevUsers.current)) {
        setUsers(newUsers);
        prevUsers.current = newUsers;
      }
      setLastPage(response.data.last_page || 1);
      setLoading(false);
    } catch (err) {
      const errorMessage = err.response
        ? `Lỗi ${err.response.status}: ${err.response.data.message || err.response.statusText}`
        : `Lỗi kết nối: ${err.message}`;
      setError(errorMessage);
      setLoading(false);
    } finally {
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchUsers(currentPage);
  }, [currentPage, fetchUsers]);

  const handleView = useCallback(async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập lại.');
        return;
      }

      const response = await axios.get(`http://127.0.0.1:8000/api/listuser/${id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedUser(response.data);
    } catch (err) {
      setError('Không thể tải thông tin người dùng: ' + (err.response?.data?.message || err.message));
    }
  }, []);

  const handleEdit = useCallback((user) => {
    setEditForm({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: null,
    });
    setEditErrors(null); // Xóa lỗi cũ khi mở modal
  }, []);

  const handleEditChange = useCallback((e) => {
    const { name, value, files } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  }, []);

  const handleEditSubmit = useCallback(async (e) => {
    e.preventDefault();
    setEditErrors(null); // Xóa lỗi cũ trước khi gửi

    // Kiểm tra dữ liệu trước khi gửi
    if (!editForm.username.trim()) {
      setEditErrors({ username: ['Tên người dùng là bắt buộc'] });
      return;
    }
    if (!editForm.email.trim()) {
      setEditErrors({ email: ['Email là bắt buộc'] });
      return;
    }
    if (!['user', 'admin'].includes(editForm.role)) {
      setEditErrors({ role: ['Vai trò không hợp lệ'] });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập lại.');
        return;
      }

      await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
        withCredentials: true,
      });

      const formData = new FormData();
      formData.append('username', editForm.username.trim());
      formData.append('email', editForm.email.trim());
      formData.append('role', editForm.role);
      formData.append('_method', 'PUT'); // Laravel yêu cầu cho PUT qua multipart
      if (editForm.avatar) {
        formData.append('avatar', editForm.avatar);
      }

      await axios.post(`http://127.0.0.1:8000/api/update/${editForm.id}`, formData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      fetchUsers(currentPage);
      setError(null);
      setEditErrors(null);
      document.querySelector('#editModal .btn-close').click();
    } catch (err) {
      if (err.response && err.response.status === 422) {
        setEditErrors(err.response.data.errors || { general: ['Dữ liệu không hợp lệ'] });
      } else {
        setError('Không thể cập nhật người dùng: ' + (err.response?.data?.message || err.message));
      }
    }
  }, [editForm, currentPage, fetchUsers]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập lại.');
        return;
      }

      await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
        withCredentials: true,
      });

      await axios.delete(`http://127.0.0.1:8000/api/delete/${id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchUsers(currentPage);
      setError(null);
    } catch (err) {
      setError('Không thể xóa người dùng: ' + (err.response?.data?.message || err.message));
    }
  }, [currentPage, fetchUsers]);

  const handleLogout = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập lại.');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return;
      }

      await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
        withCredentials: true,
      });

      await axios.post('http://127.0.0.1:8000/api/logout', {}, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('UserList.js: Đăng xuất thành công');
      localStorage.removeItem('token');
      window.location.href = '/';
    } catch (err) {
      setError('Không thể đăng xuất: ' + (err.response?.data?.message || err.message));
      localStorage.removeItem('token');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  }, []);

  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= lastPage && page !== currentPage) {
      setCurrentPage(page);
      setLoading(true);
    }
  }, [lastPage, currentPage]);

  const handleBackToHome = useCallback(() => {
    navigate('/Home');
  }, [navigate]);

  return (
    <div className="container my-5">
      <h3 className="text-center mb-4" style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>
        Danh sách tài khoản
      </h3>
      <div className="text-start mb-3">
        <button className="btn btn-primary me-2" onClick={handleBackToHome}>
          <i className="bi bi-arrow-left me-2"></i>Quay lại
        </button>
        <button className="btn btn-danger" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info text-center">Đang tải...</div>}
      {!loading && users.length === 0 && !error && (
        <div className="alert alert-info text-center">Không có người dùng nào.</div>
      )}
      {!loading && users.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>Tên người dùng</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Avatar</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</td>
                  <td>
                    <img
                      src={getAvatarUrl(user.avatar)}
                      alt={user.username}
                      className="rounded-circle"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-info btn-sm me-1"
                      data-bs-toggle="modal"
                      data-bs-target="#viewModal"
                      onClick={() => handleView(user.id)}
                    >
                      Xem
                    </button>
                    <button
                      className="btn btn-warning btn-sm me-1"
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
      )}
      {!loading && lastPage > 1 && (
        <nav aria-label="Page navigation">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                Trước
              </button>
            </li>
            {[...Array(lastPage).keys()].map((page) => (
              <li key={page + 1} className={`page-item ${currentPage === page + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(page + 1)}>
                  {page + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === lastPage ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                Sau
              </button>
            </li>
          </ul>
        </nav>
      )}
      <ViewModal selectedUser={selectedUser} />
      <EditModal
        editForm={editForm}
        handleEditChange={handleEditChange}
        handleEditSubmit={handleEditSubmit}
        errors={editErrors}
      />
    </div>
  );
};

export default UserList;