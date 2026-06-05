export function formatDate(dateStr) {
  if (!dateStr) return "—";

  const d = new Date(dateStr);

  if (isNaN(d)) return dateStr;

  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

export function isDelivered(order) {
  return !!order.fecha_entregado;
}

export function isOverdue(order) {
  if (!order.fecha_entrega) return false;

  if (isDelivered(order)) return false;

  return new Date(order.fecha_entrega) < new Date();
}