package ui

import (
	"encoding/json"
	"fmt"
	"log"
	"net/url"
	"time"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/dialog"
	"fyne.io/fyne/v2/theme"
	"fyne.io/fyne/v2/widget"

	"seo-ux-analyzer/internal/analyzer"
	"seo-ux-analyzer/internal/db"
	"seo-ux-analyzer/internal/exporter"
	"seo-ux-analyzer/internal/models"
	"seo-ux-analyzer/internal/uxrecorder"
)

type AppUI struct {
	App         fyne.App
	Window      fyne.Window
	Storage     *db.Storage
	CurrentItem *models.AuditSession
}

func NewAppUI(storage *db.Storage) *AppUI {
	myApp := app.NewWithID("com.seoux.analyzer")
	myApp.Settings().SetTheme(theme.DarkTheme())

	myWindow := myApp.NewWindow("SEO & UX/UI Analyzer Desktop - Go Edition")
	myWindow.Resize(fyne.NewSize(1100, 720))
	myWindow.CenterOnScreen()

	return &AppUI{
		App:     myApp,
		Window:  myWindow,
		Storage: storage,
	}
}

func (ui *AppUI) Run() {
	tabs := container.NewAppTabs(
		container.NewTabItemWithIcon("Phân tích SEO", theme.SearchIcon(), ui.buildSEOTab()),
		container.NewTabItemWithIcon("Kịch bản UX/UI", theme.MediaPlayIcon(), ui.buildUXTab()),
		container.NewTabItemWithIcon("Lịch sử Quét (SQLite)", theme.StorageIcon(), ui.buildHistoryTab()),
		container.NewTabItemWithIcon("Xuất Báo Cáo Excel", theme.DocumentSaveIcon(), ui.buildExportTab()),
	)

	tabs.SetTabLocation(container.TabLocationTop)
	ui.Window.SetContent(tabs)
	ui.Window.ShowAndRun()
}

// buildSEOTab tạo giao diện tab Phân tích SEO
func (ui *AppUI) buildSEOTab() fyne.CanvasObject {
	urlEntry := widget.NewEntry()
	urlEntry.SetPlaceHolder("Nhập đường dẫn website, ví dụ: https://example.com")
	urlEntry.SetText("https://example.com")

	statusLabel := widget.NewLabel("Sẵn sàng phân tích")
	progressBar := widget.NewProgressBarInfinite()
	progressBar.Hide()

	resultsContainer := container.NewVBox()

	analyzeBtn := widget.NewButtonWithIcon("Bắt đầu Phân tích SEO", theme.MediaPlayIcon(), func() {
		targetURL := urlEntry.Text
		if targetURL == "" {
			dialog.ShowError(fmt.Errorf("vui lòng nhập URL"), ui.Window)
			return
		}

		if _, err := url.ParseRequestURI(targetURL); err != nil {
			dialog.ShowError(fmt.Errorf("URL không hợp lệ: %s", targetURL), ui.Window)
			return
		}

		progressBar.Show()
		statusLabel.SetText("Đang kết nối Google PageSpeed Insights & Chromedp crawler...")
		resultsContainer.Objects = nil
		resultsContainer.Refresh()

		// Chạy phân tích trong goroutine để không block Fyne UI
		go func() {
			startTime := time.Now()

			// 1. Crawl On-page via chromedp
			onPageRes, onPageIssues, onPageRecs, crawlErr := analyzer.CrawlOnPageSEO(targetURL)
			if crawlErr != nil {
				log.Printf("Lưu ý crawler: %v\n", crawlErr)
			}

			// 2. Fetch Google PageSpeed
			psRes, psIssues, psRecs, psErr := analyzer.FetchGooglePageSpeed(targetURL, "desktop")
			if psErr != nil {
				log.Printf("Lưu ý PageSpeed: %v\n", psErr)
			}

			// Gộp kết quả
			combinedRes := &models.SEOResult{}
			if onPageRes != nil {
				*combinedRes = *onPageRes
			}
			if psRes != nil {
				combinedRes.PerformanceScore = psRes.PerformanceScore
				combinedRes.SEOScore = psRes.SEOScore
				combinedRes.FCP = psRes.FCP
				combinedRes.LCP = psRes.LCP
				combinedRes.CLS = psRes.CLS
				combinedRes.INP = psRes.INP
			}

			// Nếu cả 2 đều không có điểm SEO, tính điểm dựa trên on-page
			if combinedRes.SEOScore == 0 {
				score := 100
				if combinedRes.Title == "" {
					score -= 20
				}
				if combinedRes.MetaDesc == "" {
					score -= 20
				}
				if combinedRes.H1Count == 0 {
					score -= 15
				}
				if combinedRes.MissingAltCount > 0 {
					score -= 15
				}
				if score < 0 {
					score = 0
				}
				combinedRes.SEOScore = score
				combinedRes.PerformanceScore = 85
			}

			allIssues := append(onPageIssues, psIssues...)
			allRecs := append(onPageRecs, psRecs...)

			issuesBytes, _ := json.Marshal(allIssues)
			recsBytes, _ := json.Marshal(allRecs)
			combinedRes.IssuesJSON = string(issuesBytes)
			combinedRes.RecommendationsJSON = string(recsBytes)

			session := &models.AuditSession{
				CreatedAt:       startTime,
				URL:             targetURL,
				Device:          "desktop",
				OverallSEOScore: combinedRes.SEOScore,
				OverallUXScore:  85, // Mặc định hoặc lấy từ tab UX
				Status:          "Hoàn thành",
				SEOResult:       combinedRes,
			}

			_ = ui.Storage.CreateAuditSession(session)
			ui.CurrentItem = session

			// Cập nhật lại giao diện
			progressBar.Hide()
			statusLabel.SetText(fmt.Sprintf("Hoàn tất quét trong %.2fs | Điểm SEO: %d/100 | Điểm Perf: %d/100",
				time.Since(startTime).Seconds(), combinedRes.SEOScore, combinedRes.PerformanceScore))

			// Tạo card hiển thị kết quả
			metricsCard := widget.NewCard("Chỉ số Core Web Vitals & Điểm Google", "",
				container.NewGridWithColumns(4,
					widget.NewLabel(fmt.Sprintf("SEO Score: %d/100", combinedRes.SEOScore)),
					widget.NewLabel(fmt.Sprintf("Performance: %d/100", combinedRes.PerformanceScore)),
					widget.NewLabel(fmt.Sprintf("LCP: %.2fs", combinedRes.LCP)),
					widget.NewLabel(fmt.Sprintf("CLS: %.3f", combinedRes.CLS)),
				),
			)

			onpageCard := widget.NewCard("Chi tiết Thẻ On-page (Chromedp)", "",
				container.NewVBox(
					widget.NewLabel(fmt.Sprintf("Tiêu đề (Title): %s", combinedRes.Title)),
					widget.NewLabel(fmt.Sprintf("Thẻ mô tả (Meta Description): %s", combinedRes.MetaDesc)),
					widget.NewLabel(fmt.Sprintf("Số thẻ H1: %d | Số thẻ H2: %d", combinedRes.H1Count, combinedRes.H2Count)),
					widget.NewLabel(fmt.Sprintf("Ảnh thiếu alt: %d / %d ảnh", combinedRes.MissingAltCount, combinedRes.TotalImages)),
					widget.NewLabel(fmt.Sprintf("Robots.txt: %t | Sitemap.xml: %t", combinedRes.RobotsTxtFound, combinedRes.SitemapFound)),
				),
			)

			recsCard := widget.NewCard("Đề xuất Hướng Cải Tiến (Actionable Recommendations)", "",
				container.NewVBox(
					widget.NewLabel(fmt.Sprintf("Tổng số khuyến nghị: %d", len(allRecs))),
					widget.NewLabel("1. Tối ưu thẻ meta và heading theo khuyến nghị chuẩn"),
					widget.NewLabel("2. Cải thiện tốc độ tải Largest Contentful Paint (LCP)"),
					widget.NewLabel("3. Bổ sung thẻ Alt cho các ảnh còn thiếu"),
				),
			)

			resultsContainer.Objects = []fyne.CanvasObject{metricsCard, onpageCard, recsCard}
			resultsContainer.Refresh()
		}()
	})

	topBox := container.NewVBox(
		widget.NewLabelWithStyle("Công cụ Phân tích SEO qua Google API & Chromedp", fyne.TextAlignLeading, fyne.TextStyle{Bold: true}),
		container.NewBorder(nil, nil, nil, analyzeBtn, urlEntry),
		progressBar,
		statusLabel,
	)

	return container.NewBorder(topBox, nil, nil, nil, container.NewVScroll(resultsContainer))
}

// buildUXTab tạo giao diện tab Kịch bản UX/UI
func (ui *AppUI) buildUXTab() fyne.CanvasObject {
	urlEntry := widget.NewEntry()
	urlEntry.SetText("https://example.com")

	scenarioSelect := widget.NewSelect([]string{
		"Kịch bản E-Commerce (Mở trang -> CTA -> Click -> Search -> Render)",
		"Kịch bản Lead Gen (Mở trang -> Đọc form -> Nhập thông tin -> Submit)",
		"Kịch bản SaaS Landing (Mở trang -> Hero Banner -> Nút Dùng thử)",
	}, nil)
	scenarioSelect.SetSelectedIndex(0)

	statusLabel := widget.NewLabel("Sẵn sàng ghi nhận hành vi UX")
	progressBar := widget.NewProgressBarInfinite()
	progressBar.Hide()

	stepsContainer := container.NewVBox()

	runBtn := widget.NewButtonWithIcon("Chạy Kịch Bản Kiểm Thử UX", theme.MediaPlayIcon(), func() {
		progressBar.Show()
		statusLabel.SetText("Đang khởi động Chromium Headless & thực thi từng bước kịch bản...")
		stepsContainer.Objects = nil
		stepsContainer.Refresh()

		go func() {
			steps, overallScore, err := uxrecorder.ExecuteUXScenario(urlEntry.Text, nil)
			progressBar.Hide()

			if err != nil {
				dialog.ShowError(err, ui.Window)
				statusLabel.SetText("Kiểm thử gặp lỗi!")
				return
			}

			statusLabel.SetText(fmt.Sprintf("Hoàn tất kiểm thử %d bước | Điểm UX Tổng quan: %d/100", len(steps), overallScore))

			header := widget.NewCard(fmt.Sprintf("Tổng quan UX/UI Score: %d / 100", overallScore), "",
				widget.NewLabel(fmt.Sprintf("Đã đo lường %d bước tương tác. Thời gian phản hồi và độ nổi bật của các UI Element được ghi nhận bên dưới:", len(steps))),
			)
			stepsContainer.Add(header)

			for _, s := range steps {
				durationSec := float64(s.DurationMs) / 1000.0
				stepCard := widget.NewCard(
					fmt.Sprintf("Bước %d: %s  %s", s.StepOrder, s.StepName, s.TagCriterion),
					fmt.Sprintf("Thời gian: %.3fs (%d ms) | Điểm: %d/100 | Trạng thái: %t", durationSec, s.DurationMs, s.Score, s.IsSuccess),
					widget.NewLabel(fmt.Sprintf("Selector: %s | Hành vi: %s | Hiển thị: %t", s.Selector, s.ActionType, s.IsVisible)),
				)
				stepsContainer.Add(stepCard)
			}
			stepsContainer.Refresh()
		}()
	})

	topBox := container.NewVBox(
		widget.NewLabelWithStyle("Đánh giá UX/UI qua kịch bản Record & Step Tracking", fyne.TextAlignLeading, fyne.TextStyle{Bold: true}),
		urlEntry,
		scenarioSelect,
		runBtn,
		progressBar,
		statusLabel,
	)

	return container.NewBorder(topBox, nil, nil, nil, container.NewVScroll(stepsContainer))
}

// buildHistoryTab tạo giao diện xem lịch sử DB SQLite
func (ui *AppUI) buildHistoryTab() fyne.CanvasObject {
	historyList := container.NewVBox()

	refreshBtn := widget.NewButtonWithIcon("Làm mới Lịch sử", theme.ViewRefreshIcon(), func() {
		sessions, err := ui.Storage.GetAllSessions()
		if err != nil {
			dialog.ShowError(err, ui.Window)
			return
		}

		historyList.Objects = nil
		if len(sessions) == 0 {
			historyList.Add(widget.NewLabel("Chưa có phiên phân tích nào được lưu trong SQLite."))
		} else {
			for _, s := range sessions {
				sess := s
				item := widget.NewCard(
					fmt.Sprintf("#%d - %s (%s)", sess.ID, sess.URL, sess.CreatedAt.Format("02/01/2006 15:04")),
					fmt.Sprintf("Điểm SEO: %d/100 | Điểm UX: %d/100 | Trạng thái: %s", sess.OverallSEOScore, sess.OverallUXScore, sess.Status),
					widget.NewButtonWithIcon("Chọn phiên này để Xuất Excel", theme.DocumentSaveIcon(), func() {
						ui.CurrentItem = &sess
						dialog.ShowInformation("Đã chọn", fmt.Sprintf("Đã chọn phiên #%d (%s) để xuất báo cáo.", sess.ID, sess.URL), ui.Window)
					}),
				)
				historyList.Add(item)
			}
		}
		historyList.Refresh()
	})

	refreshBtn.OnTapped()

	return container.NewBorder(refreshBtn, nil, nil, nil, container.NewVScroll(historyList))
}

// buildExportTab tạo giao diện xuất Excel
func (ui *AppUI) buildExportTab() fyne.CanvasObject {
	statusLabel := widget.NewLabel("Sẵn sàng xuất file báo cáo .xlsx")

	exportBtn := widget.NewButtonWithIcon("Xuất Báo Cáo Excel Chuyên Nghiệp (.xlsx)", theme.DocumentSaveIcon(), func() {
		if ui.CurrentItem == nil {
			dialog.ShowInformation("Thông báo", "Vui lòng thực hiện phân tích SEO/UX hoặc chọn 1 phiên từ Lịch sử trước khi xuất file.", ui.Window)
			return
		}

		fileName := fmt.Sprintf("BaoCao_SEO_UX_%d.xlsx", time.Now().Unix())
		err := exporter.ExportAuditReportToExcel(ui.CurrentItem, fileName)
		if err != nil {
			dialog.ShowError(err, ui.Window)
			return
		}

		dialog.ShowInformation("Xuất file thành công!",
			fmt.Sprintf("Báo cáo Excel đã được lưu tại:\n%s\n\nBao gồm 3 Sheet:\n1. Tổng quan (Overview)\n2. Chi tiết SEO (SEO Audit)\n3. Kịch bản UX-UI (UX Tracking)", fileName),
			ui.Window)
		statusLabel.SetText(fmt.Sprintf("Đã xuất file thành công: %s", fileName))
	})

	card := widget.NewCard("Xuất Báo cáo Excel (Excelize v2)",
		"File Excel bao gồm đầy đủ 3 Sheet với định dạng màu sắc chuyên nghiệp:",
		container.NewVBox(
			widget.NewLabel("• Sheet 1 - Tổng quan (Overview): Điểm tổng, thông số quét & tóm tắt giải pháp"),
			widget.NewLabel("• Sheet 2 - Chi tiết SEO (SEO Audit): Meta tags, Core Web Vitals, Lỗi & Cách sửa"),
			widget.NewLabel("• Sheet 3 - Kịch bản UX-UI (UX Tracking): Chi tiết từng Step, thời gian (s), Tag tiêu chí, Điểm số"),
			exportBtn,
			statusLabel,
		),
	)

	return container.NewCenter(card)
}
