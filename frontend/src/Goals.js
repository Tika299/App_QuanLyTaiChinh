import React, { useState, useEffect, useRef } from 'react'; // Thêm useRef
import axios from 'axios';
import GoalList from './GoalList';
import FlashMessage from './FlashMessage';
import Header from './Header';
import Slider from './Slider';
import 'bootstrap/dist/css/bootstrap.min.css'; // Đảm bảo nhập Bootstrap CSS

// Hàm chuyển đổi full-width sang half-width
const normalizeToHalfWidth = (value) => {
  if (!value) return value;
  const fullWidthMap = {
    '０': '0',
    '１': '1',
    '２': '2',
    '３': '3',
    '４': '4',
    '５': '5',
    '６': '6',
    '７': '7',
    '８': '8',
    '９': '9',
  };
  return value.replace(/[０-９]/g, (match) => fullWidthMap[match]);
};

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeForm, setActiveForm] = useState(null);
  const [flashMessage, setFlashMessage] = useState({ type: '', message: '' });
  const [addFormData, setAddFormData] = useState({
    name: '',
    target_amount: '',
    contribution_period: '',
    contribution_type: '',
    deadline: '',
    category_id: '',
    note: '',
  });
  const [editFormData, setEditFormData] = useState({
    goal_id: '',
    name: '',
    target_amount: '',
    contribution_period: '',
    contribution_type: '',
    deadline: '',
    category_id: '',
    note: '',
  });
  const [deleteGoalId, setDeleteGoalId] = useState('');
  const [errors, setErrors] = useState({});
  const toastRef = useRef(null); // Thêm toastRef

  // Hàm hiển thị toast thông báo
  const showToast = (message, type = 'success') => {
    const toastContainer = toastRef.current;
    if (!toastContainer) return;

    const toastId = `toast-${Date.now()}`;
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    toastContainer.appendChild(toast);

    const bsToast = new window.bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();

    toast.addEventListener('hidden.bs.toast', () => {
      toast.remove();
    });
  };

  // Hàm hiển thị toast xác nhận
  const showConfirmToast = (message, onConfirm) => {
    const toastContainer = toastRef.current;
    if (!toastContainer) return;

    const toastId = `toast-confirm-${Date.now()}`;
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = 'toast align-items-center text-white bg-warning border-0';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <div class="ms-auto me-2 m-auto">
          <button type="button" class="btn btn-sm btn-success me-2" id="${toastId}-confirm">Xác nhận</button>
          <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="toast" id="${toastId}-cancel">Hủy</button>
        </div>
      </div>
    `;

    toastContainer.appendChild(toast);

    const bsToast = new window.bootstrap.Toast(toast, { autohide: false });
    bsToast.show();

    const confirmButton = document.getElementById(`${toastId}-confirm`);
    const cancelButton = document.getElementById(`${toastId}-cancel`);

    confirmButton.addEventListener('click', () => {
      onConfirm();
      bsToast.hide();
    });

    toast.addEventListener('hidden.bs.toast', () => {
      toast.remove();
    });
  };

  useEffect(() => {
    fetchGoals();
    fetchCategories();
  }, [currentPage]);

  const fetchGoals = async () => {
    try {
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Vui lòng đăng nhập lại.', 'danger');
        window.location.href = '/login';
        return;
      }

      const response = await axios.get(`http://localhost:8000/api/goals?page=${currentPage}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setGoals(response.data.data.map(goal => ({
        ...goal,
        target_amount: normalizeToHalfWidth(String(goal.target_amount)),
      })));
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error('Fetch goals error:', error.response?.data || error.message);
      showToast('Lỗi khi tải danh sách mục tiêu.', 'danger');
    }
  };

  const fetchCategories = async () => {
    try {
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Vui lòng đăng nhập lại.', 'danger');
        window.location.href = '/login';
        return;
      }

      const response = await axios.get('http://localhost:8000/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Fetch categories error:', error.response?.data || error.message);
      showToast('Lỗi khi tải danh sách danh mục.', 'danger');
    }
  };

  const showForm = (form) => {
    setActiveForm(form);
    setErrors({});
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    const normalizedValue = name === 'target_amount' ? normalizeToHalfWidth(value) : value;
    if (name === 'name' && value.length > 50) {
      showToast('Tên mục tiêu không được vượt quá 50 ký tự.', 'danger');
      return;
    }
    if (name === 'note' && value.length > 1000) {
      showToast('Ghi chú không được vượt quá 1000 ký tự.', 'danger');
      return;
    }
    setAddFormData({ ...addFormData, [name]: normalizedValue });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (
      !addFormData.name ||
      !addFormData.target_amount ||
      !addFormData.contribution_period ||
      !addFormData.contribution_type ||
      !addFormData.category_id
    ) {
      showToast('Vui lòng điền đầy đủ các trường bắt buộc.', 'danger');
      return;
    }

    if (isNaN(addFormData.target_amount) || addFormData.target_amount <= 0) {
      showToast('Số tiền mục tiêu phải là số dương.', 'danger');
      return;
    }

    showConfirmToast(
      'Bạn có muốn thêm mục tiêu này không?',
      async () => {
        try {
          await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
          const token = localStorage.getItem('token');
          if (!token) {
            showToast('Vui lòng đăng nhập lại.', 'danger');
            window.location.href = '/login';
            return;
          }

          const payload = {
            name: addFormData.name,
            target_amount: parseFloat(addFormData.target_amount),
            contribution_period: addFormData.contribution_period,
            contribution_type: addFormData.contribution_type,
            deadline: addFormData.deadline || null,
            category_id: parseInt(addFormData.category_id),
            note: addFormData.note || null,
          };

          const response = await axios.post('http://localhost:8000/api/goals', payload, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
          showToast('Đã thêm mục tiêu!', 'success');
          fetchGoals();
          setActiveForm(null);
          setAddFormData({
            name: '',
            target_amount: '',
            contribution_period: '',
            contribution_type: '',
            deadline: '',
            category_id: '',
            note: '',
          });
          setErrors({});
        } catch (error) {
          console.error('Add goal error:', error.response?.data || error.message);
          if (error.response?.data?.errors) {
            setErrors(error.response.data.errors);
            const errorMessages = Object.values(error.response.data.errors).flat().join(' ');
            showToast(`Lỗi: ${errorMessages}`, 'danger');
          } else {
            showToast(error.response?.data?.error || 'Có lỗi xảy ra khi thêm mục tiêu.', 'danger');
          }
        }
      }
    );
  };

  const handleEditGoalChange = (e) => {
    const goalId = e.target.value;
    setEditFormData({ ...editFormData, goal_id: goalId });
    const goal = goals.find((g) => g.id === parseInt(goalId));
    if (goal) {
      setEditFormData({
        goal_id: goalId,
        name: goal.name || '',
        target_amount: normalizeToHalfWidth(String(goal.target_amount)) || '',
        contribution_period: goal.contribution_period || '',
        contribution_type: goal.contribution_type || '',
        deadline: goal.deadline || '',
        category_id: goal.category?.id || '',
        note: goal.note || '',
        updated_at: goal.updated_at ? goal.updated_at : new Date().toISOString().replace('T', ' ').slice(0, 19),
      });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const normalizedValue = name === 'target_amount' ? normalizeToHalfWidth(value) : value;
    if (name === 'name' && value.length > 50) {
      showToast('Tên mục tiêu không được vượt quá 50 ký tự.', 'danger');
      return;
    }
    if (name === 'note' && value.length > 1000) {
      showToast('Ghi chú không được vượt quá 1000 ký tự.', 'danger');
      return;
    }
    setEditFormData({ ...editFormData, [name]: normalizedValue });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (
      !editFormData.goal_id ||
      !editFormData.name ||
      !editFormData.target_amount ||
      !editFormData.contribution_period ||
      !editFormData.contribution_type ||
      !editFormData.category_id
    ) {
      showToast('Vui lòng điền đầy đủ các trường bắt buộc.', 'danger');
      return;
    }

    if (isNaN(editFormData.target_amount) || editFormData.target_amount <= 0) {
      showToast('Số tiền mục tiêu phải là số dương.', 'danger');
      return;
    }

    showConfirmToast(
      'Bạn có muốn sửa mục tiêu này không?',
      async () => {
        try {
          await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
          const token = localStorage.getItem('token');
          if (!token) {
            showToast('Vui lòng đăng nhập lại.', 'danger');
            window.location.href = '/login';
            return;
          }

          const formattedUpdatedAt = editFormData.updated_at
            ? new Date(editFormData.updated_at).toISOString().replace('T', ' ').slice(0, 19)
            : null;

          const payload = {
            name: editFormData.name,
            target_amount: parseFloat(editFormData.target_amount),
            contribution_period: editFormData.contribution_period,
            contribution_type: editFormData.contribution_type,
            deadline: editFormData.deadline || null,
            category_id: parseInt(editFormData.category_id),
            note: editFormData.note || null,
            updated_at: formattedUpdatedAt,
          };

          const response = await axios.put(`http://localhost:8000/api/goals/${editFormData.goal_id}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
          showToast('Đã cập nhật mục tiêu!', 'success');
          fetchGoals();
          setActiveForm(null);
          setEditFormData({
            goal_id: '',
            name: '',
            target_amount: '',
            contribution_period: '',
            contribution_type: '',
            deadline: '',
            category_id: '',
            note: '',
            updated_at: '',
          });
          setErrors({});
        } catch (error) {
          console.error('Edit goal error:', error.response?.data || error.message);
          if (error.response?.data?.errors) {
            setErrors(error.response.data.errors);
            const errorMessages = Object.values(error.response.data.errors).flat().join(' ');
            showToast(`Lỗi: ${errorMessages}`, 'danger');
          } else if (error.response?.status === 409) {
            showToast('Hãy tải lại trang để cập nhật.', 'danger');
            setTimeout(() => window.location.reload(), 2000);
          } else {
            showToast(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật mục tiêu.', 'danger');
          }
        }
      }
    );
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();

    if (!deleteGoalId) {
      showToast('Vui lòng chọn mục tiêu để xóa.', 'danger');
      return;
    }

    showConfirmToast(
      deleteGoalId === 'all'
        ? 'Bạn chắc chắn muốn xóa TẤT CẢ mục tiêu? Hành động này không thể khôi phục!'
        : 'Bạn chắc chắn muốn xóa mục tiêu này?',
      async () => {
        try {
          await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
          const token = localStorage.getItem('token');
          if (!token) {
            showToast('Vui lòng đăng nhập lại.', 'danger');
            window.location.href = '/login';
            return;
          }

          const url = deleteGoalId === 'all' ? 'http://localhost:8000/api/goals/delete-all' : `http://localhost:8000/api/goals/${deleteGoalId}`;
          await axios.delete(url, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
          showToast('Đã xóa mục tiêu!', 'success');
          fetchGoals();
          setActiveForm(null);
          setDeleteGoalId('');
        } catch (error) {
          console.error('Delete goal error:', error.response?.data || error.message);
          showToast('Có lỗi xảy ra khi xóa mục tiêu.', 'danger');
        }
      }
    );
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <div style={{ width: '245px', backgroundColor: '#f8f9fa' }}>
        <Slider />
      </div>
      <div className="flex-grow-1">
        <Header />
        <div className="p-4">
          <h2 className="mb-4">Quản Lý Mục Tiêu Tài Chính</h2>

          {flashMessage.message && (
            <FlashMessage type={flashMessage.type} message={flashMessage.message} setFlashMessage={setFlashMessage} />
          )}

          <GoalList
            goals={goals}
            categories={categories}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />

          <div className="mb-4">
            <button className="btn btn-success me-2" onClick={() => showForm('addForm')}>
              Thêm Mục Tiêu
            </button>
            <button className="btn btn-warning me-2" onClick={() => showForm('editForm')}>
              Sửa Mục Tiêu
            </button>
            <button className="btn btn-danger" onClick={() => showForm('deleteForm')}>
              Xóa Mục Tiêu
            </button>
          </div>

          <form onSubmit={handleAddSubmit} id="addForm" style={{ display: activeForm === 'addForm' ? 'block' : 'none' }}>
            <h4>Thêm Mục Tiêu</h4>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Tên Mục Tiêu:</label>
              <input
                type="text"
                name="name"
                id="name"
                value={addFormData.name}
                onChange={handleAddChange}
                className="form-control"
                placeholder="Ví dụ: Mua xe, Du lịch,..."
                required
              />
              {errors.name && <span className="text-danger">{errors.name[0]}</span>}
            </div>
            <div className="mb-3">
              <label htmlFor="target_amount" className="form-label">Số Tiền Mục Tiêu:</label>
              <input
                type="number"
                name="target_amount"
                id="target_amount"
                value={addFormData.target_amount}
                onChange={handleAddChange}
                className="form-control"
                placeholder="Ví dụ: 10000000"
                required
              />
              {errors.target_amount && <span className="text-danger">{errors.target_amount[0]}</span>}
            </div>
            <div className="mb-3">
              <label htmlFor="contribution_period" className="form-label">Kỳ Góp:</label>
              <select
                name="contribution_period"
                id="contribution_period"
                value={addFormData.contribution_period}
                onChange={handleAddChange}
                className="form-control"
                required
              >
                <option value="">-- Chọn Kỳ Góp --</option>
                <option value="daily">Hàng Ngày</option>
                <option value="weekly">Hàng Tuần</option>
                <option value="monthly">Hàng Tháng</option>
              </select>
              {errors.contribution_period && <span className="text-danger">{errors.contribution_period[0]}</span>}
            </div>
            <div className="mb-3">
              <label htmlFor="contribution_type" className="form-label">Loại Kỳ Góp:</label>
              <select
                name="contribution_type"
                id="contribution_type"
                value={addFormData.contribution_type}
                onChange={handleAddChange}
                className="form-control"
                required
              >
                <option value="">-- Chọn Loại Kỳ Góp --</option>
                <option value="fixed">Tiền Mặt</option>
                <option value="flexible">Ngân Hàng</option>
              </select>
              {errors.contribution_type && <span className="text-danger">{errors.contribution_type[0]}</span>}
            </div>
            <div className="mb-3">
              <label htmlFor="deadline" className="form-label">Hạn:</label>
              <input
                type="date"
                name="deadline"
                id="deadline"
                value={addFormData.deadline}
                onChange={handleAddChange}
                className="form-control"
              />
              {errors.deadline && <span className="text-danger">{errors.deadline[0]}</span>}
            </div>
            <div className="mb-3">
              <label htmlFor="category_id" className="form-label">Danh Mục:</label>
              <select
                name="category_id"
                id="category_id"
                value={addFormData.category_id}
                onChange={handleAddChange}
                className="form-control"
                required
              >
                <option value="">-- Chọn Danh Mục --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.type === 'income' ? 'Thu' : 'Chi'}){cat.color && ` - Màu: ${cat.color}`}
                  </option>
                ))}
              </select>
              {errors.category_id && <span className="text-danger">{errors.category_id[0]}</span>}
            </div>
            <div className="mb-3">
              <label htmlFor="note" className="form-label">Ghi Chú:</label>
              <textarea
                name="note"
                id="note"
                value={addFormData.note}
                onChange={handleAddChange}
                className="form-control"
                rows="3"
                placeholder="Ví dụ: Ghi chú về kế hoạch tiết kiệm..."
              />
              {errors.note && <span className="text-danger">{errors.note[0]}</span>}
            </div>
            <button type="submit" className="btn btn-primary mt-2">Lưu</button>
          </form>

          <form onSubmit={handleEditSubmit} id="editForm" style={{ display: activeForm === 'editForm' ? 'block' : 'none' }}>
            <h4>Sửa Mục Tiêu</h4>
            <div className="mb-3">
              <label htmlFor="edit_goal_id" className="form-label">Chọn Mục Tiêu:</label>
              <select
                name="goal_id"
                id="edit_goal_id"
                value={editFormData.goal_id}
                onChange={handleEditGoalChange}
                className="form-control"
                required
              >
                <option value="">-- Chọn Mục Tiêu --</option>
                {goals.map(goal => (
                  <option key={goal.id} value={goal.id}>
                    {goal.name} (Danh mục: {goal.category?.name || 'Không Có'} - {goal.category?.type === 'income' ? 'Thu' : 'Chi'})
                  </option>
                ))}
              </select>
              {errors.goal_id && <span className="text-danger">{errors.goal_id[0]}</span>}
            </div>
            <div className="mb-3">
              <label htmlFor="edit_name" className="form-label">Tên Mục Tiêu:</label>
              <input
                type="text"
                name="name"
                id="edit_name"
                value={editFormData.name}
                onChange={handleEditChange}
                className="form-control"
                placeholder="Ví dụ: Mua xe, Du lịch,..."
                required
              />
              {errors.name && <span className="text-danger">{errors.name[0]}</span>}
            </div>
            <div className="mb-3">
              <label htmlFor="edit_amount" className="form-label">Số Tiền Mục Tiêu:</label>
              <input
                type="number"
                name="target_amount"
                id="edit_amount"
                value={editFormData.target_amount}
                onChange={handleEditChange}
                className="form-control"
                placeholder="Ví dụ: 10000000"
                required
              />
              {errors.target_amount && <span className="text-danger">{errors.target_amount[0]}</span>}
            </div>
            <div className="mb-3">
              <label htmlFor="edit_contribution_period" className="form-label">Kỳ Góp:</label>
              <select
                name="contribution_period"
                id="edit_contribution_period"
                value={editFormData.contribution_period}
                onChange={handleEditChange}
                className="form-control"
                required
              >
                <option value="">-- Chọn Kỳ Góp --</option>
                <option value="daily">Hàng Ngày</option>
                <option value="weekly">Hàng Tuần</option>
                <option value="monthly">Hàng Tháng</option>
              </select>
              {errors.contribution_period && <span className="text-danger">{errors.contribution_period[0]}</span>}
            </div>
            <div className="mb-3">
              <label htmlFor="edit_contribution_type" className="form-label">Loại Kỳ Góp:</label>
              <select
                name="contribution_type"
                id="edit_contribution_type"
                value={editFormData.contribution_type}
                onChange={handleEditChange}
                className="form-control"
                required
              >
                <option value="">-- Chọn Loại Kỳ Góp --</option>
                <option value="fixed">Tiền Mặt</option>
                <option value="flexible">Ngân Hàng</option>
              </select>
              {errors.contribution_type && <span className="text-danger">{errors.contribution_type[0]}</span>}
            </div>
            <div className="mb-3">
              <label htmlFor="edit_deadline" className="form-label">Hạn:</label>
              <input
                type="date"
                name="deadline"
                id="edit_deadline"
                value={editFormData.deadline}
                onChange={handleEditChange}
                className="form-control"
              />
              {errors.deadline && <span className="text-danger">{errors.deadline[0]}</span>}
            </div>
            <div className="mb-3">
              <label htmlFor="edit_category_id" className="form-label">Danh Mục:</label>
              <select
                name="category_id"
                id="edit_category_id"
                value={editFormData.category_id}
                onChange={handleEditChange}
                className="form-control"
                required
              >
                <option value="">-- Chọn Danh Mục --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.type === 'income' ? 'Thu' : 'Chi'}){cat.color && ` - Màu: ${cat.color}`}
                  </option>
                ))}
              </select>
              {errors.category_id && <span className="text-danger">{errors.category_id[0]}</span>}
            </div>
            <div className="mb-3">
              <label htmlFor="edit_note" className="form-label">Ghi Chú:</label>
              <textarea
                name="note"
                id="edit_note"
                value={editFormData.note}
                onChange={handleEditChange}
                className="form-control"
                rows="3"
                placeholder="Ví dụ: Ghi chú về kế hoạch tiết kiệm..."
              />
              {errors.note && <span className="text-danger">{errors.note[0]}</span>}
            </div>
            <button type="submit" className="btn btn-warning mt-2">Cập Nhật</button>
          </form>

          <form onSubmit={handleDeleteSubmit} id="deleteForm" style={{ display: activeForm === 'deleteForm' ? 'block' : 'none' }}>
            <h4>Xóa Mục Tiêu</h4>
            <div className="mb-3">
              <label htmlFor="delete_goal_id" className="form-label">Chọn Mục Tiêu Cần Xóa:</label>
              <select
                name="goal_id"
                id="delete_goal_id"
                value={deleteGoalId}
                onChange={(e) => setDeleteGoalId(e.target.value)}
                className="form-control"
                required
              >
                <option value="">-- Chọn Mục Tiêu --</option>
                {goals.map(goal => (
                  <option key={goal.id} value={goal.id}>
                    {goal.name} (Danh mục: {goal.category?.name || 'Không có'} - {goal.category?.type === 'income' ? 'Thu' : 'Chi'})
                  </option>
                ))}
              </select>
              {errors.goal_id && <span className="text-danger">{errors.goal_id[0]}</span>}
            </div>
            <button type="submit" className="btn btn-danger mt-2">Xóa</button>
          </form>
          <div className="toast-container position-fixed top-0 end-0 p-3" ref={toastRef}></div>
        </div>
      </div>
    </div>
  );
};

export default Goals;