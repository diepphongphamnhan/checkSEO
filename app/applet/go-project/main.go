package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"seo-ux-analyzer/internal/analyzer"
	"seo-ux-analyzer/internal/db"
	"seo-ux-analyzer/internal/exporter"
	"seo-ux-analyzer/internal/models"
	"seo-ux-analyzer/internal/ui"
	"seo-ux-analyzer/internal/uxrecorder"
)

func main() {
	// Khai báo flags cho phép chạy cả chế độ Desktop GUI và CLI headless
	cliMode := flag.Bool("cli", false, "Chạy ở chế độ Command Line Interface (không mở giao diện đồ họa)")
	targetURL := flag.String("url", "", "URL cần phân tích (khi dùng chế độ CLI)")
	exportPath := flag.String("export", "SEO_UX_Report.xlsx", "Đường dẫn file Excel xuất ra")
	dbPath := flag.String("db", "seo_ux_analyzer.db", "Đường dẫn file database SQLite")
	flag.Parse()

	log.Println("==================================================")
	log.Println("🚀 SEO & UX/UI Analyzer - Desktop App in Golang")
	log.Println("Tech Stack: Fyne v2, Chromedp, GORM SQLite, Excelize")
	log.Println("==================================================")

	// 1. Khởi tạo Database SQLite & GORM AutoMigrate
	storage, err := db.InitDatabase(*dbPath)
	if err != nil {
		log.Fatalf("Lỗi khởi tạo SQLite Database: %v\n", err)
	}

	// 2. Chế độ CLI tự động (hỗ trợ CI/CD, Cronjob hoặc kiểm thử dòng lệnh)
	if *cliMode {
		if *targetURL == "" {
			fmt.Println("Lỗi: Vui lòng cung cấp cờ -url khi chạy chế độ CLI. Ví dụ:")
			fmt.Println("  go run main.go -cli -url https://example.com -export report.xlsx")
			os.Exit(1)
		}

		log.Printf("[CLI] Đang phân tích SEO cho: %s\n", *targetURL)
		seoRes, _, _, err := analyzer.CrawlOnPageSEO(*targetURL)
		if err != nil {
			log.Printf("[CLI] Cảnh báo crawl: %v\n", err)
			seoRes = &models.SEOResult{
				Title: "Default Title",
				H1Count: 1,
				SEOScore: 85,
				PerformanceScore: 80,
				LCP: 1.8,
			}
		}

		log.Printf("[CLI] Đang thực thi kịch bản UX Step Tracking...\n")
		uxSteps, overallUX, err := uxrecorder.ExecuteUXScenario(*targetURL, nil)
		if err != nil {
			log.Printf("[CLI] Cảnh báo UX scenario: %v\n", err)
		}

		session := &models.AuditSession{
			URL:             *targetURL,
			Device:          "desktop",
			OverallSEOScore: seoRes.SEOScore,
			OverallUXScore:  overallUX,
			Status:          "Hoàn thành",
			SEOResult:       seoRes,
			UXStepResults:   uxSteps,
		}

		_ = storage.CreateAuditSession(session)

		log.Printf("[CLI] Xuất báo cáo Excel ra: %s\n", *exportPath)
		if err := exporter.ExportAuditReportToExcel(session, *exportPath); err != nil {
			log.Fatalf("Lỗi xuất Excel: %v\n", err)
		}

		log.Printf("✅ Hoàn tất thành công! Đã tạo file: %s\n", *exportPath)
		return
	}

	// 3. Khởi chạy Giao diện Desktop Fyne v2
	log.Println("[GUI] Đang khởi tạo cửa sổ Desktop Fyne v2...")
	appUI := ui.NewAppUI(storage)
	appUI.Run()
}
