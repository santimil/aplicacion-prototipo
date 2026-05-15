import { useEffect, useState } from "react";

export default function ControlDetail({ control, setView, onUpdateCheck, handleSentToEntrega }) {

  const [observaciones, setObservaciones] = useState("");

  const allApproved = control.control_chequeo.every(
    c =>
        c.estado === "aprobado" ||
        c.estado === "no_aplica"
  );

  if (!control) {
    return (
      <div style={{
        padding: 20,
        color: "#E8E0D0"
      }}>
        Cargando control...
      </div>
    );
  }

  const checks = control.control_chequeo || [];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0D0D0D",
      color: "#E8E0D0",
      padding: 16,
      paddingBottom: 80
    }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20
      }}>
        <button
          onClick={() => setView("detail")}
          style={{
            background: "transparent",
            border: "none",
            color: "#888",
            cursor: "pointer",
            fontSize: 14
          }}
        >
          ← Volver
        </button>

        <div style={{
          fontSize: 18,
          fontWeight: "bold"
        }}>
          🧪 Control de Calidad
        </div>

        <div />
      </div>

      {/* INFO CONTROL */}
      <div style={{
        background: "#161616",
        border: "1px solid #2A2A2A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20
      }}>
        <div style={{ marginBottom: 8 }}>
          <strong>Estado:</strong> {control.estado}
        </div>

        <div style={{ marginBottom: 8 }}>
          <strong>Orden:</strong> #{control.orden?.numero}
        </div>

        <div>
          <strong>Chequeos:</strong> {checks.length}
        </div>
      </div>

      {/* LISTA CHEQUEOS */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 12
      }}>

        {checks.map(check => {

          const estado = check.estado;

          return (
            <div
              key={check.id}
              style={{
                background: "#161616",
                border: "1px solid #2A2A2A",
                borderRadius: 12,
                padding: 14
              }}
            >

              {/* NOMBRE */}
              <div style={{
                fontSize: 15,
                fontWeight: "bold",
                marginBottom: 10
              }}>
                {check.chequeo?.descripcion}
              </div>

              {/* ESTADO */}
              <div style={{
                marginBottom: 12,
                fontSize: 13,
                color:
                  estado === "aprobado"
                    ? "#81C784"
                    : estado === "rechazado"
                    ? "#E57373"
                    : "#FFB74D"
              }}>
                Estado: {estado}
              </div>

              {/* BOTONES */}
              <div style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap"
              }}>

                <button
                  onClick={() =>
                    onUpdateCheck(check.id, "aprobado", observaciones[control.id] || "")
                  }
                  style={{
                    background: "#1E4620",
                    color: "#81C784",
                    border: "1px solid #2E7D32",
                    borderRadius: 8,
                    padding: "8px 12px",
                    cursor: "pointer"
                  }}
                >
                  ✔ Aprobar
                </button>

                <button
                  onClick={() =>
                    onUpdateCheck(check.id, "rechazado", observaciones[control.id] || "")
                  }
                  style={{
                    background: "#4A1C1C",
                    color: "#E57373",
                    border: "1px solid #C62828",
                    borderRadius: 8,
                    padding: "8px 12px",
                    cursor: "pointer"
                  }}
                >
                  ✖ Rechazar
                </button>

                <button
                  onClick={() =>
                    onUpdateCheck(check.id, "no_aplica", observaciones[control.id] || "")
                  }
                  style={{
                    background: "#3A331A",
                    color: "#FFD54F",
                    border: "1px solid #F9A825",
                    borderRadius: 8,
                    padding: "8px 12px",
                    cursor: "pointer"
                  }}
                >
                  ⊘ No aplica
                </button>

              </div>

              <textarea
                value={observaciones[control.id] || control.observacion || ""}
                onChange={(e) =>
                    setObservaciones(prev => ({
                    ...prev,
                    [control.id]: e.target.value
                    }))
                }
                placeholder="Observaciones..."
                style={{
                    width: "100%",
                    marginTop: 8,
                    borderRadius: 8,
                    background: "#1A1A1A",
                    border: "1px solid #333",
                    color: "#E8E0D0",
                    padding: 8,
                    resize: "vertical",
                    minHeight: 60
                }}
                />

            </div>
          );
        })}

      </div>

      {allApproved && (
        <button
            onClick={() => handleSentToEntrega(control.id)}
            style={{
            width: "100%",
            marginTop: 20,
            padding: "14px",
            borderRadius: 10,
            border: "none",
            background: "#4CAF50",
            color: "#0D0D0D",
            fontWeight: "bold",
            cursor: "pointer"
            }}
        >
            📦 Enviar a entrega
        </button>
       )}

    </div>
  );
}