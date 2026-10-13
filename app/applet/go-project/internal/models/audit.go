package models

import (
	"time"
	"gorm.io/gorm"
)

// UI/UX Criteria Tag Constants theo yêu cầu
const (
	TagNoiBat         = "[Nổi bật]"
	TagNhanh          = "[Nhanh]"
	TagDeHieu         = "[Dễ hiểu]"
	TagGonGang        = "[Gọn gàng]"
	TagTaiCham        = "[Tải chậm]"
	TagGiaoDienPhucTap = "[Giao diện phức tạp]"
)

// AuditSession lưu thông tin tổng quan phiên phân tích
type AuditSession struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
	URL             string         `gorm:"size:1024;not null;index" json:"url"`
	Device          string         `gorm:"size:20;default:'desktop'" json:"device"` // desktop hoặc mobile
	OverallSEOScore int            `json:"overall_seo_score"`                      // Thang điểm 0 - 100
	OverallUXScore  int            `json:"overall_ux_score"`                       // Thang điểm 0 - 100
	Status          string         `gorm:"size:50;default:'completed'" json:"status"`
	Notes           string         `gorm:"type:text" json:"notes"`

	// Quan hệ One-to-One và One-to-Many
	SEOResult     *SEOResult     `gorm:"foreignKey:SessionID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"seo_result,omitempty"`
	UXStepResults []UXStepResult `gorm:"foreignKey:SessionID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"ux_step_results,omitempty"`
}

// SEOResult lưu chi tiết phân tích SEO On-page và Google PageSpeed Core Web Vitals
type SEOResult struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	SessionID uint      `gorm:"uniqueIndex;not null" json:"session_id"`
	CreatedAt time.Time `json:"created_at"`

	// On-page elements
	Title          string `gorm:"size:512" json:"title"`
	MetaDesc       string `gorm:"type:text" json:"meta_desc"`
	H1Count        int    `json:"h1_count"`
	H2Count        int    `json:"h2_count"`
	MissingAltCount int   `json:"missing_alt_count"`
	TotalImages    int    `json:"total_images"`
	Canonical      string `gorm:"size:1024" json:"canonical"`
	RobotsTxtFound bool   `json:"robots_txt_found"`
	SitemapFound   bool   `json:"sitemap_found"`

	// Google PageSpeed / Core Web Vitals
	FCP              float64 `json:"fcp_sec"`            // First Contentful Paint (giây)
	LCP              float64 `json:"lcp_sec"`            // Largest Contentful Paint (giây)
	CLS              float64 `json:"cls"`                // Cumulative Layout Shift
	INP              float64 `json:"inp_ms"`             // Interaction to Next Paint (ms)
	PerformanceScore int     `json:"performance_score"`  // Điểm Performance 0-100
	SEOScore         int     `json:"seo_score"`          // Điểm SEO 0-100

	// JSON chuỗi lưu danh sách chi tiết lỗi & hướng cải tiến
	IssuesJSON          string `gorm:"type:text" json:"issues_json"`
	RecommendationsJSON string `gorm:"type:text" json:"recommendations_json"`
}

// UXStepResult lưu thông tin chi tiết từng step trong hành vi UX kiểm thử
type UXStepResult struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	SessionID   uint      `gorm:"index;not null" json:"session_id"`
	CreatedAt   time.Time `json:"created_at"`

	StepOrder    int     `json:"step_order"`                       // Thứ tự thực hiện (1, 2, 3...)
	StepName     string  `gorm:"size:255;not null" json:"step_name"` // Tên bước (vd: Click button Mua ngay)
	ActionType   string  `gorm:"size:50" json:"action_type"`         // navigate, click, input, wait, submit
	Selector     string  `gorm:"size:512" json:"selector"`           // CSS / XPath selector
	DurationMs   int64   `json:"duration_ms"`                      // Thời gian thực thi (miliseconds)
	TagCriterion string  `gorm:"size:50" json:"tag_criterion"`      // Tag tiêu chí: [Nổi bật], [Nhanh]...
	Score        int     `json:"score"`                            // Điểm số của step (0 - 100)
	IsVisible    bool    `json:"is_visible"`                       // UI element có hiển thị rõ ràng không
	IsSuccess    bool    `json:"is_success"`                       // Thành công hay thất bại
	ErrorMsg     string  `gorm:"size:512" json:"error_msg"`        // Lỗi nếu có
}

// SEOIssue đại diện cho 1 vấn đề SEO phát hiện
type SEOIssue struct {
	Type        string `json:"type"`        // "error", "warning", "notice"
	Category    string `json:"category"`    // "meta", "heading", "speed", "indexing"
	Title       string `json:"title"`       // Tiêu đề lỗi
	Description string `json:"description"` // Mô tả chi tiết
	Impact      string `json:"impact"`      // "Cao", "Trung bình", "Thấp"
}

// SEORecommendation đại diện cho 1 giải pháp cải tiến
type SEORecommendation struct {
	Category    string `json:"category"`    // Danh mục
	Action      string `json:"action"`      // Hành động cụ thể
	Priority    string `json:"priority"`    // "Ưu tiên cao", "Ưu tiên vừa", "Khuyến nghị"
	ExpectedGain string `json:"expected_gain"`// Lợi ích mang lại
}
