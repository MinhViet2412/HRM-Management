# HRM - Human Resource Management System

## Tổng quan dự án

Hệ thống quản lý nhân sự (HRM) hoàn chỉnh với các tính năng:

### 🚀 Tính năng chính

#### 1. **Quản lý nhân sự**
- ✅ Quản lý thông tin nhân viên (thêm, sửa, xóa, tìm kiếm)
- ✅ Quản lý phòng ban và vị trí
- ✅ Quản lý hợp đồng lao động
- ✅ Trạng thái nhân viên (đang hoạt động, không hoạt động, nghỉ việc)

#### 2. **Chấm công và nghỉ phép**
- ✅ Bảng chấm công chi tiết
- ✅ Quản lý ca làm việc
- ✅ Đăng ký nghỉ phép
- ✅ **Đăng ký làm thêm giờ (OT)** - Tính năng mới
- ✅ Phê duyệt OT cho quản lý/admin

#### 3. **Tính lương**
- ✅ Tính lương tự động
- ✅ Bao gồm lương cơ bản, phụ cấp, làm thêm giờ
- ✅ Khấu trừ thuế, bảo hiểm
- ✅ Phiếu lương chi tiết

#### 4. **Báo cáo**
- ✅ Tổng quan chấm công
- ✅ Nhân sự theo phòng ban
- ✅ Tổng quan lương
- ✅ **Biến động nhân sự** - Tính năng mới
- ✅ Xuất báo cáo Excel

#### 5. **Đa ngôn ngữ (i18n)**
- ✅ Tiếng Việt (mặc định)
- ✅ Tiếng Anh
- ✅ Chuyển đổi ngôn ngữ real-time

#### 6. **Tiền tệ**
- ✅ Hiển thị bằng VND (Việt Nam Đồng)
- ✅ Định dạng số theo chuẩn Việt Nam

### 🛠 Công nghệ sử dụng

#### Backend
- **NestJS** - Framework Node.js
- **TypeORM** - ORM cho database
- **PostgreSQL** - Database chính
- **JWT** - Authentication
- **Swagger** - API Documentation
- **Excel Export** - Xuất báo cáo

#### Frontend
- **React 18** - UI Framework
- **TypeScript** - Type safety
- **React Query** - Data fetching
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **React i18next** - Internationalization
- **Lucide React** - Icons

#### DevOps
- **Docker & Docker Compose** - Containerization
- **Nginx** - Web server
- **PgAdmin** - Database management

### 📦 Cài đặt và chạy

#### Yêu cầu hệ thống
- Docker & Docker Compose
- Node.js 18+ (cho development)
- Git

#### 1. Clone dự án
```bash
git clone <repository-url>
cd hrm
```

#### 2. Chạy với Docker (Khuyến nghị)
```bash
# Build và chạy tất cả services
docker compose up -d --build

# Xem logs
docker compose logs -f

# Dừng services
docker compose down
```

#### 3. Chạy local development
```bash
# Cài đặt dependencies
make install

# Chạy development
make dev

# Hoặc chạy từng service
cd backend && npm run start:dev
cd frontend && npm run dev
```

### 🔧 Cấu hình

#### Environment Variables
```bash
# Backend (.env)
DATABASE_URL=postgresql://postgres:password@localhost:5432/hrm
JWT_SECRET=your-secret-key
PORT=3000

# Frontend (.env)
REACT_APP_API_URL=http://localhost:3000
```

#### Database
- **Host**: localhost:5432
- **Database**: hrm
- **Username**: postgres
- **Password**: password
- **PgAdmin**: http://localhost:5050

### 👥 Tài khoản mặc định

#### Admin
- **Email**: admin@hrm.com
- **Password**: admin123

#### HR Manager
- **Email**: hr@hrm.com
- **Password**: hr123

#### Manager
- **Email**: manager@hrm.com
- **Password**: manager123

#### Employee
- **Email**: employee@hrm.com
- **Password**: employee123

### 📱 Giao diện

#### Responsive Design
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (320px - 767px)

#### Dark/Light Mode
- ✅ Tự động theo hệ thống
- ✅ Toggle manual

### 🔐 Bảo mật

#### Authentication
- ✅ JWT Token-based
- ✅ Refresh Token
- ✅ Role-based Access Control (RBAC)

#### Authorization
- **Admin**: Toàn quyền
- **HR**: Quản lý nhân sự, báo cáo
- **Manager**: Quản lý team, phê duyệt OT
- **Employee**: Xem thông tin cá nhân, đăng ký OT/nghỉ phép

### 📊 API Documentation

Swagger UI: http://localhost:3000/api

### 🧪 Testing

```bash
# Backend tests
cd backend && npm run test

# Frontend tests
cd frontend && npm run test
```

### 📈 Performance

#### Optimization
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Image optimization
- ✅ Database indexing
- ✅ Caching với React Query

### 🚀 Deployment

#### Production Build
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

#### Docker Production
```bash
docker compose -f docker-compose.prod.yml up -d
```

### 📝 Changelog

#### Version 1.0.0 (Current)
- ✅ Complete HRM system
- ✅ Overtime management
- ✅ Personnel turnover reports
- ✅ Excel export
- ✅ Internationalization (i18n)
- ✅ VND currency support

### 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

### 📄 License

MIT License

### 📞 Support

- **Email**: support@hrm.com
- **Documentation**: [Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)

---

## 🎯 Quick Start Commands

```bash
# Clone và chạy
git clone <repo>
cd hrm
docker compose up -d --build

# Truy cập ứng dụng
open http://localhost:3001

# Truy cập API docs
open http://localhost:3000/api

# Truy cập database
open http://localhost:5050
```

**Chúc bạn sử dụng hệ thống HRM hiệu quả! 🎉**