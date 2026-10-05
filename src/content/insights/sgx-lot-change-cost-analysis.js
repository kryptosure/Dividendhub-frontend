export const insight = {
  slug: "sgx-lot-change-cost-analysis",
  title: "The Hidden Cost of the SGX Board Lot Change Nobody Is Talking About",
  date: "2026-10-05",
  category: "Data Finding",
  emoji: "💰",
  excerpt: "Everyone is celebrating cheaper access to DBS, OCBC, and UOB. But broker minimum commissions can eat 0.65% of a small trade. Here's the math.",
  content: `
    <p><strong>The headline:</strong> SGX cut board lot sizes from 100 to 10 shares for 11 major stocks. Minimum investment in DBS drops from ~S$7,700 to ~S$770.</p>

    <p><strong>The part nobody is calculating:</strong> Broker minimum commissions haven't changed. For a small trade, that fixed fee can eat a much larger percentage of your investment.</p>

    <h2>The Math</h2>

    <div class="db-ig">
      <div class="db-ig-header">
        <a href="/" class="db-ig-brand"><span class="db-ig-logo">D</span> DividendBro</a>
        <a href="/blog/top-10-us-brokers-comparison" class="db-ig-link">Broker comparison →</a>
      </div>
      <h4 class="db-ig-title">💸 Commission Drag: Old vs New Lot Size</h4>
      <p class="db-ig-sub">Assuming S$5 minimum commission per trade</p>
      <div class="db-ig-body">
        <div class="db-ig-row">
          <span class="db-ig-row-label">Old: 100 shares of DBS</span>
          <div class="db-ig-row-track"><div class="db-ig-row-fill" style="width:2%;background:linear-gradient(90deg,#10b981,#34d399);"></div></div>
          <span class="db-ig-row-val" style="color:#34d399;">0.06%</span>
        </div>
        <div class="db-ig-row">
          <span class="db-ig-row-label">New: 10 shares of DBS</span>
          <div class="db-ig-row-track"><div class="db-ig-row-fill" style="width:100%;background:linear-gradient(90deg,#f87171,#ef4444);"></div></div>
          <span class="db-ig-row-val" style="color:#f87171;">0.65%</span>
        </div>
      </div>
      <div class="db-ig-footer">
        Same S$5 commission · 10x smaller trade · 10x larger percentage drag
      </div>
    </div>

    <h2>What This Means</h2>

    <p>The board lot change is genuinely good for access. But if you're buying small lots, you need to check your broker's fee structure first.</p>

    <p><strong>Three approaches:</strong></p>

    <ul>
      <li><strong>Use a broker with no minimum commission.</strong> OCBC Securities announced they'll remove minimum commissions for online SGX trades from October 5. Other brokers may follow.</li>
      <li><strong>Batch your purchases.</strong> Buy 5 lots (50 shares) every 5 months instead of 1 lot (10 shares) every month. Same total investment, 1/5 the commission.</li>
      <li><strong>Focus on the long-term.</strong> A 0.65% commission on the first purchase matters far less than the dividend yield over the next 10 years. Don't let the fee optimize you out of starting.</li>
    </ul>

    <h2>The Real Takeaway</h2>

    <p>The board lot change is a structural improvement. The fee math is a temporary problem — competition between brokers will push minimums to zero within a year, just like it did in the US.</p>

    <p>In the meantime, the fix is simple: check the minimum before you trade.</p>

    <p>Full breakdown → <a href="/blog/sgx-board-lot-reduction-2026">SGX Board Lot Guide</a></p>
  `
};