import React, { useRef } from 'react';
import { downloadCSV, captureElement, downloadImage, generatePDF, shareViaWhatsApp } from '../utils/exportUtils';

const ExportButtons = ({ 
  data, 
  filename, 
  headers, 
  csvData, 
  elementRef, 
  title, 
  shareMessage,
  showCSV = true,
  showPDF = true,
  showShare = true,
  className = '',
}) => {
  const handleCSV = () => {
    if (!csvData && !data) return;
    const exportData = csvData || data;
    downloadCSV(exportData, filename, headers);
  };

  const handlePDF = async () => {
    if (!elementRef?.current) return;
    await generatePDF(elementRef.current, filename);
  };

  const handleShare = async () => {
    if (!elementRef?.current) return;
    await shareViaWhatsApp(elementRef.current, title, shareMessage);
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