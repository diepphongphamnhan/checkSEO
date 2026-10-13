package analyzer

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/chromedp/chromedp"
	"seo-ux-analyzer/internal/models"
)

// CrawlOnPageSEO dùng chromedp để cào dữ liệu HTML thực tế của trang mục tiêu
func CrawlOnPageSEO(targetURL string) (*models.SEOResult, []models.SEOIssue, []models.SEORecommendation, error) {
	// Khởi tạo ngữ cảnh chromedp với timeout
	ctx, cancel := context.WithTimeout(context.Background(), 35*time.Second)
	defer cancel()

	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", true),
		chromedp.Flag("disable-gpu", true),
		chromedp.Flag("no-sandbox", true),
		chromedp.Flag("disable-dev-shm-usage", true),
		chromedp.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"),
	)

	allocCtx, allocCancel := chromedp.NewExecAllocator(ctx, opts...)
	defer allocCancel()

	taskCtx, taskCancel := chromedp.NewContext(allocCtx)
	defer taskCancel()

	var pageTitle string
	var metaDesc string
	var canonical string
	var h1Count int
	var h2Count int
	var totalImages int
	var missingAltCount int

	// Javascript snippet trích xuất dữ liệu thẻ meta và headings
	extractScript := `
	(() => {
		const title = document.title || "";
		const metaDescEl = document.querySelector('meta[name="description"]');
		const metaDesc = metaDescEl ? metaDescEl.getAttribute("content") || "" : "";
		
		const canonicalEl = document.querySelector('link[rel="canonical"]');
		const canonical = canonicalEl ? canonicalEl.getAttribute("href") || "" : "";
		
		const h1s = document.querySelectorAll("h1").length;
		const h2s = document.querySelectorAll("h2").length;
		
		const imgs = Array.from(document.querySelectorAll("img"));
		const totalImgs = imgs.length;
		const missingAlts = imgs.filter(img => !img.hasAttribute("alt") || img.getAttribute("alt").trim() === "").length;
		
		return {
			title,
			metaDesc,
			canonical,
			h1Count: h1s,
			h2Count: h2s,
			totalImages: totalImgs,
			missingAltCount: missingAlts
		};
	})()
	`

	var extractedData struct {
		Title           string `json:"title"`
		MetaDesc        string `json:"metaDesc"`
		Canonical       string `json:"canonical"`
		H1Count         int    `json:"h1Count"`
		H2Count         int    `json:"h2Count"`
		TotalImages     int    `json:"totalImages"`
		MissingAltCount int    `json:"missingAltCount"`
	}

	err := chromedp.Run(taskCtx,
		chromedp.Navigate(targetURL),
		chromedp.WaitReady("body", chromedp.ByQuery),
		chromedp.Evaluate(extractScript, &extractedData),
	)

	if err != nil {
		// Fallback nếu môi trường thiếu chromium
		return nil, nil, nil, fmt.Errorf("chromedp không thể truy cập trang: %w", err)
	}

	pageTitle = strings.TrimSpace(extractedData.Title)
	metaDesc = strings.TrimSpace(extractedData.MetaDesc)
	canonical = strings.TrimSpace(extractedData.Canonical)
	h1Count = extractedData.H1Count
	h2Count = extractedData.H2Count
	totalImages = extractedData.TotalImages
	missingAltCount = extractedData.MissingAltCount

	// Kiểm tra robots.txt và sitemap.xml
	parsedURL, _ := url.Parse(targetURL)
	robotsURL := fmt.Sprintf("%s://%s/robots.txt", parsedURL.Scheme, parsedURL.Host)
	sitemapURL := fmt.Sprintf("%s://%s/sitemap.xml", parsedURL.Scheme, parsedURL.Host)

	robotsFound := checkHTTPStatus(robotsURL)
	sitemapFound := checkHTTPStatus(sitemapURL)

	seoRes := &models.SEOResult{
		Title:           pageTitle,
		MetaDesc:        metaDesc,
		H1Count:         h1Count,
		H2Count:         h2Count,
		TotalImages:     totalImages,
		MissingAltCount: missingAltCount,
		Canonical:       canonical,
		RobotsTxtFound: robotsFound,
		SitemapFound:   sitemapFound,
	}

	var issues []models.SEOIssue
	var recs []models.SEORecommendation

	// Đánh giá Title
	if pageTitle == "" {
		issues = append(issues, models.SEOIssue{
			Type:        "error",
			Category:    "meta",
			Title:       "Thiếu thẻ Title trang web",
			Description: "Trang không có thẻ <title>, Google sẽ tự động gán tiêu đề ngẫu nhiên làm giảm CTR nghiêm trọng.",
			Impact:      "Cao",
		})
		recs = append(recs, models.SEORecommendation{
			Category:    "Thẻ Meta",
			Action:      "Thêm thẻ <title> độc nhất từ 50-60 ký tự chứa từ khóa chính của thương hiệu",
			Priority:    "Ưu tiên cao",
			ExpectedGain: "Hiển thị đúng tiêu đề trên kết quả tìm kiếm Google, tăng tỷ lệ nhấp chuột",
		})
	} else if len(pageTitle) < 30 || len(pageTitle) > 65 {
		issues = append(issues, models.SEOIssue{
			Type:        "warning",
			Category:    "meta",
			Title:       fmt.Sprintf("Độ dài Title chưa tối ưu (%d ký tự)", len(pageTitle)),
			Description: "Tiêu đề nên nằm trong khoảng 50 - 60 ký tự để không bị cắt bớt (...) trên Google SERP.",
			Impact:      "Trung bình",
		})
	}

	// Đánh giá Meta Description
	if metaDesc == "" {
		issues = append(issues, models.SEOIssue{
			Type:        "error",
			Category:    "meta",
			Title:       "Thiếu Meta Description",
			Description: "Không tìm thấy thẻ <meta name=\"description\">. Google sẽ tự trích xuất đoạn văn bản bất kỳ.",
			Impact:      "Cao",
		})
		recs = append(recs, models.SEORecommendation{
			Category:    "Thẻ Meta",
			Action:      "Viết mô tả hấp dẫn từ 140 - 160 ký tự tóm lược nội dung và có lời kêu gọi hành động (Call to action)",
			Priority:    "Ưu tiên cao",
			ExpectedGain: "Tăng tỷ lệ nhấp tự nhiên (organic CTR) từ trang tìm kiếm",
		})
	}

	// Đánh giá H1
	if h1Count == 0 {
		issues = append(issues, models.SEOIssue{
			Type:        "error",
			Category:    "heading",
			Title:       "Không tìm thấy thẻ H1",
			Description: "Mỗi trang chuẩn SEO cần đúng 1 thẻ <h1> làm chủ đề chính.",
			Impact:      "Cao",
		})
		recs = append(recs, models.SEORecommendation{
			Category:    "Heading",
			Action:      "Bổ sung 1 thẻ <h1> duy nhất chứa từ khóa mục tiêu tại phần đầu nội dung",
			Priority:    "Ưu tiên cao",
			ExpectedGain: "Giúp Google bot định danh chính xác chủ đề bài viết hoặc dịch vụ",
		})
	} else if h1Count > 1 {
		issues = append(issues, models.SEOIssue{
			Type:        "warning",
			Category:    "heading",
			Title:       fmt.Sprintf("Có nhiều hơn 1 thẻ H1 (%d thẻ)", h1Count),
			Description: "Trang có nhiều H1 có thể làm loãng trọng tâm từ khóa chính.",
			Impact:      "Thấp",
		})
	}

	// Đánh giá Hình ảnh & Alt text
	if missingAltCount > 0 {
		issues = append(issues, models.SEOIssue{
			Type:        "warning",
			Category:    "media",
			Title:       fmt.Sprintf("Có %d/%d hình ảnh thiếu thuộc tính alt", missingAltCount, totalImages),
			Description: "Thiếu thẻ alt khiến công cụ tìm kiếm không hiểu nội dung ảnh và giảm khả năng tiếp cận (Accessibility).",
			Impact:      "Trung bình",
		})
		recs = append(recs, models.SEORecommendation{
			Category:    "Hình ảnh & Media",
			Action:      "Điền thuộc tính alt mô tả chính xác nội dung hình ảnh hoặc bối cảnh xung quanh",
			Priority:    "Ưu tiên vừa",
			ExpectedGain: "Cải thiện xếp hạng trên Google Images Search và tuân thủ chuẩn Web Accessibility",
		})
	}

	// Đánh giá Robots.txt & Sitemap
	if !robotsFound {
		issues = append(issues, models.SEOIssue{
			Type:        "warning",
			Category:    "indexing",
			Title:       "Không tìm thấy tập tin robots.txt",
			Description: "Không thể truy cập đường dẫn /robots.txt chuẩn.",
			Impact:      "Trung bình",
		})
	}

	if !sitemapFound {
		issues = append(issues, models.SEOIssue{
			Type:        "notice",
			Category:    "indexing",
			Title:       "Không tìm thấy sitemap.xml tại thư mục gốc",
			Description: "Đảm bảo sitemap.xml đã được khai báo trong robots.txt hoặc nộp trên Google Search Console.",
			Impact:      "Thấp",
		})
	}

	return seoRes, issues, recs, nil
}

func checkHTTPStatus(urlStr string) bool {
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(urlStr)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	return resp.StatusCode == http.StatusOK
}
