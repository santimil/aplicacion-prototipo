import { useEffect, useState } from "react";
import { getPlanos } from "../services/api";
import { overlay, getModalStyle, getCardStyle, getActionButton, dividerStyle, 
  chipStyle, primaryLinkButton, sectionTitleStyle } from "../styles/styles";

function CuestionarioView({ order, onClose, onEdit, theme }) {

  const [cuestionario, setCuestionario] = useState(null);
  const [planos, setPlanos] = useState([]);
  const [selectedPlano, setSelectedPlano] = useState(null);

  useEffect(() => {
    if (order?.cuestionario?.[0]) {
      setCuestionario(order.cuestionario[0]);
    }
  }, [order]);

  useEffect(() => {

    async function loadData() {
      const q = order?.cuestionario?.[0];

      if (!q?.id) return;

      setCuestionario(q);

      try {

        const data = await getPlanos(q.id);
        setPlanos(Array.isArray(data) ? data : []);

      } catch (err) {

        console.error("Error cargando planos:", err);
        setPlanos([]);
      }
    }

    loadData();
  }, [order]);

  useEffect(() => {

    if (planos.length > 0) {
      setSelectedPlano(planos[0]);
    }

  }, [planos]);

  const modalStyle = getModalStyle(theme);
  const cardStyleTheme = getCardStyle(theme);
  const actionButton = getActionButton(theme);

  if (!cuestionario) {
    return (
      <div style={overlay}>
        <div style={modalStyle}>
          <p style={{ color: "#666" }}>Sin datos de cuestionario</p>
          <button onClick={onClose}>Cerrar</button>
        </div>
      </div>
    );
  }

  const isImage = selectedPlano?.nombre?.match(/\.(jpg|jpeg|png|webp)$/i);
  const isPdf = selectedPlano?.nombre?.match(/\.pdf$/i);

  function Field({ label, value }) {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) return null;

    return (
      <div
        style={{
          ...cardStyleTheme,
          marginBottom: 12
        }}
      >
        <div
          style={{
            color: theme.secondaryText,
            fontSize: 11,
            marginBottom: 4,
            textTransform: "uppercase",
            letterSpacing: 1
          }}
        >
          {label}
        </div>

        <div
          style={{
            color: theme.text,
            fontSize: 14,
            wordBreak: "break-word"
          }}
        >
          {value}
        </div>
      </div>
    );
  }

  return (
    <div style={overlay}>
      <div style={modalStyle}>

        <h3 style={{ color: "#FFB74D" }}>
          📋 Detalles - {order.numero}
        </h3>

        <Field label="Color" value={cuestionario.color} />
        <div style={dividerStyle} />

        <Field label="Llaves" value={cuestionario.llaves ? "Sí" : "No"} />
        <div style={dividerStyle} />

        {cuestionario.llaves && (
          <Field label="Marca llaves" value={cuestionario.marca_llaves} />
        )}

        {cuestionario.llaves && (
          <div style={dividerStyle} />
        )}

        <Field label="Tablero completo" value={cuestionario.tablero_completo ? "Sí" : "No"} />
        <div style={dividerStyle} />
        
        <Field label="Tipo cierre" value={cuestionario.tipo_cierre} />
        <div style={dividerStyle} />

        <Field label="Espesor chapa" value={cuestionario.espesor_chapa} />
        <div style={dividerStyle} />

        <Field label="Tipo chapa" value={cuestionario.tipo_chapa} />
        <div style={dividerStyle} />

        <Field label="Información específica" value={cuestionario.informacion_especifica} />
        <div
          style={{
            ...dividerStyle,
            margin: "20px 0"
          }}
        />

        <div style={{ marginTop: 15 }}>

          <div
            style={sectionTitleStyle}
          >
            📐 Planos
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 10
            }}
          >
            {planos.map(plano => (

              <button
                key={plano.id}
                onClick={() => setSelectedPlano(plano)}
                style={{
                  ...chipStyle,

                  background:
                    selectedPlano?.id === plano.id
                      ? "#FFB74D"
                      : theme.card,

                  color:
                    selectedPlano?.id === plano.id
                      ? "#111"
                      : theme.text,

                  border: `1px solid ${theme.border}`
                }}
              >
                📎 {plano.nombre}
              </button>

            ))}
          </div>

        </div>

        {selectedPlano && (

          <div style={{ marginTop: 20 }}>

            <div
              style={{
                ...cardStyleTheme,
                marginTop: 12,
                boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                overflow: "hidden"
              }}
            >
              {isImage ? (
                <img
                  src={selectedPlano.url}
                  alt={selectedPlano.nombre}
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    objectFit: "contain",
                    maxHeight: 300
                  }}
                />
              ) : isPdf ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                    padding: "20px 10px"
                  }}
                >
                  <div style={{ fontSize: 48 }}>📄</div>

                  <div
                    style={{
                      color: theme.text,
                      fontSize: 13,
                      textAlign: "center",
                      wordBreak: "break-word"
                    }}
                  >
                    {selectedPlano.nombre}
                  </div>

                  <a
                    href={selectedPlano.url}
                    target="_blank"
                    rel="noreferrer"
                    style={primaryLinkButton}
                  >
                    Abrir PDF
                  </a>
                </div>
              ) : (
                <div style={{ color: "#888" }}>
                  Vista previa no disponible
                </div>
              )}
            </div>

            <a
              href={selectedPlano.url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "block",
                marginTop: 10,
                color: "#FFB74D",
                textDecoration: "none"
              }}
            >
              Abrir archivo
            </a>

          </div>

        )}

        <div style={{ display: "flex", gap: 10, position: "sticky",
                    bottom: 0, marginTop: 15 }}>

          {/* 👇 botón para editar */}
          <button 
            onClick={() => onEdit(order)}
            style={actionButton}
          >
            ✏️ Editar
          </button>

          <button 
                style={actionButton}
                onClick={onClose}>
                Cerrar
            </button>
        </div>

      </div>
    </div>
  );
}

export default CuestionarioView;