# SEO & UX/UI Analyzer - Desktop App (Golang)

Ứng dụng Desktop phân tích chuyên sâu SEO Website & Đánh giá Trải nghiệm Người dùng (UX/UI) bằng ngôn ngữ **Go (Golang)**.

---

## 🛠️ Bộ Công Nghệ Bắt Buộc (Tech Stack)

1. **`fyne.io/fyne/v2`**: Giao diện người dùng đồ họa Desktop đa nền tảng (Windows, macOS, Linux).
2. **`github.com/chromedp/chromedp`**: Điều khiển trình duyệt Chromium Headless tự động hoá để cào dữ liệu on-page, gọi Google Public PageSpeed API, và record đo lường từng step trong kịch bản UX.
3. **`gorm.io/gorm` & `gorm.io/driver/sqlite`**: Quản lý cơ sở dữ liệu quan hệ cục bộ SQLite, tự động AutoMigrate và lưu trữ toàn bộ lịch sử các phiên phân tích.
4. **`github.com/xuri/excelize/v2`**: Thư viện tạo và định dạng báo cáo Excel (.xlsx) 3 sheet chuyên nghiệp, chuẩn màu sắc, viền và căn chỉnh.

---

## 🚀 Cách Khắc Phục Lỗi 'checksum mismatch / SECURITY ERROR'

Lỗi này xuất hiện do mã băm trong file `go.sum` cũ không khớp với dữ liệu thực tế từ máy chủ Google Go Module. Cách xử lý triệt để:

```bash
# Bước 1: Xóa file go.sum cũ
rm -f go.sum

# Bước 2: Để Go tự động tải mã băm chính thức từ sum.golang.org:
go mod tidy

# Bước 3: Chạy ứng dụng Desktop bình thường:
go run main.go
# hoặc:
go run .
```

---

## 💻 Các Lệnh Thường Dùng

### Chạy Giao diện Desktop GUI (Fyne v2)
```bash
go run main.go
```

### Chạy Ở Chế Độ Dòng Lệnh (CLI Headless Mode)
Dành cho kiểm thử tự động, tích hợp CI/CD hoặc chạy không cần màn hình:
```bash
go run main.go -cli -url https://tiki.vn -export BaoCao_SEO_UX.xlsx
```

### Đóng Gói File Chạy (Build Binary)
```bash
go build -ldflags="-s -w" -o seo-analyzer main.go
```
