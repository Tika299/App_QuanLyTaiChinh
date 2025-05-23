import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GoalList from './GoalList';
import FlashMessage from './FlashMessage';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeForm, setActiveForm] = useState(null);
  const [flashMessage, setFlashMessage] = useState({ type: '', message: '' });
  const [addFormData, setAddFormData] = useState({
    name: '',
    category_id: '',
    target_amount: '',
    due_date: '',
    note: '',
  });
  const [editFormData, setEditFormData] = useState({
    goal_id: '',
    name: '',
    category_id: '',
    target_amount: '',
    due_date: '',
    note: '',
  });
  const [deleteGoalId, setDeleteGoalId] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchGoals();
    fetchCategories();
  }, [currentPage]);

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/goals?page=${currentPage}`, { withCredentials: true });
      setGoals(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      setFlashMessage({ type: 'error', message: 'Lỗi khi tải danh sách mục tiêu.' });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/categories');
      setCategories(response.data);
      console.log('Categories:', response.data);
    } catch (error) {
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
      const payload = {
        name: addFormData.name,
        category_id: parseInt(addFormData.category_id),
        target_amount: parseFloat(addFormData.target_amount),
        due_date: addFormData.due_date,
        note: addFormData.note || null,
      };
      console.log('Payload:', payload);
      const response = await axios.post('http://localhost:8000/api/goals', payload, { withCredentials: true });
      console.log('Response:', response.data);
      setFlashMessage({ type: 'success', message: 'Đã thêm mục tiêu!' });
      fetchGoals();
      setActiveForm(null);
      setAddFormData({ name: '', category_id: '', target_amount: '', due_date: '', note: '' });
      setErrors({});
    } catch (error) {
      console.error('Add goal error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        setFlashMessage({ type: 'error', message: 'Vui lòng kiểm tra các trường nhập.' });
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
        category_id: goal.category_id || '',
        target_amount: goal.target_amount || '',
        due_date: goal.due_date ? goal.due_date.split('T')[0] : '',
        note: goal.note || '',
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
      const payload = {
        name: editFormData.name,
        category_id: parseInt(editFormData.category_id),
        target_amount: parseFloat(editFormData.target_amount),
        due_date: editFormData.due_date,
        note: editFormData.note,
      };
      await axios.put(`http://localhost:8000/api/goals/${editFormData.goal_id}`, payload, { withCredentials: true });
      setFlashMessage({ type: 'success', message: 'Đã cập nhật mục tiêu!' });
      fetchGoals();
      setActiveForm(null);
      setEditFormData({ goal_id: '', name: '', category_id: '', target_amount: '', due_date: '', note: '' });
      setErrors({});
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
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
      const url = deleteGoalId === 'all' ? 'http://localhost:8000/api/goals/delete-all' : `http://localhost:8000/api/goals/${deleteGoalId}`;
      await axios.delete(url, { withCredentials: true });
      setFlashMessage({ type: 'success', message: 'Đã xóa mục tiêu!' });
      fetchGoals();
      setActiveForm(null);
      setDeleteGoalId('');
    } catch (error) {
      setFlashMessage({ type: 'error', message: 'Có lỗi xảy ra khi xóa mục tiêu.' });
    }
  };

  return (
    <div className="container mt-5">
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
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.category_id && <span className="text-danger">{errors.category_id[0]}</span>}
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
          <label htmlFor="due_date" className="form-label">Hạn Hoàn Thành:</label>
          <input
            type="date"
            name="due_date"
            id="due_date"
            value={addFormData.due_date}
            onChange={handleAddChange}
            className="form-control"
            required
          />
          {errors.due_date && <span className="text-danger">{errors.due_date[0]}</span>}
        </div>
        <div className="mb-3">
          <label htmlFor="note" className="form-label">Ghi Chú:</label>
          <textarea
            name="note"
            id="note"
            value={addFormData.note}
            onChange={handleAddChange}
            className="form-control"
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
                {goal.name} ({new Date(goal.due_date).toLocaleDateString('vi-VN')})
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
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.category_id && <span className="text-danger">{errors.category_id[0]}</span>}
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
          <label htmlFor="edit_date" className="form-label">Hạn Hoàn Thành:</label>
          <input
            type="date"
            name="due_date"
            id="edit_date"
            value={editFormData.due_date}
            onChange={handleEditChange}
            className="form-control"
            required
          />
          {errors.due_date && <span className="text-danger">{errors.due_date[0]}</span>}
        </div>
        <div className="mb-3">
          <label htmlFor="edit_note" className="form-label">Ghi Chú:</label>
          <textarea
            name="note"
            id="edit_note"
            value={editFormData.note}
            onChange={handleEditChange}
            className="form-control"
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
            <option value="all">Xóa Tất Cả</option>
            {goals.map(goal => (
              <option key={goal.id} value={goal.id}>
                {goal.name} ({new Date(goal.due_date).toLocaleDateString('vi-VN')})
              </option>
            ))}
          </select>
          {errors.goal_id && <span className="text-danger">{errors.goal_id[0]}</span>}
        </div>
        <button type="submit" className="btn btn-danger mt-2">Xóa</button>
      </form>
    </div>
  );
};

export default Goals;