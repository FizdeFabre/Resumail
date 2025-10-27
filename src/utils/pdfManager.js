import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { generateStyledHtml, styledCss } from "./reportTemplate.js";

/**
 * 🔧 Normalise la structure des rapports pour uniformiser l'export PDF.
 * Garantit que les mini-rapports, résumés et stats soient toujours disponibles
 * sous les bons noms, même si la source diffère (Dashboard, Analyse, etc.)
 */
export function normalizeReportData(raw = {}) {
  if (!raw) return {};

  const classification =
    raw.classification ||
    raw.sentiment_overall ||
    raw.stats ||
    {};

  const miniReports =
    raw.mini_reports ||
    raw.miniReports ||
    raw.mini_report ||
    raw.sub_reports ||
    [];

  const normalized = {
    summary: raw.report_text || raw.summary || "",
    classification: {
      positive: classification.positive || 0,
      neutral: classification.neutral || 0,
      negative: classification.negative || 0,
      other: classification.other || 0,
    },
    total_emails:
      raw.total_emails ||
      raw.total ||
      classification.total ||
      miniReports.length ||
      0,
    highlights: raw.highlights || raw.keywords || [],
    mini_reports: miniReports.map((r, i) => ({
      title: r.title || r.label || `Mini-rapport ${i + 1}`,
      text: r.text || r.summary || r.content || "",
    })),
  };

  return normalized;
}

/**
 * 📄 Génération et export d’un PDF stylé
 */
export async function exportStyledPdf(rawReport, gmailUser = "—") {
  if (!rawReport) {
    alert("Aucun rapport à exporter !");
    return;
  }

  const report = normalizeReportData(rawReport);

  try {
    const html = generateStyledHtml(report, gmailUser);

    // 🧱 Construction invisible du contenu
    const container = document.createElement("div");
    container.innerHTML = `
      <div id="pdf-content" style="
        background: white;
        width: 794px; /* A4 à 96 dpi */
        padding: 40px;
        font-family: 'Inter', sans-serif;
      ">
        <style>${styledCss}</style>
        ${html}
      </div>`;
    container.style.position = "fixed";
    container.style.top = "-9999px";
    document.body.appendChild(container);

    const pdfContent = container.querySelector("#pdf-content");

    // 🎨 Capture du HTML
    const canvas = await html2canvas(pdfContent, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fff",
      scrollX: 0,
      scrollY: 0,
      windowWidth: pdfContent.scrollWidth,
      windowHeight: pdfContent.scrollHeight,
    });

    // 🧾 Conversion en PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 0;
    let heightLeft = imgHeight;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`Resumail_Report_${new Date().toISOString().split("T")[0]}.pdf`);
    document.body.removeChild(container);
  } catch (err) {
    console.error("🚨 Erreur PDF:", err);
    alert("Erreur lors de la génération du PDF (voir console).");
  }
}
