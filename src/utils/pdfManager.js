import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { generateStyledHtml, styledCss } from "./reportTemplate.js"

export async function exportStyledPdf(report, gmailUser = "—") {
  if (!report) {
    alert("Aucun rapport à exporter !");
    return;
  }

  try {
    // 1️⃣ Génération du HTML complet
    const html = generateStyledHtml(report, gmailUser);

    // 2️⃣ Insertion dans le DOM (zone cachée)
    const container = document.createElement("div");
    container.innerHTML = `
      <div id="pdf-content" style="
        background: white;
        width: 794px; /* largeur A4 (96 DPI) */
        padding: 50px 60px;
        box-sizing: border-box;
        font-family: 'Inter', sans-serif;
        color: #111;
      ">
        <style>${styledCss}</style>
        ${html}
      </div>
    `;
    container.style.position = "fixed";
    container.style.top = "-9999px";
    container.style.left = "-9999px";
    document.body.appendChild(container);

    const pdfContent = container.querySelector("#pdf-content");

    // 3️⃣ Capture haute résolution
    const canvas = await html2canvas(pdfContent, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: pdfContent.scrollWidth,
      windowHeight: pdfContent.scrollHeight,
    });

    // 4️⃣ Conversion en image
    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const pdf = new jsPDF({
      orientation: "p",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 0;
    let heightLeft = imgHeight;

    // 5️⃣ Ajout progressif (évite les “coupures” entre pages)
    while (heightLeft > 0) {
      const sourceY = imgHeight - heightLeft;
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.min(canvas.height, (pageHeight * canvas.width) / pageWidth);

      const pageCtx = pageCanvas.getContext("2d");
      pageCtx.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        pageCanvas.height,
        0,
        0,
        canvas.width,
        pageCanvas.height
      );

      const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.98);
      if (position > 0) pdf.addPage();
      pdf.addImage(pageImgData, "JPEG", 0, 0, pageWidth, pageHeight);

      heightLeft -= pageHeight;
      position += pageHeight;
    }

    // 6️⃣ Téléchargement
    pdf.save(`Resumail_Report_${new Date().toISOString().split("T")[0]}.pdf`);

    // Nettoyage
    document.body.removeChild(container);
  } catch (err) {
    console.error("🚨 Erreur PDF:", err);
    alert("Erreur lors de la génération du PDF (voir console).");
  }
}
