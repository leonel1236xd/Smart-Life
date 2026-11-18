import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Sale } from '../types';
import { formatDateBolivia, formatTimeBolivia } from './timezone';
import { formatCurrency, formatNumber } from './formatters';

export interface GeneratePdfReportOptions {
  sales: Sale[];
  startDateStr: string; // Formato YYYY-MM-DD
  endDateStr: string;   // Formato YYYY-MM-DD
  adminName: string;
}

/**
 * Genera y descarga un reporte oficial en PDF con las ventas del período
 */
export function generateSalesReportPdf(options: GeneratePdfReportOptions): void {
  const { sales, startDateStr, endDateStr, adminName } = options;

  // Formato carta (Letter): 215.9mm ancho x 279.4mm alto
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = 215.9;
  const pageHeight = 279.4;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 187.9 mm

  // Cálculos de resumen
  const totalCount = sales.length;
  const totalRevenue = sales.reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0);

  // Fecha y hora de emisión en Bolivia
  const now = new Date();
  const emisionDateStr = new Intl.DateTimeFormat('es-BO', {
    timeZone: 'America/La_Paz',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);

  // 1. Barra superior decorativa (Azul eléctrico Smart Life)
  doc.setFillColor(0, 132, 255);
  doc.rect(0, 0, pageWidth, 3.5, 'F');

  // 2. Encabezado principal: Datos de la tienda (Izquierda)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('SMART LIFE', marginX, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text('Computación · Tecnología · Innovación', marginX, 19.5);
  doc.text('Control y Gestión de Ventas', marginX, 23.5);

  // 3. Encabezado principal: Datos del reporte (Derecha)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(0, 102, 204);
  doc.text('REPORTE OFICIAL DE VENTAS', pageWidth - marginX, 15, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Emisión: ${emisionDateStr}`, pageWidth - marginX, 19.5, { align: 'right' });
  doc.text(`Generado por: ${adminName || 'Administrador'}`, pageWidth - marginX, 23.5, { align: 'right' });

  // 4. Recuadro de Parámetros del Reporte (Limpio y sin textos innecesarios)
  const paramBoxY = 28;
  const paramBoxHeight = 10;

  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, paramBoxY, contentWidth, paramBoxHeight, 2, 2, 'FD');

  // Contenido del recuadro
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Período auditado:', marginX + 4, paramBoxY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const formattedStart = formatDateBolivia(`${startDateStr}T12:00:00-04:00`);
  const formattedEnd = formatDateBolivia(`${endDateStr}T12:00:00-04:00`);
  doc.text(`${formattedStart}  al  ${formattedEnd}`, marginX + 32, paramBoxY + 6.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Total registros:', marginX + 115, paramBoxY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${formatNumber(totalCount)} venta${totalCount !== 1 ? 's' : ''}`, marginX + 138, paramBoxY + 6.5);

  // 5. Preparar filas de la tabla
  const tableRows = sales.map((sale, index) => {
    const productName = sale.notes
      ? `${sale.product_name}\nNota: ${sale.notes}`
      : sale.product_name;

    const fechaHora = `${formatDateBolivia(sale.created_at)} ${formatTimeBolivia(sale.created_at)}`;
    const vendedor = sale.profiles?.full_name || 'Empleado';
    const cant = `${sale.quantity} ud.`;
    const precio = sale.unit_price !== null ? formatCurrency(sale.unit_price) : '—';
    const total = sale.total_amount !== null ? formatCurrency(sale.total_amount) : '—';

    return [String(index + 1), fechaHora, productName, vendedor, cant, precio, total];
  });

  // 6. Generar Tabla con jspdf-autotable
  autoTable(doc, {
    startY: paramBoxY + paramBoxHeight + 4,
    head: [['#', 'Fecha y Hora', 'Producto / Accesorio', 'Vendedor', 'Cant.', 'P. Unit.', 'Total']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42], // Slate 900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
      cellPadding: 2.2,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59], // Slate 800
      cellPadding: 2,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate 50
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 31, halign: 'left' },
      2: { cellWidth: 'auto', halign: 'left' },
      3: { cellWidth: 30, halign: 'left' },
      4: { cellWidth: 16, halign: 'center' },
      5: { cellWidth: 23, halign: 'right' },
      6: { cellWidth: 26, halign: 'right', fontStyle: 'bold', textColor: [5, 150, 105] }, // Esmeralda
    },
    margin: { left: marginX, right: marginX, top: 20, bottom: 20 },
    didDrawPage: (_data) => {
      const curPage = doc.getNumberOfPages();
      if (curPage > 1) {
        doc.setFillColor(0, 132, 255);
        doc.rect(0, 0, pageWidth, 2.5, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text('Smart Life · Reporte Oficial de Ventas', marginX, 8);
      }
    },
  });

  // Obtener posición final de la tabla
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastTableY = (doc as any).lastAutoTable?.finalY || 100;

  // 7. Bloque de TOTAL GENERADO resaltado ubicado debajo de la columna Total
  const boxWidth = 56;
  const boxHeight = 15;
  const boxX = pageWidth - marginX - boxWidth;
  let boxY = lastTableY + 4;

  // Si no cabe en la página actual, agregamos una nueva página
  if (boxY + boxHeight > pageHeight - 16) {
    doc.addPage();
    boxY = 20;
  }

  // Recuadro resaltado con fondo y borde esmeralda suave
  doc.setFillColor(240, 253, 244); // Esmeralda suave (#f0fdf4)
  doc.setDrawColor(16, 185, 129);  // Borde verde esmeralda (#10b981)
  doc.setLineWidth(0.4);
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, 'FD');

  // Texto: TOTAL GENERADO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text('TOTAL GENERADO', boxX + boxWidth - 4, boxY + 5.5, { align: 'right' });

  // Monto resaltado en Bolivianos
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(5, 150, 105); // Verde esmeralda (#059669)
  doc.text(formatCurrency(totalRevenue), boxX + boxWidth - 4, boxY + 12, { align: 'right' });

  // 8. Pie de página en todas las páginas (Número de página "Página X de Y" y membrete)
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Línea divisoria del pie
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    // Texto informativo del pie
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(
      'Smart Life · Computación y Tecnología · Documento oficial de respaldo administrativo',
      marginX,
      pageHeight - 7
    );

    // Paginación
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - marginX, pageHeight - 7, {
      align: 'right',
    });
  }

  // 9. Descargar directamente al dispositivo
  const fileName = `Reporte_Ventas_SmartLife_${startDateStr}_al_${endDateStr}.pdf`;
  doc.save(fileName);
}
