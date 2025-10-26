// src/utils/pdfManager.js
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Exporte un rapport Resumail en PDF stylé.
 * @param {Object} report - Données du rapport à exporter
 * @param {Function} generateStyledHtml - Fonction qui génère le HTML complet (retourne une string)
 * @param {String} styledCss - Chaîne de style CSS utilisée pour le rendu
 * @param {String} filename - Nom du fichier PDF (sans extension)
 */
export async function exportStyledPdf(report, generateStyledHtml, styledCss, filename = "Resumail_Rapport") {
  try {
    if (!report) {
      alert("Aucun rapport à exporter !");
      return;
    }

    // 🧩 1. Génération du HTML complet
    const html = generateStyledHtml();
    if (!html || !html.trim()) {
      throw new Error("HTML vide pour le PDF");
    }

    // 🧩 2. Conteneur temporaire invisible
    const container = document.createElement("div");
    container.innerHTML = `
      <div id="pdf-content" style="
        background: white;
        width: 794px;
        padding: 40px;
        color: #111;
        font-family: 'Inter', sans-serif;
      ">
        <style>${styledCss}</style>
        ${html}
      </div>
    `;
    container.style.position = "fixed";
    container.style.top = "-9999px";
    document.body.appendChild(container);

    const pdfContent = container.querySelector("#pdf-content");

    // 🧩 3. Capture haute résolution
    const canvas = await html2canvas(pdfContent, {
      scale: 2.5,
      useCORS: true,
      backgroundColor: "#fff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");

    // 🧩 4. Génération PDF jsPDF
    const pdf = new jsPDF({
      orientation: "p",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}_${new Date().toISOString().split("T")[0]}.pdf`);

    // Nettoyage
    document.body.removeChild(container);
  } catch (err) {
    console.error("🚨 Erreur PDF:", err);
    alert("Erreur lors de la génération du PDF (voir console).");
  }
}