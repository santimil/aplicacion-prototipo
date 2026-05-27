import { useRef, useState, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { cleanData } from "../services/cleanData";
import { supabase } from "../supabaseClient";
import { uploadFile, createOrder, updateCuestionario, getNotifications, markNotificationAsRead } from "../services/api";

function Header({ orders, onNewOrder, setPrefillQueue, setCurrentPrefill, fetchOrders, setView, selectO, user, view, setPrev, handleLogout }) {

  const cameraRef = useRef();
  const fileRef = useRef();
  const [pendingFiles, setPendingFiles] = useState([]);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [mode, setMode] = useState("manual");
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);


  async function handleImage(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (files.length === 1) {
      processFiles(files, "manual");
    } else {
      setPendingFiles(files);
      setShowModeSelector(true);
    }
  }

  async function processFiles(files, mode) {
    setLoadingOCR(true);
    setTotalFiles(files.length);

    const results = [];

    for (let i = 0; i < files.length; i++) {
      setCurrentIndex(i + 1);

      const file = files[i];
      let data;

      const formData = new FormData();

      // 🔥 UN SOLO LUGAR para decidir tipo
      if (file.type.startsWith("image/")) {

        const compressedFile = await imageCompression(file, {
          maxSizeMB: 0.35,
          maxWidthOrHeight: 1280,
          useWebWorker: true
        });

        formData.append("file", compressedFile);

      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel"
      ) {

        formData.append("file", file);

      } else if (file.type === "application/pdf") {

        formData.append("file", file);

      } else {
        console.warn("Tipo no soportado:", file.type);
        continue;
      }

      try {
        data = await uploadFile(formData);

      } catch (err) {
        console.error(
          "Error procesando archivo:",
          file.name,
          err
        );

        continue;
      }

      // 🆕 Excel con metadata
      let items = [];

      // 🧠 Normalizar respuesta
      if (data?.data) {
        // Excel
        if (data.skipped > 0) {
          alert(`⚠️ ${data.skipped} filas inválidas ignoradas`);
        }
        items = data.data;

      } else if (Array.isArray(data)) {
        // PDF o múltiples
        items = data;

      } else {
        // Imagen o único
        items = [data];
      }

      // 🔥 Un solo punto de limpieza
      const cleanedArray = items.map(d => cleanData(d));
      results.push(...cleanedArray);
    }

    setLoadingOCR(false);

    const validResults = results.filter(r => r.numero && r.cliente);

    if (validResults.length > 1) {

      const autoCreate = confirm(
        `Se detectaron ${validResults.length} órdenes.\n\n` +
        `Aceptar = crear automáticamente\n` +
        `Cancelar = revisar una por una`
      );

      if (autoCreate) {

        await handleAutoCreate(validResults);

      } else {

        setPrefillQueue(validResults);
        setCurrentPrefill(validResults[0] || null);
        setView("form");
      }

    } else {

      setPrefillQueue(validResults);
      setCurrentPrefill(validResults[0] || null);
      setView("form");
    }
  }

  function handleModeSelect(selectedMode) {
    setMode(selectedMode);
    setShowModeSelector(false);
    processFiles(pendingFiles, selectedMode);
    setPendingFiles([]);
  }

  async function handleAutoCreate(prefills) {
    try {
      for (const prefill of prefills) {
        console.log("PREFILL:", prefill);
        // 1️⃣ crear orden
        const order = await createOrder({
          ...prefill,
          diasAsignados: prefill.diasAsignados || 10,
          usuario_id: user.id
        });

        // 2️⃣ actualizar cuestionario
        if (prefill.cuestionario) {
          await updateCuestionario(order.id, prefill.cuestionario);
        }
      }

      // 3️⃣ volver a kanban
      await fetchOrders();
      setView("kanban");

    } catch (err) {
      console.error("Error en auto create:", err);
    }
  }

  const unreadCount = notifications.filter(n => !n.leido).length;

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();

      setNotifications(data);

    } catch (err) {
      console.error(
        "Error cargando notificaciones",
        err
      );
    }
  };

  async function handleNotificationClick(n) {
    try {
      // 1. actualizar estado local
      setNotifications(prev =>
        prev.map(item =>
          item.id === n.id ? { ...item, leido: true } : item
        )
      );

      // 2. marcar como leída si no lo esta
      if (!n.leido) {
        try {
          await markNotificationAsRead(n.id);

        } catch (err) {
          console.error(
            "Error marcando como leída",
            err
          );
        }
      }

      // 3. buscar la orden en memoria
      const order = orders.find(o => o.id === n.order_id);

      if (!order) {
        console.warn("Orden no encontrada en frontend");
        return;
      }

      // 4. setear
      selectO(order);
      if (
        n.tipo === "consulta_nueva" ||
        n.tipo === "consulta_respondida"
      ) {

        setView("Consultas");

      } else {

        setView("detail");
      }

      // 5. cerrar menú
      setMenuOpen(false);
      setShowNotifications(false);

    } catch (err) {
      console.error("Error al abrir notificación", err);
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".menu-container")) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      window.addEventListener("click", handleClickOutside);
    }

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: "#111",
      borderBottom: "1px solid #1E1E1E",
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      gap: 8
    }}>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={(e) => handleImage(e, "camera")}
      />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => handleImage(e, "file")}
      />

      {/* LOGO */}
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "13px",
        letterSpacing: "0.15em",
        margin: 0,
        padding: 0,
        flexShrink: 0,
        fontWeight: "bold",
      }}>
        TALLER <span style={{ color: "#FFB74D" }}>PROD</span>
      </div>

      <div style={{
        marginLeft: "auto",
        display: "flex",
        gap: 8,
        alignItems: "center"
      }}>

        {/* 📷 CAMARA */}
        <button 
          onClick={() => cameraRef.current.click()}
          style={{
            padding: "8px 8px",
            background: "#1A1A1A",
            color: "#FFB74D",
            border: "1px solid #FFB74D55",
            borderRadius: 8,
            fontSize: 18,
            lineHeight: 1,
            cursor: "pointer"
          }}>
          📷
        </button>

        {/* 🖼 GALERIA */}
        <button 
          onClick={() => fileRef.current.click()}
          style={{
            padding: "8px 8px",
            background: "#1A1A1A",
            color: "#80CBC4",
            border: "1px solid #80CBC455",
            borderRadius: 8,
            fontSize: 18,
            lineHeight: 1,
            cursor: "pointer"
          }}>
          🖼
        </button>

        {/* ➕ NUEVA ORDEN */}
        <button
          onClick={onNewOrder}
          style={{
            padding: "10px 12px",
            background: "#FFB74D",
            color: "#0D0D0D",
            borderRadius: 6,
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: 12
          }}
        >
          + <span style={{margin: 3}}>OT</span>
        </button>

        <div className="menu-container">
          <button 
            onClick={() => {
              setMenuOpen(!menuOpen);
            }}
            style={{
              position: "relative",
              fontSize: 20,
              background: "transparent",
              border: "none",
              color: "#E8E0D0",
              cursor: "pointer"
            }}
          >
            ☰

            {unreadCount > 0 && (
              <span style={{
                position: "absolute",
                top: -5,
                right: -8,
                background: "red",
                color: "white",
                borderRadius: "50%",
                fontSize: 10,
                padding: "2px 6px"
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {menuOpen && (
            <div style={{
              position: "absolute",
              top: "60px",
              right: "10px",
              width: "260px",
              maxHeight: "300px", // 🔥 clave
              overflowY: "auto",  // 🔥 scroll vertical
              background: "#2b2b2b",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              padding: "10px",
              zIndex: 9999,
            }}>
              
              <button style={menuItemStyle} onClick={() => setShowNotifications(prev => !prev)}>
                🔔 Notificaciones ({unreadCount})
              </button>

              {showNotifications && (
                <div style={{
                  marginTop: 10,
                  maxHeight: "200px",
                  overflowY: "auto",
                  borderTop: "1px solid #444",
                  paddingTop: 10
                }}>
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: 12, opacity: 0.7 }}>
                      No hay notificaciones
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        style={{
                          background: n.tipo === "alerta" ? "#7a1f1f" : "#8a6d1f",
                          opacity: n.leido ? 0.6 : 1, // 👈 diferencia visual
                          border: n.leido ? "1px solid #555" : "1px solid transparent",
                          borderRadius: "10px",
                          padding: "10px",
                          marginBottom: "8px",
                          fontSize: "12px",
                          color: "#fff",
                          cursor: "pointer"
                        }}
                      >
                        <strong>{n.tipo.toUpperCase()}</strong>
                        <div>{n.mensaje}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* MIS ÓRDENES */}
                <button
                  onClick={() => { setView("misOrdenes"); setPrev(); }}
                  style={menuItemStyle}
                >
                  <span style={{ fontSize: 20 }}>👤</span>
                  Mis ordenes
                </button>

              <button style={menuItemStyle} onClick={handleLogout}>
                🚪 Logout
              </button>

            </div>
          )}
        </div>

      </div>

      {showModeSelector && (
        <div 
        style={overlayStyle}
        onClick={() => setShowModeSelector(false)}>
          <div 
          onClick={(e) => e.stopPropagation()}
          style={modalStyle}>
            
            <h3 style={{ marginBottom: 10 }}>
              Se detectaron <span style={{ color: "#f5a742" }}>{pendingFiles.length}</span> órdenes
            </h3>

            <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 20 }}>
              ¿Cómo querés procesarlas?
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              
              <button
                onClick={() => handleModeSelect("manual")}
                style={{
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid #444",
                  background: "#1a1a1a",
                  color: "#E8E0D0",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Revisar una por una
              </button>

              <button
                onClick={() => handleModeSelect("auto")}
                style={{
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid #444",
                  background: "#1a1a1a",
                  color: "#E8E0D0",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Crear automáticamente
              </button>

            </div>

          </div>
        </div>
      )}

      {loadingOCR && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999
        }}>
          <div style={{ color: "#E8E0D0", fontSize: 16 }}>
            {totalFiles > 1
              ? mode === "auto"
                ? `📄 Creando orden ${currentIndex} de ${totalFiles}...`
                : `📄 Procesando orden ${currentIndex} de ${totalFiles}...`
              : "📄 Procesando orden..."}
          </div>
        </div>
      )}

    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000
};

const modalStyle = {
  background: "#2b2b2b",
  padding: "24px",
  borderRadius: "12px",
  color: "#E8E0D0",
  width: "320px",
  maxWidth: "90%",
  textAlign: "center",
  boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
};

const menuItemStyle = {
  width: "100%",
  padding: "10px",
  border: "none",
  background: "transparent",
  color: "#E8E0D0",
  textAlign: "left",
  cursor: "pointer",
  borderRadius: "8px"
};

export default Header;