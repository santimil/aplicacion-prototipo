import { useState, useEffect } from "react";
import {
  getInputStyle
} from "../styles/styles";


function OrderForm({ onCreate, onCancel, prefill, theme }) {
  const [form, setForm] = useState({
    numero: "",
    cliente: "",
    trabajo: "",
    fechaIngreso: "",
    diasAsignados: "",
    area: "inicio",
    prioridad: "baja",
    notas: ""
  });

  useEffect(() => {
    if (prefill) {
      setForm(prev => ({
        ...prev,
        ...prefill
      }));
    }
  }, [prefill]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const inputStyle = getInputStyle(theme);

  return (
    <div style={{
      padding: 12,
      paddingBottom: 80,
      color: theme.text
    }}>

      {/* TÍTULO */}
      <h2 style={{
        marginBottom: 16,
        color: theme.text
      }}>
        Nueva Orden
      </h2>

      {/* INPUT */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: theme.secondaryText }}>
          NÚMERO OT
        </label>
        <input
          value={form.numero}
          onChange={e => handleChange("numero", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: theme.secondaryText }}>
          CLIENTE
        </label>
        <input
          value={form.cliente}
          onChange={e => handleChange("cliente", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: theme.secondaryText }}>
          TRABAJO
        </label>
        <input
          value={form.trabajo}
          onChange={e => handleChange("trabajo", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: theme.secondaryText }}>
          FECHA INGRESO
        </label>
        <input
          type="date"
          value={form.fechaIngreso}
          onChange={e => handleChange("fechaIngreso", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: theme.secondaryText }}>
          DIAS ASIGNADOS
        </label>
        <input
          type="number"
          value={form.diasAsignados}
          onChange={e => handleChange("diasAsignados", Number(e.target.value))}
          style={inputStyle}
          min="0"
        />
      </div>

      {/* SELECT AREA */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: theme.secondaryText }}>
          ÁREA
        </label>
        <select
          value={form.area}
          onChange={e => handleChange("area", e.target.value)}
          style={inputStyle}
        >
          <option value="inicio">Inicio</option>
          <option value="corte">Corte</option>
          <option value="plegado">Plegado</option>
          <option value="soldadura">Soldadura</option>
          <option value="limpieza">Pulido</option>
          <option value="pintura">Pintura</option>
          <option value="armado">Armado</option>
        </select>
      </div>

      {/* SELECT PRIORIDAD */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, color: theme.secondaryText }}>
          PRIORIDAD
        </label>
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
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, color: theme.secondaryText }}>
          NOTAS
        </label>
        <textarea
          value={form.notas}
          onChange={e => handleChange("notas", e.target.value)}
          style={{
            ...inputStyle,
            minHeight: 80,
            resize: "none"
          }}
        />
      </div>

      {/* BOTONES */}
      <div style={{
        display: "flex",
        gap: 10
      }}>
        <button
          onClick={() => onCreate(form)}
          style={{
            flex: 1,
            padding: "10px",
            background: "#FFB74D",
            color: "#0D0D0D",
            border: "none",
            borderRadius: 6,
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          GUARDAR
        </button>

        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: "10px",
            background: theme.card,
            color: theme.secondaryText,
            border: `1px solid ${theme.border}`,
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          CANCELAR
        </button>
      </div>

    </div>
  );
}

export default OrderForm;