import React from "react";
import {
  AREAS,
  PCOLORS
} from "../constant/orderConstants";

function isOverdue(order) {
  if (!order.fecha_entrega) return false;
  return new Date(order.fecha_entrega) < new Date();
}

function getAreaData(areaId) {
  return AREAS.find(a => a.id === areaId);
}

function ListView({ orders, onSelectOrder, search, setSearch, filterArea, setFilterArea, 
  onOpenCuestionario, onOpenConsultas, theme, darkMode, setDarkMode }) {
  console.log("onOpenConsultas:", onOpenConsultas);
  
  return (
    <div style={{ padding: 12, paddingBottom: 80}}>

      <div style={{ marginBottom: 12 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          background: theme.surface,
          border: `1px solid ${theme.border}`,
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
              color: theme.text,
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
            background: filterArea === "all"
              ? theme.text
              : theme.surface,

            color: filterArea === "all"
              ? theme.background
              : theme.secondaryText
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
              background:
                filterArea === a.id
                  ? a.color
                  : theme.surface,

              color:
                filterArea === a.id
                  ? "#000"
                  : theme.text,

              border:
                `1px solid ${
                  filterArea === a.id
                    ? a.color
                    : theme.border
                }`,
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
            background: theme.card,
            color: theme.text,
            border: `1px solid ${theme.border}`,
            padding: 12,
            marginBottom: 8,
            borderRadius: 6,
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
              color: darkMode
                ? area.color
                : theme.text
            }}>
              {o.numero}
            </span>

            <span style={{
              fontSize: 10,
              padding: "2px 6px",
              borderRadius: 4,
              background: area ? area.color + "22" : theme.surface,
              border: area ? `1px solid ${area.color}55` : `1px solid ${theme.border}`,
              color: darkMode ? area.color : theme.text,
              display: "flex",
              alignItems: "center",
              gap: 4
            }}>
              <span>{area?.icon}</span>
              <span>{area?.label}</span>
            </span>

            <span style={{
              fontSize: 10,
              padding: "2px 6px",
              borderRadius: 4,
              background: (PCOLORS[o.prioridad] || "#999") + "22",
              color: !darkMode
                ? "#333"
                : (PCOLORS[o.prioridad] || "#999")
            }}>
              {o.prioridad}
            </span>
          </div>

          {/* CLIENTE */}
          <div style={{
            fontWeight: "bold",
            marginBottom: 6,
            marginTop: 6
          }}>
            {o.cliente}
          </div>

          {/* TRABAJO */}
          <div style={{
            fontSize: 12,
            color: theme.secondaryText,
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
                  background: theme.surface,
                  color: theme.secondaryText,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 6,
                  padding: "4px 8px",
                  cursor: "pointer",
                  fontSize: 12
                }}
                >
                  📋 detalles
                </button>

                <button
              onClick={(e) => {
                  e.stopPropagation(); // ⚠️ IMPORTANTE
                  onOpenConsultas(o);
                }}
              style={{
                background: theme.surface,
                color: theme.secondaryText,
                border: `1px solid ${theme.border}`,
                borderRadius: 6,
                padding: "4px 8px",
                cursor: "pointer",
                fontSize: 12
              }}
              >
                📋 consultas
              </button>
          </div>

        </div>
      )})}

    </div>
  );
}

export default ListView;