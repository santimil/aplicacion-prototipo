import React from "react";
import {
  AREAS,
  PCOLORS
} from "../constant/orderConstants";

function Kanban({ orders, users, onSelectOrder, search, setSearch, filterArea, setFilterArea, 
  onOpenCuestionario, onOpenConsultas, theme, darkMode, setDarkMode }) {
  function isOverdue(order) {
    if (!order.fecha_entrega) return false;

    if (isDelivered(order)) return false;

    const today = new Date();
    const entrega = new Date(order.fecha_entrega);

    return entrega < today;
  }

  function isDelivered(order) {
    return !!order.fecha_entregado;
  }

  const getUserName = (id) => {
    const user = users.find(u => u.id === id);
    return user ? user.nombre : null;
  };
  
  return (
    <div style={{ padding: 12, paddingBottom: 80 }}>

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

      {AREAS.map(area => {
        const areaOrders = orders.filter(o => o.area === area.id);

        const shouldShow = areaOrders.length > 0 || filterArea === area.id;

        if (!shouldShow) return null;

        return (
          <div key={area.id} style={{ marginBottom: 20 }}>
            
            {/* HEADER */}
            <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: `2px solid ${area.color}`,
            marginBottom: 10,
            paddingBottom: 6
            }}>
                <span>{area.icon}</span>

                <span style={{
                    color: area.color,
                    fontWeight: "bold",
                    letterSpacing: "1px"
                }}>
                    {area.label.toUpperCase()}
                </span>

                <span style={{
                    marginLeft: "auto",
                    background: theme.surface,
                    border: `1px solid ${theme.border}`,
                    color: theme.text,
                    borderRadius: 4,
                    padding: "2px 8px",
                    fontSize: 11
                }}>
                    {areaOrders.length}
                </span>
            </div>

            {/* CONTENIDO */}
            {areaOrders.length === 0 ? (
              <div style={{
                padding: 12,
                textAlign: "center",
                color: theme.secondaryText,
                fontSize: 11,
                border: `1px dashed ${theme.border}`,
                borderRadius: 6
                }}>
                VACÍO
                </div>
            ) : (
              areaOrders.map(o => (
                <div 
                key={o.id} 
                onClick={() => onSelectOrder(o)}
                style={{
                    background: theme.card,
                    border: `1px solid ${theme.border}`,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    padding: 12,
                    marginBottom: 8,
                    borderRadius: 6,
                    cursor: "pointer"
                }}
                >
                {/* NUMERO + ALERTA */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4
                }}>
                  <span style={{
                    fontSize: 11,
                    color: area.color
                  }}>
                    {o.numero}
                  </span>

                  {o.asignado_a && (
                    <div style={{
                      marginTop: 6,
                      fontSize: 11,
                      color: "#FFB74D",
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}>
                      👤 {getUserName(o.asignado_a)}
                    </div>
                  )}

                  {isDelivered(o) ? (
                    <span style={{
                      marginLeft: 10,
                      fontSize: 12,
                      color: "#81C784"
                    }}>
                      ✅ ENTREGADA
                    </span>
                  ) : isOverdue(o) && (
                    <span style={{
                      marginLeft: 10,
                      fontSize: 12,
                      color: "#FF5252"
                    }}>
                      ⚠ VENCIDA
                    </span>
                  )}
                </div>

                {/* CLIENTE */}
                <div style={{
                    fontWeight: "bold",
                    marginBottom: 4,
                    textAlign: "left"
                }}>
                    {o.cliente}
                </div>

                {/* TRABAJO */}
                <div style={{
                    fontSize: 12,
                    color: theme.secondaryText,
                    marginBottom: 8,
                    textAlign: "left"
                }}>
                    {o.trabajo}
                </div>

                {/* FOOTER */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "left"
                }}>
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
                        fontSize: 12,
                        fontWeight: 500
                      }}
                    >
                      📋 consultas
                    </button>

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
                        fontSize: 12,
                        fontWeight: 500
                      }}
                    >
                      📋 detalles
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
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Kanban;