import React from 'react';
import { downloadCSV, shareViaWhatsApp } from '../utils/exportUtils';
import { generatePDFReport } from '../utils/pdfExport';

const ExportButtons = ({
  data,
  filename,
  headers,
  reportData,      // For PDF: { title, subtitle, kpis, tables, currencySymbol }
  shareMessage,
  showCSV = true,
  showPDF = true,
  showShare = true,
  className = '',
}) => {
  const handleCSV = () => {
    if (!data || data.length === 0) return;
    downloadCSV(data, filename, headers);
  };

  const handlePDF = async () => {
    if (!reportData) {
      console.warn('No report data for PDF');
      return;
    }
    try {
      await generatePDFReport({
        ...reportData,
        filename: filename || 'report',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
    }
  };

  const handleShare = () => {
    const message = shareMessage || 'Check out my portfolio on DividendBro!';
    shareViaWhatsApp(message);
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {showCSV && (
        <button
          onClick={handleCSV}
          className="text-xs px-3 py-1.5 bg-bg-surface border border-border rounded-full hover:bg-bg-surface-hover transition flex items-center gap-1"
        >
          📊 CSV
        </button>
      )}
      {showPDF && (
        <button
          onClick={handlePDF}
          className="text-xs px-3 py-1.5 bg-bg-surface border border-border rounded-full hover:bg-bg-surface-hover transition flex items-center gap-1"
        >
          📄 PDF
        </button>
      )}
      {showShare && (
        <button
          onClick={handleShare}
          className="text-xs px-3 py-1.5 bg-accent-green/10 border border-accent-green/30 rounded-full hover:bg-accent-green/20 transition flex items-center gap-1 text-accent-green"
        >
          📤 Share
        </button>
      )}
    </div>
  );
};

export default ExportButtons;