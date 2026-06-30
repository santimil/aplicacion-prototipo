import fs from "fs";
import xlsx from "xlsx";
import { processImage } from "./ocrController.js";
import { exec } from "child_process";
import path from "path";


export async function handleFile(req, res) {
  const file = req.file;

  try {
    let result;

    // 🖼️ IMAGEN → OCR
    if (file.mimetype.startsWith("image/")) {
        result = await processImage(file);
    }

    // 📄 PDF
    else if (file.mimetype === "application/pdf") {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      
      const dataBuffer = fs.readFileSync(file.path);
      const uint8Array = new Uint8Array(dataBuffer);

      const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
      const pdf = await loadingTask.promise;

      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        const strings = content.items.map(item => item.str);
        fullText += strings.join(" ") + "\n";
      }

      if (fullText.trim().length > 50) {
        console.log("📄 PDF con texto → parse directo");
        result = parseTextToOrder(fullText);
      } else {
        console.log("📄 PDF escaneado → convertir a imágenes");

        const images = await convertPdfToImages(file.path);

        const results = [];

        for (const imgPath of images) {
          const fakeFile = {
            path: imgPath,
            mimetype: "image/jpeg"
          };

          const ocrResult = await processImage(fakeFile);
          results.push(ocrResult);

          // 🧹 LIMPIEZA
          try {
            fs.unlinkSync(imgPath);
          } catch (err) {
            console.warn("Error limpiando archivos:", err);
          }
        }

        // 👇 combinar resultados si hay varias páginas
        result = results[0]; // simple por ahora
      }
      fs.unlinkSync(file.path);
    }

    // 📊 EXCEL
    else if (
      file.mimetype.includes("spreadsheet") ||
      file.mimetype.includes("excel")
    ) {
      const workbook = xlsx.readFile(file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet, {
        header: 1
      });

      const headerIndex = rows.findIndex(row =>
          row.some(cell =>
              typeof cell === "string" &&
              cell.toLowerCase().includes("cliente")
          )
      );

      const headers = rows[headerIndex];
      const dataRows = rows.slice(headerIndex + 1);

      const json = dataRows.map(row => {
        const obj = {};

        headers.forEach((header, index) => {
          obj[header] = row[index];
        });

        return obj;
      });

      const parsed = parseExcelToOrder(json);

      return res.json({
        data: parsed
      });
    }

    else {
      return res.status(400).json({ error: "Tipo no soportado" });
    }

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error procesando archivo" });
  }
}

function normalizeKey(key) {
    return key
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // quitar tildes
      .trim();
  }

  function normalizeRow(row) {
    const newRow = {};

    for (const key in row) {
      newRow[normalizeKey(key)] = row[key];
    }

    return newRow;
  }

  function validateRow(row) {
    if (!row.numero || !row.cliente || !row.trabajo) {
        return false;
    }
    return true;
  }

  function parseStandardExcel(rows) {
    return rows
      .map(row => ({
        numero: row["numero"] || "",
        cliente: row["cliente"] || "",
        trabajo: row["trabajo"] || "",

        area: row["area"] || "",
        prioridad: row["prioridad"] || "",

        fechaIngreso: parseExcelDate(row["fecha ingreso"]),
        fechaEntrega: parseExcelDate(row["fecha entrega"]),

        diasAsignados:
          row["dias asignados"]?.toString() || "0",

        notas: "",
        cuestionario: {}
      }))
      .filter(validateRow);
  }

  function parseVentasExcel(rows) {
    const grouped = {};

    for (const row of rows) {
      const numero =
        row["nº"] ||
        row["n°"] ||
        row["no"] ||
        "";

      if (!numero) continue;

      if (!grouped[numero]) {
        grouped[numero] = [];
      }

      grouped[numero].push(row);
    }

    const orders = [];

    for (const [numero, orderRows] of Object.entries(grouped)) {

      const multipleRows = orderRows.length > 1;

      orderRows.forEach((row, index) => {

        const articulo = (row.articulo || "")
          .replace(/\s+/g, " ")
          .trim();

        const descripcion = (row.descripcion || "")
          .replace(/\s+/g, " ")
          .trim();

        const cantidad = (row.cantidad || "")
          .toString()
          .trim();

        const fechaIngreso = parseExcelDate(row.fecha);

        let numeroFinal = numero.toString();

        if (multipleRows) {
          const letra =
            String.fromCharCode(65 + index); // A, B, C...
          numeroFinal = `${numero}-${letra}`;
        }

        orders.push({
          numero: numeroFinal,

          cliente: row.cliente || "",

          trabajo:
            `- ${articulo} - ${descripcion} X ${cantidad}`,

          area: "inicio",
          prioridad: "baja",

          fechaIngreso,
          fechaEntrega: "",
          diasAsignados: "0",

          notas: "",
          cuestionario: {}
        });
      });
    }

    return orders;
  }

  function calculateAssignedDays(fechaInicio, fechaFin) {
    if (!fechaInicio || !fechaFin) return "0";

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    const diffMs = fin - inicio;

    const diffDays = Math.round(
        diffMs / (1000 * 60 * 60 * 24)
    );

    return Math.max(diffDays, 0).toString();
  }

  function parsePlanillaTrabajoExcel(rows) {

    return rows
        .map(row => ({
            numero: (
                row["n° ot"] ||
                row["nº ot"] ||
                row["n°"] ||
                ""
            ).toString(),

            cliente: row["cliente"] || "",

            trabajo: row["detalle"] || "",

            prioridad: "baja",

            fechaIngreso: parseExcelDate(
                row["f. de entrada"]
            ),

            area: "inicio",

            diasAsignados: "0",

            fechaEntrega: "",

            notas: row["observaciones"] || "",

            cuestionario: {}
        }))
        .filter(validateRow);
  }

  function parseExcelToOrder(rows) {
    const normalizedRows = rows.map(normalizeRow);

    console.log("Primera fila:", normalizedRows[0]);

    console.log(
      "isVentasFormat:",
      isVentasFormat(normalizedRows[0])
    );

    console.log(
      "isPlanillaFormat:",
      isPlanillaTrabajoFormat(normalizedRows[0])
    );

    if (
      normalizedRows.length > 0 &&
      isVentasFormat(normalizedRows[0])
    ) {
      console.log("USANDO PARSER VENTAS");
      return parseVentasExcel(normalizedRows);
    }

    if (normalizedRows.length > 0 && isPlanillaTrabajoFormat(normalizedRows[0])) {
      console.log("USANDO PARSER PLANILLA");
      return parsePlanillaTrabajoExcel(normalizedRows);
    }

    console.log("USANDO PARSER STANDARD");

    return parseStandardExcel(normalizedRows);
  }

    function isVentasFormat(row) {
      return (
        row["cliente"] !== undefined &&
        row["descripcion"] !== undefined &&
        row["articulo"] !== undefined &&
        row["cantidad"] !== undefined &&
        (
          row["nº"] !== undefined ||
          row["n°"] !== undefined
        )
      );
    }

    function isPlanillaTrabajoFormat(row) {
        return (
            row["cliente"] !== undefined &&
            row["detalle"] !== undefined &&
            (
                row["n° ot"] !== undefined ||
                row["nº ot"] !== undefined ||
                row["n°"] !== undefined
            )
        );
    }

    function parseExcelDate(value) {
        if (!value) return "";

        // 🟢 ya es string (ej: "2026-03-26")
        if (typeof value === "string") return value;

        // 🔵 es número (Excel serial)
        if (typeof value === "number") {
            const date = xlsx.SSF.parse_date_code(value);

            if (!date) return "";

            const yyyy = date.y;
            const mm = String(date.m).padStart(2, "0");
            const dd = String(date.d).padStart(2, "0");

            return `${yyyy}-${mm}-${dd}`;
        }

        return "";
    }

    function extract(text, regex) {
      const match = text.match(regex);
      return match ? match[1].trim() : "";
    }

    function parseTextToOrder(text) {
      // 👇 limpiar espacios raros
      const clean = text.replace(/\s+/g, " ");

      return {
        numero: extract(clean, /Número:\s*(.*?)\s*Cliente:/i),
        cliente: extract(clean, /Cliente:\s*(.*?)\s*Trabajo:/i),

        trabajo: extract(clean, /Trabajo:\s*(.*?)\s*Área:/i),

        area: extract(clean, /Área:\s*(\w+)/i),
        prioridad: extract(clean, /Prioridad:\s*(\w+)/i),

        fechaIngreso: extract(clean, /Fecha Ingreso:\s*([\d-]+)/i),
        fechaEntrega: extract(clean, /Fecha Entrega:\s*([\d-]+)/i),

        diasAsignados: extract(clean, /Días Asignados:\s*(\d+)/i) || "10",

        notas: "",

        cuestionario: {}
      };
    }

    async function convertPdfToImages(pdfPath) {
      const outputDir = "uploads/";
      const outputPrefix = `page_${Date.now()}_`;

      return new Promise((resolve, reject) => {
        exec(
          `pdftoppm -jpeg -jpegopt quality=60 -r 100 ${pdfPath} ${outputDir}${outputPrefix}`,
          (err) => {
            if (err) return reject(err);

            const images = fs.readdirSync(outputDir)
              .filter(f => f.startsWith(outputPrefix) && f.endsWith(".jpg"))
              .map(f => path.join(outputDir, f));

            resolve(images);
          }
        );
      });
    }