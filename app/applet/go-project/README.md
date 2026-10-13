# SEO & UX/UI Analyzer - Desktop App (Golang)

Ứng dụng Desktop phân tích chuyên sâu SEO Website & Đánh giá Trải nghiệm Người dùng (UX/UI) bằng ngôn ngữ **Go (Golang)**.

---

## 🛠️ Bộ Công Nghệ Bắt Buộc (Tech Stack)

1. **`fyne.io/fyne/v2`**: Giao diện người dùng đồ họa Desktop đa nền tảng (Windows, macOS, Linux).
2. **`github.com/chromedp/chromedp`**: Điều khiển trình duyệt Chromium Headless tự động hoá để cào dữ liệu on-page, gọi Google Public PageSpeed API, và record đo lường từng step trong kịch bản UX.
3. **`gorm.io/gorm` & `gorm.io/driver/sqlite`**: Quản lý cơ sở dữ liệu quan hệ cục bộ SQLite, tự động AutoMigrate và lưu trữ toàn bộ lịch sử các phiên phân tích.
4. **`github.com/xuri/excelize/v2`**: Thư viện tạo và định dạng báo cáo Excel (.xlsx) 3 sheet chuyên nghiệp, chuẩn màu sắc, viền và căn chỉnh.

---

## 📂 Cấu Trúc Mã Nguồn (Clean Architecture)

```
seo-ux-analyzer/
├── go.mod                     # Go modules & dependencies
├── main.go                    # Điểm khởi chạy (hỗ trợ cả GUI Fyne & CLI headless)
├── internal/
│   ├── models/
│   │   └── audit.go           # GORM Schema (AuditSession, SEOResult, UXStepResult) & Criteria Tags
│   ├── db/
│   │   └── sqlite.go          # Kết nối SQLite, AutoMigrate và CRUD operations
│   ├── analyzer/
│   │   ├── pagespeed.go       # Google PageSpeed Insights v5 API & Core Web Vitals
│   │   └── chromedp_crawl.go  # Cào trực tiếp On-page (Title, Meta, H1-H6, Alt, Robots, Sitemap)
│   ├── uxrecorder/
│   │   └── recorder.go        # Kịch bản kiểm thử hành vi UX, đo Latency ms, gán Tag tiêu chí
│   ├── exporter/
│   │   └── excel.go           # Xuất báo cáo Excel 3 Sheet với Excelize v2
│   └── ui/
│       └── app.go             # Giao diện Fyne v2 (Tabs SEO, UX Scenario, History, Export)
└── README.md
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### 1. Yêu cầu Tiền đề (Prerequisites)
- **Go 1.20+** hoặc mới hơn (tải tại [golang.org](https://golang.org)).
- **GCC / C Compiler** (do `go-sqlite3` và `Fyne` yêu cầu CGO):
  - **Windows**: Cài [TDM-GCC](https://jmeubank.github.io/tdm-gcc/) hoặc MSYS2 Mingw-w64.
  - **Linux (Ubuntu/Debian)**: `sudo apt-get install gcc libgl1-mesa-dev xorg-dev`
  - **macOS**: `xcode-select --install`
- **Google Chrome** hoặc **Chromium** đã được cài trên máy tính.

### 2. Tải Thư Viện (Download Dependencies)
```bash
go mod tidy
go mod download
```

### 3. Chạy Ứng Dụng Desktop (GUI Mode)
```bash
go run main.go
```

### 4. Chạy Ở Chế Độ Dòng Lệnh (CLI Headless Mode)
Dành cho kiểm thử tự động, tích hợp CI/CD hoặc chạy không cần màn hình:
```bash
go run main.go -cli -url https://example.com -export BaoCao_SEO_UX.xlsx
```

### 5. Đóng Gói File Chạy (Build Binary)
```bash
# Build file thực thi
go build -ldflags="-s -w" -o seo-analyzer main.go

# Hoặc dùng Fyne CLI để đóng gói icon và binary hoàn chỉnh:
go install fyne.io/fyne/v2/cmd/fyne@latest
fyne package -os windows -icon icon.png
```

---

## 📋 Chi Tiết 4 Tính Năng Cốt Lõi

### 1. Phân Tích SEO Google & On-Page
- Gọi Google PageSpeed Insights v5 trích xuất:
  - **LCP** (Largest Contentful Paint)
  - **FCP** (First Contentful Paint)
  - **CLS** (Cumulative Layout Shift)
  - **INP / FID** (Interaction to Next Paint)
  - **Performance Score** & **SEO Score**
- Chromedp crawl trực tiếp trang: Title, Meta Description, Thẻ H1-H6, Đếm số ảnh thiếu Alt, Canonical Link, kiểm tra phản hồi `/robots.txt` và `/sitemap.xml`.
- Tự động sinh danh sách lỗi và giải pháp khuyến nghị hành động (Actionable recommendations) bằng tiếng Việt.

### 2. Đánh Giá UX/UI Qua Kịch Bản Record & Step Tracking
- Cấu hình chuỗi kịch bản người dùng (Ví dụ: Mở trang -> Tìm CTA -> Click -> Nhập Form -> Kiểm tra kết quả).
- Đo thời gian chính xác từng step (`DurationMs`), kiểm tra `IsVisible` của phần tử trên DOM.
- Tự động phân loại bằng **Tag Tiêu chí**:
  - `[Nổi bật]`: Phần tử trọng tâm hiển thị rõ ràng, nhận diện tức thì (< 350ms).
  - `[Nhanh]`: Tốc độ phản hồi vượt trội (< 350ms).
  - `[Gọn gàng]`: Bố cục hợp lý, phản hồi tốt (350ms - 800ms).
  - `[Dễ hiểu]`: Luồng người dùng trực quan (800ms - 1500ms).
  - `[Tải chậm]`: Độ trễ lớn (> 1500ms).
  - `[Giao diện phức tạp]`: Phần tử ẩn, DOM sâu hoặc lỗi không định vị được.
- Chấm điểm UX/UI tổng quan (0 - 100).

### 3. Quản Lý Dữ Liệu Local (SQLite + GORM)
- Bảng `audit_sessions`, `seo_results`, `ux_step_results` với khóa ngoại liên kết.
- Tự động tạo bảng (`AutoMigrate`) khi khởi động.
- Lưu trữ mọi lần phân tích; giao diện cho phép xem lại chi tiết và nạp lại bất kỳ phiên nào.

### 4. Xuất Báo Cáo Excel Chuyên Nghiệp (Excelize v2)
Xuất file `.xlsx` gồm đúng 3 Sheet:
1. **Sheet 1 - Tổng quan (Overview)**: Thông tin URL, thời gian quét, điểm SEO, điểm UX/UI, bảng danh sách gợi ý cải tiến với màu badge mức độ ưu tiên.
2. **Sheet 2 - Chi tiết SEO (SEO Audit)**: Bảng thống kê chi tiết thẻ Meta, Core Web Vitals, Lỗi phát hiện & Giải pháp khắc phục.
3. **Sheet 3 - Kịch bản UX-UI (UX Tracking)**: Chi tiết từng Step, thời gian thực thi (s), Tag tiêu chí, Điểm từng step, Trạng thái.
