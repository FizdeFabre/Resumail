// src/utils/reportTemplate.js
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

  const title = "Resumail — Rapport";
  const dateStr = new Date().toLocaleString();
  const userStr = gmailUser || "—";
  const summary = (report.report_text || report.summary || "").replace(/\n/g, "<br/>");

  const highlightsHtml = (report.highlights || []).length
    ? report.highlights
        .map((h) =>
          typeof h === "string"
            ? `<div class="highlight-item">${escapeHtml(h)}</div>`
            : `<div class="highlight-item">${escapeHtml(h.text || JSON.stringify(h))} <span class="meta">(${h.count ?? ""} — ${h.pct ?? ""})</span></div>`
        )
        .join("")
    : `<p class="muted">Aucun point marquant détecté.</p>`;

  const positive = report.classification?.positive ?? 0;
  const negative = report.classification?.negative ?? 0;
  const neutral = report.classification?.neutral ?? 0;
  const other = report.classification?.other ?? 0;
  const total = report.total_emails ?? (positive + negative + neutral + other);

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
            <h3>📨 Mini-rapport ${i + 1}</h3>
            <p>${escapeHtml(r.title || r.label || "—")}</p>
            <div class="mini-summary">
              ${escapeHtml(r.text || r.summary || "Aucun contenu.").replace(/\n/g, "<br/>")}
            </div>
          </div>`
        )
        .join("")
    : `<p class="muted">Aucun mini-rapport disponible.</p>`;

  return `
    <div class="container">
      <header>
        <h1>📊 ${escapeHtml(title)}</h1>
        <div class="subtitle">${escapeHtml(userStr)} — ${escapeHtml(dateStr)}</div>
      </header>

      <div class="card">
        <h2>📝 Résumé</h2>
        <div class="summary"><p>${summary || "<span class='muted'>Aucun résumé disponible.</span>"}</p></div>
      </div>

      <div class="card">
        <h2>📈 Statistiques</h2>
        <p>Total emails analysés : <strong>${escapeHtml(String(total))}</strong></p>
        <div class="grid">
          <div class="stat"><div class="value">${positive}</div><div>Positifs</div></div>
          <div class="stat"><div class="value">${negative}</div><div>Négatifs</div></div>
          <div class="stat"><div class="value">${neutral}</div><div>Neutres</div></div>
          <div class="stat"><div class="value">${other}</div><div>Autres</div></div>
        </div>
      </div>

      <div class="card">
        <h2>✨ Points récurrents</h2>
        ${highlightsHtml}
      </div>

      <div class="card">
        <h2>📬 Mini-rapports détaillés</h2>
        ${miniReportsHtml}
      </div>

      <footer>Rapport généré automatiquement par Resumail — ${escapeHtml(dateStr)}</footer>
    </div>
  `;
}

export const styledCss = `
  @page { margin: 18mm; }
  body { font-family: Inter, "Segoe UI", Roboto, sans-serif; color: #0f172a; background: #f8fafc; margin: 0; padding: 24px; }
  .container { max-width: 800px; margin: 0 auto; }
  header { text-align: center; margin-bottom: 18px; }
  h1 { color: #3730a3; margin: 0; font-size: 22px; }
  .subtitle { color: #64748b; margin-top: 6px; font-size: 12px; }
  .card { background: white; border-radius: 10px; padding: 18px; box-shadow: 0 6px 18px rgba(15,23,42,0.06); margin-bottom: 14px; }
  .summary { border-left: 4px solid #6366f1; padding-left: 12px; }
  h2 { color: #0f172a; font-size: 16px; margin: 0 0 8px 0; }
  p { margin: 6px 0; line-height: 1.5; color: #334155; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; margin-top: 8px; }
  .stat { background: #eef2ff; border-radius: 8px; padding: 10px; text-align: center; }
  .stat .value { font-weight: 700; font-size: 18px; color: #111827; }
  .highlight-item { background: #fff; border-left: 4px solid #6366f1; padding: 10px; border-radius: 8px; margin-bottom: 8px; font-size: 14px; color: #0f172a; }
  .highlight-item .meta { color: #64748b; font-weight: 500; font-size: 12px; margin-left: 8px; }
  .muted { color: #94a3b8; }
  footer { text-align: center; margin-top: 16px; color: #94a3b8; font-size: 12px; }
  .mini-report { background: #f9fafb; border-left: 4px solid #818cf8; padding: 10px; border-radius: 8px; margin-bottom: 8px; }
  .mini-report h3 { font-size: 14px; color: #4338ca; margin: 0 0 4px 0; }
  .mini-summary { font-size: 13px; color: #334155; line-height: 1.4; }
`;
