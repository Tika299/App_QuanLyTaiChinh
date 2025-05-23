import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import Header from './Header';
import Slider from './Slider';

function Transaction() {

    const [giaoDich, setGiaoDich] = useState([
        { id: 1, ten: 'Mua sắm thực phẩm', soTien: -500000, danhMuc: 'Chi tiêu', ngay: '2025-04-20', moTa: 'Mua thực phẩm hàng tuần' },
        { id: 2, ten: 'Lương tháng', soTien: 20000000, danhMuc: 'Thu nhập', ngay: '2025-04-15', moTa: 'Lương tháng 4' },
        { id: 3, ten: 'Hóa đơn điện', soTien: -1000000, danhMuc: 'Chi tiêu', ngay: '2025-04-10', moTa: 'Hóa đơn điện tháng 4' },
    ]);
    const [locDanhMuc, setLocDanhMuc] = useState('Tất cả');
    const [locNgay, setLocNgay] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
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
        danhMuc: 'Chi tiêu',
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
            // Đảm bảo dữ liệu trả về có category_color
            setGiaoDich(response.data.map(item => ({
                ...item,
                category_color: item.category_color || '#000000', // Mặc định đen nếu không có màu
            })));
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
        setFormData({ ...formData, [name]: value });
        setLoi('');
    };

    const validateForm = () => {
        const { ten, soTien, ngay, danhMuc } = formData;
        const today = new Date().toISOString().split('T')[0];

        if (!ten) return 'Vui lòng nhập tên giao dịch';
        if (!soTien) return 'Vui lòng nhập số tiền giao dịch';
        if (isNaN(soTien) || soTien <= 0) return 'Số tiền phải là số dương';
        if (!ngay) return 'Vui lòng chọn ngày giao dịch';
        if (ngay > today) return 'Không được chọn ngày giao dịch trong tương lai';
        if ((ten.toLowerCase().includes('thu') && danhMuc === 'Chi tiêu') ||
            (ten.toLowerCase().includes('chi') && danhMuc === 'Thu nhập')) {
            return 'Loại giao dịch không phù hợp với tên';
        }
        return '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const loiValidate = validateForm();
        if (loiValidate) {
            setLoi(loiValidate);
            return;
        }

        // Thêm giao dịch mới
        const newTransaction = {
            id: giaoDich.length + 1,
            ...formData,
            soTien: parseFloat(formData.soTien),
        };
        setGiaoDich([...giaoDich, newTransaction]);
        alert('Giao dịch đã được thêm thành công!');

        // Đóng modal và reset form
        setShowModal(false);
        setFormData({
            ten: '',
            soTien: '',
            danhMuc: 'Chi tiêu',
            ngay: '',
            moTa: '',
        });
        setLoi('');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({
            ten: '',
            soTien: '',
            danhMuc: 'Chi tiêu',
            ngay: '',
            moTa: '',
        });
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

    const xuLySuaGiaoDich = (id) => {
        alert(`Chuyển đến trang Sửa Giao dịch cho ID: ${id}`);
    };

    const xuLyXoaGiaoDich = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này không?')) {
            setGiaoDich(giaoDich.filter((gd) => gd.id !== id));
        }
    };

    const xuLyXemChiTiet = (id) => {
        alert(`Chuyển đến trang Chi tiết Giao dịch cho ID: ${id}`);
    const xuLyXemChiTiet = async (id) => {
        try {
            // Tìm giao dịch trong danh sách giaoDich
            const existingTransaction = giaoDich.find((gd) => gd.id === id);
            if (existingTransaction) {
                setSelectedTransaction(existingTransaction);
                setShowModalDetail(true);
            } else {
                // Nếu không tìm thấy, gọi API
                const response = await axios.get(`http://localhost/api/transactions/${id}`);
                setSelectedTransaction({
                    ...response.data,
                    category_name: response.data.category_name || 'Không xác định',
                    category_color: response.data.category_color || '#000000',
                    danhMelderly: response.data.danhMelderly || 'Không xác định',
                });
                setShowModalDetail(true);
            }
        } catch (error) {
            setLoi(error.response?.data?.error || 'Lỗi khi xem chi tiết giao dịch');
        }
    };

    const giaoDichDaLoc = giaoDich.filter((gd) => {
        const khopDanhMuc = locDanhMuc === 'Tất cả' || gd.danhMuc === locDanhMuc;
        const khopNgay = locNgay === '' || gd.ngay.includes(locNgay);
        return khopDanhMuc && khopNgay;
    });

    return (
        <div className="d-flex">
            {<Slider />}
            <div className='wapper'>
                {<Header />}
                <main className='d-flex'>
                    <div className='content'>
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
                                                        <th scope="col">Ngày</th>
                                                        <th scope="col">Hành động</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {giaoDichDaLoc.map((giaoDich) => (
                                                        <tr key={giaoDich.id}>
                                                            <td>{giaoDich.ten}</td>
                                                            <td className={giaoDich.soTien >= 0 ? 'text-success' : 'text-danger'}>
                                                                {Math.abs(giaoDich.soTien).toLocaleString('vi-VN')} VNĐ
                                                            </td>
                                                            <td>{giaoDich.danhMuc}</td>
                                                            <td>
                                                                <span
                                                                    style={{
                                                                        backgroundColor: giaoDich.category_color,
                                                                        color: '#fff',
                                                                        padding: '2px 8px',
                                                                        borderRadius: '4px',
                                                                    }}
                                                                >
                                                                    {giaoDich.category_name}
                                                                </span>
                                                            </td>
                                                            <td>{giaoDich.danhMelderly}</td>
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

                                {/* Modal Thêm Giao dịch */}
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
                                                        <label htmlFor="danhMuc" className="form-label">Danh mục</label>
                                                        <select
                                                            className="form-select"
                                                            id="danhMuc"
                                                            name="danhMuc"
                                                            value={formData.danhMuc}
                                                            onChange={handleChange}
                                                        >
                                                            {danhMuc.slice(1).map((dm) => (
                                                                <option key={dm} value={dm}>
                                                                    {dm}
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

                                {/* Modal Xem Chi Tiết Giao Dịch */}
                                <div className={`modal fade ${showModalDetail ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                    <div className="modal-dialog modal-dialog-centered">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">Chi Tiết Giao Dịch</h5>
                                                <button type="button" className="btn-close" onClick={handleCloseModalDetail}></button>
                                            </div>
                                            <div className="modal-body">
                                                {loi && (
                                                    <div className="alert alert-danger" role="alert">
                                                        {loi}
                                                    </div>
                                                )}
                                                {selectedTransaction && (
                                                    <div>
                                                        <div className="mb-3">
                                                            <label className="form-label fw-bold">Tên giao dịch</label>
                                                            <p>{selectedTransaction.ten}</p>
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="form-label fw-bold">Số tiền (VNĐ)</label>
                                                            <p className={selectedTransaction.danhMelderly === "Thu nhập" ? 'text-success' : 'text-danger'}>
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
                                                            <p>{selectedTransaction.danhMelderly}</p>
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
                </main>
            </div>
        </div>
    )
}
}

export default Transaction;