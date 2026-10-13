export const CriteriaTags = {
  NOI_BAT: '[Nổi bật]',
  NHANH: '[Nhanh]',
  DE_HIEU: '[Dễ hiểu]',
  GON_GANG: '[Gọn gàng]',
  TAI_CHAM: '[Tải chậm]',
  GIAO_DIEN_PHUC_TAP: '[Giao diện phức tạp]',
} as const;

export type CriteriaTag = typeof CriteriaTags[keyof typeof CriteriaTags];

export interface SEOIssue {
  type: 'error' | 'warning' | 'notice';
  category: 'meta' | 'heading' | 'speed' | 'indexing' | 'media';
  title: string;
  description: string;
  impact: 'Cao' | 'Trung bình' | 'Thấp';
}

export interface SEORecommendation {
  category: string;
  action: string;
  priority: 'Ưu tiên cao' | 'Ưu tiên vừa' | 'Khuyến nghị';
  expectedGain: string;
}

export interface SEOResult {
  id?: number;
  sessionId?: number;
  title: string;
  metaDesc: string;
  h1Count: number;
  h2Count: number;
  missingAltCount: number;
  totalImages: number;
  canonical: string;
  robotsTxtFound: boolean;
  sitemapFound: boolean;
  fcp: number; // seconds
  lcp: number; // seconds
  cls: number; // score
  inp: number; // ms
  performanceScore: number; // 0-100
  seoScore: number; // 0-100
  issues: SEOIssue[];
  recommendations: SEORecommendation[];
}

export interface UXStepResult {
  id?: number;
  sessionId?: number;
  stepOrder: number;
  stepName: string;
  actionType: 'navigate' | 'wait_element' | 'click' | 'input' | 'submit';
  selector: string;
  durationMs: number;
  tagCriterion: CriteriaTag;
  score: number; // 0-100
  isVisible: boolean;
  isSuccess: boolean;
  errorMsg?: string;
  inputValue?: string;
}

export interface AuditSession {
  id: number;
  createdAt: string;
  url: string;
  device: 'desktop' | 'mobile';
  overallSeoScore: number;
  overallUxScore: number;
  status: string;
  notes?: string;
  seoResult: SEOResult;
  uxStepResults: UXStepResult[];
}

export interface UXScenarioPreset {
  id: string;
  name: string;
  description: string;
  steps: Array<{
    name: string;
    actionType: 'navigate' | 'wait_element' | 'click' | 'input' | 'submit';
    selector: string;
    inputValue?: string;
    description: string;
  }>;
}
