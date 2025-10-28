    // src/pages/Filters.jsx
    import React, { useEffect, useState } from "react";
    import { useNavigate, useSearchParams } from "react-router-dom";
    import { Button } from "@/components/ui/Button";
    import { Input } from "@/components/ui/Input";
    import { Checkbox } from "@/components/ui/Checkbox";
    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
    import { supabase } from "../supabaseClient";
    import { Loader2 } from "lucide-react";

import { exportStyledPdf } from "../utils/pdfManager"; 

  import { API_URL } from "@/lib/api"; // adapte le chemin selon ton projet

    const CREDITS_PER_EMAIL = 1;

    async function getUserId() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Erreur auth supabase:", error.message);
        return null;
      }
      return user?.id || null;
    }

    export default function Filters() {
      const navigate = useNavigate();
      const [searchParams] = useSearchParams();
      const [gmailUser, setGmailUser] = useState(
        searchParams.get("user") || localStorage.getItem("gmailUser") || ""
      );

      const [emailsOriginal, setEmailsOriginal] = useState([]);
      const [emailsShown, setEmailsShown] = useState([]);
      
      const [selectedMap, setSelectedMap] = useState({});
      // report will contain merged info + id: { total_emails, classification, highlights, summary/report_text, id, finalReportId }
      const [report, setReport] = useState(null);
      const [loading, setLoading] = useState(false);
      const [analyzing, setAnalyzing] = useState(false);
      const [error, setError] = useState(null);
      const [creditsLeft, setCreditsLeft] = useState(null);

      const [filters, setFilters] = useState({
        ignoreSenders: "",
        ignoreKeywords: "",
        minWords: 0,
        maxWords: 10000,
        startDate: "",
        endDate: ""
      });

      const [fetchAllPages, setFetchAllPages] = useState(false);
      const [maxToFetch, setMaxToFetch] = useState(500);

      // ------------------- Utility -------------------
      function parseCreditsJson(obj) {
        if (!obj) return null;
        if (typeof obj === "number") return obj;
        if (typeof obj.credits === "number") return obj.credits;
        if (typeof obj.creditsLeft === "number") return obj.creditsLeft;
        if (obj.data && typeof obj.data.credits === "number") return obj.data.credits;
        if (obj.data && typeof obj.data.creditsLeft === "number") return obj.data.creditsLeft;
        if (obj.profile && typeof obj.profile.credits === "number") return obj.profile.credits;
        for (const k of Object.keys(obj)) {
          if (typeof obj[k] === "number") return obj[k];
        }
        return null;
      }

      async function fetchCreditsFromServer(userId) {
        if (!userId) return 0;
        try {
             const resp = await fetch(`${API_URL}/credits?userId=${encodeURIComponent(userId)}`);
          if (!resp.ok) return 0;
          const json = await resp.json();
          const parsed = parseCreditsJson(json);
          setCreditsLeft(parsed ?? 0);
          return parsed ?? 0;
        } catch (err) {
          console.error("[fetchCredits] error:", err);
          setCreditsLeft(0);
          return 0;
        }
      }

      // download PDF via fetch and force save
      const downloadReportPdfFile = async (id) => {
        try {
          if (!id) throw new Error("Missing report id");
        
          const res = await fetch(`${API_URL}/reports/${id}/pdf`);
          if (!res.ok) throw new Error('PDF download failed');
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `resumail-report-${id}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        } catch (err) {
          console.error("downloadReportPdfFile error:", err);
          alert("Erreur lors du téléchargement du PDF (voir console).");
        }
      };

      // ------------------- Effects -------------------
      useEffect(() => {
        if (!gmailUser) {
          navigate("/dashboard");
          return;
        }
        localStorage.setItem("gmailUser", gmailUser);

        (async () => {
          const userId = await getUserId();
          if (userId) {
            await fetchCreditsFromServer(userId);
          } else {
            setCreditsLeft(null);
          }
        })();
      }, [gmailUser, navigate]);

      // ------------------- Mailbox -------------------
   async function fetchMailbox() {
  if (!gmailUser) {
    console.warn("Aucun utilisateur Gmail défini, impossible de récupérer les emails.");
    setError("Utilisateur non défini. Connecte-toi d'abord via le Dashboard.");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const url = `${API_URL}/emails?user=${encodeURIComponent(gmailUser)}&maxResults=${maxToFetch}`;
    const res = await fetch(url);

    if (!res.ok) {
      const text = await res.text();
      console.error("Fetch emails failed:", res.status, text);
      throw new Error(`Erreur ${res.status} lors de la récupération des emails.`);
    }

    const data = await res.json();
    setEmailsOriginal(data.messages || []);
    setEmailsShown(data.messages || []);
    setSelectedMap({});
  } catch (err) {
    console.error("Fetch emails failed:", err);
    setError(
      "Impossible de récupérer les emails. Vérifie ton backend et la connexion de l'utilisateur."
    );
  } finally {
    setLoading(false);
  }
}
      // ------------------- Filters -------------------
      const applyFilters = () => {
        const filtered = emailsOriginal.filter((e) => {
          const fromCheck = !filters.ignoreSenders
            ? true
            : !filters.ignoreSenders
                .split(",")
                .some((s) => e.from.toLowerCase().includes(s.trim().toLowerCase()));

          const keywordCheck = !filters.ignoreKeywords
            ? true
            : !filters.ignoreKeywords
                .split(",")
                .some((k) => e.subject.toLowerCase().includes(k.trim().toLowerCase()));

          const wordCount = e.body?.split(/\s+/).length || 0;
          const wordCheck = wordCount >= filters.minWords && wordCount <= filters.maxWords;

          let dateCheck = true;
          if (filters.startDate) dateCheck = new Date(e.date) >= new Date(filters.startDate);
          if (filters.endDate) dateCheck = dateCheck && new Date(e.date) <= new Date(filters.endDate);

          return fromCheck && keywordCheck && wordCheck && dateCheck;
        });
        setEmailsShown(filtered);
      };

      const resetDisplayedFilters = () => setEmailsShown([...emailsOriginal]);
      const clearAllFiltersInputs = () =>
        setFilters({ ignoreSenders: "", ignoreKeywords: "", minWords: 0, maxWords: 10000, startDate: "", endDate: "" });

      const toggleSelectEmail = (id) => setSelectedMap((prev) => ({ ...prev, [id]: !prev[id] }));
      const selectAllShown = () => {
        const all = {};
        emailsShown.forEach((e) => (all[e.id] = true));
        setSelectedMap(all);
      };
      const deselectAll = () => setSelectedMap({});

      // ------------------- Analyze -------------------
async function analyzeSelection() {
  setAnalyzing(true);
  try {
    const userId = await getUserId();
    if (!userId) throw new Error("Utilisateur non connecté (Supabase)");

    const selectedEmails = emailsShown.filter((e) => selectedMap[e.id]);
    if (!selectedEmails.length) {
      alert("Aucun email sélectionné");
      return;
    }

    const serverCredits = await fetchCreditsFromServer(userId);
    const needed = selectedEmails.length * CREDITS_PER_EMAIL;
    const creditsAvailable = serverCredits ?? creditsLeft ?? 0;
    if (creditsAvailable < needed) {
      alert(`Pas assez de crédits (${creditsAvailable} disponibles, ${needed} nécessaires).`);
      return;
    }

    // ----- Analyse principale -----
    console.log("📦 Analyse request:", { userId, emails: selectedEmails }); // ✅ variable correcte
    const res = await fetch(`${API_URL}/analyzev2`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, emails: selectedEmails }), // ✅ cohérent avec ton backend
    });

    const ct = (res.headers.get("content-type") || "").toLowerCase();
    let data;
    if (ct.includes("application/json")) {
      data = await res.json();
    } else {
      const txt = await res.text();
      console.error("[analyzeSelection] /analyzev2 returned non-JSON:", txt.slice(0, 400));
      throw new Error("Le serveur a renvoyé du HTML au lieu du JSON (probablement une erreur backend).");
    }

    if (!res.ok) throw new Error(data?.error || "Analyse échouée");

    const final = data.finalReport || {};
    const finalId = data.finalReportId || data.final_report_id || null;

    let miniReportIds = data.miniReportIds || data.mini_report_ids || [];
    if (typeof miniReportIds === "string") {
      try {
        miniReportIds = JSON.parse(miniReportIds);
      } catch {
        miniReportIds = [];
      }
    }

    // ----- Récupération des mini-rapports -----
   const fetchMiniReports = async (ids) => {
  console.log("➡️ fetchMiniReports() called with:", ids);
  if (!ids || !ids.length) return [];
  const query = ids.map(encodeURIComponent).join(',');
  console.log("➡️ URL finale:", `${API_URL}/reports?ids=${query}`);
  const res = await fetch(`${API_URL}/reports/byIds?ids=${query}`); 
  if (!res.ok) throw new Error(`Erreur ${res.status} en récupérant les mini-rapports`);
  return await res.json();
};

    const miniReportsData = await fetchMiniReports(miniReportIds);

    // ----- Normalisation du rapport final -----
    const normalized = {
      id: finalId || final.id || null,
      finalReportId: finalId || final.id || null,
      total_emails: final.total_emails ?? final.totalEmails ?? selectedEmails.length,
      classification: final.classification ?? final.sentiments ?? {},
      highlights: final.highlights ?? [],
      summary: final.summary ?? final.report_text ?? "",
      report_text: final.summary ?? final.report_text ?? "",
      raw: final,
      miniReportIds,
      miniReports: miniReportsData,
    };

    setReport(normalized);

    // ----- Crédits -----
    const newCredits = data.creditsLeft ?? parseCreditsJson(data) ?? null;
    if (newCredits !== null) setCreditsLeft(newCredits);

    setSelectedMap({});
  } catch (err) {
    console.error("Analyse error:", err);
    alert(err.message || "Erreur pendant l’analyse (voir console)");
  } finally {
    setAnalyzing(false);
  }
}

      // ------------------- Print (styled HTML "mignon") -------------------
      const handlePrintReport = () => {
        if (!report) return;

        const title = "Resumail — Rapport";
        const dateStr = new Date().toLocaleString();
        const userStr = gmailUser || "—";
        const summary = (report.report_text || report.summary || "").replace(/\n/g, "<br/>");

        const highlightsHtml = (report.highlights || []).length
          ? (report.highlights || [])
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

        const html = `
          <html>
          <head>
            <meta charset="utf-8" />
            <title>${title}</title>
            <style>
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
            </style>
          </head>
          <body>
            <div class="container">
              <header>
                <h1>📊 Rapport Resumail</h1>
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
                  <div class="stat"><div class="value">${escapeHtml(String(positive))}</div><div>Positifs</div></div>
                  <div class="stat"><div class="value">${escapeHtml(String(negative))}</div><div>Négatifs</div></div>
                  <div class="stat"><div class="value">${escapeHtml(String(neutral))}</div><div>Neutres</div></div>
                  <div class="stat"><div class="value">${escapeHtml(String(other))}</div><div>Autres</div></div>
                </div>
              </div>

              <div class="card">
                <h2>✨ Points récurrents</h2>
                ${highlightsHtml}
              </div>

              <footer>Rapport généré automatiquement par Resumail — ${escapeHtml(dateStr)}</footer>
            </div>
          </body>
          </html>
        `;

        const w = window.open("", "_blank");
        if (!w) {
          alert("Impossible d'ouvrir une fenêtre d'impression (bloqueur de pop-up ?).");
          return;
        }
        w.document.write(html);
        w.document.close();
        w.focus();
        // give browser a small delay to render styles, then print
        setTimeout(() => {
          w.print();
          // optionally keep the window open for manual save / close
          // w.close();
        }, 300);
      };

      // small helper to escape HTML content
      function escapeHtml(str) {
        if (typeof str !== "string") return str;
        return str
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

    const styledCss = `
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

      .mini-report {
      background: #f9fafb;
      border-left: 4px solid #818cf8;
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 8px;
    }
    .mini-report h3 {
      font-size: 14px;
      color: #4338ca;
      margin: 0 0 4px 0;
    }
    .mini-summary {
      font-size: 13px;
      color: #334155;
      line-height: 1.4;
    }
    `;

      // ------------------- Render -------------------
return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500">
    {/* Header */}
    <header className="sticky top-0 z-30 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-white">
          Filtres — <span className="text-white/80">{gmailUser}</span>
        </h1>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm">
            {creditsLeft ?? 0} crédits
          </div>
          <Button
            onClick={() => navigate("/billing")}
            className="bg-white text-indigo-700 hover:bg-gray-100"
          >
            Acheter des crédits
          </Button>
        </div>
      </div>
    </header>

    <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Charger Gmail */}
      <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
        <div className="p-6 md:p-8">
          <h2 className="text-white text-lg font-semibold">📥 Charger la boîte Gmail</h2>
          <p className="text-white/80 text-sm mt-1">
            Récupère les {maxToFetch} derniers emails reçus depuis ta boîte connectée.
          </p>
          <div className="mt-4">
            <Button
              onClick={fetchMailbox}
              disabled={loading || !gmailUser}
              className="bg-white text-indigo-700 hover:bg-gray-100"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" /> Chargement…
                </>
              ) : (
                "Charger ma boîte"
              )}
            </Button>
            {error && <p className="text-red-200 text-sm mt-3">{error}</p>}
          </div>
        </div>
      </div>

      {/* Paramètres de filtrage */}
      <div className="rounded-2xl bg-white/90 backdrop-blur border border-white/60 shadow-md">
        <div className="p-6 md:p-8">
          <h2 className="text-gray-900 text-lg font-semibold">⚙️ Paramètres de filtrage</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Expéditeurs */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-indigo-700 font-semibold mb-1">Filtrage des expéditeurs</h3>
              <p className="text-gray-500 text-sm mb-3">
                Liste d’expéditeurs à ignorer (séparés par des virgules).
              </p>
              <Input
                placeholder="Ex: pub@, noreply@, newsletter@..."
                value={filters.ignoreSenders}
                onChange={(e) => setFilters({ ...filters, ignoreSenders: e.target.value })}
                className="bg-white"
              />
            </div>

            {/* Mots-clés */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-indigo-700 font-semibold mb-1">Filtrage par mots-clés</h3>
              <p className="text-gray-500 text-sm mb-3">Mots-clés à ignorer dans le contenu ou le sujet.</p>
              <Input
                placeholder="Ex: promo, urgent, vente..."
                value={filters.ignoreKeywords}
                onChange={(e) => setFilters({ ...filters, ignoreKeywords: e.target.value })}
                className="bg-white"
              />
            </div>

            {/* Dates */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-indigo-700 font-semibold mb-1">Filtrage par date</h3>
              <p className="text-gray-500 text-sm mb-3">Choisis la période à analyser.</p>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="bg-white"
                />
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="bg-white"
                />
              </div>
            </div>

            {/* Taille */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-indigo-700 font-semibold mb-1">Taille du message</h3>
              <p className="text-gray-500 text-sm mb-3">Filtrer selon le nombre de mots du contenu.</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minWords}
                  onChange={(e) => setFilters({ ...filters, minWords: parseInt(e.target.value || "0") })}
                  className="bg-white"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxWords}
                  onChange={(e) => setFilters({ ...filters, maxWords: parseInt(e.target.value || "10000") })}
                  className="bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <Button onClick={applyFilters} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Appliquer
            </Button>
            <Button variant="outline" onClick={resetDisplayedFilters} className="border-gray-300 text-gray-700">
              Réinitialiser
            </Button>
            <Button
              variant="secondary"
              onClick={clearAllFiltersInputs}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Vider
            </Button>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="rounded-2xl bg-white/90 backdrop-blur border border-white/60 shadow-md">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="text-gray-900 font-semibold">
              📑 Résultats ({emailsShown.length} affichés / {emailsOriginal.length} récupérés)
            </h2>
            <div className="flex flex-wrap gap-2">
              <Button onClick={selectAllShown} className="bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50">
                Tout sélectionner
              </Button>
              <Button onClick={deselectAll} variant="outline" className="border-gray-300 text-gray-700">
                Tout désélectionner
              </Button>
              <Button
                onClick={analyzeSelection}
                disabled={analyzing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {analyzing ? "⚡ Analyse en cours…" : "🤖 Analyser la sélection"}
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {emailsShown.map((e) => (
              <div
                key={e.id}
                className={[
                  "p-4 border rounded-xl shadow-sm flex gap-3 items-start transition",
                  "bg-white hover:bg-gray-50",
                  selectedMap[e.id] ? "border-indigo-300 ring-2 ring-indigo-100" : "border-gray-200",
                ].join(" ")}
              >
                <Checkbox
                  checked={!!selectedMap[e.id]}
                  onCheckedChange={() => toggleSelectEmail(e.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center gap-3">
                    <h4 className="font-semibold text-gray-900 line-clamp-1">{e.subject}</h4>
                    <span className="text-gray-500 text-sm shrink-0">{e.from}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                    {(e.body || "").slice(0, 300)}
                    {(e.body || "").length > 300 ? "…" : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rapport IA */}
      {report && (
        <div className="rounded-2xl bg-white/90 backdrop-blur border border-white/60 shadow-md">
          <div className="p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">📊 Rapport IA</h3>
              <p className="text-sm text-gray-500">Résumé et indicateurs clés</p>
            </div>

            {/* Résumé */}
            <section className="bg-white p-4 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">📝 Résumé</h4>
              <p className="text-gray-700 whitespace-pre-wrap">
                {report.report_text || report.summary || "—"}
              </p>
            </section>

            {/* Stats */}
            <section className="bg-white p-4 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">📈 Statistiques générales</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div className="bg-indigo-50 p-3 rounded-lg text-center border border-indigo-100">
                  <span className="block font-bold text-xl text-indigo-700">{report.total_emails ?? 0}</span>
                  <span className="text-gray-700">Total</span>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center border border-green-100">
                  <span className="block font-bold text-xl text-green-700">{report.classification?.positive ?? 0}</span>
                  <span className="text-gray-700">Positifs</span>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg text-center border border-yellow-100">
                  <span className="block font-bold text-xl text-yellow-700">{report.classification?.neutral ?? 0}</span>
                  <span className="text-gray-700">Neutres</span>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center border border-red-100">
                  <span className="block font-bold text-xl text-red-700">{report.classification?.negative ?? 0}</span>
                  <span className="text-gray-700">Négatifs</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-200">
                  <span className="block font-bold text-xl text-gray-800">{report.classification?.other ?? 0}</span>
                  <span className="text-gray-700">Autres</span>
                </div>
              </div>
            </section>

            {/* Points récurrents */}
            <section className="bg-white p-4 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">💡 Points récurrents</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {(report.highlights || []).length ? (
                  report.highlights.map((h, i) =>
                    typeof h === "string" ? (
                      <li key={i}>{h}</li>
                    ) : (
                      <li key={i}>
                        {h.text} {h.count ? `(${h.count})` : ""} {h.pct ? `— ${h.pct}` : ""}
                      </li>
                    )
                  )
                ) : (
                  <li className="text-gray-500">Aucun point marquant détecté.</li>
                )}
              </ul>
            </section>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => exportStyledPdf(report, gmailUser)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg px-4 py-2"
              >
                💾 Télécharger PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  </div>
);


    }