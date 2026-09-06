import React from 'react';
import { downloadCSV, shareViaWhatsApp } from '../utils/exportUtils';
import { generatePDFReport } from '../utils/pdfExport';

const ExportButtons = ({
  data,
  filename,
  headers,
  reportData,
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
    if (!reportData) return;
    try {
      await generatePDFReport(reportData);
    } catch (error) {
      console.error('PDF engine execution failure:', error);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 text-xs font-bold ${className}`}>
      {showCSV && (
        <button onClick={handleCSV} className="px-3.5 py-2 bg-bg-surface border border-border/60 hover:bg-bg-surface-hover rounded-xl text-text-secondary transition-all active:scale-95 shadow-sm">
          📊 CSV
        </button>
      )}
      {showPDF && (
        <button onClick={handlePDF} className="px-3.5 py-2 bg-bg-surface border border-border/60 hover:bg-bg-surface-hover rounded-xl text-text-secondary transition-all active:scale-95 shadow-sm">
          📄 PDF
        </button>
      )}
      {showShare && (
        <button onClick={() => shareViaWhatsApp(shareMessage || 'Tracking yield metrics on DividendBro.')} className="px-3.5 py-2 bg-accent-green/5 border border-accent-green/20 hover:bg-accent-green/10 text-accent-green rounded-xl transition-all active:scale-95 shadow-sm">
          📤 Share
        </button>
      )}
    </div>
  );
};

export default ExportButtons;
