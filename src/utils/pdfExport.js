import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate a professional, responsive PDF report directly from data models.
 */
export async function generatePDFReport(options) {
  const {
    title = 'Simulation Audit Report',
    subtitle = '',
    kpis = [],
    tables = [],
    currencySymbol = '$',
    filename = 'report_dump',
  } = options;

  try {
    let tableHTML = '';
    tables.forEach((table, idx) => {
      tableHTML += `
        <h4 style="font-size:13px; font-weight:800; margin:24px 0 8px 0; color:#0f172a; text-transform:uppercase; letter-spacing:0.5px;">${table.title || `Data Stream Matrix ${idx+1}`}</h4>
        <table style="width:100%; border-collapse:collapse; font-size:10px; font-weight:500;">
          <thead>
            <tr style="background-color:#3b82f6;">
              ${table.headers.map(h => `<th style="color:#ffffff; padding:8px 12px; text-align:left; font-weight:700; text-transform:uppercase; font-size:9px; letter-spacing:0.5px;">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody style="color:#334155;">
            ${table.rows.map((row, rIdx) => `
              <tr style="background-color: ${rIdx % 2 === 1 ? '#f8fafc' : '#ffffff'};">
                ${row.map((cell, i) => {
                  const isNumeric = !isNaN(parseFloat(cell)) && i > 0;
                  const align = isNumeric ? 'text-align:right;' : 'text-align:left;';
                  let styleColor = '';
                  if (typeof cell === 'string' && cell.startsWith('+')) styleColor = 'color:#10b981; font-weight:700;';
                  else if (typeof cell === 'string' && cell.startsWith('-')) styleColor = 'color:#ef4444; font-weight:700;';
                  return `<td style="padding:7px 12px; border-bottom:1px solid #f1f5f9; ${align} ${styleColor}">${cell}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    });

    const kpiHTML = kpis.length > 0 ? `
      <div style="display:grid; grid-template-columns:repeat(${Math.min(kpis.length, 4)}, 1fr); gap:12px; margin:20px 0;">
        ${kpis.map(kpi => `
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px 14px; box-shadow:0 1px 2px rgba(0,0,0,0.02);">
            <div style="font-size:9px; color:#64748b; text-transform:uppercase; font-weight:700; letter-spacing:0.5px;">${kpi.label}</div>
            <div style="font-size:15px; font-weight:900; color:#0f172a; margin-top:4px; ${kpi.color ? `color:${kpi.color};` : ''}">${kpi.value}</div>
          </div>
        `).join('')}
      </div>
    ` : '';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background:#ffffff; color:#0f172a; padding:32px; width:780px; margin:0 auto; }
            .header { background:#0a0e1a; padding:24px 28px; border-radius:12px; display:flex; justify-content:space-between; align-items:center; }
            .header h1 { color:#ffffff; font-size:18px; font-weight:900; tracking-tight; }
            .header .sub { color:#64748b; font-size:11px; font-weight:600; margin-top:2px; }
            .header .date { color:#64748b; font-size:11px; font-weight:600; text-align:right; }
            .title { font-size:20px; font-weight:900; margin:24px 0 4px 0; color:#0f172a; tracking-tight; }
            .subtitle { font-size:11px; color:#64748b; font-weight:500; margin-bottom:16px; }
            .footer { margin-top:32px; padding-top:16px; border-t:1px solid #e2e8f0; font-size:10px; color:#64748b; text-align:center; font-weight:500; }
            .footer a { color:#3b82f6; text-decoration:none; font-weight:700; }
            .footer .brand { color:#3b82f6; font-weight:800; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>📊 DividendBro</h1>
              <div class="sub">Smart Dividend Analysis Hub</div>
            </div>
            <div class="date">${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</div>
          </div>

          <div class="title">${title}</div>
          ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}

          ${kpiHTML}
          ${tableHTML}

          <div class="footer">
            <span>Generated via <span class="brand">DividendBro</span> — High Yield Matrix Engine</span><br>
            <span style="font-size:9px; color:#94a3b8; margin-top:4px; display:inline-block;">Audit performance lines live at <a href="https://dividendbro.com">dividendbro.com</a></span>
          </div>
        </body>
      </html>
    `;

    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '0';
    container.style.width = '780px';
    container.style.background = '#ffffff';
    container.style.zIndex = '-9999';
    document.body.appendChild(container);

    await new Promise(resolve => setTimeout(resolve, 250));

    const canvas = await html2canvas(container, {
      scale: 2.2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      width: 780,
      height: container.scrollHeight,
    });

    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const doc = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 190;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    doc.addImage(imgData, 'JPEG', 10, 10, pdfWidth, pdfHeight);
    doc.save(`${filename}_audit_${new Date().toISOString().slice(0,10)}.pdf`);
  } catch (error) {
    console.error('PDF layer canvas write failure:', error);
    throw error;
  }
}
