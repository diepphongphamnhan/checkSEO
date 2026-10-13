import React from 'react';
import { Download, FileSpreadsheet, Code2, Monitor, ShieldCheck, Database } from 'lucide-react';

interface TitleBarProps {
  onExportExcel: () => void;
  onDownloadGoZip: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  onExportExcel,
  onDownloadGoZip,
  setActiveTab,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 select-none text-slate-200">
      {/* Top native desktop window bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800/60 text-xs">
        {/* Window controls styling (macOS/Linux style dots) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 pr-3 border-r border-slate-800">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block hover:opacity-80 cursor-pointer" title="Đóng cửa sổ"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block hover:opacity-80 cursor-pointer" title="Thu nhỏ"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block hover:opacity-80 cursor-pointer" title="Phóng to"></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-semibold tracking-wide">
            <Monitor className="w-3.5 h-3.5 text-cyan-400" />
            <span>SEO & UX/UI Analyzer Desktop</span>
            <span className="px-1.5 py-0.5 text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono font-medium">
              Golang 1.22 + Fyne v2
            </span>
          </div>
        </div>

        {/* Core Tech Stack Badges */}
        <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> fyne.io/fyne/v2
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <Monitor className="w-3 h-3 text-sky-400" /> chromedp
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <Database className="w-3 h-3 text-indigo-400" /> gorm + sqlite
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <FileSpreadsheet className="w-3 h-3 text-emerald-400" /> excelize/v2
          </span>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 transition-colors"
            title="Xuất file Excel .xlsx 3 Sheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xuất Excel (.xlsx)</span>
          </button>
          <button
            onClick={onDownloadGoZip}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/30 transition-colors"
            title="Tải trọn bộ mã nguồn Go để chạy trên máy tính"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tải Mã Go (.zip)</span>
          </button>
          <button
            onClick={() => setActiveTab('go-code')}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
            title="Xem toàn bộ mã nguồn Go"
          >
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Mã nguồn</span>
          </button>
        </div>
      </div>
    </header>
  );
};
