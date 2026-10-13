import React, { useState } from 'react';
import {
  Database,
  Search,
  Trash2,
  ExternalLink,
  FileSpreadsheet,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { AuditSession } from '../types/analyzer';

interface HistoryTabProps {
  sessions: AuditSession[];
  currentSessionId?: number;
  onSelectSession: (session: AuditSession) => void;
  onDeleteSession: (id: number) => void;
  onExportExcel: (session: AuditSession) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onExportExcel,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredSessions = sessions.filter((s) =>
    s.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg shadow-black/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <span>Quản Lý Dữ Liệu Lịch Sử (GORM + SQLite Local)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Toàn bộ dữ liệu phiên phân tích SEO và kịch bản UX được lưu trữ bền vững trong cơ sở dữ liệu SQLite cục bộ qua GORM ORM.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800 text-xs text-indigo-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            <span>GORM AutoMigrate: Active</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo URL website đã quét..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs font-mono"
          />
        </div>
      </div>

      {/* Database Schema Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
            <span className="font-mono text-cyan-400">audit_sessions</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-400">GORM Struct</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            ID, CreatedAt, URL, Device, OverallSEOScore, OverallUXScore, Status, Notes
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
            <span className="font-mono text-emerald-400">seo_results</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-400">1-to-1</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            SessionID, Title, MetaDesc, H1Count, MissingAlt, LCP, CLS, IssuesJSON
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
            <span className="font-mono text-amber-400">ux_step_results</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-400">1-to-Many</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            SessionID, StepOrder, StepName, DurationMs, TagCriterion, Score, IsVisible
          </p>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
            Không tìm thấy phiên phân tích nào phù hợp trong SQLite.
          </div>
        ) : (
          filteredSessions.map((s) => {
            const isCurrent = currentSessionId === s.id;
            return (
              <div
                key={s.id}
                className={`bg-slate-900 border rounded-xl p-4 transition-all ${
                  isCurrent
                    ? 'border-cyan-500/80 bg-slate-900/90 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-slate-400">#{s.id}</span>
                      <h3 className="text-sm font-bold text-slate-100 font-mono truncate max-w-[320px] sm:max-w-md">
                        {s.url}
                      </h3>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-medium">
                          Đang hoạt động
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(s.createdAt).toLocaleString('vi-VN')}
                      </span>
                      <span>•</span>
                      <span>{s.device === 'desktop' ? 'Desktop' : 'Mobile'}</span>
                      <span>•</span>
                      <span className="text-slate-300">{s.status}</span>
                    </div>
                  </div>

                  {/* Score Pills & Actions */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <div className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-500 block">SEO</span>
                        <span className="font-bold text-emerald-400">{s.overallSeoScore}/100</span>
                      </div>
                      <div className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-500 block">UX</span>
                        <span className="font-bold text-cyan-400">{s.overallUxScore}/100</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
                      <button
                        onClick={() => onSelectSession(s)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                        title="Nạp phiên này vào màn hình phân tích"
                      >
                        Nạp Xem
                      </button>
                      <button
                        onClick={() => onExportExcel(s)}
                        className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/80 transition-colors cursor-pointer"
                        title="Xuất file Excel cho phiên này"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteSession(s.id)}
                        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/60 transition-colors cursor-pointer"
                        title="Xóa phiên khỏi SQLite"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub row showing step summary */}
                {s.uxStepResults && s.uxStepResults.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-400 overflow-x-auto">
                    <span className="text-slate-500 shrink-0">Tags đã gán:</span>
                    {s.uxStepResults.map((st, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[10px] shrink-0"
                      >
                        Step {st.stepOrder}: {st.tagCriterion}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
