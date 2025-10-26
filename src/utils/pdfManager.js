import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { generateStyledHtml, styledCss } from "./reportTemplate.js";

export async function exportStyledPdf(report, gmailUser = "—") {
  if (!report) {
    alert("Aucun rapport à exporter !");
    return;
  }

  try {
    const html = generateStyledHtml(report, gmailUser);

    const container = document.createElement("div");
    container.innerHTML = `
      <div id="pdf-content" style="
        background: white;
        width: 794px; /* format A4 */
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
    const canvas = await html2canvas(pdfContent, {
      scale: 2.5,
      useCORS: true,
      backgroundColor: "#fff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

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

    pdf.save(`Resumail_Rapport_${new Date().toISOString().split("T")[0]}.pdf`);
    document.body.removeChild(container);
  } catch (err) {
    console.error("🚨 Erreur PDF:", err);
    alert("Erreur lors de la génération du PDF (voir console).");
  }
}
