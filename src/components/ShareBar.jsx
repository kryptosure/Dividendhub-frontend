import React from 'react';
import { FileText, Table2, MessageCircle } from 'lucide-react';
import { track } from '../services/tracker';

const ShareBar = ({ result, curSymbol }) => {
  const fmt = (n) => {
    if (n == null || isNaN(n)) return '-';
    return Number(n).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /* ─────────── CSV export ─────────── */
  const handleCSV = () => {
    track('income_planner_share_csv', { count: result.positions.length });

    const headers = [
      'Ticker',
      'Company',
      'Sector',
      'Yield %',
      'Weight %',
      'Shares',
      'Invest',
      'Monthly Income',
      'Safety',
    ];

    const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;

    const rows = result.positions.map((p) => [
      p.symbol,
      p.name,
      p.sector || '',
      p.currentYield.toFixed(2),
      p.weight.toFixed(2),
      p.shares,
      p.cost.toFixed(2),
      p.monthlyIncome.toFixed(2),
      p.safety,
    ]);

    const csv = [
      `# DividendBro Monthly Dividend Income Plan`,
      `# Goal: ${curSymbol}${fmt(result.summary.targetMonthly)}/month`,
      `# Required capital: ${curSymbol}${fmt(result.summary.requiredCapital)} at ${result.summary.avgYield}% avg yield`,
      `# Risk profile: ${result.profile.label}`,
      `# Generated: ${new Date().toLocaleDateString()}`,
      '',
      headers.map(escape).join(','),
      ...rows.map((r) => r.map(escape).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dividendbro_plan_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* ─────────── PDF export ─────────── */
  const handlePDF = async () => {
    track('income_planner_share_pdf', { count: result.positions.length });

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let y = margin;

      /* Header */
      doc.setFillColor(10, 14, 26);
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('DividendBro', margin, 13);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Monthly Dividend Income Plan', margin, 20);
      doc.setFontSize(8);
      doc.text(
        `Generated: ${new Date().toLocaleDateString()}`,
        pageWidth - margin,
        20,
        { align: 'right' }
      );

      y = 42;

      /* Summary box */
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 32, 3, 3, 'FD');

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('YOUR GOAL', margin + 5, y + 7);
      doc.text('CAPITAL REQUIRED', margin + 65, y + 7);
      doc.text('AVG YIELD', margin + 125, y + 7);

      doc.setTextColor(10, 14, 26);
      doc.setFontSize(14);
      doc.text(`${curSymbol}${fmt(result.summary.targetMonthly)}/mo`, margin + 5, y + 18);
      doc.text(`${curSymbol}${fmt(result.summary.requiredCapital)}`, margin + 65, y + 18);
      doc.text(`${result.summary.avgYield}%`, margin + 125, y + 18);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`${result.profile.label} profile`, margin + 5, y + 26);
      doc.text(`${result.summary.positionCount} stocks`, margin + 65, y + 26);

      y += 42;

      /* Positions table */
      doc.setTextColor(10, 14, 26);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Sample Portfolio', margin, y);
      y += 6;

      const cols = [
        { label: 'Ticker', x: margin, w: 20, align: 'left' },
        { label: 'Company', x: margin + 20, w: 55, align: 'left' },
        { label: 'Yield', x: margin + 75, w: 18, align: 'right' },
        { label: 'Weight', x: margin + 93, w: 18, align: 'right' },
        { label: 'Shares', x: margin + 111, w: 18, align: 'right' },
        { label: 'Invest', x: margin + 129, w: 25, align: 'right' },
        { label: 'Income/mo', x: margin + 154, w: 26, align: 'right' },
      ];

      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y - 4, pageWidth - margin * 2, 7, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      cols.forEach((c) => {
        const tx = c.align === 'right' ? c.x + c.w : c.x;
        doc.text(c.label, tx, y, { align: c.align });
      });
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(10, 14, 26);
      result.positions.forEach((p) => {
        if (y > pageHeight - 30) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(p.symbol, cols[0].x, y);
        doc.setFont('helvetica', 'normal');
        const nameTrunc = p.name.length > 32 ? p.name.slice(0, 30) + '...' : p.name;
        doc.text(nameTrunc, cols[1].x, y);
        doc.text(`${p.currentYield.toFixed(2)}%`, cols[2].x + cols[2].w, y, { align: 'right' });
        doc.text(`${p.weight.toFixed(2)}%`, cols[3].x + cols[3].w, y, { align: 'right' });
        doc.text(String(p.shares), cols[4].x + cols[4].w, y, { align: 'right' });
        doc.text(`${curSymbol}${fmt(p.cost)}`, cols[5].x + cols[5].w, y, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.text(`${curSymbol}${fmt(p.monthlyIncome)}`, cols[6].x + cols[6].w, y, {
          align: 'right',
        });
        y += 5.5;
      });

      /* Total */
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y - 1, pageWidth - margin, y - 1);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Total', cols[0].x, y + 4);
      doc.text(`${curSymbol}${fmt(result.summary.totalCost)}`, cols[5].x + cols[5].w, y + 4, {
        align: 'right',
      });
      doc.text(
        `${curSymbol}${fmt(result.summary.totalMonthlyIncome)}`,
        cols[6].x + cols[6].w,
        y + 4,
        { align: 'right' }
      );

      /* Disclaimer */
      y = pageHeight - 25;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y - 3, pageWidth - margin, y - 3);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      const disclaimer =
        'This is a sample portfolio generated by DividendBro for educational purposes only. Not financial advice. Always do your own research before investing.';
      doc.text(disclaimer, margin, y + 2, { maxWidth: pageWidth - margin * 2 });

      doc.save(`dividendbro_plan_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  /* ─────────── WhatsApp share ─────────── */
  const handleWhatsApp = () => {
    track('income_planner_share_whatsapp', { count: result.positions.length });

    let msg = '*My Monthly Dividend Income Plan*\n';
    msg += 'Generated by DividendBro\n\n';
    msg += `Goal: *${curSymbol}${fmt(result.summary.targetMonthly)}/month*\n`;
    msg += `Capital needed: *${curSymbol}${fmt(result.summary.requiredCapital)}*\n`;
    msg += `Average yield: *${result.summary.avgYield}%*\n`;
    msg += `Risk profile: *${result.profile.label}*\n`;
    msg += `Positions: *${result.summary.positionCount} stocks*\n\n`;
    msg += '*Top Holdings:*\n';
    result.positions.slice(0, 5).forEach((p) => {
      msg += `${p.symbol}  ${p.currentYield.toFixed(1)}%  ${curSymbol}${fmt(p.monthlyIncome)}/mo\n`;
    });
    if (result.positions.length > 5) {
      msg += `...and ${result.positions.length - 5} more\n`;
    }
    msg += '\nBuild your own free plan at https://dividendbro.com';

    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-bg-surface border border-border/50 rounded-2xl p-5 shadow-sm">
      <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-3">
        Share your plan
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">

        {/* PDF */}
        <button
          type="button"
          onClick={handlePDF}
          className="min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-bg-primary border border-border/60 text-text-secondary text-xs font-bold uppercase tracking-wider hover:bg-bg-surface-hover hover:border-border-hover active:scale-[0.98] transition-all"
        >
          <FileText size={14} />
          Download PDF
        </button>

        {/* CSV */}
        <button
          type="button"
          onClick={handleCSV}
          className="min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-bg-primary border border-border/60 text-text-secondary text-xs font-bold uppercase tracking-wider hover:bg-bg-surface-hover hover:border-border-hover active:scale-[0.98] transition-all"
        >
          <Table2 size={14} />
          Download CSV
        </button>

        {/* WhatsApp */}
        <button
          type="button"
          onClick={handleWhatsApp}
          className="min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-bold uppercase tracking-wider hover:bg-[#25D366]/15 active:scale-[0.98] transition-all"
        >
          <MessageCircle size={14} />
          Share on WhatsApp
        </button>
      </div>
    </div>
  );
};

export default ShareBar;