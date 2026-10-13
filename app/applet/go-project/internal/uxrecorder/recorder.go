package uxrecorder

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/chromedp/chromedp"
	"seo-ux-analyzer/internal/models"
)

// UXStepDef định nghĩa 1 bước hành vi trong kịch bản kiểm thử
type UXStepDef struct {
	Order       int    `json:"order"`
	Name        string `json:"name"`
	ActionType  string `json:"action_type"` // navigate, wait_element, click, input, submit
	Selector    string `json:"selector"`
	InputValue  string `json:"input_value,omitempty"`
	Description string `json:"description"`
}

// GetDefaultEcommerceScenario trả về kịch bản mẫu Mua hàng / Đăng ký
func GetDefaultEcommerceScenario() []UXStepDef {
	return []UXStepDef{
		{
			Order:       1,
			Name:        "Tải trang chủ & Kiểm tra Hero Section",
			ActionType:  "wait_element",
			Selector:    "body, main, #app, #root",
			Description: "Kiểm tra thời gian trang tải ban đầu và hiển thị vùng nội dung chính",
		},
		{
			Order:       2,
			Name:        "Định vị Nút Kêu gọi Hành động (CTA Button)",
			ActionType:  "wait_element",
			Selector:    "button[type='submit'], .btn-primary, .cta-btn, a[href*='cart'], a[href*='buy'], a[href*='register']",
			Description: "Đo thời gian nhận diện và tính nổi bật của nút kêu gọi hành động",
		},
		{
			Order:       3,
			Name:        "Tương tác Click Nút Hành động Chính",
			ActionType:  "click",
			Selector:    "button, a.btn, input[type='button']",
			Description: "Thực hiện click và đo thời gian phản hồi giao diện",
		},
		{
			Order:       4,
			Name:        "Nhập dữ liệu vào Ô Tìm kiếm hoặc Form",
			ActionType:  "input",
			Selector:    "input[type='search'], input[type='text'], input[placeholder*='tìm'], input[name='q']",
			InputValue:  "Sản phẩm chất lượng cao",
			Description: "Kiểm tra độ phản hồi khi người dùng nhập dữ liệu form",
		},
		{
			Order:       5,
			Name:        "Kiểm tra Phản hồi Giao diện (Render Result)",
			ActionType:  "wait_element",
			Selector:    ".search-results, .dropdown, form, footer",
			Description: "Kiểm tra kết quả phản hồi cuối cùng của quy trình",
		},
	}
}

// ExecuteUXScenario thực thi từng bước trong kịch bản và đo lường latency, visibility, tiêu chí
func ExecuteUXScenario(targetURL string, steps []UXStepDef) ([]models.UXStepResult, int, error) {
	if len(steps) == 0 {
		steps = GetDefaultEcommerceScenario()
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", true),
		chromedp.Flag("disable-gpu", true),
		chromedp.Flag("no-sandbox", true),
		chromedp.WindowSize(1366, 768),
	)

	allocCtx, allocCancel := chromedp.NewExecAllocator(ctx, opts...)
	defer allocCancel()

	taskCtx, taskCancel := chromedp.NewContext(allocCtx)
	defer taskCancel()

	var results []models.UXStepResult
	totalScore := 0

	// Step 0: Mở trang
	navStart := time.Now()
	err := chromedp.Run(taskCtx,
		chromedp.Navigate(targetURL),
		chromedp.WaitReady("body", chromedp.ByQuery),
	)
	navDuration := time.Since(navStart).Milliseconds()

	// Ghi nhận step mở trang
	initStepResult := models.UXStepResult{
		StepOrder:    1,
		StepName:     "Mở trang & Tải khung giao diện (Initial Page Load)",
		ActionType:   "navigate",
		Selector:     "body",
		DurationMs:   navDuration,
		IsVisible:    err == nil,
		IsSuccess:    err == nil,
	}

	if err != nil {
		initStepResult.ErrorMsg = err.Error()
		initStepResult.TagCriterion = models.TagTaiCham
		initStepResult.Score = 20
	} else {
		initStepResult.TagCriterion, initStepResult.Score = evaluateStepCriterion(navDuration, true, "navigate")
	}
	results = append(results, initStepResult)
	totalScore += initStepResult.Score

	// Thực hiện từng step tiếp theo trong kịch bản
	for _, step := range steps {
		stepStart := time.Now()
		var stepErr error
		isVisible := false

		stepTimeoutCtx, stepCancel := context.WithTimeout(taskCtx, 8*time.Second)

		switch step.ActionType {
		case "wait_element":
			// Kiểm tra phần tử có xuất hiện và visible không
			var rect struct {
				Width  float64 `json:"width"`
				Height float64 `json:"height"`
			}
			script := fmt.Sprintf(`
				(() => {
					const el = document.querySelector("%s");
					if (!el) return {width: 0, height: 0};
					const r = el.getBoundingClientRect();
					const style = window.getComputedStyle(el);
					const isHidden = style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';
					return {
						width: isHidden ? 0 : r.width,
						height: isHidden ? 0 : r.height
					};
				})()
			`, escapeSelector(step.Selector))

			stepErr = chromedp.Run(stepTimeoutCtx,
				chromedp.Evaluate(script, &rect),
			)
			if stepErr == nil && rect.Width > 0 && rect.Height > 0 {
				isVisible = true
			}

		case "click":
			stepErr = chromedp.Run(stepTimeoutCtx,
				chromedp.Click(step.Selector, chromedp.ByQuery),
			)
			isVisible = stepErr == nil

		case "input":
			stepErr = chromedp.Run(stepTimeoutCtx,
				chromedp.SendKeys(step.Selector, step.InputValue, chromedp.ByQuery),
			)
			isVisible = stepErr == nil

		default:
			stepErr = chromedp.Run(stepTimeoutCtx,
				chromedp.Sleep(200*time.Millisecond),
			)
			isVisible = true
		}

		stepCancel()
		stepDuration := time.Since(stepStart).Milliseconds()

		criterionTag, stepScore := evaluateStepCriterion(stepDuration, isVisible, step.ActionType)

		stepRes := models.UXStepResult{
			StepOrder:    len(results) + 1,
			StepName:     step.Name,
			ActionType:   step.ActionType,
			Selector:     step.Selector,
			DurationMs:   stepDuration,
			TagCriterion: criterionTag,
			Score:        stepScore,
			IsVisible:    isVisible,
			IsSuccess:    stepErr == nil,
		}

		if stepErr != nil {
			stepRes.ErrorMsg = stepErr.Error()
		}

		results = append(results, stepRes)
		totalScore += stepScore
	}

	overallUXScore := 0
	if len(results) > 0 {
		overallUXScore = totalScore / len(results)
	}

	return results, overallUXScore, nil
}

// evaluateStepCriterion gán Tag Tiêu chí và tính Điểm số theo yêu cầu đề bài
func evaluateStepCriterion(durationMs int64, isVisible bool, actionType string) (string, int) {
	if !isVisible {
		return models.TagGiaoDienPhucTap, 35
	}

	// Thời gian tải rất nhanh dưới 300ms và hiển thị rõ
	if durationMs < 350 {
		if actionType == "wait_element" {
			return models.TagNoiBat, 95
		}
		return models.TagNhanh, 95
	}

	// Thời gian phản hồi tốt từ 350ms - 800ms
	if durationMs <= 800 {
		return models.TagGonGang, 88
	}

	// Thời gian phản hồi chấp nhận được 800ms - 1500ms
	if durationMs <= 1500 {
		return models.TagDeHieu, 78
	}

	// Thời gian chậm từ 1500ms - 3000ms
	if durationMs <= 3000 {
		return models.TagTaiCham, 58
	}

	// Quá 3000ms hoặc giao diện cồng kềnh khó định vị
	return models.TagGiaoDienPhucTap, 40
}

func escapeSelector(sel string) string {
	return strings.ReplaceAll(sel, `"`, `\"`)
}
