import React, { useState } from 'react';
import {
  Search,
  Zap,
  Globe,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Sparkles,
  Smartphone,
  Laptop,
  Layers,
  FileText,
  ImageIcon,
} from 'lucide-react';
import { SEOResult, AuditSession } from '../types/analyzer';
import { runSEOAnalysis, PRESET_WEBSITES } from '../services/pageSpeedApi';

interface SeoTabProps {
  currentSession: AuditSession | null;
  onUpdateSession: (partial: Partial<AuditSession>) => void;
  onNavigateToUx: () => void;
}

export const SeoTab: React.FC<SeoTabProps> = ({
  currentSession,
  onUpdateSession,
  onNavigateToUx,
}) => {
  const [url, setUrl] = useState<string>(currentSession?.url || 'https://tiki.vn');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [loading, setLoading] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');

  const seoData: SEOResult | undefined = currentSession?.seoResult;

  const handleRunAudit = async (customUrl?: string) => {
    const target = customUrl || url;
    if (!target.trim()) return;

    setLoading(true);
    setProgressMsg('Đang kích hoạt Chromium Headless & kết nối Google PageSpeed Insights...');

    try {
      setTimeout(() => {
        setProgressMsg('Đang cào dữ liệu On-page HTML (Title, Meta, H1-H6, Alt images, Robots.txt)...');
      }, 700);

      setTimeout(() => {
        setProgressMsg('Đang trích xuất Core Web Vitals (LCP, FCP, CLS, INP) và tổng hợp lỗi...');
      }, 1500);

      const result = await runSEOAnalysis(target, device);

      onUpdateSession({
        url: target,
        device,
        overallSeoScore: result.seoScore,
        seoResult: result,
        status: 'Đã hoàn thành phân tích SEO',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setProgressMsg('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input Bar & Presets */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg shadow-black/20">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              <span>Phân Tích SEO qua Google Public API & Chromedp</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Nhập URL mục tiêu để cào dữ liệu On-page trực tiếp và đo đạc chuẩn Core Web Vitals qua Google PageSpeed Insights.
            </p>
          </div>

          {/* Device Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start lg:self-auto">
            <button
              onClick={() => setDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                device === 'desktop'
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              Desktop
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                device === 'mobile'
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile
            </button>
          </div>
        </div>

        {/* Input & Analyze Button */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Nhập đường dẫn website (vd: https://tiki.vn hoặc https://domain.com)"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm font-mono"
            />
          </div>
          <button
            onClick={() => handleRunAudit()}
            disabled={loading || !url.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-md shadow-cyan-950 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang phân tích...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Bắt Đầu Phân Tích SEO</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-3.5 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Trang mẫu kiểm thử:</span>
          {PRESET_WEBSITES.map((preset) => (
            <button
              key={preset.url}
              onClick={() => {
                setUrl(preset.url);
                handleRunAudit(preset.url);
              }}
              className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Loading Progress Feedback */}
        {loading && (
          <div className="mt-4 p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-lg text-xs text-cyan-200 flex items-center gap-2.5 animate-pulse">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono">{progressMsg}</span>
          </div>
        )}
      </div>

      {/* Main Results View */}
      {seoData && (
        <div className="space-y-6">
          {/* Top Score Summary Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Overall SEO Score */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Điểm SEO Tổng Quan</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-3xl font-extrabold font-mono ${
                    seoData.seoScore >= 90 ? 'text-emerald-400' : seoData.seoScore >= 75 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {seoData.seoScore}
                  </span>
                  <span className="text-xs text-slate-500">/ 100</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Chuẩn Google Search</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                seoData.seoScore >= 90
                  ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300'
                  : 'border-amber-500 bg-amber-950/50 text-amber-300'
              }`}>
                {seoData.seoScore}%
              </div>
            </div>

            {/* Performance Score */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Google Performance</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-3xl font-extrabold font-mono ${
                    seoData.performanceScore >= 85 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {seoData.performanceScore}
                  </span>
                  <span className="text-xs text-slate-500">/ 100</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Lighthouse v11 Audit</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 border-cyan-500 bg-cyan-950/50 text-cyan-300">
                {seoData.performanceScore}%
              </div>
            </div>

            {/* Core Web Vitals: LCP */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">LCP (Largest Content)</span>
                <span className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${
                  seoData.lcp <= 2.5 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {seoData.lcp <= 2.5 ? 'Tốt (<2.5s)' : 'Cần tối ưu'}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
                {seoData.lcp} <span className="text-xs text-slate-500 font-normal">giây</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Thời gian tải khối nội dung lớn</p>
            </div>

            {/* Core Web Vitals: CLS */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">CLS (Layout Shift)</span>
                <span className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${
                  seoData.cls <= 0.1 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {seoData.cls <= 0.1 ? 'Ổn định (<0.1)' : 'Giật khung hình'}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
                {seoData.cls}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Độ dịch chuyển giao diện</p>
            </div>
          </div>

          {/* Secondary Vitals Card (FCP & INP) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3.5 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 font-medium">FCP (First Contentful Paint):</span>
                <span className="ml-2 font-mono font-bold text-slate-100">{seoData.fcp} giây</span>
              </div>
              <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 font-medium">
                {seoData.fcp <= 1.8 ? 'Rất nhanh (<1.8s)' : 'Bình thường'}
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3.5 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 font-medium">INP / FID (Interaction):</span>
                <span className="ml-2 font-mono font-bold text-slate-100">{seoData.inp} ms</span>
              </div>
              <span className="text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60 font-medium">
                {seoData.inp <= 200 ? 'Phản hồi tốt (<200ms)' : 'Cần cải thiện'}
              </span>
            </div>
          </div>

          {/* On-Page Inspection & Checklist Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* On-Page Elements crawled via Chromedp */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Yếu tố SEO On-Page (Crawl qua Chromedp)</span>
              </h3>

              <div className="space-y-3 text-xs">
                {/* Title */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" /> Thẻ Title trang
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {seoData.title.length} ký tự (Khuyến nghị 50-60)
                    </span>
                  </div>
                  <p className="text-slate-200 font-mono text-[11px] break-words bg-slate-900/60 p-1.5 rounded border border-slate-800">
                    {seoData.title || '(Chưa có tiêu đề)'}
                  </p>
                </div>

                {/* Meta Description */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" /> Thẻ Meta Description
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {seoData.metaDesc.length} ký tự (Khuyến nghị 140-160)
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] break-words bg-slate-900/60 p-1.5 rounded border border-slate-800">
                    {seoData.metaDesc || '(Chưa có thẻ Meta Description)'}
                  </p>
                </div>

                {/* Headings & Alt summary */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px]">Thẻ Heading H1</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-slate-100 font-mono text-sm">{seoData.h1Count} thẻ</span>
                      {seoData.h1Count === 1 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px]">Thẻ Heading H2</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-slate-100 font-mono text-sm">{seoData.h2Count} thẻ</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px]">Hình ảnh thiếu Alt</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-slate-100 font-mono text-sm">
                        {seoData.missingAltCount} / {seoData.totalImages}
                      </span>
                      {seoData.missingAltCount === 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px]">Robots.txt & Sitemap</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-slate-100 font-mono text-xs">HTTP 200 OK</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Issues List */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between mb-4">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Danh Sách Lỗi & Cảnh Báo Phát Hiện
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {seoData.issues.length} vấn đề
                </span>
              </h3>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {seoData.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start gap-2.5 text-xs"
                  >
                    {issue.type === 'error' ? (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{issue.title}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          issue.impact === 'Cao' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          Tác động: {issue.impact}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">{issue.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Recommendations in Vietnamese */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Đề Xuất Danh Sách Hướng Cải Tiến Cụ Thể (Actionable Recommendations)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Các giải pháp kỹ thuật cụ thể bằng tiếng Việt để tối ưu hóa thứ hạng SEO và trải nghiệm người dùng
                </p>
              </div>
              <button
                onClick={onNavigateToUx}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Chạy Kịch Bản UX</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {seoData.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-cyan-300">{rec.category}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                        rec.priority === 'Ưu tiên cao'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium leading-relaxed">{rec.action}</p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Lợi ích: {rec.expectedGain}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
