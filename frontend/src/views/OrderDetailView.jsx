import { MOVIMIENTO } from "../constant/orderConstants";
import {
  formatDate,
  isDelivered,
  isOverdue,
  getDeliveryStatus
} from "../utils/orderUtils";
import {
  AREAS
} from "../constant/orderConstants";
import {
  getActionButton,
  getInputStyle,
  getSelectStyle,
  getSecondaryButton
} from "../styles/styles";


function OrderDetailView({ order,
      form,
      errors,
      isEditing,
      showDeleteModal,
      areaActual,
      areaObj,
      color,
      user,
      users,
      isIneditable,
      handleChange,
      handleSave,
      handleDelete,
      handleSendToControl,
      handleEnCamino,
      handleEntregar,
      handleReclamo,
      handleExportPDF,
      setIsEditing,
      setShowDeleteModal,
      setForm,
      onBack,
      onRefresh,
      onMove,
      onOpenHistorial,
      handleControl,
      getUserName,
      exportToExcel, 
      theme, 
      darkMode, 
      setDarkMode }) {

    const inputStyle = getInputStyle(theme);
    const selectStyle = getSelectStyle(theme);
    const actionButton = getActionButton(theme);
    const secondaryButton = getSecondaryButton(theme);
    const deliveryStatus = getDeliveryStatus(order);

    const excelButton = {
      ...actionButton,
      border: "1px solid #2e7d32",
      color: darkMode ? "#A5D6A7" : "#2e7d32"
    };

    const pdfButton = {
      ...actionButton,
      border: "1px solid #c62828",
      color: darkMode ? "#EF9A9A" : "#c62828"
    };

    console.log("order:", order);

  return (
    <div style={{
      minHeight: "100vh",
      background: theme.background,
      color: theme.text,
      padding: 16,
      paddingBottom: 80,
      fontFamily: "monospace"
    }}>

      {/* BOTÓN VOLVER */}
      <button
        onClick={onBack}
        style={{
          marginBottom: 20,
          padding: "8px 14px",
          background: theme.surface,
          color: theme.secondaryText,
          border: `1px solid ${theme.border}`,
          borderRadius: 6,
          cursor: "pointer"
        }}
      >
        ← Volver
      </button>

      {/* CARD PRINCIPAL */}
      <div style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: 8,
        padding: 16
      }}>

        {/* HEADER */}
        <div style={{ marginBottom: 16 }}>
          {deliveryStatus && (
            <span
              style={{
                marginLeft: 10,
                fontSize: 12,
                color: deliveryStatus.color
              }}
            >
              {deliveryStatus.text}
            </span>
          )}

          <div style={{ fontSize: 18 }}>
            {isEditing ? (
              <div>
              <input
                value={form.cliente}
                onChange={e => handleChange("cliente", e.target.value)}
                style={inputStyle}
              />

              {errors.cliente && (
                 <div style={{ color: "red", fontSize: 11 }}>
                   {errors.cliente}
                 </div>
               )}
               </div>
            ) : (
              <div>{order.cliente}</div>
            )}
          </div>
        </div>

        {/* TRABAJO */}
        <div style={{
          background: theme.background,
          borderLeft: `3px solid ${theme.border}`,
          padding: 12,
          borderRadius: 6,
          marginBottom: 16
        }}>
          <div style={{
            fontSize: 11,
            color: theme.secondaryText,
            marginBottom: 6
          }}>
            TRABAJO
          </div>

          <div style={{
            fontSize: 14,
            lineHeight: 1.5
          }}>
            {isEditing ? (
              <div>
              <input
                value={form.trabajo}
                onChange={e => handleChange("trabajo", e.target.value)}
                style={inputStyle}
              />

              {errors.trabajo && (
                 <div style={{ color: "red", fontSize: 11 }}>
                   {errors.trabajo}
                 </div>
               )}
              </div>
            ) : (
              <div>{order.trabajo}</div>
            )}
          </div>
        </div>

        {/* GRID INFO */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10
        }}>

          <div style={{
            background: theme.background,
            padding: 10,
            borderRadius: 6
          }}>
            <div style={{ fontSize: 11, color: theme.secondaryText }}>
              ÁREA
            </div>
            <div>
              <span style={{ color: areaObj?.color || "#999" }}>
                {isEditing ? (
                  <select
                    value={form.area}
                    onChange={e => handleChange("area", e.target.value)}
                    style={inputStyle}
                  >
                    {AREAS.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div>{areaObj ? `${areaObj.icon} ${areaObj.label}` : "—"}</div>
                )}
              </span>
            </div>
          </div>

          <div style={{
            background: theme.background,
            padding: 10,
            borderRadius: 6
          }}>
            <div style={{ fontSize: 11, color: theme.secondaryText }}>
              PRIORIDAD
            </div>
            <div style={{
              fontSize: 12,
              padding: "4px 10px",
              borderRadius: 4,
              background: color + "22",
              color: color
            }}>
              {isEditing ? (
                <select
                  value={form.prioridad}
                  onChange={e => handleChange("prioridad", e.target.value)}
                  style={inputStyle}
                >
                  <option>Baja</option>
                  <option>Media</option>
                  <option>Alta</option>
                  <option>Urgente</option>
                </select>
              ) : (
                <div>{order.prioridad}</div>
              )}
            </div>
          </div>

          <div style={{
            background: theme.background,
            padding: 10,
            borderRadius: 6
          }}>
            <div style={{ fontSize: 11, color: theme.secondaryText }}>
              FECHA DE INGRESO
            </div>
            <div>
              {formatDate(order.fecha_ingreso)}
            </div>
          </div>

          <div style={{
            background: theme.background,
            padding: 10,
            borderRadius: 6
          }}>
            <div style={{ fontSize: 11, color: theme.secondaryText }}>
              ENTREGADO EL
            </div>

            <div style={{
              color: order.fecha_entregado ? "#81C784" : "#888"
            }}>
              {order.fecha_entregado
                ? formatDate(order.fecha_entregado)
                : "Pendiente"}
            </div>
          </div>

          <div style={{
            background: theme.background,
            padding: 10,
            borderRadius: 6
          }}>
            <div style={{ fontSize: 11, color: theme.secondaryText }}>
              FECHA DE ENTREGA
            </div>
            <div>
              <span style={{
                color: isOverdue(order) ? "#FF5252" : theme.text
                }}>
                {formatDate(order.fecha_entrega)}
                {isOverdue(order) && " ⚠"}
              </span>
            </div>
          </div>

          <div style={{
            background: theme.background,
            padding: 10,
            borderRadius: 6
          }}>
            <div style={{ fontSize: 11, color: theme.secondaryText }}>
              DIAS ASIGNADOS
            </div>
            <div>
              {isEditing ? (
                <div>
                <input
                  type="number"
                  value={form.dias_asignados || ""}
                  onChange={e => {
                    const value = e.target.value;

                    // permitir vacío (para borrar)
                    if (value === "") {
                      handleChange("dias_asignados", "");
                      return;
                    }

                    const num = Number(value);

                    // ❌ evitar negativos
                    if (num < 0) return;

                    handleChange("dias_asignados", num);
                  }}
                  min="0"
                  style={inputStyle}
                />

                {errors.dias_asignados && (
                  <div style={{ color: "red", fontSize: 11 }}>
                    {errors.dias_asignados}
                  </div>
                )}
                </div>
              ) : (
                <div>{order.dias_asignados || "—"}</div>
              )}
            </div>
          </div>

          <div style={{
            background: theme.background,
            padding: 10,
            borderRadius: 6
          }}>
            <div style={{ fontSize: 11, color: theme.secondaryText }}>
              CREADO EL
            </div>
            <div>
              {formatDate(order.creado)}
            </div>
          </div>

          <div style={{
            background: theme.background,
            padding: 10,
            borderRadius: 6
          }}>
            <div style={{ fontSize: 11, color: theme.secondaryText }}>
              CREADO POR
            </div>
            <div>
              {getUserName(order.creado_por)}
            </div>
          </div>

          <div style={{
            background: theme.background,
            padding: 10,
            borderRadius: 6
          }}>
            <div style={{ fontSize: 11, color: theme.secondaryText }}>
              ASIGNADO A
            </div>
            {isEditing ? (
                <select
                  style={selectStyle}
                  value={form.asignado_a || ""}
                  onChange={(e) =>
                    setForm({ ...form, asignado_a: e.target.value })
                  }
                >
                  <option value="">— Sin asignar —</option>
                  {users
                    .filter(u => u.rol === "trabajador")
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.nombre}
                      </option>
                    ))}
                </select>
            ) : (
              <div>{getUserName(order.asignado_a)}</div>
            )}
          </div>

        </div>

        {/* NOTAS */}
        <div style={{
          background: theme.background,
          borderLeft: `3px solid ${theme.border}`,
          padding: 12,
          borderRadius: 6,
          marginTop: 16,
          marginBottom: 16
        }}>
          <div style={{
            fontSize: 11,
            color: theme.secondaryText,
            marginBottom: 6
          }}>
            NOTAS
          </div>

          <div style={{
            fontSize: 14,
            lineHeight: 1.5
          }}>
            {isEditing ? (
              <textarea
                value={form.notas || ""}
                onChange={e => handleChange("notas", e.target.value)}
                style={{ ...inputStyle, minHeight: 80 }}
              />
            ) : (
              <div>{order.notas}</div>
            )}
          </div>
        </div>

        {!isEditing && (
          <div style={{ marginTop: 20 }}>

            {!isIneditable &&(
            <><div style={{
                fontSize: 11,
                color: theme.secondaryText,
                marginBottom: 8
              }}>
                MOVER A ÁREA
              </div><div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8
              }}>
                  {MOVIMIENTO.map(area => {
                    const isCurrent = order.area === area.id;

                    return (
                      <button
                        key={area.id}
                        onClick={async () => {
                          const success = await onMove(order.id, area.id);

                          if (success) {
                            setArea(area.id);
                          }
                        } }
                        style={{
                          padding: "8px 12px",
                          borderRadius: 6,
                          border: `1px solid ${isCurrent ? area.color : "#2A2A2A"}`,
                          background: isCurrent ? area.color : theme.background,
                          color: isCurrent ? "#0D0D0D" : theme.secondaryText,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: isCurrent ? "bold" : "normal"
                        }}
                      >
                        {area.icon} {area.label}
                      </button>
                    );
                  })}
                </div></>
            )}

            <button
               onClick={(e) => {
                  e.stopPropagation(); // ⚠️ IMPORTANTE
                  onOpenHistorial(order);
               }}
               style={{
                ...secondaryButton,
                marginTop: "18px",
                padding: "4px 8px",
                fontSize: 18
               }}>
                📖 historial
               </button>

               {areaActual === "armado" && (
                 <button
                   onClick={handleSendToControl}
                   style={{
                     ...secondaryButton,
                     marginTop: "18px",
                     padding: "4px 8px",
                     fontSize: 18
                   }}
                 >
                   🧪 Enviar a control
                 </button>
               )}

               {areaActual === "control" && (
                 <button onClick={() => handleControl(order.id)}
                 style={{
                     ...secondaryButton,
                     marginTop: "18px",
                     padding: "4px 8px",
                     fontSize: 18
                   }}
                  >
                   🧪 Abrir control
                 </button>
               )}

               {areaActual === "entrega" &&
                  user?.rol === "admin" && (

                    <>
                      {order.estado_entrega === "pendiente" && (
                        <button
                          onClick={handleEnCamino}
                          style={{
                            ...secondaryButton,
                            color: "#64B5F6",
                            marginTop: "18px",
                            padding: "4px 8px",
                            fontSize: 18
                          }}
                        >
                          🚚 Marcar en camino
                        </button>
                      )}

                      {order.estado_entrega === "en_camino" && (
                        <button
                          onClick={handleEntregar}
                          style={{
                            ...secondaryButton,
                            color: "#81C784",
                            marginTop: "18px",
                            padding: "4px 8px",
                            fontSize: 18
                          }}
                        >
                          📦 Confirmar entrega
                        </button>
                      )}

                      {order.estado_entrega === "entregada" && (
                        <button
                          onClick={handleReclamo}
                          style={{
                            ...secondaryButton,
                            color: "#FFB74D",
                            marginTop: "18px",
                            padding: "4px 8px",
                            fontSize: 18
                          }}
                        >
                          ⚠ Registrar reclamo
                        </button>
                      )}
                    </>
                  )}

          </div>
        )}

            {!isEditing && !isIneditable && user?.rol === "admin" && (
              <div style={{
                  width: "100%",
                  display: "flex",
                  gap: 10,
                  marginTop: 16
                }}>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 10,
                    background: theme.card,
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                    fontSize: 14,
                    letterSpacing: 1,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s ease"
                  }}
                >
                  ✏️ EDITAR
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    background: theme.card,
                    border: darkMode
                      ? "1px solid #3A1F1F"
                      : "1px solid #FFB3B3",
                    color: "#FF5252",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    transition: "all 0.2s ease"
                  }}
                >
                  🗑️
                </button>
              </div>
            )}

            {isEditing && !isIneditable && user?.rol === "admin" && (
                <div style={{
                  width: "100%",
                  display: "flex",
                  gap: 10,
                  marginTop: 16
                }}>

                  <button
                    onClick={handleSave}
                    style={{
                      flex: 1,
                      padding: "14px",
                      borderRadius: 10,
                      border: "none",
                      background: "#FFB74D",
                      color: "#0D0D0D",
                      fontWeight: "bold",
                      letterSpacing: 1,
                      cursor: "pointer"
                    }}
                  >
                    GUARDAR OT
                  </button>

                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setForm(order);
                    }}
                    style={{
                      ...actionButton,
                      flex: 1,
                      padding: "14px",
                      borderRadius: 10,
                      cursor: "pointer"
                    }}
                  >
                    CANCELAR
                  </button>

                </div>
            )}

            {isIneditable && (
              <div style={{
                marginTop: 16,
                padding: 12,
                borderRadius: 10,
                background: "#2A1A1A",
                border: "1px solid #5A2A2A",
                color: "#FFB74D",
                fontSize: 13
              }}>
                🔒 Orden bloqueada
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
              <button
                style={excelButton}
                onClick={() => exportToExcel(order)}
              >
                📊 Excel
              </button>

              <button
                style={pdfButton}
                onClick={handleExportPDF}
              >
                📄 PDF
              </button>
            </div>
      </div>

      {showDeleteModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>

          <div style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            padding: 20,
            borderRadius: 10,
            width: "85%",
            maxWidth: 320
          }}>

            {/* TÍTULO */}
            <div style={{
              fontSize: 16,
              marginBottom: 10,
              fontWeight: "bold"
            }}>
              Eliminar orden
            </div>

            {/* TEXTO */}
            <div style={{
              fontSize: 13,
              color: theme.secondaryText,
              marginBottom: 20
            }}>
              ¿Seguro que querés eliminar esta orden?
              <br />
              <span style={{ color: "#FF5252" }}>
                Esta acción no se puede deshacer.
              </span>
            </div>

            {/* BOTONES */}
            <div style={{
              display: "flex",
              gap: 10
            }}>

              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid #2A2A2A",
                  background: "#1A1A1A",
                  color: "#888",
                  cursor: "pointer"
                }}
              >
                Cancelar
              </button>

              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 8,
                  border: "none",
                  background: "#FF5252",
                  color: "#0D0D0D",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Eliminar
              </button>

            </div>

          </div>
        </div>
      )}

    </div>   
  );
}

export default OrderDetailView;