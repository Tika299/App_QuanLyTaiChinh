import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from './Header';
import Slider from './Slider';
import { useNavigate } from 'react-router-dom';

// Cấu hình axios
axios.defaults.baseURL = 'http://127.0.0.1:8000/api';
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function Transaction() {
  const today = new Date().toISOString().slice(0, 10);
  const [giaoDich, setGiaoDich] = useState([]);
  const [locDanhMuc, setLocDanhMuc] = useState('Tất cả');
  const [locNgay, setLocNgay] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [showModalDetail, setShowModalDetail] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('income');
  const [loiCategory, setLoiCategory] = useState('');
  const inputRef = useRef(undefined);
  const [formData, setFormData] = useState({
    ten: '',
    soTien: '',
    category_id: '',
    ngay: '',
    moTa: '',
  });
  const [formDataEdit, setFormDataEdit] = useState({
    id: null,
    ten: '',
    soTien: '',
    category_id: '',
    ngay: '',
    moTa: '',
    updated_at: '',
  });
  const [loi, setLoi] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const toastRef = useRef(null);

  // Hàm hiển thị toast
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

  // Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories', {
        withCredentials: true,
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh mục:', error);
      setLoi(error.response?.data?.error || 'Không thể tải danh sách danh mục');
    }
  };

  // Lấy danh sách giao dịch
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (locDanhMuc !== 'Tất cả') params.danhMuc = locDanhMuc;
      if (locNgay) params.ngay = locNgay;

      const response = await axios.get('/transactions', { params, withCredentials: true });
      setGiaoDich(response.data.map(item => ({
        ...item,
        category_color: item.category_color || '#000000',
      })));
    } catch (error) {
      setLoi(error.response?.data?.error || 'Không thể tải danh sách giao dịch');
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, [locDanhMuc, locNgay]);

  const handleChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit) {
      setFormDataEdit({ ...formDataEdit, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setLoi('');
  };

  const validateForm = (data) => {
    const { ten, soTien, category_id, ngay } = data;
    const today = new Date().toISOString().slice(0, 10);
    if (!ten) return 'Vui lòng nhập tên giao dịch';
    if (!soTien) return 'Vui lòng nhập số tiền giao dịch';
    if (isNaN(soTien) || soTien <= 0) return 'Số tiền phải là số dương';
    if (!category_id) return 'Vui lòng chọn danh mục';
    if (!ngay) return 'Vui lòng chọn ngày giao dịch';
    if (ngay > today) return 'Không được chọn ngày giao dịch trong tương lai';
    return '';
  };

  // Thêm category mới
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setLoiCategory('Vui lòng nhập tên danh mục');
      return;
    }
    try {
      await axios.post('/categories', {
        name: newCategoryName,
        type: newCategoryType,
      }, { withCredentials: true });
      setShowAddCategory(false);
      setNewCategoryName('');
      setNewCategoryType('income');
      setLoiCategory('');
      fetchCategories();
      showToast('Danh mục đã được thêm thành công!', 'success');
    } catch (error) {
      setLoiCategory(error.response?.data?.error || 'Lỗi khi thêm danh mục');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loiValidate = validateForm(formData);
    if (loiValidate) {
      setLoi(loiValidate);
      return;
    }

    try {
      setLoading(true);
      await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', { withCredentials: true });
      const response = await axios.post(
        '/transactions',
        {
          ten: formData.ten,
          soTien: parseFloat(formData.soTien),
          category_id: parseInt(formData.category_id),
          ngay: formData.ngay,
          moTa: formData.moTa,
        },
        { withCredentials: true }
      );
      setGiaoDich([...giaoDich, response.data]);
      showToast('Giao dịch đã được thêm thành công!', 'success');
      setShowModal(false);
      setFormData({ ten: '', soTien: '', category_id: '', ngay: '', moTa: '' });
      navigate('/dashboard?refresh=true');
    } catch (error) {
      console.log('Phản hồi lỗi:', error.response?.data);
      setLoi(error.response?.data?.error || 'Lỗi khi thêm giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const xuLySuaGiaoDich = (id) => {
    const transaction = giaoDich.find(gd => gd.id === id);
    if (transaction) {
      setFormDataEdit({
        id: transaction.id,
        ten: transaction.ten,
        soTien: transaction.soTien,
        category_id: transaction.category_id,
        ngay: transaction.ngay,
        moTa: transaction.moTa,
        updated_at: transaction.updated_at,
      });
      setShowModalEdit(true);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    const loiValidate = validateForm(formDataEdit);
    if (loiValidate) {
      setLoi(loiValidate);
      return;
    }

    const originalTransaction = giaoDich.find(gd => gd.id === formDataEdit.id);
    if (originalTransaction && originalTransaction.ngay !== formDataEdit.ngay) {
      if (!window.confirm('Bạn có chắc chắn muốn thay đổi ngày giao dịch không?')) {
        return;
      }
    }

    try {
      setLoading(true);
      await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', { withCredentials: true });
      const response = await axios.put(
        `/transactions/${formDataEdit.id}`,
        {
          ten: formDataEdit.ten,
          soTien: parseFloat(formDataEdit.soTien),
          category_id: parseInt(formDataEdit.category_id),
          ngay: formDataEdit.ngay,
          moTa: formDataEdit.moTa,
        },
        { withCredentials: true }
      );
      setGiaoDich(giaoDich.map(gd => (gd.id === formDataEdit.id ? response.data : gd)));
      showToast('Giao dịch đã được cập nhật thành công!', 'success');
      setShowModalEdit(false);
      setFormDataEdit({ id: null, ten: '', soTien: '', category_id: '', ngay: '', moTa: '', updated_at: '' });
      navigate('/dashboard?refresh=true');
    } catch (error) {
      console.log('Phản hồi lỗi:', error.response?.data);
      if (error.response?.status === 422) {
        setLoi(error.response?.data?.error || 'Dữ liệu không hợp lệ, vui lòng kiểm tra lại ngày hoặc các trường khác.');
      } else {
        setLoi(error.response?.data?.error || 'Lỗi khi cập nhật giao dịch');
      }
    } finally {
      setLoading(false);
    }
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

  const xuLyXoaGiaoDich = async (id) => {
    showConfirmToast('Bạn có chắc chắn muốn xóa giao dịch này không?', async () => {
      try {
        setLoading(true);
        await axios.delete(`/transactions/${id}`, { withCredentials: true });
        setGiaoDich(giaoDich.filter(gd => gd.id !== id));
        showToast('Giao dịch đã được xóa!', 'success');
        navigate('/dashboard?refresh=true');
      } catch (error) {
        console.log('Phản hồi lỗi:', error.response?.data);
        setLoi(error.response?.data?.error || 'Lỗi khi xóa giao dịch');
      } finally {
        setLoading(false);
      }
    });
  };

  const xuLyXemChiTiet = async (id) => {
    try {
      const existingTransaction = giaoDich.find(gd => gd.id === id);
      if (existingTransaction) {
        setSelectedTransaction(existingTransaction);
        setShowModalDetail(true);
      } else {
        const response = await axios.get(`/transactions/${id}`, { withCredentials: true });
        setSelectedTransaction({
          ...response.data,
          category_name: response.data.category_name || 'Không xác định',
          category_color: response.data.category_color || '#000000',
          danhMuc: response.data.danhMuc || 'Không xác định',
        });
        setShowModalDetail(true);
      }
    } catch (error) {
      console.log('Phản hồi lỗi:', error.response?.data);
      setLoi(error.response?.data?.error || 'Lỗi khi xem chi tiết giao dịch');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ ten: '', soTien: '', category_id: '', ngay: '', moTa: '' });
    setLoi('');
  };

  const handleCloseModalEdit = () => {
    setShowModalEdit(false);
    setFormDataEdit({ id: null, ten: '', soTien: '', category_id: '', ngay: '', moTa: '', updated_at: '' });
    setLoi('');
  };

  const handleCloseModalDetail = () => {
    setShowModalDetail(false);
    setSelectedTransaction(null);
    setLoi('');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'locDanhMuc') setLocDanhMuc(value);
    if (name === 'locNgay') setLocNgay(value);
    setCurrentPage(1);
  };

  const totalItems = giaoDich.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = giaoDich.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <div style={{ width: '245px', backgroundColor: '#f8f9fa' }}>
        <Slider />
      </div>
      <div className="flex-grow-1">
        <Header />
        <div className="p-4">
          <div className="container-fluid py-4 bg-light min-vh-100">
            <div className="container">
              <h1 className="mb-4 fw-bold">Quản lý Giao dịch</h1>
              <div className="toast-container position-fixed top-0 end-0 p-3" ref={toastRef}></div>
              {loading && (
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              )}
              {loi && <div className="alert alert-danger">{loi}</div>}
              <div className="card mb-4 shadow-sm border-0">
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label htmlFor="locDanhMuc" className="form-label">
                        Lọc theo Danh mục
                      </label>
                      <select
                        id="locDanhMuc"
                        name="locDanhMuc"
                        value={locDanhMuc}
                        onChange={handleFilterChange}
                        className="form-select"
                      >
                        {['Tất cả', 'Thu nhập', 'Chi tiêu'].map(dm => (
                          <option key={dm} value={dm}>
                            {dm}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="locNgay" className="form-label">
                        Lọc theo Ngày
                      </label>
                      <input
                        id="locNgay"
                        type="date"
                        name="locNgay"
                        value={locNgay}
                        onChange={handleFilterChange}
                        className="form-control"
                        max={today}
                      />
                    </div>
                    <div className="col-md-4 d-flex align-items-end">
                      <button
                        onClick={() => setShowModal(true)}
                        className="btn btn-primary w-100"
                        disabled={loading}
                      >
                        Thêm Giao dịch
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th scope="col">Tên</th>
                          <th scope="col">Số tiền</th>
                          <th scope="col">Danh mục</th>
                          <th scope="col">Ngày</th>
                          <th scope="col">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedTransactions.map(gd => (
                          <tr key={gd.id}>
                            <td>{gd.ten}</td>
                            <td className={gd.danhMuc === "Thu nhập" ? 'text-success' : 'text-danger'}>
                              {Math.abs(gd.soTien).toLocaleString('vi-VN')} VNĐ
                            </td>
                            <td>
                              <span
                                style={{
                                  backgroundColor: gd.category_color,
                                  color: '#fff',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                }}
                              >
                                {gd.category_name}
                              </span>
                            </td>
                            <td>{toDisplayDateFormat(gd.ngay)}</td>
                            <td>
                              <button
                                onClick={() => xuLyXemChiTiet(gd.id)}
                                className="btn btn-link text-primary p-0 me-2"
                                disabled={loading}
                              >
                                Xem
                              </button>
                              <button
                                onClick={() => xuLySuaGiaoDich(gd.id)}
                                className="btn btn-link text-warning p-0 me-2"
                                disabled={loading}
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => xuLyXoaGiaoDich(gd.id)}
                                className="btn btn-link text-danger p-0"
                                disabled={loading}
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totalPages > 1 && (
                    <nav className="mt-3">
                      <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Trước
                          </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <li
                            key={page}
                            className={`page-item ${currentPage === page ? 'active' : ''}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Sau
                          </button>
                        </li>
                      </ul>
                      <div className="text-center">
                        Trang {currentPage} / {totalPages}
                      </div>
                    </nav>
                  )}
                </div>
              </div>

              {/* Modal thêm danh mục */}
              {showAddCategory && (
                <div className="modal fade show d-block" tabIndex="-1">
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      <form onSubmit={handleAddCategory}>
                        <div className="modal-header">
                          <h5 className="modal-title">Thêm Danh mục mới</h5>
                          <button type="button" className="btn-close" onClick={() => setShowAddCategory(false)}></button>
                        </div>
                        <div className="modal-body">
                          {loiCategory && <div className="alert alert-danger">{loiCategory}</div>}
                          <div className="mb-3">
                            <label className="form-label">Tên danh mục</label>
                            <input
                              ref={inputRef}
                              type="text"
                              className="form-control"
                              value={newCategoryName}
                              onChange={e => setNewCategoryName(e.target.value)}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Loại</label>
                            <select
                              className="form-select"
                              value={newCategoryType}
                              onChange={e => setNewCategoryType(e.target.value)}
                            >
                              <option value="income">Thu nhập</option>
                              <option value="expense">Chi tiêu</option>
                            </select>
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button type="submit" className="btn btn-success">Thêm</button>
                          <button type="button" className="btn btn-secondary" onClick={() => setShowAddCategory(false)}>Hủy</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Thêm Giao dịch</h5>
                      <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                    </div>
                    <div className="modal-body">
                      <form onSubmit={handleSubmit}>
                        {loi && <div className="alert alert-danger">{loi}</div>}
                        <div className="mb-3">
                          <label htmlFor="ten" className="form-label">
                            Tên giao dịch
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="ten"
                            name="ten"
                            value={formData.ten}
                            onChange={handleChange}
                            placeholder="Ví dụ: Mua thực phẩm"
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="soTien" className="form-label">
                            Số tiền (VNĐ)
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            id="soTien"
                            name="soTien"
                            value={formData.soTien}
                            onChange={handleChange}
                            placeholder="Nhập số tiền"
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="category_id" className="form-label">
                            Danh mục
                          </label>
                          <div className="input-group">
                            <select
                              className="form-select"
                              id="category_id"
                              name="category_id"
                              value={formData.category_id}
                              onChange={handleChange}
                            >
                              <option value="">Chọn danh mục</option>
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name} ({cat.type})
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="btn btn-outline-success"
                              title="Thêm danh mục"
                              onClick={() => {
                                setShowAddCategory(true);
                                setTimeout(() => inputRef.current?.focus(), 200);
                              }}
                            >+</button>
                          </div>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="ngay" className="form-label">
                            Ngày giao dịch
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            id="ngay"
                            name="ngay"
                            value={formData.ngay}
                            onChange={handleChange}
                            max={today}
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="moTa" className="form-label">
                            Mô tả (Tùy chọn)
                          </label>
                          <textarea
                            className="form-control"
                            id="moTa"
                            name="moTa"
                            value={formData.moTa}
                            onChange={handleChange}
                            placeholder="Nhập mô tả giao dịch"
                            rows="4"
                          ></textarea>
                        </div>
                        <div className="d-flex gap-2">
                          <button type="submit" className="btn btn-primary" disabled={loading}>
                            Thêm
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleCloseModal}
                          >
                            Hủy
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`modal fade ${showModalEdit ? 'show d-block' : ''}`} tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Sửa Giao dịch</h5>
                      <button type="button" className="btn-close" onClick={handleCloseModalEdit}></button>
                    </div>
                    <div className="modal-body">
                      <form onSubmit={handleSubmitEdit}>
                        {loi && <div className="alert alert-danger">{loi}</div>}
                        <div className="mb-3">
                          <label htmlFor="ten" className="form-label">
                            Tên giao dịch
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="ten"
                            name="ten"
                            value={formDataEdit.ten}
                            onChange={(e) => handleChange(e, true)}
                            placeholder="Ví dụ: Mua thực phẩm"
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="soTien" className="form-label">
                            Số tiền (VNĐ)
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            id="soTien"
                            name="soTien"
                            value={formDataEdit.soTien}
                            onChange={(e) => handleChange(e, true)}
                            placeholder="Nhập số tiền"
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="category_id" className="form-label">
                            Danh mục
                          </label>
                          <select
                            className="form-select"
                            id="category_id"
                            name="category_id"
                            value={formDataEdit.category_id}
                            onChange={(e) => handleChange(e, true)}
                          >
                            <option value="">Chọn danh mục</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name} ({cat.type})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="ngay" className="form-label">
                            Ngày giao dịch
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            id="ngay"
                            name="ngay"
                            value={formDataEdit.ngay}
                            onChange={(e) => handleChange(e, true)}
                            max={today}
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="moTa" className="form-label">
                            Mô tả (Tùy chọn)
                          </label>
                          <textarea
                            className="form-control"
                            id="moTa"
                            name="moTa"
                            value={formDataEdit.moTa}
                            onChange={(e) => handleChange(e, true)}
                            placeholder="Nhập mô tả giao dịch"
                            rows="4"
                          ></textarea>
                        </div>
                        <div className="d-flex gap-2">
                          <button type="submit" className="btn btn-primary" disabled={loading}>
                            Cập nhật
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleCloseModalEdit}
                          >
                            Hủy
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`modal fade ${showModalDetail ? 'show d-block' : ''}`} tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Chi Tiết Giao Dịch</h5>
                      <button type="button" className="btn-close" onClick={handleCloseModalDetail}></button>
                    </div>
                    <div className="modal-body">
                      {loi && <div className="alert alert-danger">{loi}</div>}
                      {selectedTransaction && (
                        <div>
                          <div className="mb-3">
                            <label className="form-label fw-bold">Tên giao dịch</label>
                            <p>{selectedTransaction.ten}</p>
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-bold">Số tiền (VNĐ)</label>
                            <p
                              className={
                                selectedTransaction.danhMuc === 'Thu nhập' ? 'text-success' : 'text-danger'
                              }
                            >
                              {Math.abs(selectedTransaction.soTien).toLocaleString('vi-VN')} VNĐ
                            </p>
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-bold">Danh mục</label>
                            <p>
                              <span
                                style={{
                                  backgroundColor: selectedTransaction.category_color,
                                  color: '#fff',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                }}
                              >
                                {selectedTransaction.category_name}
                              </span>
                            </p>
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-bold">Loại</label>
                            <p>{selectedTransaction.danhMuc}</p>
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-bold">Ngày giao dịch</label>
                            <p>{toDisplayDateFormat(selectedTransaction.ngay)}</p>
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-bold">Ngày cập nhật</label>
                            <p>{toDisplayDateTimeFormat(selectedTransaction.updated_at)}</p>
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-bold">Mô tả</label>
                            <p>{selectedTransaction.moTa || 'Không có mô tả'}</p>
                          </div>
                          <div className="d-flex justify-content-end">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={handleCloseModalDetail}
                            >
                              Đóng
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function toDisplayDateFormat(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

function toDisplayDateTimeFormat(dateTimeStr) {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export default Transaction;