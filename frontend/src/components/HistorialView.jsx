import { useEffect, useState } from "react";
import { getHistorial } from "../services/api";

function HistorialView({ order, onClose }) {

  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    if (order?.id) {
      getHistorial(order.id)
        .then(data => setHistorial(data))
        .catch(err => console.error(err));
    }
  }, [order]);

  return (
    <div style={overlay}>
      <div style={modal}>

        <h3 style={{ color: "#FFB74D" }}>
          🕓 Historial - {order.numero}
        </h3>

        {historial.length === 0 ? (
          <p style={{ color: "#666" }}>Sin movimientos</p>
        ) : (
          historial.map((h, i) => (
            <div key={i} style={item}>
              <div style={{ fontSize: 11, color: "#666" }}>
                {new Date(h.timestamp).toLocaleString("es-UY", {
                    timeZone: "America/Montevideo",
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                })}
              </div>

              <div style={{ color: "#E8E0D0" }}>
                <div>
                    <span style={{ color: "#888" }}>{h.area_anterior}</span>
                    {" → "}
                    <span style={{ color: "#FFB74D" }}>{h.area_nueva}</span>
                </div>
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

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.9)",
  zIndex: 200,
  display: "flex",
  alignItems: "flex-end"
};

const modal = {
  width: "100%",
  background: "#111",
  borderTop: "1px solid #2A2A2A",
  borderRadius: "16px 16px 0 0",
  padding: 16,
  maxHeight: "90vh",
  overflowY: "auto"
};

const item = {
  padding: "10px 0",
  borderBottom: "1px solid #2A2A2A"
};

const button = {
  marginTop: 15,
  width: "100%",
  padding: "12px",
  borderRadius: 8,
  background: "#1A1A1A",
  color: "#E8E0D0",
  border: "1px solid #2A2A2A",
  cursor: "pointer"
};

export default HistorialView;