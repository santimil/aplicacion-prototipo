import { useEffect, useState } from "react";
import RespuestaBox from "./RespuestaBox";

function ConsultaCard({
  consulta,
  isAdmin,
  onSaveRespuesta
}) {

  const [showResponder, setShowResponder] = useState(false);

  return (

    <div style={cardStyle}>

      {/* HEADER */}

      <div style={headerStyle}>

        <div style={userStyle}>
          👷 {consulta.usuario_nombre || "Usuario"}
        </div>

        <div style={dateStyle}>
          {
            new Date(
              consulta.created_at
            ).toLocaleString()
          }
        </div>

      </div>

      {/* MENSAJE */}

      <div style={messageStyle}>
        {consulta.mensaje}
      </div>

      {/* ESTADO */}

      <div
        style={{
          ...statusStyle,

          color:
            consulta.estado === "respondida"
              ? "#7CFFB2"
              : "#FFB74D"
        }}
      >
        {
          consulta.estado === "respondida"
            ? "Respondida"
            : "Pendiente"
        }
      </div>

      {/* RESPUESTA */}

      {consulta.respuesta && (

        <div style={responseBox}>

          <div style={responseLabel}>
            🛠 Administración
          </div>

          <div style={responseText}>
            {consulta.respuesta}
          </div>

        </div>

      )}

      {/* BOTÓN ADMIN */}

      {
        isAdmin &&
        !consulta.respuesta && (
          <button
          style={replyButton}
          onClick={() =>
            setShowResponder(true)
          }
          >
            Responder
          </button>
        )
      }

      {showResponder && (
        <RespuestaBox
            consulta={consulta}

            onClose={() =>
                setShowResponder(false)
            }

            onSave={async (
                consultaId,
                respuesta
            ) => {

                await onSaveRespuesta(
                consultaId,
                respuesta
                );

                setShowResponder(false);
            }}
            />
        )
    }

    </div>
  );
}

const cardStyle = {
  background: "#161616",
  border: "1px solid #2A2A2A",
  borderRadius: 14,
  padding: 14,
  marginBottom: 14
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10
};

const userStyle = {
  color: "#E8E0D0",
  fontWeight: "bold",
  fontSize: 14
};

const dateStyle = {
  color: "#666",
  fontSize: 11
};

const messageStyle = {
  color: "#DDD",
  lineHeight: 1.5,
  marginBottom: 12,
  whiteSpace: "pre-wrap"
};

const statusStyle = {
  fontSize: 12,
  fontWeight: "bold",
  marginBottom: 10
};

const responseBox = {
  marginTop: 10,
  padding: 10,
  borderRadius: 10,
  background: "#111",
  border: "1px solid #2A2A2A"
};

const responseLabel = {
  color: "#FFB74D",
  fontSize: 12,
  marginBottom: 6
};

const responseText = {
  color: "#E8E0D0",
  lineHeight: 1.4
};

const replyButton = {
  marginTop: 12,
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "none",
  background: "#FFB74D",
  color: "#111",
  fontWeight: "bold",
  cursor: "pointer"
};

export default ConsultaCard;