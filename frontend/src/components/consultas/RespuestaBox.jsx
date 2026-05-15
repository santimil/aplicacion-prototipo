import { useState } from "react";

function RespuestaBox({
  consulta,
  onClose,
  onSave
}) {

  const [respuesta, setRespuesta] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {

    if (!respuesta.trim()) return;

    try {

      setLoading(true);

      await onSave(
        consulta.id,
        respuesta
      );

      setRespuesta("");

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
    }
  }

  return (
    <div style={{
      marginTop: 10,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }}>

      <textarea
        value={respuesta}
        onChange={e => setRespuesta(e.target.value)}
        placeholder="Escribir respuesta..."
        style={{
          width: "100%",
          minHeight: 90,
          resize: "vertical",
          background: "#111",
          border: "1px solid #2A2A2A",
          borderRadius: 10,
          padding: 12,
          color: "#E8E0D0",
          boxSizing: "border-box"
        }}
      />

      <div style={{
        display: "flex",
        gap: 10
      }}>

        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #2A2A2A",
            background: "#161616",
            color: "#AAA",
            cursor: "pointer"
          }}
        >
          Cancelar
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: "none",
            background: "#FFB74D",
            color: "#111",
            fontWeight: "bold",
            cursor: "pointer",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Enviando..." : "Responder"}
        </button>

      </div>
    </div>
  );
}

export default RespuestaBox;