// src/utils/reportTemplate.js
export const styledCss = `
  body {
    font-family: 'Inter', sans-serif;
    color: #111;
    background: white;
  }
  .container {
    padding: 20px 40px;
  }
  .card {
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 20px;
  }
  .muted { color: #888; }
  .grid {
    display: flex;
    gap: 12px;
  }
  .stat {
    flex: 1;
    text-align: center;
  }
`;

export const generateStyledHtml = (report) => {
  if (!report) return "<p>Aucun rapport disponible.</p>";

  const summary = report.report_text?.replace(/\n/g, "<br/>") || "—";
  const classification = report.classification || report.sentiment_overall || {};
  const { positive = 0, neutral = 0, negative = 0, other = 0 } = classification;

  return `
    <div class="container">
      <header>
        <h1>📊 Rapport Resumail</h1>
        <div class="muted">${new Date(report.created_at).toLocaleString("fr-FR")}</div>
      </header>

      <div class="card">
        <h2>📝 Résumé</h2>
        <p>${summary}</p>
      </div>

      <div class="card">
        <h2>📈 Statistiques</h2>
        <div class="grid">
          <div class="stat"><div class="value">${positive}</div><div>Positifs</div></div>
          <div class="stat"><div class="value">${neutral}</div><div>Neutres</div></div>
          <div class="stat"><div class="value">${negative}</div><div>Négatifs</div></div>
          <div class="stat"><div class="value">${other}</div><div>Autres</div></div>
        </div>
      </div>
    </div>
  `;
};