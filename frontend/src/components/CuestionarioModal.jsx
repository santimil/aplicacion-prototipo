import { useEffect, useState } from "react";
import { updateCuestionario } from "../services/api";
import { supabase } from "../supabaseClient";
import { getPlanos, deletePlano, uploadPlanos } from "../services/api";
import { overlay, getModalStyle, getInputStyle, getLabelStyle, buttonPrimary, buttonSecondary, dangerButtonStyle,
  getActionButton, getCardStyle, chipStyle, sectionTitleStyle } from "../styles/styles";

function CuestionarioModal({ order, onClose, onSaveLocal, theme }) {

  const [planosFiles, setPlanosFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [existingPlanos, setExistingPlanos] = useState([]);
  const [selectedExistingPlano, setSelectedExistingPlano] = useState(null);

  const handlePlanosChange = (e) => {
    setPlanosFiles(Array.from(e.target.files));
    console.log("cambio de planos", planosFiles);
  };

  const [form, setForm] = useState({
    color: "",
    llaves: false,
    marca_llaves: "",
    tablero_completo: false,
    tipo_cierre: "",
    espesor_chapa: "",
    tipo_chapa: "",
    planos_archivos: [],
    informacion_especifica: ""
  });

  // ⚠️ Supabase devuelve array
  useEffect(() => {
    console.log("cargado", order);
    if (order?.cuestionario?.[0]) {
      setForm(order.cuestionario[0]);
    }
  }, [order]);

  useEffect(() => {
    async function loadPlanos() {

      const cuestionarioId = order?.cuestionario?.[0]?.id;

      // 🔥 limpiar estado al cambiar order
      setExistingPlanos([]);
      setSelectedExistingPlano(null);

      if (!cuestionarioId) return;

      try {

        const data = await getPlanos(cuestionarioId);

        const safeData = Array.isArray(data)
          ? data
          : [];

        setExistingPlanos(safeData);

        if (safeData.length > 0) {
          setSelectedExistingPlano(safeData[0]);
        }

      } catch (err) {

        console.error("Error cargando planos:", err);

        setExistingPlanos([]);
        setSelectedExistingPlano(null);
      }
    }

    loadPlanos();
  }, [order]);

  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {

      await updateCuestionario(order.id, form);

      if (planosFiles.length > 0) {

        const formData = new FormData();

        planosFiles.forEach(item => {
          formData.append("files", item.file);
        });

        await uploadPlanos(
          order.cuestionario[0].id,
          formData
        );
      }

      onSaveLocal(order.id, form);

      onClose();

    } catch (err) {

      console.error(err);

    } finally {

      setSaving(false);
    }
  };

  const modal = getModalStyle(theme);
  const inputStyle = getInputStyle(theme);
  const cardStyle = getCardStyle(theme);
  const uploadButtonStyle = getActionButton(theme);
  const labelStyle = getLabelStyle(theme);

  return (
    <div style={overlay}>

      <div style={modal}>

        <h3 style={{ color: "#FFB74D", marginBottom: 10 }}>
          📋 Detalles - {order.numero}
        </h3>

        {/* COLOR */}
        <label style={labelStyle}>
          🖌️ Color
        </label>

        <input
          style={inputStyle}
          placeholder="Color"
          value={form.color || ""}
          onChange={e => handleChange("color", e.target.value)}
        />

        {/* LLAVES */}
        <label style={labelStyle}>
          <input
            type="checkbox"
            checked={form.llaves || false}
            onChange={e => handleChange("llaves", e.target.checked)}
          />
          Tiene llaves
        </label>

        {/* MARCA LLAVES */}
        

        {form.llaves && (
          <div>
            <label style={labelStyle}>
            🔑 Marca de llaves
            </label>
            <input
              style={inputStyle}
              placeholder="Marca de llaves"
              value={form.marca_llaves || ""}
              onChange={e => handleChange("marca_llaves", e.target.value)}
            />
          </div>
        )}

        {/* TABLERO */}
        <label style={labelStyle}>
          <input
            type="checkbox"
            checked={form.tablero_completo || false}
            onChange={e => handleChange("tablero_completo", e.target.checked)}
          />
          Tablero completo
        </label>

        <label style={labelStyle}>
          🔐​​ Tipo de cierre
        </label>

        <input
          style={inputStyle}
          placeholder="Tipo de cierre"
          value={form.tipo_cierre || ""}
          onChange={e => handleChange("tipo_cierre", e.target.value)}
        />

        <label style={labelStyle}>
          📏​ Espesor de chapa
        </label>

        <input
          style={inputStyle}
          placeholder="Espesor chapa"
          value={form.espesor_chapa || ""}
          onChange={e => handleChange("espesor_chapa", e.target.value)}
        />

        <label style={labelStyle}>
          🧱​​ Tipo de chapa
        </label>

        <input
          style={inputStyle}
          placeholder="Tipo de chapa"
          value={form.tipo_chapa || ""}
          onChange={e => handleChange("tipo_chapa", e.target.value)}
        />

        <label style={{
          ...sectionTitleStyle,
          marginTop: 12
          }}>
          📐 Subir planos
        </label>

        <label style={uploadButtonStyle}>
         📁 Seleccionar archivos

          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            style={{ display: "none" }}
            onChange={e => {
              const files = Array.from(e.target.files);

              const mapped = files.map(file => ({
                file,
                preview: file.type.startsWith("image/")
                  ? URL.createObjectURL(file)
                  : null
              }));

              setPlanosFiles(prev => [...prev, ...mapped]);
            }}
          />
        </label>

        {planosFiles.length > 0 && (
          <div style={{
            marginTop: 10,
            display: "flex",
            flexDirection: "column",
            gap: 10
          }}>
            {planosFiles.map((item, index) => (
              <div
                key={index}
                style={cardStyle}
              >
                <div style={{
                  color: "#E8E0D0",
                  fontSize: 13,
                  marginBottom: 8
                }}>
                  {item.file.name}
                </div>

                {item.preview ? (
                  <img
                    src={item.preview}
                    alt=""
                    style={{
                      width: "100%",
                      maxHeight: 180,
                      objectFit: "contain",
                      borderRadius: 6
                    }}
                  />
                ) : (
                  <div style={{
                    color: "#AAA",
                    fontSize: 14
                  }}>
                    📄 PDF
                  </div>
                )}

                <button
                  onClick={() => {
                    setPlanosFiles(prev =>
                      prev.filter((_, i) => i !== index)
                    );
                  }}
                  style={{
                    marginTop: 8,
                    background: "#2A2A2A",
                    border: "none",
                    color: "#E8E0D0",
                    padding: "6px 10px",
                    borderRadius: 6,
                    cursor: "pointer"
                  }}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        {existingPlanos.length > 0 && (
          <div style={{ marginTop: 15 }}>

            <div style={{
              color: theme.text,
              fontSize: 12,
              marginBottom: 8
            }}>
              Planos actuales
            </div>

            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8
            }}>
              {existingPlanos.map(plano => (

                <button
                  key={plano.id}
                  onClick={() => setSelectedExistingPlano(plano)}
                  style={{
                    ...chipStyle,

                    color:
                      selectedExistingPlano?.id === plano.id
                        ? "#111"
                        : theme.text,

                      background:
                      selectedExistingPlano?.id === plano.id
                        ? "#FFB74D"
                        : theme.card,

                      border: `1px solid ${theme.border}`
                  }}
                >
                  {plano.nombre}
                </button>

              ))}
            </div>
          </div>
        )}

        {selectedExistingPlano && (

          <div style={{
            ...cardStyle,
            marginTop: 12,
            marginBottom: 12
          }}>

            <div style={{
              color: "#E8E0D0",
              marginBottom: 10,
              fontSize: 13
            }}>
              {selectedExistingPlano.nombre}
            </div>

            {selectedExistingPlano.nombre.match(/\.(jpg|jpeg|png|webp)$/i) ? (

              <img
                src={selectedExistingPlano.url}
                alt=""
                style={{
                  width: "100%",
                  maxHeight: 220,
                  objectFit: "contain",
                  borderRadius: 8
                }}
              />

            ) : (

              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                padding: 20
              }}>
                <div style={{ fontSize: 42 }}>📄</div>

                <a
                  href={selectedExistingPlano.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "#FFB74D",
                    textDecoration: "none"
                  }}
                >
                  Abrir PDF
                </a>
              </div>

            )}

            <button
              style={{
                ...dangerButtonStyle,
                marginTop: 10
              }}
              onClick={async () => {

                await deletePlano(selectedExistingPlano.id);

                setExistingPlanos(prev =>
                  prev.filter(
                    p => p.id !== selectedExistingPlano.id
                  )
                );

                setSelectedExistingPlano(null);
              }}
            >
              Eliminar plano
            </button>

          </div>
        )}

        <textarea
          style={{ ...inputStyle, minHeight: 80, marginTop: 10 }}
          placeholder="Información específica"
          value={form.informacion_especifica || ""}
          onChange={e => handleChange("informacion_especifica", e.target.value)}
        />

        {/* BOTONES */}
        <div style={{ display: "flex", gap: 10, marginTop: 15, 
            position: "sticky",
            bottom: 0}}>
          <button style={{...buttonSecondary, background: theme.surface,
            color: theme.text,}} onClick={onClose}>
            Cancelar
          </button>

          <button
            style={buttonPrimary}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default CuestionarioModal;