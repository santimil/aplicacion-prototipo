import React from "react";

const AREAS = [
  { id: "inicio", label: "Inicio", icon: "▶", color: "#4FC3F7" },
  { id: "corte", label: "Corte", icon: "✂", color: "#FFB74D" },
  { id: "plegado", label: "Plegado", icon: "⌐", color: "#CE93D8" },
  { id: "soldadura", label: "Soldadura", icon: "⚡", color: "#EF9A9A" },
  { id: "pulido", label: "Pulido", icon: "◎", color: "#80CBC4" },
  { id: "pintura", label: "Pintura", icon: "◉", color: "#A5D6A7" },
  { id: "armado", label: "Armado/Ductos", icon: "⬡", color: "#FFF176" },
  { id: "control", label: "Control", icon: "🗒️", color: "#DA7422" },
  { id: "entrega", label: "Entrega", icon: "🛻", color: "#3CF000" }
];


const PCOLORS = {
  Baja: "#4FC3F7",
  Media: "#FFB74D",
  Alta: "#EF9A9A",
  Urgente: "#FF5252"
};

function isOverdue(order) {
  if (!order.fecha_entrega) return false;
  return new Date(order.fecha_entrega) < new Date();
}

function getAreaData(areaId) {
  return AREAS.find(a => a.id === areaId);
}

function ListView({ orders, onSelectOrder, search, setSearch, filterArea, setFilterArea, onOpenCuestionario }) {
  return (
    <div style={{ padding: 12, paddingBottom: 80}}>

      <div style={{ marginBottom: 12 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          background: "#111",
          border: "1px solid #2A2A2A",
          borderRadius: 6,
          padding: "8px 10px"
        }}>
          <span style={{ marginRight: 6 }}>🔍</span>

          <input
            type="text"
            placeholder="Buscar cliente, OT, trabajo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#E8E0D0",
              width: "100%"
            }}
          />
        </div>
      </div>

      <div style={{
        display: "flex",
        gap: 6,
        overflowX: "auto",
        marginBottom: 10
      }}>

        {/* TODOS */}
        <button
          onClick={() => setFilterArea("all")}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid",
            background: filterArea === "all" ? "#E8E0D0" : "#1A1A1A",
            color: filterArea === "all" ? "#0D0D0D" : "#666"
          }}
        >
          TODAS
        </button>

        {AREAS.map(a => (
          <button
            key={a.id}
            onClick={() => setFilterArea(a.id)}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid",
              background: filterArea === a.id ? a.color : "#1A1A1A",
              color: filterArea === a.id ? "#0D0D0D" : "#666",
              display: "flex",
              alignItems: "center",
              gap: 4,
              whiteSpace: "nowrap"
            }}
          >
            <span>{a.icon}</span>
            <span>{a.label}</span>
          </button>
        ))}

      </div>

      {orders.map(o => {
        const area = AREAS.find(a => a.id === o.area);
        
        return(
        <div
          key={o.id}
          onClick={() => onSelectOrder(o)}
          style={{
            background: "#161616",
            padding: 12,
            marginBottom: 8,
            borderRadius: 6,
            borderLeft: `3px solid ${PCOLORS[o.prioridad] || "#999"}`,
            cursor: "pointer",
            textAlign: "left"
          }}
        >

          {/* HEADER */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4
          }}>
            <span style={{
              fontSize: 11,
              color: "#888"
            }}>
              {o.numero}
            </span>

            <span style={{
              fontSize: 10,
              padding: "2px 6px",
              borderRadius: 4,
              background: area ? area.color + "22" : "#1A1A1A",
              color: area ? area.color : "#999",
              display: "flex",
              alignItems: "center",
              gap: 4
            }}>
              <span>{area?.icon}</span>
              <span>{area?.label}</span>
            </span>
          </div>

          {/* CLIENTE */}
          <div style={{
            fontWeight: "bold",
            marginBottom: 4
          }}>
            {o.cliente}
          </div>

          {/* TRABAJO */}
          <div style={{
            fontSize: 12,
            color: "#777",
            marginBottom: 8
          }}>
            {o.trabajo}
          </div>

          {/* FOOTER */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{
              fontSize: 11,
              color: "#555",
              display: "flex",
              alignItems: "center",
              gap: 4
            }}>
              <span style={{
                fontSize: 11,
                color: isOverdue(o) ? "#FF5252" : "#555",
                display: "flex",
                alignItems: "center",
                gap: 4
              }}>
                📅 {o.fecha_entrega || "—"}
                {isOverdue(o) && <span>⚠</span>}
              </span>
            </span>

            {/* BOTÓN CUESTIONARIO */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // ⚠️ IMPORTANTE
                  onOpenCuestionario(o);
                }}
                style={{
                  background: "#1A1A1A",
                  color: "#777",
                  border: "1px solid #2A2A2A",
                  borderRadius: 6,
                  padding: "4px 8px",
                  cursor: "pointer",
                  fontSize: 12
                }}
                >
                  📋 cuestionario
                </button>

            <span style={{
              fontSize: 10,
              padding: "2px 6px",
              borderRadius: 4,
              background: (PCOLORS[o.prioridad] || "#999") + "22",
              color: PCOLORS[o.prioridad] || "#999"
            }}>
              {o.prioridad}
            </span>
          </div>

        </div>
      )})}

    </div>
  );
}

export default ListView;