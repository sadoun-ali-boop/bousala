import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult } from './gemini';
import { UserProfile } from './supabase'; // تم التحديث ليطابق استخدام Supabase في بقية المشروع

// ملاحظة: يجب وضع كود Base64 للخط هنا. يمكنك الحصول عليه بتحويل ملف font.ttf إلى base64
const AMIRI_FONT_BASE64 = "AAEAAA... (طويل جداً) ..."; 

export const generatePDF = (result: AnalysisResult, user: UserProfile) => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  // 1. إضافة الخط للذاكرة الافتراضية (VFS) وتفعيله
  doc.addFileToVFS('Amiri-Regular.ttf', AMIRI_FONT_BASE64);
  doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
  doc.setFont('Amiri'); 
  
  doc.setFontSize(20);
  doc.text('Bousala - University of El Oued', 105, 20, { align: 'center' });
  doc.setFontSize(16);
  doc.text('تقرير تحليل أهداف التنمية المستدامة (SDG)', 105, 30, { align: 'center' });
  
  doc.setFontSize(11);
  // تحويل المعلومات لليمين
  doc.text(`الطالب: ${user.displayName}`, 190, 45, { align: 'right' });
  doc.text(`رقم الطالب: ${user.studentId || 'غير متوفر'}`, 190, 52, { align: 'right' });
  doc.text(`الكلية: ${user.faculty || 'غير متوفر'}`, 190, 59, { align: 'right' });
  doc.text(`القسم: ${user.department || 'غير متوفر'}`, 190, 66, { align: 'right' });
  doc.text(`الأستاذ المشرف: ${user.supervisorName || 'غير متوفر'}`, 190, 73, { align: 'right' });
  
  doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-DZ')}`, 20, 45);
  doc.text(`نسبة التوافق الكلية: ${result.overallSdgAlignment}%`, 20, 52);
  doc.text(`الحالة: ${user.supervisorStatus === 'approved' ? 'مصادق عليه' : 'قيد المراجعة'}`, 20, 59);

  doc.setFontSize(14);
  doc.text('الملخص التنفيذي', 190, 85, { align: 'right' });
  doc.setFontSize(10);
  const splitSummary = doc.splitTextToSize(result.summary, 170);
  doc.text(splitSummary, 190, 92, { align: 'right' });

  let currentY = 92 + (splitSummary.length * 5) + 10;

  doc.setFontSize(14);
  doc.text('تحليل التوافق مع أهداف التنمية المستدامة', 190, currentY, { align: 'right' });
  currentY += 7;

  // عكس ترتيب الأعمدة لجدول SDG: [الرابط، الدليل، النسبة، الهدف]
  const tableData = result.sdgScores.map(s => [
    s.link,
    s.evidence,
    `${s.score}%`,
    `الهدف ${s.goal}: ${s.title}`
  ]);

  try {
    autoTable(doc, {
      startY: currentY,
      head: [['رابط الأمم المتحدة', 'الدليل من النص', 'النسبة', 'هدف التنمية المستدامة']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 8, font: 'Amiri', halign: 'right' },
      headStyles: { fillColor: [0, 77, 51] }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || currentY + 40;
    currentY = finalY + 15;

    doc.setFontSize(14);
    doc.text('بطاقة نتائج مصفوفة ASAM للاستدامة', 190, currentY, { align: 'right' });
    currentY += 7;

    // عكس ترتيب أعمدة مصفوفة ASAM: [المؤشر، النتيجة، المحور]
    const asamData = [
      [result.asamMatrix.strategicAlignment.kpi, `${result.asamMatrix.strategicAlignment.score}/25`, 'التوجيه الاستراتيجي'],
      [result.asamMatrix.ecoDesign.kpi, `${result.asamMatrix.ecoDesign.score}/25`, 'التصميم البيئي والدوراني'],
      [result.asamMatrix.humanImpact.kpi, `${result.asamMatrix.humanImpact.score}/25`, 'الأثر الإنساني والاجتماعي'],
      [result.asamMatrix.viability.kpi, `${result.asamMatrix.viability.score}/25`, 'الجدوى والاستدامة التشغيلية'],
      ['نموذج شامل', `${result.asamMatrix.totalAlignment}/100`, 'المواءمة الكلية']
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['المؤشر (KPI)', 'الدرجة', 'المحور / الربع']],
      body: asamData,
      theme: 'grid',
      styles: { fontSize: 9, font: 'Amiri', halign: 'right' },
      headStyles: { fillColor: [16, 185, 129] }
    });

    doc.save(`Bousla_Report_${user.displayName.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error("PDF Generation Error:", error);
    alert("Could not generate PDF. Please try again or use the print feature.");
  }
};
