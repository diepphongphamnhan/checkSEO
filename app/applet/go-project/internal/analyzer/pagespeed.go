package analyzer

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"seo-ux-analyzer/internal/models"
)

// PageSpeedResponse biểu diễn cấu trúc phản hồi từ Google PageSpeed Insights v5
type PageSpeedResponse struct {
	LighthouseResult struct {
		Categories struct {
			Performance struct {
				Score *float64 `json:"score"`
			} `json:"performance"`
			SEO struct {
				Score *float64 `json:"score"`
			} `json:"seo"`
		} `json:"categories"`
		Audits map[string]struct {
			Score            *float64 `json:"score"`
			DisplayValue     string   `json:"displayValue"`
			NumericValue     float64  `json:"numericValue"`
			Title            string   `json:"title"`
			Description      string   `json:"description"`
			ScoreDisplayMode string   `json:"scoreDisplayMode"`
		} `json:"audits"`
	} `json:"lighthouseResult"`
}

// FetchGooglePageSpeed gọi API công khai của Google PageSpeed Insights
func FetchGooglePageSpeed(targetURL string, strategy string) (*models.SEOResult, []models.SEOIssue, []models.SEORecommendation, error) {
	if strategy == "" {
		strategy = "desktop"
	}

	apiEndpoint := fmt.Sprintf(
		"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=%s&strategy=%s&category=PERFORMANCE&category=SEO",
		url.QueryEscape(targetURL),
		strategy,
	)

	client := &http.Client{
		Timeout: 45 * time.Second,
	}

	req, err := http.NewRequest("GET", apiEndpoint, nil)
	if err != nil {
		return nil, nil, nil, fmt.Errorf("lỗi tạo request: %w", err)
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; SEO-UX-Analyzer/1.0; Desktop-Audit)")

	resp, err := client.Do(req)
	if err != nil {
		return nil, nil, nil, fmt.Errorf("không thể kết nối Google PageSpeed API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, nil, nil, fmt.Errorf("Google PageSpeed API trả về lỗi status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	var psr PageSpeedResponse
	if err := json.NewDecoder(resp.Body).Decode(&psr); err != nil {
		return nil, nil, nil, fmt.Errorf("lỗi giải mã dữ liệu PageSpeed JSON: %w", err)
	}

	lh := psr.LighthouseResult
	perfScore := 0
	if lh.Categories.Performance.Score != nil {
		perfScore = int(*lh.Categories.Performance.Score * 100)
	}

	seoScore := 0
	if lh.Categories.SEO.Score != nil {
		seoScore = int(*lh.Categories.SEO.Score * 100)
	}

	// Trích xuất các chỉ số Core Web Vitals
	fcpSec := 0.0
	if audit, ok := lh.Audits["first-contentful-paint"]; ok {
		fcpSec = audit.NumericValue / 1000.0
	}

	lcpSec := 0.0
	if audit, ok := lh.Audits["largest-contentful-paint"]; ok {
		lcpSec = audit.NumericValue / 1000.0
	}

	clsVal := 0.0
	if audit, ok := lh.Audits["cumulative-layout-shift"]; ok {
		clsVal = audit.NumericValue
	}

	inpMs := 0.0
	if audit, ok := lh.Audits["interactive"]; ok {
		inpMs = audit.NumericValue
	} else if audit, ok := lh.Audits["max-potential-fid"]; ok {
		inpMs = audit.NumericValue
	}

	result := &models.SEOResult{
		PerformanceScore: perfScore,
		SEOScore:         seoScore,
		FCP:              fcpSec,
		LCP:              lcpSec,
		CLS:              clsVal,
		INP:              inpMs,
	}

	var issues []models.SEOIssue
	var recommendations []models.SEORecommendation

	// Kiểm tra các ngưỡng Core Web Vitals và lập danh sách lỗi & khuyến nghị tiếng Việt
	if lcpSec > 2.5 {
		issues = append(issues, models.SEOIssue{
			Type:        "warning",
			Category:    "speed",
			Title:       "LCP vượt ngưỡng khuyến nghị (2.5s)",
			Description: fmt.Sprintf("Thời gian tải nội dung lớn nhất đạt %.2fs. Người dùng phải chờ quá lâu trước khi thấy nội dung quan trọng.", lcpSec),
			Impact:      "Cao",
		})
		recommendations = append(recommendations, models.SEORecommendation{
			Category:    "Tốc độ tải",
			Action:      "Tối ưu ảnh hero (dùng WebP/AVIF), kích hoạt CDN và nén pre-load font quan trọng",
			Priority:    "Ưu tiên cao",
			ExpectedGain: "Giảm LCP xuống dưới 2.0s, cải thiện thứ hạng SEO Google và trải nghiệm UX",
		})
	}

	if clsVal > 0.1 {
		issues = append(issues, models.SEOIssue{
			Type:        "warning",
			Category:    "speed",
			Title:       "CLS gây giật giao diện vượt mức 0.1",
			Description: fmt.Sprintf("Điểm dịch chuyển giao diện CLS là %.3f. Các khối tử thay đổi vị trí đột ngột gây nhầm lẫn khi người dùng click.", clsVal),
			Impact:      "Trung bình",
		})
		recommendations = append(recommendations, models.SEORecommendation{
			Category:    "Giao diện UX",
			Action:      "Chỉ định rõ chiều rộng và chiều cao (width/height hoặc aspect-ratio) cho tất cả hình ảnh, video và banner quảng cáo",
			Priority:    "Ưu tiên cao",
			ExpectedGain: "Tránh giật khung hình, bảo đảm trải nghiệm đọc mượt mà",
		})
	}

	if fcpSec > 1.8 {
		issues = append(issues, models.SEOIssue{
			Type:        "notice",
			Category:    "speed",
			Title:       "First Contentful Paint (FCP) chậm",
			Description: fmt.Sprintf("Mất %.2fs để hiển thị phần tử nội dung đầu tiên trên màn hình.", fcpSec),
			Impact:      "Trung bình",
		})
	}

	return result, issues, recommendations, nil
}
