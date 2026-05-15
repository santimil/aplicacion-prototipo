import { updateOrder, deleteOrder, getHistorial, getUsuarios, getControlByOrder, sendOrderToControl, entregarOrden } from "../services/api";
import { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import { supabase } from "../supabaseClient";

const PCOLORS = {
  Baja: "#4FC3F7",
  Media: "#FFB74D",
  Alta: "#EF9A9A",
  Urgente: "#FF5252"
};

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

const MOVIMIENTO = [
  { id: "inicio", label: "Inicio", icon: "▶", color: "#4FC3F7" },
  { id: "corte", label: "Corte", icon: "✂", color: "#FFB74D" },
  { id: "plegado", label: "Plegado", icon: "⌐", color: "#CE93D8" },
  { id: "soldadura", label: "Soldadura", icon: "⚡", color: "#EF9A9A" },
  { id: "pulido", label: "Pulido", icon: "◎", color: "#80CBC4" },
  { id: "pintura", label: "Pintura", icon: "◉", color: "#A5D6A7" },
  { id: "armado", label: "Armado/Ductos", icon: "⬡", color: "#FFF176" }
];

export async function exportToExcel(order) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Orden");

    sheet.addRow(["Número", "Cliente", "Trabajo", "Área", "Prioridad", "Fecha Ingreso", "Fecha Entrega", "Días Asignados"]);
    sheet.addRow([order.numero, order.cliente, order.trabajo, order.area, order.prioridad, order.fecha_ingreso, order.fecha_entrega, order.dias_asignados]);

    sheet.columns.forEach((column, i) => {
      let maxLength = 10;

      column.eachCell({ includeEmpty: true }, cell => {
        const length = cell.value ? cell.value.toString().length : 0;
        if (length > maxLength) {
          maxLength = length;
        }
      });

      // limitar ancho máximo (clave)
      column.width = Math.min(maxLength + 2, 30);
    });

    sheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(new Blob([buffer]), `orden_${order.numero}.xlsx`);
  }

  export function exportToPDF(order, historial = []) {
    console.log("orden pdf", order);
    const doc = new jsPDF();

    let y = 15;

    // 🔹 Título
    doc.setFontSize(18);
    doc.text("ORDEN DE TRABAJO", 105, y, { align: "center" });

    y += 10;

    doc.setDrawColor(200);
    doc.line(10, y, 200, y); // línea separadora

    y += 10;

    // 🔹 Datos principales
    doc.setFontSize(12);

    doc.text(`Número: ${order.numero}`, 10, y);
    doc.text(`Cliente: ${order.cliente}`, 120, y);

    y += 10;

    // 🔹 Trabajo (bloque grande)
    doc.setFontSize(13);
    doc.text("Trabajo:", 10, y);

    y += 6;

    doc.setFontSize(10);

    const trabajoTexto = doc.splitTextToSize(
      order.trabajo || "-",
      180
    );

    doc.text(trabajoTexto, 10, y);

    y += trabajoTexto.length * 6 + 5;

    // 🔹 Caja de detalles
    doc.setDrawColor(180);

    const startY = y;

    let boxHeight = 0;
    boxHeight += 8;
    boxHeight += 8;
    boxHeight += 8;
    boxHeight += 8;

    doc.rect(10, startY, 190, boxHeight);

    y = startY + 8;

    doc.setFontSize(11);

    doc.text(`Área: ${order.area}`, 15, y);

    const color = PCOLORS[order.prioridad] || "#FFFFFF";

    doc.setTextColor(color);
    doc.text(`Prioridad: ${order.prioridad}`, 120, y);

    doc.setTextColor(0);

    y += 8;

    doc.text(`Fecha Ingreso: ${order.fecha_ingreso || "-"}`, 15, y);
    doc.text(`Fecha Entrega: ${order.fecha_entrega || "-"}`, 120, y);

    y += 8;

    doc.text(`Días Asignados: ${order.dias_asignados || "-"}`, 15, y);

    // 👉 IMPORTANTE: salir de la caja correctamente
    y = startY + boxHeight;

    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    // 🔹 HISTORIAL

    y += 15;

    doc.setFontSize(14);
    doc.setTextColor(50);
    doc.text("Historial de movimientos", 10, y);
    doc.setTextColor(0);

    y += 6;

    const histStartY = y;

    y += 8;

    doc.setFontSize(10);

    historial.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    historial.forEach(h => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      const fecha = new Date(h.timestamp).toLocaleString();

      // 🔹 punto tipo timeline
      doc.setFillColor(120);
      const textY = y;
      doc.circle(12, textY - 1, 1.2, "F");

      // 🔹 fecha (gris)
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(fecha, 16, y);

      y += 5;

      // 🔹 movimiento (más grande)
      doc.setFontSize(11);

      doc.setTextColor(100);
      doc.text(h.area_anterior, 18, y);

      const offset = doc.getTextWidth(h.area_anterior);

      doc.setTextColor(0);
      doc.text(" >>>", 18 + offset, y);

      const arrowOffset = doc.getTextWidth(" >>> ");

      doc.setTextColor(255, 140, 0);
      doc.text(h.area_nueva, 18 + offset + arrowOffset, y);

      doc.setTextColor(0);

      y += 10; // más espacio entre items
    });

    const histEndY = y;

    doc.setDrawColor(200);
    if (histEndY - histStartY < 200) {
      doc.rect(10, histStartY, 190, histEndY - histStartY);
    }

    // 🔹 Footer
    doc.setFontSize(8);
    doc.setTextColor(120);

    doc.text(
      `Generado: ${new Date().toLocaleString()}`,
      10,
      280
    );

    // Guardar
    doc.save(`orden_${order.numero}.pdf`);
  }

function OrderDetail({ orderId, orders, onBack, onMove, onUpdate, onOpenHistorial, users, user, handleControl }) {

  const order = orders.find(o => o.id === orderId);

  const [areaActual, setArea] = useState(order.area);

  const isIneditable = areaActual === "control" || areaActual === "entrega";

  useEffect(() => {
    setArea(order.area);
  }, [order.area]);

  const handleExportPDF = async () => {
    const historial = await getHistorial(orderId);
    exportToPDF(order, historial);
  };

  // ✅ DESPUÉS usás funciones que dependen de order
  function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;

    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

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
    return user ? user.nombre : "—";
  };

  const [errors, setErrors] = useState({});
  const validate = () => {
  const newErrors = {};

  if (!form.cliente?.trim()) newErrors.cliente = "Requerido";
  if (!form.trabajo?.trim()) newErrors.trabajo = "Requerido";
  
  if (form.dias_asignados !== "" && form.dias_asignados < 0) {
    newErrors.dias_asignados = "No puede ser negativo";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(order);

  const [showDeleteModal, setShowDeleteModal] = useState(false);


  useEffect(() => {
    setForm(order);
  }, [order]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!validate()) return;

    const { id, creado, ...updates } = form;

    const updated = await updateOrder(order.id, updates);

    onUpdate(updated);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteOrder(order.id);

    setShowDeleteModal(false);

    // volver al tablero
    onBack();

    // actualizar lista
    onUpdate({ id: order.id, deleted: true });
  };

  // 🛑 seguridad (muy importante)
  if (!order) {
    return <div>Cargando...</div>;
  }

  async function handleSendToControl() {
    try {
      await sendOrderToControl(order.id);

      alert("Orden enviada a control");

      onBack();

    } catch (err) {
      console.error(err);

      alert(
        err.message || "Error enviando a control"
      );
    }
  }

  async function handleEntregar() {
    try {

      const updated = await entregarOrden(order.id);

      onUpdate(updated);

      alert("Orden entregada");

    } catch (err) {
      console.error(err);

      alert(
        err.message || "Error marcando entrega"
      );
    }
  }

  const areaObj = AREAS.find(a => a.id === (isEditing ? form.area : order.area));

  const color = PCOLORS[order.prioridad] || "#999";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0D0D0D",
      color: "#E8E0D0",
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
          background: "#1A1A1A",
          color: "#888",
          border: "1px solid #2A2A2A",
          borderRadius: 6,
          cursor: "pointer"
        }}
      >
        ← Volver
      </button>

      {/* CARD PRINCIPAL */}
      <div style={{
        background: "#161616",
        border: "1px solid #2A2A2A",
        borderRadius: 8,
        padding: 16
      }}>

        {/* HEADER */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#FFB74D"
          }}>
            {order.numero || "SIN N°"}
            {isDelivered(order) ? (
              <span style={{
                marginLeft: 10,
                fontSize: 12,
                color: "#81C784"
              }}>
                ✅ ENTREGADA
              </span>
            ) : isOverdue(order) && (
              <span style={{
                marginLeft: 10,
                fontSize: 12,
                color: "#FF5252"
              }}>
                ⚠ VENCIDA
              </span>
            )}
          </div>

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
          background: "#0D0D0D",
          padding: 12,
          borderRadius: 6,
          marginBottom: 16,
          borderLeft: "3px solid #2A2A2A"
        }}>
          <div style={{
            fontSize: 11,
            color: "#666",
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
            background: "#0D0D0D",
            padding: 10,
            borderRadius: 6
          }}>
            <div style={{ fontSize: 11, color: "#666" }}>
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
            background: "#0D0D0D",
            padding: 10,
            borderRadius: 6
          }}>
            <div style={{ fontSize: 11, color: "#666" }}>
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
            background: "#0D0D0D",
            padding: 10,
            borderRadius: 6
          }}>
            <div style={{ fontSize: 11, color: "#666" }}>
              FECHA DE INGRESO
            </div>
            <div>
              {formatDate(order.fecha_ingreso)}
            </div>
          </div>

          <div style={{
            background: "#0D0D0D",
            padding: 10,
            borderRadius: 6
          }}>
            <div style={{ fontSize: 11, color: "#666" }}>
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
            background: "#0D0D0D",
            padding: 10,
            borderRadius: 6
          }}>
            <div style={{ fontSize: 11, color: "#666" }}>
              FECHA DE ENTREGA
            </div>
            <div>
              <span style={{
                color: isOverdue(order) ? "#FF5252" : "#E8E0D0"
                }}>
                {formatDate(order.fecha_entrega)}
                {isOverdue(order) && " ⚠"}
              </span>
            </div>
          </div>

          <div style={{
            background: "#0D0D0D",
            padding: 10,
            borderRadius: 6
          }}>
            <div style={{ fontSize: 11, color: "#666" }}>
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
            background: "#0D0D0D",
            padding: 10,
            borderRadius: 6
          }}>
            <div style={{ fontSize: 11, color: "#666" }}>
              CREADO EL
            </div>
            <div>
              {formatDate(order.creado)}
            </div>
          </div>

          <div style={{
            background: "#0D0D0D",
            padding: 10,
            borderRadius: 6
          }}>
            <div style={{ fontSize: 11, color: "#666" }}>
              CREADO POR
            </div>
            <div>
              {getUserName(order.creado_por)}
            </div>
          </div>

          <div style={{
            background: "#0D0D0D",
            padding: 10,
            borderRadius: 6
          }}>
            <div style={{ fontSize: 11, color: "#666" }}>
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
          background: "#0D0D0D",
          padding: 12,
          borderRadius: 6,
          marginTop: 16,
          marginBottom: 16,
          borderLeft: "3px solid #2A2A2A"
        }}>
          <div style={{
            fontSize: 11,
            color: "#666",
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
                color: "#666",
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
                          background: isCurrent ? area.color : "#1A1A1A",
                          color: isCurrent ? "#0D0D0D" : "#666",
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
                background: "#1A1A1A",
                color: "#777",
                border: "1px solid #2A2A2A",
                borderRadius: 6,
                marginTop: "18px",
                padding: "4px 8px",
                cursor: "pointer",
                fontSize: 18
               }}>
                📖 historial
               </button>

               {areaActual === "armado" && (
                 <button
                   onClick={handleSendToControl}
                   style={{
                     background: "#1A1A1A",
                     color: "#777",
                     border: "1px solid #2A2A2A",
                     borderRadius: 6,
                     marginTop: "18px",
                     padding: "4px 8px",
                     cursor: "pointer",
                     fontSize: 18
                   }}
                 >
                   🧪 Enviar a control
                 </button>
               )}

               {areaActual === "control" && (
                 <button onClick={() => handleControl(orderId)}
                 style={{
                     background: "#1A1A1A",
                     color: "#777",
                     border: "1px solid #2A2A2A",
                     borderRadius: 6,
                     marginTop: "18px",
                     padding: "4px 8px",
                     cursor: "pointer",
                     fontSize: 18
                   }}
                  >
                   🧪 Abrir control
                 </button>
               )}

               {areaActual === "entrega" &&
                  user?.rol === "admin" &&
                  !order.fecha_entregado && (
                    <button
                      onClick={handleEntregar}
                      style={{
                        background: "#1A1A1A",
                        color: "#81C784",
                        border: "1px solid #2A2A2A",
                        borderRadius: 6,
                        marginTop: "18px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: 18
                      }}
                    >
                      📦 Marcar entregada
                    </button>
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
                    border: "1px solid #2A2A2A",
                    background: "#161616",
                    color: "#E8E0D0",
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
                    border: "1px solid #3A1F1F",
                    background: "#161616",
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
                      flex: 1,
                      padding: "14px",
                      borderRadius: 10,
                      border: "1px solid #2A2A2A",
                      background: "#161616",
                      color: "#888",
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
            background: "#161616",
            padding: 20,
            borderRadius: 10,
            width: "85%",
            maxWidth: 320,
            border: "1px solid #2A2A2A"
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
              color: "#888",
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

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: 4,
  background: "#111",
  border: "1px solid #2A2A2A",
  borderRadius: 6,
  color: "#E8E0D0",
  outline: "none",
  boxSizing: "border-box"
};

const selectStyle = {
  width: "100%",
  padding: "8px",
  background: "#1A1A1A",
  color: "#E8E0D0",
  border: "1px solid #2A2A2A",
  borderRadius: 6,
  fontSize: 12,
  outline: "none",
  cursor: "pointer"
};

const actionButton = {
  flex: 1,
  padding: "12px",
  borderRadius: 10,
  border: "1px solid #2A2A2A",
  background: "#161616",
  color: "#E8E0D0",
  fontSize: 13,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  transition: "all 0.2s ease"
};

const excelButton = {
  ...actionButton,
  border: "1px solid #2e7d32",
  color: "#A5D6A7"
};

const pdfButton = {
  ...actionButton,
  border: "1px solid #c62828",
  color: "#EF9A9A"
};

export default OrderDetail;