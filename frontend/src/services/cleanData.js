import { normalizeDate } from "./date";

export function cleanData(data) {
    return {
      numero: data.numero || "",
      cliente: data.cliente || "",
      trabajo: data.trabajo || "",
      fechaIngreso: normalizeDate(data.fechaIngreso),
      notas: data.notas || "",
      diasAsignados: data.diasAsignados || 10,

      area: [
        "inicio","corte","plegado","soldadura","limpieza","pintura","armado"
      ].includes(data.area)
        ? data.area
        : "corte",

      prioridad: ["Baja","Media","Alta","Urgente"].includes(data.prioridad)
        ? data.prioridad
        : "Media",

      // 🔥 CLAVE
      cuestionario: data.cuestionario || {}
    };
  }