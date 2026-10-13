import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Table,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { AuditSession } from '../types/analyzer';

interface ExportTabProps {
  currentSession: AuditSession | null;
  onExportExcel: () => void;
}

export const ExportTab: React.FC<ExportTabProps> = ({
  currentSession,
  onExportExcel,
}) => {
  const [activeSheetPreview, setActiveSheetPreview] = useState<'sheet1' | 'sheet2' | 'sheet3'>('sheet1');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExportExcel();
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  if (!currentSession) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        Vui lòng chạy phân tích SEO hoặc chọn một phiên từ tab Lịch sử để chuẩn bị báo cáo Excel.
      </div>
    );
  }

  const sr = currentSession.seoResult;
  const ux = currentSession.uxStepResults;

  return (
    <div className="space-y-6">
      {/* Top Export Action Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg shadow-black/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <span>Xuất Báo Cáo Excel Chuyên Nghiệp (github.com/xuri/excelize/v2)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            File Excel (.xlsx) được tạo với đầy đủ định dạng bảng, viền ô, căn chỉnh văn bản và màu sắc nhận diện trực quan cho 3 Sheet độc lập.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-950 cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang tạo .xlsx...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Tải Báo Cáo Excel (.xlsx)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success notification banner */}
      {exportSuccess && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 rounded-xl flex items-center gap-2.5 text-xs text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Đã xuất và tải xuống thành công file báo cáo Excel với đầy đủ 3 Sheet: <b>Tổng quan (Overview)</b>, <b>Chi tiết SEO (SEO Audit)</b>, và <b>Kịch bản UX-UI (UX Tracking)</b>!
          </span>
        </div>
      )}

      {/* Sheet Tabs Preview Selector */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSheetPreview('sheet1')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSheetPreview === 'sheet1'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Sheet 1 - Tổng quan (Overview)</span>
        </button>

        <button
          onClick={() => setActiveSheetPreview('sheet2')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSheetPreview === 'sheet2'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Sheet 2 - Chi tiết SEO (SEO Audit)</span>
        </button>

        <button
          onClick={() => setActiveSheetPreview('sheet3')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSheetPreview === 'sheet3'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Sheet 3 - Kịch bản UX-UI (UX Tracking)</span>
        </button>
      </div>

      {/* Simulated Excel Spreadsheet View */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {/* Spreadsheet Header Simulation */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Excel Workbook View: </span>
            <span className="text-slate-200 font-semibold">
              {activeSheetPreview === 'sheet1'
                ? 'Tổng quan (Overview)'
                : activeSheetPreview === 'sheet2'
                ? 'Chi tiết SEO (SEO Audit)'
                : 'Kịch bản UX-UI (UX Tracking)'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Định dạng font Segoe UI / Chuẩn Excelize</span>
        </div>

        {/* Sheet 1 Content */}
        {activeSheetPreview === 'sheet1' && (
          <div className="p-5 space-y-5 text-xs">
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80">
              <h3 className="font-bold text-sm text-slate-100 mb-3">
                BÁO CÁO PHÂN TÍCH SEO & ĐÁNH GIÁ UX/UI
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="flex justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">URL Mục tiêu:</span>
                  <span className="text-slate-200 font-semibold truncate max-w-[240px]">{currentSession.url}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Thời gian quét:</span>
                  <span className="text-slate-200">{new Date(currentSession.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Điểm SEO Tổng quan:</span>
                  <span className="text-emerald-400 font-bold">{currentSession.overallSeoScore} / 100</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Điểm UX/UI Tổng quan:</span>
                  <span className="text-cyan-400 font-bold">{currentSession.overallUxScore} / 100</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-200 mb-2.5">
                DANH SÁCH GỢI Ý CẢI TIẾN CHÍNH (ACTIONABLE RECOMMENDATIONS)
              </h4>
              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 text-center">STT</th>
                      <th className="py-2.5 px-3">Hạng mục</th>
                      <th className="py-2.5 px-3">Hành động khắc phục đề xuất</th>
                      <th className="py-2.5 px-3 text-center">Mức độ ưu tiên</th>
                      <th className="py-2.5 px-3">Lợi ích kỳ vọng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-xs">
                    {(sr?.recommendations || []).map((rec, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400">{i + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-cyan-300">{rec.category}</td>
                        <td className="py-2.5 px-3 text-slate-200">{rec.action}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.priority === 'Ưu tiên cao'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}>
                            {rec.priority}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{rec.expectedGain}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Sheet 2 Content */}
        {activeSheetPreview === 'sheet2' && (
          <div className="p-5 text-xs">
            <h4 className="font-bold text-slate-200 mb-3">
              CHI TIẾT PHÂN TÍCH SEO ON-PAGE & GOOGLE PAGESPEED
            </h4>
            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Chỉ số / Thẻ kiểm tra</th>
                    <th className="py-2.5 px-3">Giá trị ghi nhận</th>
                    <th className="py-2.5 px-3">Chuẩn khuyến nghị</th>
                    <th className="py-2.5 px-3 text-center">Đánh giá</th>
                    <th className="py-2.5 px-3">Giải pháp khắc phục đề xuất</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">Thẻ Title</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300 max-w-xs truncate">{sr?.title}</td>
                    <td className="py-2.5 px-3 text-slate-400">50 - 60 ký tự</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                        Đạt chuẩn
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">Tối ưu độ dài và chứa từ khóa chính</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">Thẻ Meta Description</td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate">{sr?.metaDesc}</td>
                    <td className="py-2.5 px-3 text-slate-400">140 - 160 ký tự</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                        Đạt chuẩn
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">Bổ sung mô tả kèm Call To Action</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">Thẻ Heading H1</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{sr?.h1Count} thẻ</td>
                    <td className="py-2.5 px-3 text-slate-400">Duy nhất 1 thẻ</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                        Chuẩn 1 H1
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">Giữ 1 thẻ H1 đại diện cho tiêu đề trang</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">LCP (Largest Contentful Paint)</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{sr?.lcp} giây</td>
                    <td className="py-2.5 px-3 text-slate-400">Dưới 2.5s</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        (sr?.lcp ?? 0) <= 2.5
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {(sr?.lcp ?? 0) <= 2.5 ? 'Tốt (<2.5s)' : 'Cần tối ưu'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">Tối ưu ảnh hero, CDN, giảm render-blocking</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">CLS (Layout Shift)</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{sr?.cls}</td>
                    <td className="py-2.5 px-3 text-slate-400">Dưới 0.1</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                        Tốt (&lt;0.1)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">Đặt kích thước width/height cho banner</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sheet 3 Content */}
        {activeSheetPreview === 'sheet3' && (
          <div className="p-5 text-xs">
            <h4 className="font-bold text-slate-200 mb-3">
              CHI TIẾT KỊCH BẢN KIỂM THỬ HÀNH VI & ĐO LƯỜNG UX/UI
            </h4>
            <div className="overflow-x-auto border border-slate-800 rounded-lg font-mono">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 text-center">Step #</th>
                    <th className="py-2.5 px-3 font-sans">Tên bước hành vi</th>
                    <th className="py-2.5 px-3">Loại</th>
                    <th className="py-2.5 px-3 text-right">Thời gian (s)</th>
                    <th className="py-2.5 px-3 text-center">Tag Tiêu chí</th>
                    <th className="py-2.5 px-3 text-center">Điểm Step</th>
                    <th className="py-2.5 px-3 text-center font-sans">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {ux.map((st, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 text-center text-slate-400">#{st.stepOrder}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-200 font-medium">{st.stepName}</td>
                      <td className="py-2.5 px-3 text-slate-400">{st.actionType}</td>
                      <td className="py-2.5 px-3 text-right text-slate-200">{(st.durationMs / 1000).toFixed(3)} s</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                          {st.tagCriterion}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-400">{st.score}</td>
                      <td className="py-2.5 px-3 text-center font-sans text-emerald-400">Thành công</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
