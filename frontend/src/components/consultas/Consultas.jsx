import { supabase } from "../../supabaseClient";
import { useEffect, useState } from "react";
import NuevaConsultaBox from "./NuevaConsultaBox";
import ConsultasList from "./ConsultasList";
import RespuestaBox from "./RespuestaBox";
import { getConsultas, createConsulta, updateConsulta } from "../../services/api";

function ConsultasView({ order, user, onClose }) {

  const [consultas, setConsultas] = useState([]);
  const [selectedConsulta, setSelectedConsulta] = useState(null);

  useEffect(() => {

    if (!order?.id) return;

    async function loadConsultas() {

      try {
        const data = await getConsultas(order.id);
        setConsultas(data.reverse());

      } catch (err) {
        console.error(
          "Error cargando consultas:",
          err
        );
      }
    }

    loadConsultas();

  }, [order]);

  function handleResponder(consulta) {
    setSelectedConsulta(consulta);
  }

  async function handleCreateConsulta(mensaje) {

    try {

      const nuevaConsulta =
        await createConsulta({
          orden_id: order.id,
          mensaje,
          usuario_id: user.id,
          estado: "pendiente"
        });

      setConsultas(prev => [
        nuevaConsulta,
        ...prev
      ]);

    } catch (err) {

      console.error(err);
    }
  }

  async function handleSaveRespuesta(
    consultaId,
    respuesta
  ) {

    try {

      const updated =
        await updateConsulta(
          consultaId,
          {
            respuesta,
            estado: "respondida"
          }
        );

      setConsultas(prev =>
        prev.map(c =>
          c.id === consultaId
            ? updated
            : c
        )
      );

      setSelectedConsulta(null);

    } catch (err) {

      console.error(err);
    }
  }

  return (
    <div style={{
          padding: "8px 10px",
          paddingBottom: 80
        }}>
          <div style={{
            padding: "8px 10px",
            fontSize: 22,
            fontWeight: "bold",
            color: "#FFB74D"
          }}>
            {order.numero}
          </div>

      <NuevaConsultaBox
        onCreate={handleCreateConsulta}
      />

      <ConsultasList
        consultas={consultas}
        isAdmin={user.rol === "admin"}
        onResponder={handleSaveRespuesta}
      />
    </div>
  );
}

export default ConsultasView;