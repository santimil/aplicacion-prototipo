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

export function getDeliveryStatus(order) {

  if (order.estado_entrega === "reclamada") {
    return {
      text: "⚠ RECLAMADA",
      color: "#FF5252"
    };
  }

  if (order.estado_entrega === "entregada") {
    return {
      text: "✅ ENTREGADA",
      color: "#81C784"
    };
  }

  if (order.estado_entrega === "en_camino") {
    return {
      text: "🚚 EN CAMINO",
      color: "#64B5F6"
    };
  }

  if (isOverdue(order)) {
    return {
      text: "⚠ VENCIDA",
      color: "#FF5252"
    };
  }

  return null;
}