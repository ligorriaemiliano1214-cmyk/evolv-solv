import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SolucionParsed, parseSoluciones, hasSoluciones } from "./parse-soluciones";
import { ChatMessage } from "./types";

export function generateReport(titulo: string, messages: ChatMessage[]) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // --- Header ---
  doc.setFillColor(24, 24, 27); // zinc-900
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setFillColor(245, 158, 11); // amber-500
  doc.roundedRect(margin, 8, 8, 8, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("EVOLV Solv", margin + 12, 14.5);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Reporte de Soluciones Constructivas", margin + 12, 19);

  // Title
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(titulo, margin, 29);

  // Date
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(161, 161, 170);
  const date = new Date().toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(date, pageWidth - margin - doc.getTextWidth(date), 29);

  y = 42;

  // --- Collect all solutions from assistant messages ---
  const allSoluciones: SolucionParsed[] = [];
  let diagnostico = "";

  for (const msg of messages) {
    if (msg.role === "assistant" && hasSoluciones(msg.content)) {
      const parsed = parseSoluciones(msg.content);
      if (!diagnostico && parsed.antes) diagnostico = parsed.antes;
      allSoluciones.push(...parsed.soluciones);
    }
  }

  // --- Diagnóstico ---
  if (diagnostico) {
    doc.setTextColor(24, 24, 27);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Diagnóstico", margin, y);
    y += 5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(82, 82, 91);
    const diagLines = doc.splitTextToSize(diagnostico, contentWidth);
    doc.text(diagLines, margin, y);
    y += diagLines.length * 3.5 + 6;
  }

  // --- Tabla comparativa ---
  if (allSoluciones.length > 0) {
    doc.setTextColor(24, 24, 27);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Comparativa de Soluciones", margin, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: [24, 24, 27],
        textColor: [255, 255, 255],
        fontSize: 7,
        fontStyle: "bold",
        cellPadding: 2.5,
      },
      bodyStyles: {
        fontSize: 6.5,
        cellPadding: 2,
        textColor: [63, 63, 70],
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 18, halign: "center" },
        2: { cellWidth: 18, halign: "center" },
        3: { cellWidth: 28 },
        4: { cellWidth: 20, halign: "center" },
        5: { cellWidth: 20, halign: "center" },
        6: { cellWidth: 20, halign: "center" },
      },
      head: [["Solución", "Costo", "Complejidad", "Precio/m²", "Durabilidad", "Tiempo", "Modernidad"]],
      body: allSoluciones.map((s) => [
        s.nombre,
        s.costo,
        s.complejidad,
        s.costo_m2 || "-",
        s.durabilidad,
        s.tiempo,
        s.modernidad,
      ]),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // --- Detalle de cada solución ---
  for (let i = 0; i < allSoluciones.length; i++) {
    const sol = allSoluciones[i];

    // Check if we need a new page
    if (y > 250) {
      doc.addPage();
      y = margin;
    }

    // Solution header
    doc.setFillColor(245, 158, 11);
    doc.roundedRect(margin, y - 1, 5, 5, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}`, margin + 1.7, y + 2.5);

    doc.setTextColor(24, 24, 27);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(sol.nombre, margin + 8, y + 3);
    y += 8;

    // Description
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(82, 82, 91);
    const descLines = doc.splitTextToSize(sol.descripcion, contentWidth);
    doc.text(descLines, margin, y);
    y += descLines.length * 3 + 3;

    // Mano de obra
    if (sol.mano_de_obra) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(55, 48, 163);
      doc.text("Mano de obra: ", margin, y);
      doc.setFont("helvetica", "normal");
      const moX = margin + doc.getTextWidth("Mano de obra: ");
      doc.setTextColor(82, 82, 91);
      const moLines = doc.splitTextToSize(sol.mano_de_obra, contentWidth - (moX - margin));
      doc.text(moLines, moX, y);
      y += moLines.length * 3 + 2;
    }

    // Materiales
    if (sol.materiales.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(24, 24, 27);
      doc.text("Materiales:", margin, y);
      y += 3;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(82, 82, 91);
      for (const mat of sol.materiales) {
        doc.text(`• ${mat}`, margin + 3, y);
        y += 3;
      }
      y += 1;
    }

    // Ventajas / Desventajas side by side
    const halfWidth = contentWidth / 2 - 2;

    if (sol.ventajas.length > 0 || sol.desventajas.length > 0) {
      const ventajasY = y;

      if (sol.ventajas.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(22, 163, 74);
        doc.text("Ventajas", margin, y);
        y += 3;
        doc.setFont("helvetica", "normal");
        for (const v of sol.ventajas) {
          const vLines = doc.splitTextToSize(`✓ ${v}`, halfWidth);
          doc.text(vLines, margin, y);
          y += vLines.length * 3;
        }
      }

      let desY = ventajasY;
      if (sol.desventajas.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(220, 38, 38);
        doc.text("Desventajas", margin + halfWidth + 4, desY);
        desY += 3;
        doc.setFont("helvetica", "normal");
        for (const d of sol.desventajas) {
          const dLines = doc.splitTextToSize(`✗ ${d}`, halfWidth);
          doc.text(dLines, margin + halfWidth + 4, desY);
          desY += dLines.length * 3;
        }
      }

      y = Math.max(y, desY) + 3;
    }

    // Clima
    if (sol.clima) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(14, 116, 144);
      doc.text("Clima: ", margin, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(82, 82, 91);
      const cLines = doc.splitTextToSize(sol.clima, contentWidth - doc.getTextWidth("Clima: "));
      doc.text(cLines, margin + doc.getTextWidth("Clima: "), y);
      y += cLines.length * 3 + 2;
    }

    // Separator
    doc.setDrawColor(228, 228, 231);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
  }

  // --- Footer ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageCount = (doc as any).getNumberOfPages() as number;
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(6.5);
    doc.setTextColor(161, 161, 170);
    doc.text(
      `EVOLV Solv — Reporte generado el ${date} — Página ${p} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  doc.save(`EVOLV-Solv_${titulo.replace(/\s+/g, "_").substring(0, 40)}.pdf`);
}
