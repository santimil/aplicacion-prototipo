export function normalizeDate(fecha) {
  if (!fecha) return "";

  if (typeof fecha !== "string") {
    return "";
  }

  // Ya está en formato correcto
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return fecha;
  }

  // Formato DD/MM/YY o DD/MM/YYYY
  if (fecha.includes("/")) {
    const parts = fecha.split("/");
    if (parts.length !== 3) return null;

    let [dia, mes, anio] = parts;

    if (!anio) return null;

    if (anio.length === 2) {
      anio = "20" + anio;
    }

    return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }

  // Formato raro → fallback
  return null;
}