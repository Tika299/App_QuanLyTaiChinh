import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Slider from './Slider';
import { useNavigate } from 'react-router-dom'; // Thêm useNavigate

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
  const [giaoDich, setGiaoDich] = useState([]);
  const [locDanhMuc, setLocDanhMuc] = useState('Tất cả');
  const [locNgay, setLocNgay] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [showModalDetail, setShowModalDetail] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [categories, setCategories] = useState([]);
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
  });
  const [loi, setLoi] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Khởi tạo useNavigate

  // Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
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

      const response = await axios.get('/transactions', { params });
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
    const today = new Date().toISOString().split('T')[0];
    if (!ten) return 'Vui lòng nhập tên giao dịch';
    if (!soTien) return 'Vui lòng nhập số tiền giao dịch';
    if (isNaN(soTien) || soTien <= 0) return 'Số tiền phải là số dương';
    if (!category_id) return 'Vui lòng chọn danh mục';
    if (!ngay) return 'Vui lòng chọn ngày giao dịch';
    if (ngay > today) return 'Không được chọn ngày giao dịch trong tương lai';
    return '';
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
      const response = await axios.post('/transactions', {
        ten: formData.ten,
        soTien: parseFloat(formData.soTien),
        category_id: formData.category_id,
        ngay: formData.ngay,
        moTa: formData.moTa,
      });
      setGiaoDich([...giaoDich, response.data]);
      alert('Giao dịch đã được thêm thành công!');
      setShowModal(false);
      setFormData({ ten: '', soTien: '', category_id: '', ngay: '', moTa: '' });
      // Điều hướng về Dashboard với refresh=true
      navigate('/dashboard?refresh=true');
    } catch (error) {
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

    try {
      setLoading(true);
      const response = await axios.put(`/transactions/${formDataEdit.id}`, {
        ten: formDataEdit.ten,
        soTien: parseFloat(formDataEdit.soTien),
        category_id: formDataEdit.category_id,
        ngay: formDataEdit.ngay,
        moTa: formDataEdit.moTa,
      });
      setGiaoDich(giaoDich.map(gd => (gd.id === formDataEdit.id ? response.data : gd)));
      alert('Giao dịch đã được cập nhật!');
      setShowModalEdit(false);
      setFormDataEdit({ id: null, ten: '', soTien: '', category_id: '', ngay: '', moTa: '' });
      // Điều hướng về Dashboard với refresh=true sau khi sửa
      navigate('/dashboard?refresh=true');
    } catch (error) {
      setLoi(error.response?.data?.error || 'Lỗi khi cập nhật giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const xuLyXoaGiaoDich = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này không?')) {
      try {
        setLoading(true);
        await axios.delete(`/transactions/${id}`);
        setGiaoDich(giaoDich.filter(gd => gd.id !== id));
        alert('Giao dịch đã được xóa!');
        // Điều hướng về Dashboard với refresh=true sau khi xóa
        navigate('/dashboard?refresh=true');
      } catch (error) {
        setLoi(error.response?.data?.error || 'Lỗi khi xóa giao dịch');
      } finally {
        setLoading(false);
      }
    }
  };

  const xuLyXemChiTiet = async (id) => {
    try {
      const existingTransaction = giaoDich.find(gd => gd.id === id);
      if (existingTransaction) {
        setSelectedTransaction(existingTransaction);
        setShowModalDetail(true);
      } else {
        const response = await axios.get(`/transactions/${id}`);
        setSelectedTransaction({
          ...response.data,
          category_name: response.data.category_name || 'Không xác định',
          category_color: response.data.category_color || '#000000',
          danhMuc: response.data.danhMuc || 'Không xác định',
        });
        setShowModalDetail(true);
      }
    } catch (error) {
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
    setFormDataEdit({ id: null, ten: '', soTien: '', category_id: '', ngay: '', moTa: '' });
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
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Sidebar cố định với chiều rộng 245px */}
      <div style={{ width: '245px', backgroundColor: '#f8f9fa' }}>
        <Slider />
      </div>

      {/* Phần nội dung chính */}
      <div className="flex-grow-1">
        <Header />
        <div className="p-4">
          <div className="container-fluid py-4 bg-light min-vh-100">
            <div className="container">
              <h1 className="mb-4 fw-bold">Quản lý Giao dịch</h1>
              {loading && (
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              )}
              {loi && <div className="alert alert-danger">{loi}</div>}

              {/* Phần Lọc */}
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

              {/* Danh sách Giao dịch */}
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
                        {giaoDich.map(gd => (
                          <tr key={gd.id}>
                            <td>{gd.ten}</td>
                            <td className={gd.soTien >= 0 ? 'text-success' : 'text-danger'}>
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
                            <td>{gd.ngay}</td>
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
                </div>
              </div>

              {/* Modal Thêm Giao dịch */}
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

              {/* Modal Sửa Giao dịch */}
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

              {/* Modal Xem Chi Tiết Giao Dịch */}
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
                            <p>{selectedTransaction.ngay}</p>
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

export default Transaction;