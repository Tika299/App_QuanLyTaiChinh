import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Slider from './Slider';

function Transaction() {
    const [giaoDich, setGiaoDich] = useState([]);
    const [locDanhMuc, setLocDanhMuc] = useState('Tất cả');
    const [locNgay, setLocNgay] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formDataEdit, setFormDataEdit] = useState({
        id: null,
        ten: '',
        soTien: '',
        category_id: '',
        ngay: '',
        moTa: '',
    });
    const [formData, setFormData] = useState({
        ten: '',
        soTien: '',
        category_id: '',
        ngay: '',
        moTa: '',
    });
    const [loi, setLoi] = useState('');

    const danhMuc = ['Tất cả', 'Thu nhập', 'Chi tiêu'];

    // Lấy danh sách danh mục
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`http://localhost/api/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh mục:', error);
            setLoi('Không thể tải danh sách danh mục');
        }
    };

    // Lấy danh sách giao dịch
    const fetchTransactions = async () => {
        try {
            const params = {};
            if (locDanhMuc !== 'Tất cả') {
                params.danhMuc = locDanhMuc;
            }
            if (locNgay !== '') {
                params.ngay = locNgay;
            }

            const response = await axios.get(`http://localhost/api/transactions`, {
                params,
            });
            setGiaoDich(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy giao dịch:', error);
            setLoi(error.response?.data?.error || 'Không thể tải danh sách giao dịch');
        }
    };

    // Gọi API khi component mount
    useEffect(() => {
        fetchCategories();
        fetchTransactions();
    }, [locDanhMuc, locNgay]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormDataEdit({ ...formDataEdit, [name]: value });
        setFormData({ ...formData, [name]: value });
        setLoi('');
    };

    const validateForm = (data) => {
        const { ten, soTien, ngay, category_id } = data;
        const today = new Date().toISOString().split('T')[0];
        const category = categories.find(cat => cat.id === parseInt(category_id));

        if (!ten) return 'Vui lòng nhập tên giao dịch';
        if (!soTien) return 'Vui lòng nhập số tiền giao dịch';
        if (isNaN(soTien) || soTien <= 0) return 'Số tiền phải là số dương';
        if (!category_id) return 'Vui lòng chọn danh mục';
        if (!ngay) return 'Vui lòng chọn ngày giao dịch';
        if (ngay > today) return 'Không được chọn ngày giao dịch trong tương lai';
        if (category && ((ten.toLowerCase().includes('thu') && category.type === 'Chi tiêu') ||
            (ten.toLowerCase().includes('chi') && category.type === 'Thu nhập'))) {
            return 'Loại giao dịch không phù hợp với tên';
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isEditing = !!formDataEdit.id;
        const dataToValidate = isEditing ? formDataEdit : formData;
        const loiValidate = validateForm(dataToValidate);
        if (loiValidate) {
            setLoi(loiValidate);
            return;
        }

        try {
            if (isEditing) {
                const response = await axios.put(
                    `http://localhost/api/transactions/${formDataEdit.id}`,
                    formDataEdit
                );
                if (response.data) {
                    setGiaoDich(giaoDich.map(gd => (gd.id === formDataEdit.id ? response.data : gd)));
                    alert('Giao dịch đã được cập nhật thành công!');
                    setShowModalEdit(false);
                    setFormDataEdit({ id: null, ten: '', soTien: '', category_id: '', ngay: '', moTa: '' });
                } else {
                    setLoi('Không nhận được dữ liệu từ server');
                }
            } else {
                const response = await axios.post(`http://localhost/api/transactions`, formData);
                setGiaoDich([...giaoDich, response.data]);
                alert('Giao dịch đã được thêm thành công!');
                setShowModal(false);
                setFormData({ ten: '', soTien: '', category_id: '', ngay: '', moTa: '' });
            }
            setLoi('');
        } catch (error) {
            setLoi(error.response?.data?.error || `Lỗi khi ${isEditing ? 'cập nhật' : 'thêm'} giao dịch`);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setShowModalEdit(false);
        setFormDataEdit({ id: null, ten: '', soTien: '', category_id: '', ngay: '', moTa: '' });
        setFormData({ ten: '', soTien: '', category_id: '', ngay: '', moTa: '' });
        setLoi('');
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        if (name === 'locDanhMuc') setLocDanhMuc(value);
        if (name === 'locNgay') setLocNgay(value);
    };

    const xuLySuaGiaoDich = async (id) => {
        setShowModalEdit(true);
        try {
            const response = await axios.get(`http://localhost/api/transactions/${id}`);
            setFormDataEdit({
                id: response.data.id,
                ten: response.data.ten,
                soTien: response.data.soTien,
                category_id: response.data.category_id,
                ngay: response.data.ngay,
                moTa: response.data.moTa
            });
        } catch (error) {
            setLoi(error.response?.data?.error || 'Lỗi khi lấy thông tin giao dịch');
        }
    };

    const xuLyXoaGiaoDich = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa giao dịch này không?')) {
            try {
                await axios.delete(`http://localhost/api/transactions/${id}`);
                setGiaoDich(giaoDich.filter((gd) => gd.id !== id));
                alert('Giao dịch đã được xóa thành công!');
            } catch (error) {
                setLoi(error.response?.data?.error || 'Lỗi khi xóa giao dịch');
            }
        }
    };

    const xuLyXemChiTiet = async (id) => {
        try {
            const response = await axios.get(`http://localhost/api/transactions/${id}`);
            alert(JSON.stringify(response.data, null, 2));
        } catch (error) {
            setLoi(error.response?.data?.error || 'Lỗi khi xem chi tiết giao dịch');
        }
    };

    return (
        <div className="d-flex">
            <Slider />
            <div className="wapper">
                <Header />
                <main className="d-flex">
                    <div className="content">
                        <div className="container-fluid py-4 bg-light min-vh-100">
                            <div className="container">
                                <h1 className="mb-4 fw-bold">Quản lý Giao dịch</h1>

                                {/* Phần Lọc */}
                                <div className="card mb-4">
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <label htmlFor="locDanhMuc" className="form-label">Lọc theo Danh mục</label>
                                                <select
                                                    id="locDanhMuc"
                                                    name="locDanhMuc"
                                                    value={locDanhMuc}
                                                    onChange={handleFilterChange}
                                                    className="form-select"
                                                >
                                                    {danhMuc.map((dm) => (
                                                        <option key={dm} value={dm}>
                                                            {dm}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label htmlFor="locNgay" className="form-label">Lọc theo Ngày</label>
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
                                                >
                                                    Thêm Giao dịch
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông báo lỗi */}
                                {loi && (
                                    <div className="alert alert-danger" role="alert">
                                        {loi}
                                    </div>
                                )}

                                {/* Danh sách Giao dịch */}
                                <div className="card">
                                    <div className="card-body p-0">
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th scope="col">Tên</th>
                                                        <th scope="col">Số tiền</th>
                                                        <th scope="col">Danh mục</th>
                                                        <th scope="col">Loại</th>
                                                        <th scope="col">Ngày</th>
                                                        <th scope="col">Hành động</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {giaoDich.map((giaoDich) => (
                                                        <tr key={giaoDich.id}>
                                                            <td>{giaoDich.ten}</td>
                                                            <td className={giaoDich.danhMelderly === "Thu nhập" ? 'text-success' : 'text-danger'}>
                                                                {Math.abs(giaoDich.soTien).toLocaleString('vi-VN')} VNĐ
                                                            </td>
                                                            <td>{giaoDich.category_name}</td>
                                                            <td>{giaoDich.danhMuc}</td>
                                                            <td>{giaoDich.ngay}</td>
                                                            <td>
                                                                <button
                                                                    onClick={() => xuLyXemChiTiet(giaoDich.id)}
                                                                    className="btn btn-link text-primary p-0 me-2"
                                                                >
                                                                    Xem
                                                                </button>
                                                                <button
                                                                    onClick={() => xuLySuaGiaoDich(giaoDich.id)}
                                                                    className="btn btn-link text-warning p-0 me-2"
                                                                >
                                                                    Sửa
                                                                </button>
                                                                <button
                                                                    onClick={() => xuLyXoaGiaoDich(giaoDich.id)}
                                                                    className="btn btn-link text-danger p-0"
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

                                {/* Modal Thêm Giao Dịch */}
                                <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                    <div className="modal-dialog modal-dialog-centered">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">Thêm Giao dịch</h5>
                                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                                            </div>
                                            <div className="modal-body">
                                                <form onSubmit={handleSubmit}>
                                                    {loi && (
                                                        <div className="alert alert-danger" role="alert">
                                                            {loi}
                                                        </div>
                                                    )}

                                                    <div className="mb-3">
                                                        <label htmlFor="ten" className="form-label">Tên giao dịch</label>
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
                                                        <label htmlFor="soTien" className="form-label">Số tiền (VNĐ)</label>
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
                                                        <label htmlFor="category_id" className="form-label">Danh mục</label>
                                                        <select
                                                            className="form-select"
                                                            id="category_id"
                                                            name="category_id"
                                                            value={formData.category_id}
                                                            onChange={handleChange}
                                                        >
                                                            <option value="">Chọn danh mục</option>
                                                            {categories.map((cat) => (
                                                                <option key={cat.id} value={cat.id}>
                                                                    {cat.name} ({cat.type})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="mb-3">
                                                        <label htmlFor="ngay" className="form-label">Ngày giao dịch</label>
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
                                                        <label htmlFor="moTa" className="form-label">Mô tả (Tùy chọn)</label>
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
                                                        <button type="submit" className="btn btn-primary">Thêm</button>
                                                        <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                                            Hủy
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Sửa Giao Dịch */}
                                <div className={`modal fade ${showModalEdit ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                    <div className="modal-dialog modal-dialog-centered">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">Sửa Giao dịch</h5>
                                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                                            </div>
                                            <div className="modal-body">
                                                <form onSubmit={handleSubmit}>
                                                    {loi && (
                                                        <div className="alert alert-danger" role="alert">
                                                            {loi}
                                                        </div>
                                                    )}

                                                    <div className="mb-3">
                                                        <label htmlFor="ten" className="form-label">Tên giao dịch</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="ten"
                                                            name="ten"
                                                            value={formDataEdit.ten}
                                                            onChange={handleChange}
                                                            placeholder="Ví dụ: Mua thực phẩm"
                                                        />
                                                    </div>

                                                    <div className="mb-3">
                                                        <label htmlFor="soTien" className="form-label">Số tiền (VNĐ)</label>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            id="soTien"
                                                            name="soTien"
                                                            value={formDataEdit.soTien}
                                                            onChange={handleChange}
                                                            placeholder="Nhập số tiền"
                                                        />
                                                    </div>

                                                    <div className="mb-3">
                                                        <label htmlFor="category_id" className="form-label">Danh mục</label>
                                                        <select
                                                            className="form-select"
                                                            id="category_id"
                                                            name="category_id"
                                                            value={formDataEdit.category_id}
                                                            onChange={handleChange}
                                                        >
                                                            <option value="">Chọn danh mục</option>
                                                            {categories.map((cat) => (
                                                                <option key={cat.id} value={cat.id}>
                                                                    {cat.name} ({cat.type})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="mb-3">
                                                        <label htmlFor="ngay" className="form-label">Ngày giao dịch</label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            id="ngay"
                                                            name="ngay"
                                                            value={formDataEdit.ngay}
                                                            onChange={handleChange}
                                                        />
                                                    </div>

                                                    <div className="mb-3">
                                                        <label htmlFor="moTa" className="form-label">Mô tả (Tùy chọn)</label>
                                                        <textarea
                                                            className="form-control"
                                                            id="moTa"
                                                            name="moTa"
                                                            value={formDataEdit.moTa}
                                                            onChange={handleChange}
                                                            placeholder="Nhập mô tả giao dịch"
                                                            rows="4"
                                                        ></textarea>
                                                    </div>

                                                    <div className="d-flex gap-2">
                                                        <button type="submit" className="btn btn-primary">Cập nhật</button>
                                                        <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                                            Hủy
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Transaction;