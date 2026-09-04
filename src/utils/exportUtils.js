import { jsPDF } from 'jspdf';
import { formatCurrency, formatNumber, formatPercent } from './formatters';

// ---------- CSV Export ----------
export const downloadCSV = (data, filename, headers) => {
  if (!data || data.length === 0) return;
  
  const headerRow = headers ? headers.join(',') : Object.keys(data[0]).join(',');
  const rows = data.map(row => {
    if (headers) {
      return headers.map(h => {
        const val = row[h] !== undefined ? row[h] : '';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',');
    }
    return Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
  });
  
  const csv = [headerRow, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

// ---------- PDF Report Generation ----------
export const generatePDFReport = async (reportData, filename) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF('p', 'mm', 'a4');
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  // Helper functions
  const addText = (text, x, y, options = {}) => {
    const { fontSize = 10, fontStyle = 'normal', color = '#333333', align = 'left' } = options;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(color);
    doc.text(text, x, y, { align });
  };

  const addLine = (y, color = '#e5e7eb') => {
    doc.setDrawColor(color);
    doc.line(margin, y, pageWidth - margin, y);
  };

  // ---------- HEADER ----------
  // Logo placeholder (text-based branding)
  doc.setFillColor('#0a0e1a');
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Brand
  doc.setTextColor('#ffffff');
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('📊 DividendBro', margin, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Smart Dividend Investing', margin + 90, 22, { align: 'left' });
  
  // Date
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, 22, { align: 'right' });

  y = 45;

  // ---------- TITLE ----------
  addText(reportData.title || 'Investment Portfolio Report', margin, y, { fontSize: 18, fontStyle: 'bold', color: '#1a1a2e' });
  y += 8;
  addText(reportData.subtitle || 'Powered by DividendBro', margin, y, { fontSize: 10, color: '#6b7280' });
  y += 12;

  // ---------- SUMMARY SECTION ----------
  // Section header
  addText('📋 Portfolio Summary', margin, y, { fontSize: 14, fontStyle: 'bold', color: '#1a1a2e' });
  y += 6;
  addLine(y);
  y += 8;

  // KPI Grid
  const kpis = reportData.kpis || [];
  const cols = 3;
  const colWidth = (pageWidth - margin * 2) / cols;
  
  kpis.forEach((kpi, index) => {
    const x = margin + (index % cols) * colWidth;
    const row = Math.floor(index / cols);
    const yPos = y + row * 18;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#6b7280');
    doc.text(kpi.label, x, yPos);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#1a1a2e');
    doc.text(kpi.value, x, yPos + 6);
  });
  
  y += Math.ceil(kpis.length / cols) * 18 + 8;

  // ---------- HOLDINGS TABLE ----------
  addText('📈 Holdings', margin, y, { fontSize: 14, fontStyle: 'bold', color: '#1a1a2e' });
  y += 6;
  addLine(y);
  y += 8;

  if (reportData.holdings && reportData.holdings.length > 0) {
    // Table headers
    const headers = ['Stock', 'Shares', 'Avg Cost', 'Current', 'Value', 'Gain', 'Yield', 'Dividends'];
    const colWidths = [45, 20, 25, 25, 30, 30, 20, 30];
    let x = margin;
    
    doc.setFillColor('#f3f4f6');
    doc.rect(margin, y - 4, pageWidth - margin * 2, 7, 'F');
    
    headers.forEach((h, i) => {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#374151');
      doc.text(h, x + 1, y + 1);
      x += colWidths[i];
    });
    
    y += 8;
    
    // Table rows
    reportData.holdings.forEach((row, idx) => {
      const values = [
        row.name,
        row.shares.toString(),
        row.avgCost,
        row.currentPrice,
        row.value,
        row.gain,
        row.yield,
        row.dividendIncome,
      ];
      
      let xPos = margin;
      values.forEach((val, i) => {
        const isNumeric = !isNaN(parseFloat(val)) && i > 0;
        const align = isNumeric ? 'right' : 'left';
        const text = typeof val === 'number' ? val.toFixed(2) : val;
        
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        
        // Color for gain
        if (i === 5 && typeof row.gain === 'number') {
          doc.setTextColor(row.gain >= 0 ? '#10b981' : '#ef4444');
        } else if (i === 7) {
          doc.setTextColor('#10b981');
        } else {
          doc.setTextColor('#1a1a2e');
        }
        
        if (align === 'right') {
          doc.text(String(text), xPos + colWidths[i] - 2, y + 1, { align: 'right' });
        } else {
          doc.text(String(text), xPos + 1, y + 1);
        }
        xPos += colWidths[i];
      });
      
      y += 6;
      
      // Alternate row background
      if (idx % 2 === 1) {
        doc.setFillColor('#f9fafb');
        doc.rect(margin, y - 5, pageWidth - margin * 2, 6, 'F');
      }
      
      // Check for page overflow
      if (y > pageHeight - 40) {
        doc.addPage();
        y = margin + 10;
      }
    });
  }

  y += 8;

  // ---------- DIVIDEND INCOME SECTION ----------
  if (reportData.dividendHistory && reportData.dividendHistory.length > 0) {
    addText('💰 Dividend Income', margin, y, { fontSize: 14, fontStyle: 'bold', color: '#1a1a2e' });
    y += 6;
    addLine(y);
    y += 8;

    // Dividend summary
    const totalDividends = reportData.dividendHistory.reduce((sum, d) => sum + d.amount, 0);
    addText(`Total Dividends Received: ${formatCurrency(totalDividends, reportData.currencySymbol || '$')}`, margin, y, { fontSize: 10, fontStyle: 'bold', color: '#10b981' });
    y += 6;
    
    // Dividend by year
    const byYear = {};
    reportData.dividendHistory.forEach(d => {
      const year = d.date.slice(0, 4);
      byYear[year] = (byYear[year] || 0) + d.amount;
    });
    
    Object.entries(byYear).sort().forEach(([year, amount]) => {
      const barWidth = (amount / totalDividends) * (pageWidth - margin * 2 - 60);
      doc.setFillColor('#3b82f6');
      doc.rect(margin, y - 3, Math.min(barWidth, pageWidth - margin * 2), 5, 'F');
      addText(`${year}: ${formatCurrency(amount, reportData.currencySymbol || '$')}`, margin + 3, y + 3, { fontSize: 8 });
      y += 8;
    });
  }

  y += 8;

  // ---------- FOOTER ----------
  // Footer line
  addLine(y, '#d1d5db');
  y += 6;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#6b7280');
  doc.text('Generated by DividendBro - Smart Dividend Investing', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.text('Visit dividendbro.com for more insights', pageWidth / 2, y, { align: 'center' });
  
  // Hyperlink
  doc.link(margin, y - 4, pageWidth - margin * 2, 8, { url: 'https://dividendbro.com' });

  // Save PDF
  doc.save(`${filename}_report_${new Date().toISOString().slice(0,10)}.pdf`);
};

// ---------- WhatsApp Share ----------
export const shareViaWhatsApp = (message) => {
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

// ---------- Build Share Message ----------
export const buildShareMessage = (reportData) => {
  const kpis = reportData.kpis || [];
  let message = `📊 *DividendBro Portfolio Report*\n\n`;
  message += `📅 ${new Date().toLocaleDateString()}\n\n`;
  
  kpis.forEach(kpi => {
    message += `• ${kpi.label}: *${kpi.value}*\n`;
  });
  
  message += `\n🔗 View full report: dividendbro.com/portfolio`;
  message += `\n\nBuilt with ❤️ by DividendBro`;
  
  return message;
};