import ExcelJS from 'exceljs';
import { AuditSession } from '../types/analyzer';

export async function exportReportToExcel(session: AuditSession): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SEO & UX/UI Analyzer (Golang + Excelize spec)';
  workbook.lastModifiedBy = 'Desktop Suite';
  workbook.created = new Date();
  workbook.modified = new Date();

  // ==========================================
  // SHEET 1: TỔNG QUAN (OVERVIEW)
  // ==========================================
  const sheet1 = workbook.addWorksheet('Tổng quan (Overview)', {
    views: [{ showGridLines: true }],
  });

  // Header Title
  sheet1.mergeCells('A1:F1');
  const titleCell = sheet1.getCell('A1');
  titleCell.value = 'BÁO CÁO PHÂN TÍCH SEO & ĐÁNH GIÁ UX/UI';
  titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF0F172A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet1.getRow(1).height = 36;

  // Overview Info Table
  const infoRows = [
    ['URL Mục tiêu:', session.url],
    ['Thời gian quét:', new Date(session.createdAt).toLocaleString('vi-VN')],
    ['Thiết bị giả lập:', session.device === 'desktop' ? 'Máy tính để bàn (Desktop)' : 'Thiết bị di động (Mobile)'],
    ['Điểm SEO Tổng quan:', `${session.overallSeoScore} / 100`],
    ['Điểm UX/UI Tổng quan:', `${session.overallUxScore} / 100`],
    ['Trạng thái kiểm thử:', session.status],
  ];

  infoRows.forEach((row, idx) => {
    const rowNum = idx + 3;
    const cellA = sheet1.getCell(`A${rowNum}`);
    const cellB = sheet1.getCell(`B${rowNum}`);

    cellA.value = row[0];
    cellB.value = row[1];

    cellA.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF334155' } };
    cellA.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' },
    };
    cellA.alignment = { vertical: 'middle' };

    cellB.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF0F172A' } };
    cellB.alignment = { vertical: 'middle' };

    sheet1.getRow(rowNum).height = 22;
  });

  // Section 2: Actionable Recommendations
  const recStartRow = 11;
  sheet1.mergeCells(`A${recStartRow}:F${recStartRow}`);
  const secTitle = sheet1.getCell(`A${recStartRow}`);
  secTitle.value = 'DANH SÁCH GỢI Ý CẢI TIẾN CHÍNH (ACTIONABLE RECOMMENDATIONS)';
  secTitle.font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: 'FF1E293B' } };
  secTitle.alignment = { vertical: 'middle' };
  sheet1.getRow(recStartRow).height = 28;

  // Header Table 1
  const recHeaders = ['STT', 'Hạng mục', 'Hành động khắc phục đề xuất', 'Mức độ ưu tiên', 'Lợi ích kỳ vọng'];
  const headerRow = sheet1.getRow(recStartRow + 2);
  headerRow.height = 26;

  recHeaders.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  });

  const recs = session.seoResult?.recommendations || [];
  recs.forEach((rec, idx) => {
    const rNum = recStartRow + 3 + idx;
    const row = sheet1.getRow(rNum);
    row.height = 24;

    row.getCell(1).value = idx + 1;
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    row.getCell(2).value = rec.category;
    row.getCell(2).alignment = { vertical: 'middle' };

    row.getCell(3).value = rec.action;
    row.getCell(3).alignment = { vertical: 'middle', wrapText: true };

    const priorityCell = row.getCell(4);
    priorityCell.value = rec.priority;
    priorityCell.alignment = { horizontal: 'center', vertical: 'middle' };
    if (rec.priority === 'Ưu tiên cao') {
      priorityCell.font = { bold: true, color: { argb: 'FF92400E' } };
      priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
    } else {
      priorityCell.font = { bold: true, color: { argb: 'FF065F46' } };
      priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
    }

    row.getCell(5).value = rec.expectedGain;
    row.getCell(5).alignment = { vertical: 'middle', wrapText: true };

    for (let c = 1; c <= 5; c++) {
      row.getCell(c).border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    }
  });

  sheet1.getColumn(1).width = 8;
  sheet1.getColumn(2).width = 24;
  sheet1.getColumn(3).width = 55;
  sheet1.getColumn(4).width = 18;
  sheet1.getColumn(5).width = 45;

  // ==========================================
  // SHEET 2: CHI TIẾT SEO (SEO AUDIT)
  // ==========================================
  const sheet2 = workbook.addWorksheet('Chi tiết SEO (SEO Audit)', {
    views: [{ showGridLines: true }],
  });

  sheet2.mergeCells('A1:E1');
  const s2Title = sheet2.getCell('A1');
  s2Title.value = 'CHI TIẾT PHÂN TÍCH SEO ON-PAGE & GOOGLE PAGESPEED';
  s2Title.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF0F172A' } };
  s2Title.alignment = { vertical: 'middle' };
  sheet2.getRow(1).height = 36;

  const seoHeaders = ['Chỉ số / Thẻ kiểm tra', 'Giá trị ghi nhận', 'Chuẩn khuyến nghị', 'Đánh giá trạng thái', 'Giải pháp khắc phục đề xuất'];
  const s2HeaderRow = sheet2.getRow(3);
  s2HeaderRow.height = 26;

  seoHeaders.forEach((h, i) => {
    const cell = s2HeaderRow.getCell(i + 1);
    cell.value = h;
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  const sr = session.seoResult;
  const seoDataRows = [
    ['Thẻ Title', sr?.title || 'Chưa quét', '50 - 60 ký tự', sr?.title?.length ? (sr.title.length >= 30 && sr.title.length <= 65 ? 'Đạt chuẩn' : 'Cần tối ưu') : 'Thiếu thẻ', 'Đảm bảo tiêu đề độc nhất và chứa từ khóa chính'],
    ['Thẻ Meta Description', sr?.metaDesc || 'Chưa quét', '140 - 160 ký tự', sr?.metaDesc?.length ? 'Đạt chuẩn' : 'Thiếu thẻ', 'Bổ sung thẻ mô tả có Call to action hấp dẫn'],
    ['Thẻ Heading H1', `${sr?.h1Count ?? 0} thẻ`, 'Duy nhất 1 thẻ', sr?.h1Count === 1 ? 'Đạt chuẩn' : (sr?.h1Count === 0 ? 'Thiếu H1' : 'Nhiều H1'), 'Cấu hình duy nhất 1 thẻ H1 làm tiêu đề lớn'],
    ['Thẻ Heading H2', `${sr?.h2Count ?? 0} thẻ`, 'Từ 2 thẻ trở lên', (sr?.h2Count ?? 0) >= 2 ? 'Đạt chuẩn' : 'Ít H2', 'Phân cấp nội dung rõ ràng theo đề mục con'],
    ['Hình ảnh thiếu thuộc tính Alt', `${sr?.missingAltCount ?? 0} / ${sr?.totalImages ?? 0} ảnh`, '0 ảnh thiếu Alt', (sr?.missingAltCount ?? 0) === 0 ? 'Hoàn hảo' : `Thiếu ${sr?.missingAltCount} ảnh`, 'Thêm alt text mô tả đầy đủ ngữ cảnh cho mọi ảnh'],
    ['Canonical Link', sr?.canonical || 'Chưa có', 'Có thẻ canonical hợp lệ', sr?.canonical ? 'Hợp lệ' : 'Chưa có', 'Ngăn chặn trùng lặp nội dung duplicate content'],
    ['Tập tin Robots.txt', sr?.robotsTxtFound ? 'HTTP 200 (Tìm thấy)' : 'Không tìm thấy', 'HTTP 200 OK', sr?.robotsTxtFound ? 'Đạt chuẩn' : 'Cần bổ sung', 'Tạo file robots.txt hướng dẫn bot tìm kiếm'],
    ['Sơ đồ trang Sitemap.xml', sr?.sitemapFound ? 'HTTP 200 (Tìm thấy)' : 'Không tìm thấy', 'HTTP 200 OK', sr?.sitemapFound ? 'Đạt chuẩn' : 'Cần bổ sung', 'Cung cấp sitemap.xml và submit lên Search Console'],
    ['LCP (Largest Contentful Paint)', `${sr?.lcp ?? 0} giây`, 'Dưới 2.5 giây', (sr?.lcp ?? 0) <= 2.5 ? 'Tốt (< 2.5s)' : 'Cần cải thiện', 'Nén ảnh hero WebP/AVIF, preload tài nguyên quan trọng'],
    ['FCP (First Contentful Paint)', `${sr?.fcp ?? 0} giây`, 'Dưới 1.8 giây', (sr?.fcp ?? 0) <= 1.8 ? 'Tốt (< 1.8s)' : 'Cần cải thiện', 'Tối ưu CSS chặn render và nén mã nguồn'],
    ['CLS (Cumulative Layout Shift)', `${sr?.cls ?? 0}`, 'Dưới 0.1', (sr?.cls ?? 0) <= 0.1 ? 'Tốt (< 0.1)' : 'Cần cải thiện', 'Cố định kích thước width/height cho banner và hình ảnh'],
    ['INP / FID (Interaction to Paint)', `${sr?.inp ?? 0} ms`, 'Dưới 200 ms', (sr?.inp ?? 0) <= 200 ? 'Tốt (< 200ms)' : 'Cần cải thiện', 'Tối ưu luồng xử lý JavaScript chính (main-thread)'],
    ['Điểm Google Performance Score', `${sr?.performanceScore ?? 0} / 100`, 'Trên 85 điểm', (sr?.performanceScore ?? 0) >= 85 ? 'Tốt' : 'Trung bình', 'Áp dụng các đề xuất tối ưu Lighthouse'],
    ['Điểm Google SEO Score', `${sr?.seoScore ?? 0} / 100`, 'Trên 90 điểm', (sr?.seoScore ?? 0) >= 90 ? 'Xuất sắc' : 'Cần cải thiện', 'Hoàn thiện đầy đủ các chuẩn On-page và index'],
  ];

  seoDataRows.forEach((row, idx) => {
    const rNum = idx + 4;
    const r = sheet2.getRow(rNum);
    r.height = 22;

    row.forEach((val, cIdx) => {
      const cell = r.getCell(cIdx + 1);
      cell.value = val;
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.alignment = { vertical: 'middle', wrapText: cIdx === 1 || cIdx === 4 };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      if (cIdx === 3) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        if (val.includes('Đạt chuẩn') || val.includes('Tốt') || val.includes('Hoàn hảo') || val.includes('Xuất sắc') || val.includes('Hợp lệ')) {
          cell.font = { bold: true, color: { argb: 'FF065F46' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
        } else {
          cell.font = { bold: true, color: { argb: 'FF92400E' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
        }
      }
    });
  });

  sheet2.getColumn(1).width = 30;
  sheet2.getColumn(2).width = 42;
  sheet2.getColumn(3).width = 20;
  sheet2.getColumn(4).width = 20;
  sheet2.getColumn(5).width = 48;

  // ==========================================
  // SHEET 3: KỊCH BẢN UX-UI (UX TRACKING)
  // ==========================================
  const sheet3 = workbook.addWorksheet('Kịch bản UX-UI (UX Tracking)', {
    views: [{ showGridLines: true }],
  });

  sheet3.mergeCells('A1:G1');
  const s3Title = sheet3.getCell('A1');
  s3Title.value = 'CHI TIẾT KỊCH BẢN KIỂM THỬ HÀNH VI & ĐO LƯỜNG UX/UI';
  s3Title.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF0F172A' } };
  s3Title.alignment = { vertical: 'middle' };
  sheet3.getRow(1).height = 36;

  const uxHeaders = ['Step #', 'Tên bước hành vi', 'Loại thao tác', 'Thời gian (s)', 'Tag Tiêu chí', 'Điểm Step (0-100)', 'Trạng thái'];
  const s3HeaderRow = sheet3.getRow(3);
  s3HeaderRow.height = 26;

  uxHeaders.forEach((h, i) => {
    const cell = s3HeaderRow.getCell(i + 1);
    cell.value = h;
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  const steps = session.uxStepResults || [];
  steps.forEach((st, idx) => {
    const rNum = idx + 4;
    const r = sheet3.getRow(rNum);
    r.height = 22;

    const durationSec = (st.durationMs / 1000).toFixed(3);

    r.getCell(1).value = st.stepOrder;
    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    r.getCell(2).value = st.stepName;
    r.getCell(2).alignment = { vertical: 'middle' };

    r.getCell(3).value = st.actionType;
    r.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };

    r.getCell(4).value = `${durationSec} s`;
    r.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };

    const tagCell = r.getCell(5);
    tagCell.value = st.tagCriterion;
    tagCell.alignment = { horizontal: 'center', vertical: 'middle' };
    if (st.tagCriterion === '[Nổi bật]' || st.tagCriterion === '[Nhanh]' || st.tagCriterion === '[Gọn gàng]') {
      tagCell.font = { bold: true, color: { argb: 'FF065F46' } };
      tagCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
    } else {
      tagCell.font = { bold: true, color: { argb: 'FF92400E' } };
      tagCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
    }

    r.getCell(6).value = st.score;
    r.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };

    const statusCell = r.getCell(7);
    statusCell.value = st.isSuccess ? 'Thành công' : `Thất bại: ${st.errorMsg || ''}`;
    statusCell.alignment = { horizontal: 'center', vertical: 'middle' };
    statusCell.font = { bold: true, color: st.isSuccess ? { argb: 'FF065F46' } : { argb: 'FF991B1B' } };

    for (let c = 1; c <= 7; c++) {
      r.getCell(c).border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    }
  });

  sheet3.getColumn(1).width = 10;
  sheet3.getColumn(2).width = 40;
  sheet3.getColumn(3).width = 16;
  sheet3.getColumn(4).width = 16;
  sheet3.getColumn(5).width = 22;
  sheet3.getColumn(6).width = 18;
  sheet3.getColumn(7).width = 22;

  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `SEO_UX_Report_${new URL(session.url).hostname}_${Date.now()}.xlsx`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
