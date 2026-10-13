import React, { useEffect } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Search,
  Gauge,
  Database,
  FileSpreadsheet,
  Code2,
  Sparkles,
  Lightbulb,
} from 'lucide-react';

export interface TourStep {
  title: string;
  stepNumber: number;
  totalSteps: number;
  tabId: string;
  badge: string;
  description: string;
  tip: string;
  icon: React.ElementType;
  accentColor: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    stepNumber: 1,
    totalSteps: 6,
    tabId: 'seo',
    badge: 'Bước 1: Nhập URL & Phân Tích SEO',
    title: 'Cào Dữ Liệu On-Page & Kiểm Tra Google API',
    description:
      'Nhập bất kỳ đường dẫn website nào (hoặc bấm chọn nhanh các trang mẫu như Tiki, VnExpress, Linear). Bấm nút "Bắt Đầu Phân Tích SEO" để hệ thống khởi chạy Chromium Headless thu thập cấu trúc thẻ Title, Meta Description, H1-H6, hình ảnh thiếu thẻ Alt, Robots.txt và Sitemap.xml.',
    tip: 'Bạn có thể chuyển đổi giữa chế độ Desktop và Mobile để kiểm tra phản hồi theo từng loại thiết bị.',
    icon: Search,
    accentColor: 'from-cyan-500 to-blue-500',
  },
  {
    stepNumber: 2,
    totalSteps: 6,
    tabId: 'seo',
    badge: 'Bước 2: Đo Lường Core Web Vitals',
    title: 'Đánh Giá Tốc Độ & Đề Xuất Cải Tiến Tiếng Việt',
    description:
      'Xem chi tiết điểm Google SEO & Performance, kèm theo các thước đo cốt lõi: LCP (thời gian tải nội dung chính), CLS (độ giật khung hình), FCP và INP. Dưới cùng là bảng danh sách các giải pháp khắc phục cụ thể phân cấp theo mức độ Ưu tiên cao, Ưu tiên vừa và Khuyến nghị.',
    tip: 'Các đề xuất đều có ước tính mức cải thiện kỳ vọng (Expected Gain) để bạn dễ dàng tối ưu hóa.',
    icon: Gauge,
    accentColor: 'from-emerald-500 to-teal-500',
  },
  {
    stepNumber: 3,
    totalSteps: 6,
    tabId: 'ux',
    badge: 'Bước 3: Kịch Bản Record & Step Tracking',
    title: 'Đo Độ Trễ Hành Vi UX & Gán Tag Tiêu Chí',
    description:
      'Chuyển sang tab Kịch bản UX/UI, chọn kịch bản mẫu (E-Commerce hoặc Lead Gen). Bấm "Chạy Kịch Bản Kiểm Thử UX" để tự động thực thi từng bước (Mở trang, Định vị CTA, Click nút, Nhập form) và bấm giờ độ trễ thực tế bằng milisecond (ms).',
    tip: 'Hệ thống tự động gán 6 Tag tiêu chí: [Nổi bật], [Nhanh], [Gọn gàng], [Dễ hiểu], [Tải chậm], [Giao diện phức tạp] và tính điểm UX tổng quan.',
    icon: Sparkles,
    accentColor: 'from-purple-500 to-indigo-500',
  },
  {
    stepNumber: 4,
    totalSteps: 6,
    tabId: 'history',
    badge: 'Bước 4: Cơ Sở Dữ Liệu SQLite Cục Bộ',
    title: 'Lưu Trữ Bền Vững & Xem Lại Lịch Sử Qua GORM',
    description:
      'Mỗi lần quét có thể bấm nút "Lưu SQLite" để lưu vào cơ sở dữ liệu quan hệ cục bộ. Bảng AuditSession, SEOResult và UXStepResult được liên kết với nhau qua khóa ngoại, hỗ trợ tìm kiếm theo URL, nạp lại phiên cũ và so sánh kết quả qua các mốc thời gian.',
    tip: 'Cơ chế GORM AutoMigrate tự động khởi tạo bảng khi ứng dụng vừa bật mà không cần cấu hình SQL thủ công.',
    icon: Database,
    accentColor: 'from-blue-500 to-indigo-500',
  },
  {
    stepNumber: 5,
    totalSteps: 6,
    tabId: 'export',
    badge: 'Bước 5: Xuất Báo Cáo Excel Chuyên Nghiệp',
    title: 'Tạo File .xlsx 3 Sheet Chuẩn Định Dạng Excelize',
    description:
      'Bấm "Xuất Báo Cáo" để tải file Excel chuẩn gồm đúng 3 Sheet: Sheet 1 (Tổng quan & Gợi ý cải tiến), Sheet 2 (Chi tiết SEO & Core Web Vitals), Sheet 3 (Kịch bản hành vi UX từng step). Toàn bộ tiêu đề, viền ô và badge màu sắc được căn chỉnh hoàn hảo.',
    tip: 'Bạn có thể xem trước nội dung mô phỏng của từng sheet trực tiếp ngay trên màn hình trước khi tải về.',
    icon: FileSpreadsheet,
    accentColor: 'from-emerald-500 to-green-600',
  },
  {
    stepNumber: 6,
    totalSteps: 6,
    tabId: 'go-code',
    badge: 'Bước 6: Trọn Bộ Mã Nguồn Golang & Tải ZIP',
    title: 'Clean Architecture Cho Ứng Dụng Desktop Go',
    description:
      'Xem toàn bộ mã nguồn Go nguyên bản trong tab này: từ main.go, GORM models, chromedp crawler, step recorder đến excelize exporter. Bạn có thể sao chép nhanh bất kỳ file nào hoặc bấm "Tải Trọn Bộ Project Go (.ZIP)" để chạy trực tiếp trên máy của mình bằng lệnh `go run .`.',
    tip: 'Dự án hỗ trợ cả giao diện đồ họa Desktop Fyne v2 và chế độ dòng lệnh CLI Headless phục vụ CI/CD.',
    icon: Code2,
    accentColor: 'from-cyan-500 to-amber-500',
  },
];

interface InteractiveTourProps {
  isOpen: boolean;
  onClose: () => void;
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onSwitchTab: (tabId: string) => void;
}

export const InteractiveTour: React.FC<InteractiveTourProps> = ({
  isOpen,
  onClose,
  currentStepIndex,
  onStepChange,
  onSwitchTab,
}) => {
  const currentStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const Icon = currentStep.icon;

  // Lắng nghe phím tắt ESC để thoát, Mũi tên Trái/Phải để chuyển bước
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
          handleNext();
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStepIndex > 0) {
          handlePrev();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      onStepChange(nextIndex);
      onSwitchTab(TOUR_STEPS[nextIndex].tabId);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      onStepChange(prevIndex);
      onSwitchTab(TOUR_STEPS[prevIndex].tabId);
    }
  };

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Photoshop-style Dimmed Backdrop Overlay (Lớp phủ bán trong suốt làm nổi bật) */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Interactive Tour Card Dialog */}
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-10 flex flex-col text-slate-100 ring-1 ring-cyan-500/30">
        {/* Top Gradient Accent Line */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${currentStep.accentColor}`} />

        {/* Card Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${currentStep.accentColor} flex items-center justify-center text-white shadow-lg shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">
                  {currentStep.badge}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentStep.stepNumber} / {currentStep.totalSteps}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 mt-1">
                {currentStep.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Đóng hướng dẫn (Bỏ qua)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Dots Bar */}
        <div className="px-6 py-1 flex items-center gap-1.5">
          {TOUR_STEPS.map((_, idx) => (
            <div
              key={idx}
              onClick={() => {
                onStepChange(idx);
                onSwitchTab(TOUR_STEPS[idx].tabId);
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentStepIndex
                  ? 'w-8 bg-cyan-400 shadow-sm shadow-cyan-400/50'
                  : idx < currentStepIndex
                  ? 'w-3 bg-slate-600'
                  : 'w-2 bg-slate-800'
              }`}
              title={`Chuyển tới bước ${idx + 1}`}
            />
          ))}
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 pt-3 space-y-4 text-xs sm:text-sm text-slate-300">
          <p className="leading-relaxed text-slate-300">
            {currentStep.description}
          </p>

          {/* Practical Pro Tip Box */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-amber-300">Mẹo hữu ích: </span>
              {currentStep.tip}
            </div>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 font-medium transition-colors cursor-pointer"
          >
            Bỏ qua hướng dẫn
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={isFirstStep}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại</span>
            </button>

            <button
              onClick={handleNext}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-white transition-all shadow-md cursor-pointer ${
                isLastStep
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-950'
              }`}
            >
              {isLastStep ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hoàn tất</span>
                </>
              ) : (
                <>
                  <span>Tiếp theo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
