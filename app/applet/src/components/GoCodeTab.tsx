import React, { useState } from 'react';
import {
  Code2,
  FolderTree,
  FileCode,
  Download,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  Cpu,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { GO_PROJECT_FILES, GoFileItem, downloadGoProjectZip } from '../services/zipExport';

export const GoCodeTab: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<GoFileItem>(GO_PROJECT_FILES[1]); // default to main.go
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [cmdCopied, setCmdCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCmd = (text: string) => {
    navigator.clipboard.writeText(text);
    setCmdCopied(true);
    setTimeout(() => setCmdCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await downloadGoProjectZip();
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Architect Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg shadow-black/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Code2 className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-100">
              Kiến Trúc & Trọn Bộ Mã Nguồn Go (Senior Golang Suite)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Hệ thống mã nguồn Go được thiết kế theo mô hình Clean Architecture chuẩn mực với 4 thư viện cốt lõi: <b>fyne.io/fyne/v2</b>, <b>chromedp</b>, <b>gorm.io/gorm + sqlite</b>, và <b>excelize/v2</b>.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-cyan-950 shrink-0 cursor-pointer disabled:opacity-50"
        >
          {isZipping ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Đang đóng gói ZIP...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Tải Trọn Bộ Project Go (.ZIP)</span>
            </>
          )}
        </button>
      </div>

      {/* Troubleshooting "checksum mismatch / SECURITY ERROR" Box */}
      <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-4.5 text-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-200 text-sm">
                Xử Lý Lỗi: <code className="bg-amber-900/40 px-1.5 py-0.5 rounded text-amber-300 font-mono text-xs">checksum mismatch / SECURITY ERROR</code>
              </h3>
              <p className="text-amber-200/80 mt-1 leading-relaxed">
                <b>Nguyên nhân:</b> File <code>go.sum</code> hiện tại chứa mã băm không khớp với mã nguồn chính thức tải về từ proxy Go của Google.
                <br />
                <b>Cách khắc phục ngay lập tức:</b> Xóa file <code>go.sum</code> cũ và chạy <code>go mod tidy</code> để Go tự động tải mã băm chuẩn xác từ <code>sum.golang.org</code>:
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-amber-700/60 font-mono text-amber-300 text-xs">
                  <span>rm -f go.sum && go mod tidy</span>
                  <button
                    onClick={() => handleCopyCmd('rm -f go.sum && go mod tidy')}
                    className="ml-2 text-slate-400 hover:text-white cursor-pointer"
                    title="Sao chép lệnh"
                  >
                    {cmdCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Highlights & Library Mapping */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>1. fyne.io/fyne/v2</span>
          </div>
          <p className="text-[11px] text-slate-400">
            GUI Desktop đa nền tảng, thiết kế tabs phân tầng, bảng tiến trình và hội thoại thông báo.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 font-bold text-sky-400 mb-1">
            <Cpu className="w-4 h-4" />
            <span>2. chromedp</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Điều khiển Chromium Headless, crawl On-page (Title, Meta, Alt, Headings) và bấm giờ đo độ trễ từng bước UX.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 font-bold text-indigo-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>3. gorm + sqlite</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Cơ sở dữ liệu cục bộ SQLite, quan hệ AuditSession, SEOResult, UXStepResult kèm AutoMigrate tự động.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1">
            <Download className="w-4 h-4" />
            <span>4. excelize/v2</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Xuất file báo cáo .xlsx chuyên nghiệp với đúng 3 Sheet: Tổng quan, Chi tiết SEO, Kịch bản UX Tracking.
          </p>
        </div>
      </div>

      {/* Main File Explorer and Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {/* Left: File Tree Sidebar */}
        <div className="lg:col-span-4 bg-slate-950/70 p-4 border-b lg:border-b-0 lg:border-r border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            <FolderTree className="w-4 h-4 text-cyan-400" />
            <span>Cây Thư Mục Dự Án (File Tree)</span>
          </div>

          <div className="space-y-1 text-xs font-mono">
            {GO_PROJECT_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate">{file.path}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 ml-1">Go</span>
                </button>
              );
            })}
          </div>

          {/* Quick Terminal Command Card */}
          <div className="mt-6 p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1.5">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Chạy Chuẩn Trên Máy Cục Bộ:</span>
            </div>
            <pre className="p-2 rounded bg-slate-950 text-cyan-300 font-mono text-[10px] overflow-x-auto">
{`# 1. Đồng bộ và sinh mã checksum chuẩn:
rm -f go.sum && go mod tidy

# 2. Khởi chạy Desktop GUI Fyne v2:
go run main.go

# 3. Hoặc chạy chế độ CLI Headless:
go run main.go -cli -url https://tiki.vn -export report.xlsx`}
            </pre>
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-8 flex flex-col h-[650px] bg-slate-950">
          {/* File Header Bar */}
          <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-slate-200">{selectedFile.path}</span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-400 font-sans">
                  {selectedFile.folder}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-sans">
                {selectedFile.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                title="Sao chép toàn bộ mã nguồn file này"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Đã chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Syntax Highlighted Editor Window */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed bg-[#0B0F19]">
            <pre className="select-text whitespace-pre">
              {selectedFile.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
