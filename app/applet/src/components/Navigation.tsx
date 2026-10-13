import React from 'react';
import { Search, PlayCircle, Database, FileSpreadsheet, Code2, Globe, Compass } from 'lucide-react';
import { AuditSession } from '../types/analyzer';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentSession: AuditSession | null;
  onOpenTour?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  currentSession,
  onOpenTour,
}) => {
  const tabs = [
    {
      id: 'seo',
      label: 'Phân tích SEO',
      sub: 'Google PageSpeed & Chromedp',
      icon: Search,
      badge: currentSession ? `${currentSession.overallSeoScore}/100` : undefined,
      badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
    },
    {
      id: 'ux',
      label: 'Kịch bản UX/UI',
      sub: 'Record & Step Tracking',
      icon: PlayCircle,
      badge: currentSession ? `${currentSession.overallUxScore}/100` : undefined,
      badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800',
    },
    {
      id: 'history',
      label: 'Lịch sử Quét',
      sub: 'SQLite GORM Database',
      icon: Database,
    },
    {
      id: 'export',
      label: 'Xuất Báo Cáo',
      sub: 'Excel .xlsx 3 Sheet',
      icon: FileSpreadsheet,
    },
    {
      id: 'go-code',
      label: 'Mã Nguồn Go Hoàn Chỉnh',
      sub: 'Architect Hub & Tải ZIP',
      icon: Code2,
      highlight: true,
    },
  ];

  return (
    <nav className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/80 shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              } ${tab.highlight && !isActive ? 'text-amber-300 hover:text-amber-200' : ''}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : tab.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
              <div className="text-left">
                <div className="leading-tight flex items-center gap-1.5 font-semibold">
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`px-1.5 py-0.2 text-[10px] rounded border font-mono ${tab.badgeColor}`}>
                      {tab.badge}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 font-normal leading-tight hidden lg:block">
                  {tab.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        {currentSession && (
          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-md border border-slate-800">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[200px] text-slate-300 font-mono" title={currentSession.url}>
              {currentSession.url}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-semibold font-mono">
              SEO: {currentSession.overallSeoScore}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 font-semibold font-mono">
              UX: {currentSession.overallUxScore}
            </span>
          </div>
        )}

        {onOpenTour && (
          <button
            onClick={onOpenTour}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer"
            title="Bật Hướng dẫn tương tác từng bước"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Hướng dẫn</span>
          </button>
        )}
      </div>
    </nav>
  );
};
