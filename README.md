# Personal Finance Management System

**Hệ thống Quản lý Tài chính Cá nhân** – Giúp bạn kiểm soát chi tiêu, theo dõi thu nhập và xây dựng kế hoạch tài chính thông minh.

---

##  Giới thiệu

**Personal Finance Management System** là dự án cá nhân giúp quản lý tài chính một cách toàn diện và trực quan. Ứng dụng cho phép người dùng ghi chép các giao dịch, phân loại chi tiêu, thiết lập ngân sách, xem báo cáo thống kê và dự báo xu hướng tài chính.

Dự án được xây dựng với mục tiêu học tập và áp dụng các công nghệ hiện đại trong phát triển Full-stack.

##  Tính năng chính

###  Core Features
- **Quản lý giao dịch**: Thêm/sửa/xóa thu nhập & chi tiêu
- **Phân loại**: Hỗ trợ nhiều danh mục (Ăn uống, Di chuyển, Mua sắm, Lương, Đầu tư...)
- **Ngân sách (Budget)**: Thiết lập và theo dõi ngân sách theo tháng
- **Báo cáo & Thống kê**: Biểu đồ theo thời gian, theo danh mục, so sánh tháng
- **Dashboard**: Tổng quan tài chính (Tổng thu, Tổng chi, Số dư, Tiết kiệm %)
- **Tìm kiếm & Lọc**: Theo ngày, tháng, năm, danh mục, từ khóa
- **Xuất báo cáo**: Export CSV/PDF
- **Xác thực người dùng**: Đăng ký, đăng nhập, quên mật khẩu

###  Visualization
- Biểu đồ cột, biểu đồ tròn, biểu đồ đường (sử dụng Chart.js hoặc Recharts)
- Xu hướng thu chi theo thời gian

##  Công nghệ sử dụng

### Frontend
- **React.js** / **Next.js** (tùy phiên bản)
- TailwindCSS hoặc SCSS
- Redux / Context API hoặc Zustand
- Chart.js hoặc Recharts

### Backend
- **Node.js** + **Express.js**
- **MongoDB** (Mongoose) hoặc **PostgreSQL** (Sequelize/TypeORM)

### Khác
- JWT Authentication
- RESTful API
- Responsive Design (Mobile-first)
- Docker (tùy chọn)

##  Cài đặt & Chạy dự án

### 1. Clone repository
```bash
git clone https://github.com/Tika299/App_QuanLyTaiChinh/tree/master
cd App_QuanLyTaiChinh
