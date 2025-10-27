// src/utils/reportTemplate.js

export { generateStyledHtml, styledCss };

export function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function generateStyledHtml(report, gmailUser = "—") {
  if (!report) return "";

  const title = "Resumail — Rapport d’analyse";
  const dateStr = new Date().toLocaleString("fr-FR");
  const userStr = gmailUser || "—";
  const summary = (report.report_text || report.summary || "").replace(/\n/g, "<br/>");

  const highlightsHtml = (report.highlights || []).length
    ? report.highlights
        .map(
          (h) => `
          <li>
            <span>${escapeHtml(typeof h === "string" ? h : h.text || JSON.stringify(h))}</span>
            ${h.count ? `<span class="meta">(${h.count}×)</span>` : ""}
          </li>`
        )
        .join("")
    : `<p class="muted">Aucun point marquant détecté.</p>`;

  const c = report.classification ?? {};
  const positive = c.positive ?? 0;
  const negative = c.negative ?? 0;
  const neutral = c.neutral ?? 0;
  const other = c.other ?? 0;
  const total = report.total_emails ?? positive + negative + neutral + other;

  const miniReports = Array.isArray(report.mini_reports)
    ? report.mini_reports
    : Array.isArray(report.miniReports)
    ? report.miniReports
    : [];

  const miniReportsHtml = miniReports.length
    ? miniReports
        .map(
          (r, i) => `
          <div class="mini-report">
            <div class="mini-header">
              <div class="mini-icon">📨</div>
              <div>
                <h3>Mini-rapport ${i + 1}</h3>
                <p class="mini-title">${escapeHtml(r.title || r.label || "—")}</p>
              </div>
            </div>
            <div class="mini-body">
              ${escapeHtml(r.text || r.summary || "Aucun contenu.").replace(/\n/g, "<br/>")}
            </div>
          </div>`
        )
        .join("")
    : `<p class="muted">Aucun mini-rapport disponible.</p>`;

  return `
    <div class="container">
      <header>
        <h1>${escapeHtml(title)}</h1>
        <div class="subtitle">${escapeHtml(userStr)} — ${escapeHtml(dateStr)}</div>
      </header>

      <section class="summary-card">
        <h2>📝 Résumé global</h2>
        <p>${summary || "<span class='muted'>Aucun résumé disponible.</span>"}</p>
      </section>

      <section class="stats-card">
        <h2>📊 Statistiques générales</h2>
        <div class="stats-grid">
          <div class="stat">
            <div class="stat-value positive">${positive}</div>
            <div class="stat-label">Positifs</div>
          </div>
          <div class="stat">
            <div class="stat-value neutral">${neutral}</div>
            <div class="stat-label">Neutres</div>
          </div>
          <div class="stat">
            <div class="stat-value negative">${negative}</div>
            <div class="stat-label">Négatifs</div>
          </div>
          <div class="stat">
            <div class="stat-value">${other}</div>
            <div class="stat-label">Autres</div>
          </div>
        </div>
        <div class="total">
          Total d’emails analysés : <strong>${total}</strong>
        </div>
      </section>

      <section class="highlights-card">
        <h2>✨ Points récurrents</h2>
        <ul class="highlight-list">${highlightsHtml}</ul>
      </section>

      <section class="mini-section">
        <h2>📬 Mini-rapports détaillés</h2>
        ${miniReportsHtml}
      </section>

      <footer>
        Rapport généré automatiquement par <strong>Resumail</strong><br/>
        <span class="footer-date">${escapeHtml(dateStr)}</span>
      </footer>
    </div>
  `;
}

export const styledCss = `
  @page { margin: 18mm; }
  body {
    font-family: Inter, "Segoe UI", Roboto, sans-serif;
    color: #0f172a;
    background: #f8fafc;
    margin: 0;
    padding: 0;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 0 12px rgba(0,0,0,0.08);
  }

  header {
    text-align: center;
    border-bottom: 2px solid #e0e7ff;
    padding-bottom: 8px;
    margin-bottom: 20px;
  }

  h1 {
    color: #3730a3;
    margin: 0;
    font-size: 22px;
    font-weight: 700;
  }

  .subtitle {
    color: #64748b;
    margin-top: 6px;
    font-size: 12px;
  }

  section {
    margin-bottom: 22px;
  }

  h2 {
    font-size: 16px;
    color: #4338ca;
    margin-bottom: 10px;
    border-left: 4px solid #6366f1;
    padding-left: 8px;
  }

  p {
    margin: 6px 0;
    line-height: 1.5;
    color: #334155;
  }

  .summary-card {
    background: #f5f3ff;
    border-radius: 8px;
    padding: 16px;
  }

  .stats-card {
    background: #eef2ff;
    border-radius: 8px;
    padding: 16px;
  }

  .stats-grid {
    display: flex;
    justify-content: space-between;
    text-align: center;
    margin: 10px 0;
  }

  .stat {
    flex: 1;
  }

  .stat-value {
    font-weight: 700;
    font-size: 18px;
  }

  .positive { color: #16a34a; }
  .neutral { color: #475569; }
  .negative { color: #dc2626; }

  .highlight-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .highlight-list li {
    background: #fff;
    border-left: 4px solid #6366f1;
    padding: 8px 12px;
    border-radius: 6px;
    margin-bottom: 6px;
    font-size: 14px;
  }

  .highlight-list .meta {
    color: #94a3b8;
    margin-left: 6px;
    font-size: 12px;
  }

  .mini-section {
    background: #f9fafb;
    border-radius: 8px;
    padding: 16px;
  }

  .mini-report {
    border: 1px solid #e2e8f0;
    border-left: 4px solid #818cf8;
    border-radius: 8px;
    background: white;
    padding: 12px;
    margin-bottom: 10px;
  }

  .mini-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .mini-icon {
    font-size: 18px;
  }

  .mini-title {
    font-size: 13px;
    color: #475569;
    margin: 0;
  }

  .mini-body {
    font-size: 13px;
    line-height: 1.5;
    color: #334155;
  }

  .muted {
    color: #94a3b8;
  }

  footer {
    text-align: center;
    margin-top: 24px;
    color: #94a3b8;
    font-size: 12px;
  }

  .footer-date {
    display: block;
    margin-top: 2px;
  }
`;