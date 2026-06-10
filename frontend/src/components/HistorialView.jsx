import { useEffect, useState } from "react";
import { getHistorial } from "../services/api";
import { getModalStyle, historialOverlay, getHistorialButtonStyle, getHistorialItemStyle } from "../styles/styles";

function HistorialView({ order, onClose, theme }) {

  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    if (order?.id) {
      getHistorial(order.id)
        .then(data => setHistorial(data))
        .catch(err => console.error(err));
    }
  }, [order]);

  const modal = getModalStyle(theme);
  const button = getHistorialButtonStyle(theme);
  const item = getHistorialItemStyle(theme);

  return (
    <div style={historialOverlay}>
      <div style={modal}>

        <h3 style={{ color: "#FFB74D" }}>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#FFB74D",
              fontSize: 22,
              cursor: "pointer",
              marginRight: 10
            }}
          >
            ←
          </button>
          🕓 Historial - {order.numero}
        </h3>

        {historial.length === 0 ? (
          <p style={{ color: theme.secondaryText }}>Sin movimientos</p>
        ) : (
          historial.map((h, i) => (
            <div key={i} style={item}>
              <div style={{ fontSize: 11, color: theme.secondaryText }}>
                {new Date(h.timestamp).toLocaleString("es-UY", {
                    timeZone: "America/Montevideo",
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                })}
              </div>

              <div style={{ color: theme.text }}>
                <div>
                    <span style={{ color: theme.secondaryText }}>{h.area_anterior}</span>
                    {" → "}
                    <span style={{ color: "#FFB74D" }}>{h.area_nueva}</span>
                </div>
              </div>

              <div style={{
                fontSize: 12,
                color: theme.secondaryText,
                marginTop: 4
              }}>
                👷 {h.usuario?.nombre || "Sin usuario"}
              </div>
            </div>
          ))
        )}

        <button onClick={onClose} style={button}>
          Cerrar
        </button>

      </div>
    </div>
  );
}

export default HistorialView;