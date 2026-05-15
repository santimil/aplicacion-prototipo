import fs from "fs";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function handleOCR(req, res) {
  console.log("📸 OCR endpoint hit");

  try {
    const data = await processImage(req.file);

    console.log("PARSED DATA:", data);

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error OCR" });
  }
}

export async function processImage(file) {
  console.log("📸 Procesando imagen OCR");
  console.log("MIMETYPE:", file.mimetype);

  const image = fs.readFileSync(file.path, {
    encoding: "base64"
  });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: file.mimetype,
              data: image
            }
          },
          {
            type: "text",
            text: `
              Analiza esta orden de trabajo y extrae SOLO la siguiente información:

              - numero:
                Buscar el número principal de la orden de trabajo.
                Puede aparecer como:
                - "Serie y N°"
                - "Número"
                - "Orden"
                - "OT"

                Copiar el valor COMPLETO exactamente como aparece.
                Ejemplos válidos:
                - A50850
                - OT-2024-001
                - OT 1502

              - cliente:
                Extraer el nombre completo del cliente.
                NO resumir.
                Mantener el nombre completo exactamente como aparece.

              - trabajo:
                Descripción del producto o trabajo a realizar.
                Usar la informacion debajo del campo "Concepto", seguido de un signo de multiplo y el valor bajo el campo "Cantidad".
                NO usar direcciones, NO usar datos de envío.

              - fechaIngreso:
                Fecha en la que se realiza la creación de la orden en papel.
                Obten el valor del campo Fecha.
                De no encontrar un valor que corresponda devolve la fecha actual.

              - notas:
                Información adicional relevante (referencias, nombres, observaciones).
                Puede incluir números secundarios o personas.
                si hay texto dentro rectangulo mas grande, incluirla la informacion escrita.
                Mantener los números EXACTOS sin modificarlos.

              REGLAS IMPORTANTES:
              - NO inventar datos.
              - Si un campo no está claro, devolver string vacío "".
              - NO usar direcciones como trabajo.
              - NO usar códigos como cliente.

              - IMPORTANTE para números:
              - Copiar los números EXACTAMENTE como aparecen en la imagen.
              - Prestar especial atención a dígitos similares (0, 8, 9, 3).
              - NO inventar ni corregir números.
              - Si hay duda, copiar el valor más visible.

              Devuelve SOLO JSON válido con estas claves exactas:
              {
                "numero": "",
                "cliente": "",
                "trabajo": "",
                "fechaIngreso": "",
                "notas": ""
              }

              EJEMPLO:

              Input:
              "Serie y N°: A50850"
              "831 - CIEMSA"

              Output:
              {
                "numero": "A50850",
                "cliente": "CIEMSA",
                "trabajo": "...",
                "notas": "..."
              }


              Además, extrae información para un cuestionario técnico:

              - color: si se menciona algún color
              - llaves: true si menciona llaves
              - marca_llaves: si se menciona marca
              - tablero_completo: true si se menciona tablero completo
              - tipo_cierre: si se menciona tipo de cierre
              - espera_chapa: si se menciona espesor o espera de chapa
              - tipo_chapa: tipo de material (ej: galvanizada, inoxidable)
              - planos: true si se mencionan planos
              - informacion_especifica: cualquier otro detalle técnico relevante

              Devuelve también:

              "cuestionario": {
                "color": "",
                "llaves": false,
                "marca_llaves": "",
                "tablero_completo": false,
                "tipo_cierre": "",
                "espera_chapa": "",
                "tipo_chapa": "",
                "planos": false,
                "informacion_especifica": ""
              }
              `
          }
        ]
      }
    ]
  });

  let rawText = response?.content?.[0]?.text || "";

  rawText = rawText.replace(/```json|```/g, "").trim();

  const match = rawText.match(/\{[\s\S]*\}/);

  if (!match) {
    return {
      numero: "",
      cliente: "",
      trabajo: "",
      fechaIngreso: "",
      notas: ""
    };
  }

  const jsonText = match[0];

  try {
    return JSON.parse(jsonText);
  } catch (err) {
    console.log("❌ Error parseando JSON:", jsonText);
    throw new Error("JSON inválido");
  }
}