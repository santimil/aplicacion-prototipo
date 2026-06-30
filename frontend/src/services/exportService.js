import { updateOrder, deleteOrder, getUsuarios, getControlByOrder, sendOrderToControl, entregarOrden } from "../services/api";
import { PCOLORS }
  from "../constant/orderConstants";
import { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import { supabase } from "../supabaseClient";
import { AREAS } from "../constant/orderConstants";
import { getHistorial } from "../services/api"

export async function exportToExcel(order) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Orden");

    sheet.addRow(["Número", "Cliente", "Trabajo", "Área", "Prioridad", "Fecha Ingreso", "Fecha Entrega", "Días Asignados"]);
    sheet.addRow([order.numero, order.cliente, order.trabajo, order.area, order.prioridad, order.fecha_ingreso, order.fecha_entrega, order.dias_asignados]);

    sheet.columns.forEach((column, i) => {
      let maxLength = 10;

      column.eachCell({ includeEmpty: true }, cell => {
        const length = cell.value ? cell.value.toString().length : 0;
        if (length > maxLength) {
          maxLength = length;
        }
      });

      // limitar ancho máximo (clave)
      column.width = Math.min(maxLength + 2, 30);
    });

    sheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(new Blob([buffer]), `orden_${order.numero}.xlsx`);
  }

  export async function exportPendingOrdersToExcel(orders) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Orden");

    const headers = [
      "Número",
      "Cliente",
      "Trabajo",
      "Prioridad",
      "Fecha Ingreso",
      "Fecha Entrega",
      "Días Asignados",
      ...AREAS.map(area => area.label)
    ];

    sheet.addRow(headers);

    const headerRow = sheet.getRow(1);

    // Poner toda la fila en negrita
    headerRow.font = { bold: true };

    function formatFecha(fecha) {
        if (!fecha) return "";

        const d = new Date(fecha);

        return d.toLocaleString("es-UY", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    // Colorear solo las columnas de áreas
    AREAS.forEach((area, index) => {
      const cell = headerRow.getCell(index + 8); // 4 = empieza en la columna D

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: `FF${area.color.replace("#", "")}`
        }
      };
    });

    for (const order of orders) {

        const row = [
            order.numero,
            order.cliente,
            order.trabajo,
            order.prioridad,
            order.fecha_ingreso,
            order.fecha_entrega,
            order.dias_asignados
        ];

        const historial = await getHistorial(order.id);
        console.log("historial", historial);
        const areasVisitadas = {};

        historial.forEach(h => {
            areasVisitadas[h.area_anterior] = formatFecha(h.timestamp);
        });

        console.log("areasV", areasVisitadas);

        AREAS.forEach(area => {
            if (order.area === area.id) {
                row.push(area.icon);          // Área actual
            } else {
                row.push(areasVisitadas[area.id] || "");
            }
        });

        sheet.addRow(row);

    };

    sheet.columns.forEach((column, i) => {
      let maxLength = 10;

      column.eachCell({ includeEmpty: true }, cell => {
        const length = cell.value ? cell.value.toString().length : 0;
        if (length > maxLength) {
          maxLength = length;
        }
      });

      // limitar ancho máximo (clave)
      column.width = Math.min(maxLength + 2, 30);
    });

    sheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(new Blob([buffer]), `ordenes_pendientes.xlsx`);
  }

  export function exportToPDF(order, historial = []) {
    console.log("orden pdf", order);
    const doc = new jsPDF();

    let y = 15;

    // 🔹 Título
    doc.setFontSize(18);
    doc.text("ORDEN DE TRABAJO", 105, y, { align: "center" });

    y += 10;

    doc.setDrawColor(200);
    doc.line(10, y, 200, y); // línea separadora

    y += 10;

    // 🔹 Datos principales
    doc.setFontSize(12);

    doc.text(`Número: ${order.numero}`, 10, y);
    doc.text(`Cliente: ${order.cliente}`, 120, y);

    y += 10;

    // 🔹 Trabajo (bloque grande)
    doc.setFontSize(13);
    doc.text("Trabajo:", 10, y);

    y += 6;

    doc.setFontSize(10);

    const trabajoTexto = doc.splitTextToSize(
      order.trabajo || "-",
      180
    );

    doc.text(trabajoTexto, 10, y);

    y += trabajoTexto.length * 6 + 5;

    // 🔹 Caja de detalles
    doc.setDrawColor(180);

    const startY = y;

    let boxHeight = 0;
    boxHeight += 8;
    boxHeight += 8;
    boxHeight += 8;
    boxHeight += 8;

    doc.rect(10, startY, 190, boxHeight);

    y = startY + 8;

    doc.setFontSize(11);

    doc.text(`Área: ${order.area}`, 15, y);

    const color = PCOLORS[order.prioridad] || "#FFFFFF";

    doc.setTextColor(color);
    doc.text(`Prioridad: ${order.prioridad}`, 120, y);

    doc.setTextColor(0);

    y += 8;

    doc.text(`Fecha Ingreso: ${order.fecha_ingreso || "-"}`, 15, y);
    doc.text(`Fecha Entrega: ${order.fecha_entrega || "-"}`, 120, y);

    y += 8;

    doc.text(`Días Asignados: ${order.dias_asignados || "-"}`, 15, y);

    // 👉 IMPORTANTE: salir de la caja correctamente
    y = startY + boxHeight;

    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    // 🔹 HISTORIAL

    y += 15;

    doc.setFontSize(14);
    doc.setTextColor(50);
    doc.text("Historial de movimientos", 10, y);
    doc.setTextColor(0);

    y += 6;

    const histStartY = y;

    y += 8;

    doc.setFontSize(10);

    historial.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    historial.forEach(h => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      const fecha = new Date(h.timestamp).toLocaleString();

      // 🔹 punto tipo timeline
      doc.setFillColor(120);
      const textY = y;
      doc.circle(12, textY - 1, 1.2, "F");

      // 🔹 fecha (gris)
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(fecha, 16, y);

      y += 5;

      // 🔹 movimiento (más grande)
      doc.setFontSize(11);

      doc.setTextColor(100);
      doc.text(h.area_anterior, 18, y);

      const offset = doc.getTextWidth(h.area_anterior);

      doc.setTextColor(0);
      doc.text(" >>>", 18 + offset, y);

      const arrowOffset = doc.getTextWidth(" >>> ");

      doc.setTextColor(255, 140, 0);
      doc.text(h.area_nueva, 18 + offset + arrowOffset, y);

      doc.setFontSize(9);
      doc.setTextColor(110);

      y += 5;

      doc.text(
        `trabajado por: ${h.usuario?.nombre || "-"}`,
        22,
        y
      );

      doc.setTextColor(0);

      y += 10; // más espacio entre items
    });

    const histEndY = y;

    doc.setDrawColor(200);
    if (histEndY - histStartY < 200) {
      doc.rect(10, histStartY, 190, histEndY - histStartY);
    }

    // 🔹 Footer
    doc.setFontSize(8);
    doc.setTextColor(120);

    doc.text(
      `Generado: ${new Date().toLocaleString()}`,
      10,
      280
    );

    // Guardar
    doc.save(`orden_${order.numero}.pdf`);
  }