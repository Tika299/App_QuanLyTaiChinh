import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ViewModal = ({ selectedUser }) => {
  const getAvatarUrl = useCallback((avatar) => {
    if (!avatar || avatar === 'null' || avatar === 'undefined') {
      return 'http://127.0.0.1:8000/storage/avatars/default.png';
    }

    const cleanAvatar = avatar.split('?')[0]; // Xoá ?t= cũ nếu có
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
                <option value="member">Người dùng</option>
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

  const getAvatarUrl = useCallback(
    (avatar) =>
      avatar && avatar !== 'null' && avatar !== 'undefined'
        ? `http://127.0.0.1:8000/storage/avatars/${avatar}`
        : 'http://127.0.0.1:8000/storage/avatars/default.png',
    []
  );

  const fetchUsers = useCallback(
    async (page = 1) => {
      if (isFetching.current) return;
      isFetching.current = true;
      setLoading(true);
      setError(null);

      try {
        await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
          withCredentials: true,
        });

        const token = localStorage.getItem('token');
        if (!token) {
          setError('Vui lòng đăng nhập lại.');
          navigate('/');
          return;
        }

        const config = {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        };

        console.log(`Gửi yêu cầu: GET /api/listuser?page=${page}`);
        const response = await axios.get(`http://127.0.0.1:8000/api/listuser?page=${page}`, config);
        console.log('Phản hồi:', response.data);

        const newUsers = (response.data.data || []).map((user) => {
          const roleName = user.roles && user.roles.length > 0 ? user.roles[0].name : user.role || 'user';
          return { ...user, role: roleName };
        });

        if (JSON.stringify(newUsers) !== JSON.stringify(prevUsers.current)) {
          setUsers(newUsers);
          prevUsers.current = newUsers;
        }
        setLastPage(response.data.last_page || 1);
      } catch (err) {
        console.error('Lỗi fetchUsers:', err.response || err.message);
        const errorMessage = err.response
          ? `Lỗi ${err.response.status}: ${err.response.data.message || err.response.statusText}`
          : `Lỗi kết nối: ${err.message}`;
        setError(errorMessage);
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
          setError('Vui lòng đăng nhập lại.');
          return;
        }

        const config = {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        };

        console.log(`Gửi yêu cầu: GET /api/listuser/${id}`);
        const response = await axios.get(`http://127.0.0.1:8000/api/listuser/${id}`, config);
        console.log('Phản hồi:', response.data);

        const user = response.data;
        const roleName = user.roles && user.roles.length > 0 ? user.roles[0].name : user.role || 'user';
        setSelectedUser({ ...user, role: roleName });
      } catch (err) {
        console.error('Lỗi handleView:', err.response || err.message);
        setError('Không thể tải thông tin người dùng: ' + (err.response?.data?.message || err.message));
      }
    },
    []
  );

  const handleEdit = useCallback((user) => {
    setEditForm({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: null,
    });
    setEditErrors(null);
  }, []);

  const handleEditChange = useCallback((e) => {
    const { name, value, files } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  }, []);

  const handleEditSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setEditErrors(null);

      if (!editForm.username.trim()) {
        setEditErrors({ username: ['Tên người dùng là bắt buộc'] });
        return;
      }
      if (!editForm.email.trim()) {
        setEditErrors({ email: ['Email là bắt buộc'] });
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setEditErrors({ general: ['Vui lòng đăng nhập lại.'] });
          return;
        }

        const formData = new FormData();
        formData.append('username', editForm.username);
        formData.append('email', editForm.email);
        formData.append('role', editForm.role);
        if (editForm.avatar) {
          console.log('Avatar:', editForm.avatar); // Debug file
          formData.append('avatar', editForm.avatar);
        }
        formData.append('_method', 'PUT'); // Thêm để hỗ trợ giả lập PUT nếu cần

        const config = {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        };

        console.log('Gửi yêu cầu: PUT /api/update/' + editForm.id);
        console.log('FormData:', [...formData.entries()]); // Debug FormData
        const response = await axios.post(`http://127.0.0.1:8000/api/update/${editForm.id}`, formData, config);

        console.log('Phản hồi:', response.data);

        const editModalEl = document.getElementById('editModal');
        if (editModalEl) {
          const modal = window.bootstrap.Modal.getInstance(editModalEl);
          modal.hide();
        }

        fetchUsers(currentPage);
      } catch (err) {
        console.error('Lỗi handleEditSubmit:', err.response || err.message);
        if (err.response && err.response.data && err.response.data.errors) {
          console.log('Chi tiết lỗi:', err.response.data.errors); // Debug lỗi 422
          setEditErrors(err.response.data.errors);
        } else {
          setEditErrors({ general: [err.response?.data?.message || err.message] });
        }
      }
    },
    [editForm, fetchUsers, currentPage]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Vui lòng đăng nhập lại.');
          return;
        }

        const config = {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        };

        console.log(`Gửi yêu cầu: DELETE /api/delete/${id}`);
        await axios.delete(`http://127.0.0.1:8000/api/delete/${id}`, config);

        fetchUsers(currentPage);
      } catch (err) {
        console.error('Lỗi handleDelete:', err.response || err.message);
        setError('Không thể xóa người dùng: ' + (err.response?.data?.message || err.message));
      }
    },
    [fetchUsers, currentPage]
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  return (
    <div className="container mt-4">
      <h2>Danh sách người dùng</h2>

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
                  <td colSpan="6" className="text-center">
                    Không có người dùng nào
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</td>
                  <td>
                    <img
                      src={getAvatarUrl(user.avatar)}
                      alt={user.username}
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

          {users.length > 0 && lastPage > 1 && (
            <nav aria-label="User list pagination" className="mt-3">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </button>
                </li>
                {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
                  <li
                    key={page}
                    className={`page-item ${currentPage === page ? 'active' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === lastPage ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, lastPage))}
                    disabled={currentPage === lastPage}
                  >
                    Sau
                  </button>
                </li>
              </ul>
              <div className="text-center">
                Trang {currentPage} / {lastPage}
              </div>
            </nav>
          )}
        </>
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