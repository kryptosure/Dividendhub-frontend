import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ---------- CSV ----------
export const arrayToCSV = (data, headers) => {
  if (!data || data.length === 0) return '';
  const headerRow = headers ? headers.join(',') : Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    headers 
      ? headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(',')
      : Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
  );
  return [headerRow, ...rows].join('\n');
};

export const downloadCSV = (data, filename, headers) => {
  const csv = arrayToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

// ---------- Capture ----------
export const captureElement = async (element, scale = 1) => {
  if (!element) return null;
  try {
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      backgroundColor: '#0a0e1a',
      logging: false,
      allowTaint: true,
      width: element.scrollWidth,
      height: element.scrollHeight,
    });
    return canvas.toDataURL('image/jpeg', 0.85);
  } catch (error) {
    console.error('Capture error:', error);
    return null;
  }
};

// ---------- PDF ----------
export const generatePDF = async (element, filename) => {
  if (!element) return;
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#0a0e1a',
    logging: false,
  });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 190;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, 270));
  pdf.save(`${filename}.pdf`);
};

// ---------- Notification ----------
const showNotification = (message, type = 'info', onAction = null) => {
  const existing = document.querySelector('.share-notification');
  if (existing) existing.remove();
  const notification = document.createElement('div');
  notification.className = 'share-notification';
  notification.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    padding: 14px 24px;
    border-radius: 12px;
    background: ${type === 'success' ? '#34d399' : '#f87171'};
    color: #fff;
    font-weight: 600;
    font-size: 14px;
    z-index: 9999;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    animation: slideUp 0.3s ease;
    max-width: 90%;
    text-align: center;
  `;
  notification.innerHTML = message;
  if (onAction) {
    const btn = document.createElement('button');
    btn.textContent = 'Download Again';
    btn.style.cssText = `
      margin-left: 12px;
      padding: 4px 12px;
      background: white;
      color: #0a0e1a;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    `;
    btn.onclick = onAction;
    notification.appendChild(btn);
  }
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 8000);
};

// ---------- Force download image ----------
const downloadImage = (dataUrl, filename) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ---------- WhatsApp Share ----------
export const shareViaWhatsApp = async (element, title, fallbackMessage) => {
  if (!element) {
    showNotification('Nothing to share', 'error');
    return;
  }

  // 1. Capture the element
  let imageDataUrl = null;
  try {
    const canvas = await html2canvas(element, {
      scale: 1.2,
      useCORS: true,
      backgroundColor: '#0a0e1a',
      logging: false,
      allowTaint: true,
      width: element.scrollWidth,
      height: element.scrollHeight,
    });
    imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
  } catch (e) {
    console.error('Capture failed:', e);
  }

  if (!imageDataUrl) {
    // Fallback to link sharing
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(fallbackMessage || 'Check out this dividend data on DividendHub!');
    window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank');
    showNotification('Could not capture image. Sharing link instead.', 'error');
    return;
  }

  // 2. Try Web Share API (mobile) – best experience
  if (navigator.share) {
    try {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'dividendhub-share.jpg', { type: 'image/jpeg' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: title || 'DividendHub',
          text: fallbackMessage || 'Check out this dividend data on DividendHub!',
          files: [file],
        });
        console.log('Share successful via Web Share API');
        return;
      } else {
        // Try without canShare check
        await navigator.share({
          title: title || 'DividendHub',
          text: fallbackMessage || 'Check out this dividend data on DividendHub!',
          files: [file],
        });
        console.log('Share successful via Web Share API');
        return;
      }
    } catch (shareError) {
      console.warn('Web Share API error:', shareError);
      // Fall through to download method
    }
  }

  // 3. Fallback: download the image and open WhatsApp
  // Download the image
  downloadImage(imageDataUrl, 'dividendhub-share.jpg');

  // Open WhatsApp with a pre‑filled message
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(fallbackMessage || `Check out this dividend data on DividendHub!`);
  window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank');

  // Show notification with "Download Again" button
  showNotification(
    `📸 Image downloaded! Open WhatsApp, tap the attachment icon 📎, and select the downloaded image.`,
    'success',
    () => downloadImage(imageDataUrl, 'dividendhub-share.jpg')
  );
};