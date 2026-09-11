import React, { useRef, useState } from 'react';
import { formatYears, formatCompactCurrency } from '../utils/millionaire';
import { track } from '../services/tracker';

const ShareCardModal = ({ isOpen, onClose, metrics, monthlyAmount, drip, yearsToTarget, finalValue, currencySymbol = '$' }) => {
  const cardRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !metrics) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    track('millionaire_share_download', { symbol: metrics?.symbol });
    setIsGenerating(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `dividendbro-${metrics.symbol}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Failed to generate PNG:', e);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTweet = () => {
    track('millionaire_share_tweet', { symbol: metrics?.symbol });
    const yearsText = yearsToTarget !== null ? formatYears(yearsToTarget) : '40+ years';
    const text = `I'll reach $1M in ${yearsText} investing ${currencySymbol}${monthlyAmount.toLocaleString()}/month in ${metrics.symbol} ${drip ? 'with DRIP 🔄' : 'without DRIP'}\n\nSimulate yours 👇`;
    const url = 'https://dividendbro.com/millionaire';
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, '_blank');
  };

  // ✅ NEW: WhatsApp share
  const handleWhatsApp = () => {
    track('millionaire_share_whatsapp', { symbol: metrics?.symbol });
    const yearsText = yearsToTarget !== null ? formatYears(yearsToTarget) : '40+ years';
    const text = `📊 My DividendBro projection:\n\n💰 $1,000,000 in ${yearsText}\n📅 Investing ${currencySymbol}${monthlyAmount.toLocaleString()}/month\n📈 Stock: ${metrics.symbol} (${metrics.name || metrics.symbol})\n🔄 DRIP: ${drip ? 'On' : 'Off'}\n\nSimulate yours 👇\nhttps://dividendbro.com/millionaire`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopy = async () => {
    track('millionaire_share_copy', { symbol: metrics?.symbol });
    const yearsText = yearsToTarget !== null ? formatYears(yearsToTarget) : '40+ years';
    const text = `I'll reach $1M in ${yearsText} investing ${currencySymbol}${monthlyAmount.toLocaleString()}/month in ${metrics.symbol} ${drip ? 'with DRIP' : 'without DRIP'}. Simulate yours at dividendbro.com/millionaire`;
    try {
      await navigator.clipboard.writeText(text);
      const btn = document.getElementById('copy-btn');
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => (btn.textContent = orig), 1500);
      }
    } catch (e) {}
  };

  const yearsText = yearsToTarget !== null ? formatYears(yearsToTarget) : '40+ years';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="max-w-lg w-full space-y-4" onClick={(e) => e.stopPropagation()}>

        {/* The card that gets rendered to PNG */}
        <div
          ref={cardRef}
          style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #050505 100%)',
            padding: '40px 36px',
            borderRadius: '24px',
            border: '1px solid #1e293b',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            color: '#ffffff',
          }}
        >
          {/* Header with brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
            <div style={{
              width: '32px', height: '32px',
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '16px', color: '#ffffff',
            }}>D</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.01em' }}>DividendBro</div>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>MILLIONAIRE SIMULATOR</div>
            </div>
          </div>

          {/* Stock info */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
              {metrics.name || metrics.symbol}
            </div>
            <div style={{
              display: 'inline-block', marginTop: '6px', padding: '3px 10px',
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '6px', fontFamily: 'monospace',
              fontWeight: 700, fontSize: '13px', color: '#06b6d4',
              letterSpacing: '0.05em',
            }}>{metrics.symbol}</div>
          </div>

          {/* Big years number */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '4px' }}>
              Time to reach $1,000,000
            </div>
            <div style={{
              fontSize: '60px', fontWeight: 900, lineHeight: 1,
              background: 'linear-gradient(90deg, #3b82f6, #06b6d4, #10b981)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', letterSpacing: '-0.03em',
            }}>{yearsText}</div>
          </div>

          {/* Detail row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '12px 10px' }}>
              <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Monthly</div>
              <div style={{ fontSize: '16px', fontWeight: 900, marginTop: '4px', fontFamily: 'monospace' }}>{currencySymbol}{monthlyAmount.toLocaleString()}</div>
            </div>
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '12px 10px' }}>
              <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Yield</div>
              <div style={{ fontSize: '16px', fontWeight: 900, marginTop: '4px', fontFamily: 'monospace', color: '#10b981' }}>
                {(metrics.currentYield * 100).toFixed(2)}%
              </div>
            </div>
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '12px 10px' }}>
              <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>DRIP</div>
              <div style={{ fontSize: '16px', fontWeight: 900, marginTop: '4px', fontFamily: 'monospace', color: drip ? '#06b6d4' : '#94a3b8' }}>
                {drip ? 'ON' : 'OFF'}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #1e293b' }}>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Simulate yours free →</div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#06b6d4', letterSpacing: '-0.01em' }}>dividendbro.com/millionaire</div>
          </div>
        </div>

        {/* Action buttons — now 4 total */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="px-4 py-3 bg-gradient-to-r from-accent-blue to-accent-teal text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all"
          >
            {isGenerating ? 'Generating...' : '⬇️ Download PNG'}
          </button>
          <button
            onClick={handleWhatsApp}
            className="px-4 py-3 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#25D366]/20 active:scale-95 transition-all"
          >
            💬 WhatsApp
          </button>
          <button
            onClick={handleTweet}
            className="px-4 py-3 bg-bg-surface border border-border/60 text-text-primary text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-bg-surface-hover active:scale-95 transition-all"
          >
            🐦 Post to X
          </button>
          <button
            id="copy-btn"
            onClick={handleCopy}
            className="px-4 py-3 bg-bg-surface border border-border/60 text-text-primary text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-bg-surface-hover active:scale-95 transition-all"
          >
            📋 Copy Text
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-bg-surface/60 border border-border/40 text-text-muted text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-bg-surface-hover transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ShareCardModal;