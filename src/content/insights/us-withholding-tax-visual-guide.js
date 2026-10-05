export const insight = {
  slug: "us-withholding-tax-visual-guide",
  title: "The 30% US Withholding Tax: What It Actually Costs Singapore Investors",
  date: "2026-10-05",
  category: "Educational",
  emoji: "🧾",
  excerpt: "A US stock yielding 5% only gives you 3.5% after tax. Here's the visual math — and how much extra yield you need to catch up to SGX dividends.",
  content: `
    <p><strong>The short version:</strong> Singapore has no tax treaty with the US. That means every US dividend you receive gets 30% withheld before it reaches you. A 5% yield becomes 3.5%.</p>

    <h2>The Math in One Chart</h2>

    <div class="db-ig">
      <div class="db-ig-header">
        <a href="/" class="db-ig-brand"><span class="db-ig-logo">D</span> DividendBro</a>
        <a href="/screener" class="db-ig-link">Screener →</a>
      </div>
      <h4 class="db-ig-title">💵 After-Tax Yield: US vs SGX</h4>
      <p class="db-ig-sub">What you actually keep per dollar of dividends</p>
      <div class="db-ig-body">
        <div class="db-ig-row">
          <span class="db-ig-row-label">US stock @ 5%</span>
          <div class="db-ig-row-track"><div class="db-ig-row-fill" style="width:70%;background:linear-gradient(90deg,#f87171,#ef4444);"></div></div>
          <span class="db-ig-row-val" style="color:#f87171;">3.50%</span>
        </div>
        <div class="db-ig-row">
          <span class="db-ig-row-label">SGX stock @ 5%</span>
          <div class="db-ig-row-track"><div class="db-ig-row-fill" style="width:100%;background:linear-gradient(90deg,#10b981,#34d399);"></div></div>
          <span class="db-ig-row-val" style="color:#34d399;">5.00%</span>
        </div>
      </div>
      <div class="db-ig-footer">
        SGX dividends are tax-free for individual Singapore investors · US dividends are not
      </div>
    </div>

    <h2>The Break-Even Point</h2>

    <p>For a US stock to match a 5% SGX dividend after tax, it needs to yield:</p>

    <p style="text-align:center;font-size:20px;font-weight:900;color:var(--accent);margin:2rem 0;">
      5% ÷ (1 − 0.30) = 7.14%
    </p>

    <p>That's the number. A US stock yielding 7.14% gives you the same after-tax income as a SGX stock yielding 5%.</p>

    <h2>What This Means in Practice</h2>

    <ul>
      <li><strong>Don't avoid US stocks entirely.</strong> Some US dividend payers have growth rates that SGX companies can't match. Quality matters more than tax rate.</li>
      <li><strong>Weight your portfolio toward SGX if you're income-focused.</strong> The tax advantage compounds over decades.</li>
      <li><strong>Consider Irish-domiciled ETFs for US exposure.</strong> Ireland has a US tax treaty, so the withholding on dividends is 15% instead of 30%.</li>
    </ul>

    <h2>The Takeaway</h2>

    <p>The 30% withholding tax is real and unavoidable for direct US stock ownership. Every dollar of US dividend income costs you 30 cents. Plan for it, don't ignore it.</p>

    <p>Compare after-tax yields on the <a href="/screener">DividendBro Screener</a>.</p>
  `
};