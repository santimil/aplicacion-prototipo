import { useState, useEffect } from "react";


function OrderForm({ onCreate, onCancel, prefill }) {
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

  return (
    <div style={{
      padding: 12,
      paddingBottom: 80,
      color: "#E8E0D0"
    }}>

      {/* TÍTULO */}
      <h2 style={{
        marginBottom: 16,
        color: "#E8E0D0"
      }}>
        Nueva Orden
      </h2>

      {/* INPUT */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: "#666" }}>
          NÚMERO OT
        </label>
        <input
          value={form.numero}
          onChange={e => handleChange("numero", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: "#666" }}>
          CLIENTE
        </label>
        <input
          value={form.cliente}
          onChange={e => handleChange("cliente", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: "#666" }}>
          TRABAJO
        </label>
        <input
          value={form.trabajo}
          onChange={e => handleChange("trabajo", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: "#666" }}>
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
        <label style={{ fontSize: 12, color: "#666" }}>
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
        <label style={{ fontSize: 12, color: "#666" }}>
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
        <label style={{ fontSize: 12, color: "#666" }}>
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
        <label style={{ fontSize: 12, color: "#666" }}>
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
            background: "#1A1A1A",
            color: "#666",
            border: "1px solid #2A2A2A",
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

export default OrderForm;