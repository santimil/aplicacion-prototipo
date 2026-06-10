import { useEffect, useState } from "react";
import RespuestaBox from "./RespuestaBox";
import {
  getCardStyle,
  getUserStyle,
  getDateStyle,
  getMessageStyle,
  getResponseBoxStyle,
  getResponseTextStyle
} from "../../styles/styles";

function ConsultaCard({
  consulta,
  isAdmin,
  onSaveRespuesta, 
  theme
}) {

  const [showResponder, setShowResponder] = useState(false);
  const cardStyle = getCardStyle(theme);
  const userStyle = getUserStyle(theme);
  const dateStyle = getDateStyle(theme);
  const messageStyle = getMessageStyle(theme);
  const responseBox = getResponseBoxStyle(theme);
  const responseText = getResponseTextStyle(theme);

  return (

    <div style={cardStyle}>

      {/* HEADER */}

      <div style={headerStyle}>

        <div style={userStyle}>
          👷 {consulta.usuario?.nombre || "Usuario"}
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

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10
};

const statusStyle = {
  fontSize: 12,
  fontWeight: "bold",
  marginBottom: 10
};

const responseLabel = {
  color: "#FFB74D",
  fontSize: 12,
  marginBottom: 6
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