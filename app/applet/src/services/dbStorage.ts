import { AuditSession, CriteriaTags } from '../types/analyzer';

const STORAGE_KEY = 'seo_ux_analyzer_sqlite_sessions_v1';

const INITIAL_SESSIONS: AuditSession[] = [
  {
    id: 101,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    url: 'https://tiki.vn',
    device: 'desktop',
    overallSeoScore: 92,
    overallUxScore: 88,
    status: 'Hoàn thành',
    notes: 'Quét tự động trang chủ sàn thương mại điện tử Tiki',
    seoResult: {
      title: 'Tiki - Mua Hàng Online Giá Tốt, Miễn Phí Vận Chuyển',
      metaDesc: 'Hàng triệu sản phẩm chọn lọc từ các thương hiệu chính hãng, cam kết chất lượng, giao nhanh 2h, đổi trả dễ dàng.',
      h1Count: 1,
      h2Count: 12,
      totalImages: 45,
      missingAltCount: 5,
      canonical: 'https://tiki.vn',
      robotsTxtFound: true,
      sitemapFound: true,
      fcp: 1.3,
      lcp: 2.6,
      cls: 0.07,
      inp: 160,
      performanceScore: 84,
      seoScore: 92,
      issues: [
        {
          type: 'warning',
          category: 'speed',
          title: 'LCP chạm ngưỡng 2.6s',
          description: 'Thời gian tải ảnh banner khuyến mãi lớn có thể tối ưu hơn.',
          impact: 'Cao',
        },
        {
          type: 'warning',
          category: 'media',
          title: '5/45 ảnh thiếu thuộc tính alt',
          description: 'Một số banner phụ và icon thiếu thẻ alt mô tả.',
          impact: 'Trung bình',
        },
      ],
      recommendations: [
        {
          category: 'Tốc độ tải (LCP)',
          action: 'Chuyển đổi toàn bộ banner sang WebP/AVIF và cấu hình preload cho slide ảnh đầu tiên',
          priority: 'Ưu tiên cao',
          expectedGain: 'Giảm LCP từ 2.6s xuống 1.8s',
        },
        {
          category: 'Hình ảnh & Alt Text',
          action: 'Bổ sung alt text tự động dựa trên tên sản phẩm',
          priority: 'Ưu tiên vừa',
          expectedGain: 'Tăng khả năng hiển thị trên Google Images',
        },
      ],
    },
    uxStepResults: [
      {
        stepOrder: 1,
        stepName: 'Mở trang & Tải khung giao diện (Initial Page Load)',
        actionType: 'navigate',
        selector: 'body',
        durationMs: 420,
        tagCriterion: CriteriaTags.NHANH,
        score: 92,
        isVisible: true,
        isSuccess: true,
      },
      {
        stepOrder: 2,
        stepName: 'Định vị Nút Kêu gọi Hành động (CTA Hero)',
        actionType: 'wait_element',
        selector: '.hero-banner, .btn-primary',
        durationMs: 180,
        tagCriterion: CriteriaTags.NOI_BAT,
        score: 95,
        isVisible: true,
        isSuccess: true,
      },
      {
        stepOrder: 3,
        stepName: 'Tương tác Click Thêm vào Giỏ / Xem Sản phẩm',
        actionType: 'click',
        selector: 'button.add-to-cart',
        durationMs: 290,
        tagCriterion: CriteriaTags.GON_GANG,
        score: 90,
        isVisible: true,
        isSuccess: true,
      },
      {
        stepOrder: 4,
        stepName: 'Nhập từ khóa tìm kiếm sản phẩm vào ô Search',
        actionType: 'input',
        selector: 'input[data-view-id="main_search_form_input"]',
        inputValue: 'Tai nghe bluetooth không dây',
        durationMs: 650,
        tagCriterion: CriteriaTags.DE_HIEU,
        score: 86,
        isVisible: true,
        isSuccess: true,
      },
      {
        stepOrder: 5,
        stepName: 'Hiển thị kết quả gợi ý tìm kiếm (Auto-suggest dropdown)',
        actionType: 'wait_element',
        selector: '.search-suggestion-dropdown',
        durationMs: 780,
        tagCriterion: CriteriaTags.GON_GANG,
        score: 88,
        isVisible: true,
        isSuccess: true,
      },
    ],
  },
  {
    id: 102,
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    url: 'https://vnexpress.net',
    device: 'desktop',
    overallSeoScore: 88,
    overallUxScore: 82,
    status: 'Hoàn thành',
    notes: 'Quét định kỳ nhật báo điện tử VnExpress',
    seoResult: {
      title: 'VnExpress - Báo tiếng Việt nhiều người xem nhất',
      metaDesc: 'VnExpress tin tức mới nhất - Cập nhật 24h về Thời sự, Kinh doanh, Giải trí, Thể thao.',
      h1Count: 1,
      h2Count: 20,
      totalImages: 58,
      missingAltCount: 8,
      canonical: 'https://vnexpress.net',
      robotsTxtFound: true,
      sitemapFound: true,
      fcp: 1.1,
      lcp: 2.3,
      cls: 0.12,
      inp: 210,
      performanceScore: 80,
      seoScore: 88,
      issues: [
        {
          type: 'warning',
          category: 'speed',
          title: 'CLS đạt 0.12 (Hơi giật khi tải banner quảng cáo)',
          description: 'Banner quảng cáo đẩy nội dung tin tức xuống dưới khi tải trễ.',
          impact: 'Trung bình',
        },
      ],
      recommendations: [
        {
          category: 'Giao diện UX (CLS)',
          action: 'Đặt min-height cố định cho các container quảng cáo',
          priority: 'Ưu tiên cao',
          expectedGain: 'Hạn chế dịch chuyển đột ngột layout',
        },
      ],
    },
    uxStepResults: [
      {
        stepOrder: 1,
        stepName: 'Mở trang & Tải khung giao diện tin tức',
        actionType: 'navigate',
        selector: 'body',
        durationMs: 510,
        tagCriterion: CriteriaTags.GON_GANG,
        score: 88,
        isVisible: true,
        isSuccess: true,
      },
      {
        stepOrder: 2,
        stepName: 'Nhận diện Tin tiêu điểm nổi bật (Top Story)',
        actionType: 'wait_element',
        selector: '.item-news-common',
        durationMs: 220,
        tagCriterion: CriteriaTags.NOI_BAT,
        score: 95,
        isVisible: true,
        isSuccess: true,
      },
      {
        stepOrder: 3,
        stepName: 'Click chuyển chuyên mục Tin Kinh Doanh',
        actionType: 'click',
        selector: 'a[title="Kinh doanh"]',
        durationMs: 640,
        tagCriterion: CriteriaTags.DE_HIEU,
        score: 85,
        isVisible: true,
        isSuccess: true,
      },
      {
        stepOrder: 4,
        stepName: 'Cuộn đọc nội dung & tải ảnh lazy-load',
        actionType: 'wait_element',
        selector: '.box-subcate',
        durationMs: 980,
        tagCriterion: CriteriaTags.DE_HIEU,
        score: 80,
        isVisible: true,
        isSuccess: true,
      },
    ],
  },
];

export function getStoredSessions(): AuditSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SESSIONS));
      return INITIAL_SESSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SESSIONS;
  }
}

export function saveSessionToStorage(session: Omit<AuditSession, 'id'>): AuditSession {
  const sessions = getStoredSessions();
  const nextId = sessions.length > 0 ? Math.max(...sessions.map((s) => s.id)) + 1 : 1;
  const newSession: AuditSession = {
    ...session,
    id: nextId,
  };

  const updated = [newSession, ...sessions];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newSession;
}

export function deleteSessionFromStorage(id: number): AuditSession[] {
  const sessions = getStoredSessions().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  return sessions;
}
