import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GoalList from './GoalList';
import FlashMessage from './FlashMessage';
import Header from './Header';
import Slider from './Slider';

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
    contribution_type: '', // Add this
    deadline: '',        // Add this
    category_id: '',
  });
  const [editFormData, setEditFormData] = useState({
    goal_id: '',
    name: '',
    target_amount: '',
    contribution_period: '',
    contribution_type: '', // Add this
    deadline: '',        // Add this
    category_id: '',
  });
  const [deleteGoalId, setDeleteGoalId] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchGoals();
    fetchCategories();
  }, [currentPage]);

  const fetchGoals = async () => {
    try {
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
      const token = localStorage.getItem('token');
      if (!token) {
        setFlashMessage({ type: 'error', message: 'Vui lòng đăng nhập lại.' });
        window.location.href = '/login';
        return;
      }

      const response = await axios.get(`http://localhost:8000/api/goals?page=${currentPage}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setGoals(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error('Fetch goals error:', error.response?.data || error.message);
      setFlashMessage({ type: 'error', message: 'Lỗi khi tải danh sách mục tiêu.' });
    }
  };

  const fetchCategories = async () => {
    try {
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
      const token = localStorage.getItem('token');
      if (!token) {
        setFlashMessage({ type: 'error', message: 'Vui lòng đăng nhập lại.' });
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
      setFlashMessage({ type: 'error', message: 'Lỗi khi tải danh sách danh mục.' });
    }
  };

  const showForm = (form) => {
    setActiveForm(form);
    setErrors({});
  };

  const handleAddChange = (e) => {
    setAddFormData({ ...addFormData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
      const token = localStorage.getItem('token');
      if (!token) {
        setFlashMessage({ type: 'error', message: 'Vui lòng đăng nhập lại.' });
        window.location.href = '/login';
        return;
      }

      const payload = {
        name: addFormData.name,
        target_amount: parseFloat(addFormData.target_amount),
        contribution_period: addFormData.contribution_period,
        contribution_type: addFormData.contribution_type,
        deadline: addFormData.deadline || null, // Send null if empty
        category_id: parseInt(addFormData.category_id),
      };

      // Client-side validation
      if (
        !payload.name ||
        isNaN(payload.target_amount) ||
        !payload.contribution_period ||
        !payload.contribution_type ||
        isNaN(payload.category_id)
      ) {
        setFlashMessage({ type: 'error', message: 'Vui lòng điền đầy đủ và đúng định dạng tất cả các trường.' });
        return;
      }

      console.log('Payload:', payload);
      const response = await axios.post('http://localhost:8000/api/goals', payload, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      console.log('Response:', response.data);
      setFlashMessage({ type: 'success', message: 'Đã thêm mục tiêu!' });
      fetchGoals();
      setActiveForm(null);
      setAddFormData({
        name: '',
        target_amount: '',
        contribution_period: '',
        contribution_type: '',
        deadline: '',
        category_id: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Add goal error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        const errorMessages = Object.values(error.response.data.errors).flat().join(' ');
        setFlashMessage({ type: 'error', message: `Lỗi: ${errorMessages}` });
      } else {
        setFlashMessage({ type: 'error', message: error.response?.data?.error || 'Có lỗi xảy ra khi thêm mục tiêu.' });
      }
    }
  };

  const handleEditGoalChange = (e) => {
    const goalId = e.target.value;
    setEditFormData({ ...editFormData, goal_id: goalId });
    const goal = goals.find(g => g.id === parseInt(goalId));
    if (goal) {
      setEditFormData({
        goal_id: goalId,
        name: goal.name || '',
        target_amount: goal.target_amount || '',
        contribution_period: goal.contribution_period || '',
        contribution_type: goal.contribution_type || '',
        deadline: goal.deadline || '',
        category_id: goal.category?.id || '',
      });
    }
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.goal_id) {
      setFlashMessage({ type: 'error', message: 'Vui lòng chọn mục tiêu để sửa.' });
      return;
    }
    try {
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
      const token = localStorage.getItem('token');
      if (!token) {
        setFlashMessage({ type: 'error', message: 'Vui lòng đăng nhập lại.' });
        window.location.href = '/login';
        return;
      }

      const payload = {
        name: editFormData.name,
        target_amount: parseFloat(editFormData.target_amount),
        contribution_period: editFormData.contribution_period,
        contribution_type: editFormData.contribution_type,
        deadline: editFormData.deadline || null,
        category_id: parseInt(editFormData.category_id),
      };

      await axios.put(`http://localhost:8000/api/goals/${editFormData.goal_id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setFlashMessage({ type: 'success', message: 'Đã cập nhật mục tiêu!' });
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
      });
      setErrors({});
    } catch (error) {
      console.error('Edit goal error:', error.response?.data || error.message);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        const errorMessages = Object.values(error.response.data.errors).flat().join(' ');
        setFlashMessage({ type: 'error', message: `Lỗi: ${errorMessages}` });
      } else {
        setFlashMessage({ type: 'error', message: 'Có lỗi xảy ra khi cập nhật mục tiêu.' });
      }
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    if (!deleteGoalId) {
      setFlashMessage({ type: 'error', message: 'Vui lòng chọn mục tiêu để xóa.' });
      return;
    }
    if (deleteGoalId === 'all' && !window.confirm('Bạn chắc chắn muốn xóa TẤT CẢ mục tiêu? Hành động này không thể khôi phục!')) {
      return;
    } else if (deleteGoalId !== 'all' && !window.confirm('Bạn chắc chắn muốn xóa mục tiêu này?')) {
      return;
    }
    try {
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
      const token = localStorage.getItem('token');
      if (!token) {
        setFlashMessage({ type: 'error', message: 'Vui lòng đăng nhập lại.' });
        window.location.href = '/login';
        return;
      }

      const url = deleteGoalId === 'all' ? 'http://localhost:8000/api/goals/delete-all' : `http://localhost:8000/api/goals/${deleteGoalId}`;
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setFlashMessage({ type: 'success', message: 'Đã xóa mục tiêu!' });
      fetchGoals();
      setActiveForm(null);
      setDeleteGoalId('');
    } catch (error) {
      console.error('Delete goal error:', error.response?.data || error.message);
      setFlashMessage({ type: 'error', message: 'Có lỗi xảy ra khi xóa mục tiêu.' });
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Sidebar */}
      <div style={{ width: '245px', backgroundColor: '#f8f9fa' }}>
        <Slider />
      </div>

      {/* Main content */}
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
                <option value="fixed">Cố Định</option>
                <option value="flexible">Linh Hoạt</option>
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
                    {goal.name} (Danh mục: {goal.category?.name || 'Không có'} - {goal.category?.type === 'income' ? 'Thu' : 'Chi'})
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
                <option value="fixed">Cố Định</option>
                <option value="flexible">Linh Hoạt</option>
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
                <option value="all">Xóa Tất Cả</option>
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
        </div>
      </div>
    </div>
  );
};

export default Goals;