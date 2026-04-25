import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult } from './gemini';
import { UserProfile } from './firebase';

export const generatePDF = (result: AnalysisResult, user: UserProfile) => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  // Basic RTL support is limited in standard jsPDF without custom fonts
  // For this demo, we'll use a standard layout
  
  doc.setFontSize(20);
  doc.text('Bousala - University of El Oued', 105, 20, { align: 'center' });
  doc.setFontSize(16);
  doc.text('SDG Analysis Report', 105, 30, { align: 'center' });
  
  doc.setFontSize(11);
  doc.text(`Student: ${user.displayName}`, 20, 45);
  doc.text(`Student ID: ${user.studentId || 'N/A'}`, 20, 52);
  doc.text(`Faculty: ${user.faculty || 'N/A'}`, 20, 59);
  doc.text(`Department: ${user.department || 'N/A'}`, 20, 66);
  doc.text(`Supervisor: ${user.supervisorName || 'N/A'}`, 20, 73);
  
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 45);
  doc.text(`Overall SDG Alignment: ${result.overallSdgAlignment}%`, 140, 52);
  doc.text(`Status: ${user.supervisorStatus || 'Independent'}`, 140, 59);

  doc.setFontSize(14);
  doc.text('Summary', 20, 85);
  doc.setFontSize(10);
  const splitSummary = doc.splitTextToSize(result.summary, 170);
  doc.text(splitSummary, 20, 92);

  let currentY = 92 + (splitSummary.length * 5) + 10;

  doc.setFontSize(14);
  doc.text('SDG Alignment Scores', 20, currentY);
  currentY += 7;

  const tableData = result.sdgScores.map(s => [
    `Goal ${s.goal}: ${s.title}`,
    `${s.score}%`,
    s.evidence,
    s.link
  ]);

  try {
    autoTable(doc, {
      startY: currentY,
      head: [['SDG Goal', 'Score', 'Evidence', 'UN Link']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 8, font: 'helvetica' },
      headStyles: { fillColor: [0, 77, 51] }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || currentY + 40;
    currentY = finalY + 15;

    doc.setFontSize(14);
    doc.text('ASAM Matrix Sustainability Scorecard', 20, currentY);
    currentY += 7;

    const asamData = [
      ['Strategic Alignment', `${result.asamMatrix.strategicAlignment.score}/25`, result.asamMatrix.strategicAlignment.kpi],
      ['Eco-Design & Circularity', `${result.asamMatrix.ecoDesign.score}/25`, result.asamMatrix.ecoDesign.kpi],
      ['Human-Centric Impact', `${result.asamMatrix.humanImpact.score}/25`, result.asamMatrix.humanImpact.kpi],
      ['Viability & Scalability', `${result.asamMatrix.viability.score}/25`, result.asamMatrix.viability.kpi],
      ['Total Alignment', `${result.asamMatrix.totalAlignment}/100`, 'Comprehensive Model']
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['Quadrant', 'Score', 'KPI']],
      body: asamData,
      theme: 'grid',
      styles: { fontSize: 9, font: 'helvetica' },
      headStyles: { fillColor: [16, 185, 129] }
    });

    doc.save(`Bousla_Report_${user.displayName.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error("PDF Generation Error:", error);
    alert("Could not generate PDF. Please try again or use the print feature.");
  }
};
