import React, { useState } from 'react';
import { TitleBar } from './components/TitleBar';
import { Navigation } from './components/Navigation';
import { SeoTab } from './components/SeoTab';
import { UxTab } from './components/UxTab';
import { HistoryTab } from './components/HistoryTab';
import { ExportTab } from './components/ExportTab';
import { GoCodeTab } from './components/GoCodeTab';
import { InteractiveTour, TOUR_STEPS } from './components/InteractiveTour';
import { AuditSession } from './types/analyzer';
import { getStoredSessions, saveSessionToStorage, deleteSessionFromStorage } from './services/dbStorage';
import { exportReportToExcel } from './services/excelExport';
import { downloadGoProjectZip } from './services/zipExport';
import { CheckCircle2, Compass } from 'lucide-react';

export default function App() {
  const [sessions, setSessions] = useState<AuditSession[]>(() => getStoredSessions());
  const [currentSession, setCurrentSession] = useState<AuditSession>(() => {
    const list = getStoredSessions();
    return list.length > 0 ? list[0] : ({} as AuditSession);
  });
  const [activeTab, setActiveTab] = useState<string>('seo');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Interactive Tour State
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [currentTourStepIndex, setCurrentTourStepIndex] = useState<number>(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleOpenTour = () => {
    setCurrentTourStepIndex(0);
    setActiveTab(TOUR_STEPS[0].tabId);
    setIsTourOpen(true);
  };

  const handleCloseTour = () => {
    setIsTourOpen(false);
  };

  const handleUpdateSession = (partial: Partial<AuditSession>) => {
    setCurrentSession((prev) => ({
      ...prev,
      ...partial,
    }));
  };

  const handleSaveToDatabase = () => {
    if (!currentSession.url) return;
    const saved = saveSessionToStorage({
      createdAt: new Date().toISOString(),
      url: currentSession.url,
      device: currentSession.device || 'desktop',
      overallSeoScore: currentSession.overallSeoScore || 85,
      overallUxScore: currentSession.overallUxScore || 85,
      status: 'Đã hoàn tất phân tích',
      notes: currentSession.notes || 'Lưu từ bộ công cụ Desktop GUI',
      seoResult: currentSession.seoResult,
      uxStepResults: currentSession.uxStepResults,
    });

    const updatedList = getStoredSessions();
    setSessions(updatedList);
    setCurrentSession(saved);
    showToast(`Đã lưu phiên #${saved.id} (${saved.url}) vào SQLite cục bộ thành công!`);
  };

  const handleDeleteSession = (id: number) => {
    const updated = deleteSessionFromStorage(id);
    setSessions(updated);
    if (currentSession.id === id && updated.length > 0) {
      setCurrentSession(updated[0]);
    }
    showToast(`Đã xóa phiên #${id} khỏi cơ sở dữ liệu SQLite.`);
  };

  const handleExportExcel = async (targetSession?: AuditSession) => {
    const sess = targetSession || currentSession;
    if (!sess || !sess.url) {
      showToast('Vui lòng thực hiện phân tích SEO trước khi xuất báo cáo!');
      return;
    }
    await exportReportToExcel(sess);
    showToast(`Đã tạo và tải xuống file Excel .xlsx 3 Sheet cho ${sess.url}!`);
  };

  const handleDownloadGoZip = async () => {
    await downloadGoProjectZip();
    showToast('Đã bắt đầu tải xuống trọn bộ mã nguồn Go (.zip)!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-text">
      {/* Native Desktop Window Header Bar */}
      <TitleBar
        onExportExcel={() => handleExportExcel()}
        onDownloadGoZip={handleDownloadGoZip}
        onOpenTour={handleOpenTour}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentSession={currentSession}
        onOpenTour={handleOpenTour}
      />

      {/* Main Work Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'seo' && (
          <SeoTab
            currentSession={currentSession}
            onUpdateSession={handleUpdateSession}
            onNavigateToUx={() => setActiveTab('ux')}
          />
        )}

        {activeTab === 'ux' && (
          <UxTab
            currentSession={currentSession}
            onUpdateSession={handleUpdateSession}
            onSaveToDatabase={handleSaveToDatabase}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            sessions={sessions}
            currentSessionId={currentSession.id}
            onSelectSession={(sess) => {
              setCurrentSession(sess);
              showToast(`Đã nạp phiên #${sess.id} (${sess.url}) vào màn hình làm việc.`);
            }}
            onDeleteSession={handleDeleteSession}
            onExportExcel={handleExportExcel}
          />
        )}

        {activeTab === 'export' && (
          <ExportTab
            currentSession={currentSession}
            onExportExcel={() => handleExportExcel()}
          />
        )}

        {activeTab === 'go-code' && <GoCodeTab />}
      </main>

      {/* Photoshop-inspired Interactive Walkthrough Modal & Dimmed Backdrop */}
      <InteractiveTour
        isOpen={isTourOpen}
        onClose={handleCloseTour}
        currentStepIndex={currentTourStepIndex}
        onStepChange={setCurrentTourStepIndex}
        onSwitchTab={setActiveTab}
      />

      {/* Floating Quick Guide Launcher in Bottom Corner */}
      <button
        onClick={handleOpenTour}
        className="fixed bottom-12 left-6 z-40 hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/40 shadow-xl shadow-black/60 text-xs font-semibold backdrop-blur-sm transition-all hover:scale-105 cursor-pointer"
        title="Mở Hướng dẫn tương tác từng bước"
      >
        <Compass className="w-4 h-4 text-amber-400 animate-spin-slow" />
        <span>Hướng dẫn sử dụng</span>
      </button>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-cyan-500/80 shadow-2xl shadow-cyan-950 text-xs text-slate-100 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Desktop Footer Status Bar */}
      <footer className="bg-slate-950 border-t border-slate-900 px-4 py-2 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            Fyne v2 Runtime: Ready
          </span>
          <span>•</span>
          <span>Chromedp: Headless Active</span>
          <span>•</span>
          <span>SQLite Database: AutoMigrate OK</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenTour}
            className="text-amber-400/90 hover:text-amber-300 font-medium transition-colors cursor-pointer"
          >
            Bật Hướng Dẫn Tương Tác
          </button>
          <span>•</span>
          <span>SEO & UX/UI Analyzer - Golang Desktop Architecture</span>
        </div>
      </footer>
    </div>
  );
}
