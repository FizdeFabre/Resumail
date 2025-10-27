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
        width: 794px; /* format A4 largeur px à 96dpi */
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

    // Capture fidèle du DOM
    const canvas = await html2canvas(pdfContent, {
      scale: 2, // assez précis sans bug de coupure
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: pdfContent.scrollWidth,
      windowHeight: pdfContent.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");

    // Paramètres du PDF
    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Conversion px -> points
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 0;
    let heightLeft = imgHeight;

    // Première page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Pages suivantes sans coupure ni saut visuel
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