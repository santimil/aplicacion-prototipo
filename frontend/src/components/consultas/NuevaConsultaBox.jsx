import { cardStyle, textareaStyle, buttonPrimary, sendButton, cancelButton } from "../../styles/styles";
import { useEffect, useState } from "react";

function NuevaConsultaBox({ onCreate, loading = false }) {

  const [open, setOpen] = useState(false);

  const [mensaje, setMensaje] = useState("");

  async function handleSubmit() {

    if (!mensaje.trim()) return;

    await onCreate(mensaje);

    setMensaje("");
    setOpen(false);
  }

  return (

    <div
      style={{
        marginBottom: 20
      }}
    >

      {!open ? (

        <button
          onClick={() => setOpen(true)}
          style={buttonPrimary}
        >
          ➕ Nueva consulta
        </button>

      ) : (

        <div style={cardStyle}>

          <textarea
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            placeholder="Escribe una consulta..."
            style={textareaStyle}
          />

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 10
            }}
          >

            <button
              onClick={() => {
                setOpen(false);
                setMensaje("");
              }}
              style={cancelButton}
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={sendButton}
            >
              {
                loading
                  ? "Enviando..."
                  : "Enviar"
              }
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default NuevaConsultaBox;