import { useRef, useState } from "react";
import { useNotifications } from "../hooks/useNotifications";
import { useMenu } from "../hooks/useMenu";
import { useOCR } from "../hooks/useOCR";

function Header({ orders, onNewOrder, setPrefillQueue, setCurrentPrefill, fetchOrders, selectO, 
  user, view, goToView, resetNavigation, handleLogout, theme, darkMode, setDarkMode }) {

  const cameraRef = useRef();
  const fileRef = useRef();
  const {
    notifications,
    unreadCount,
    showNotifications,
    setShowNotifications,
    handleNotificationClick
  } = useNotifications({
    orders,
    selectO,
    goToView
  });
  const {
    menuOpen,
    setMenuOpen,
    openMenu,
    closeMenu,
    toggleMenu
  } = useMenu();
  const {
    progress,
    pendingFiles,
    showModeSelector,
    closeModeSelector,
    mode,
    handleImage,
    handleModeSelect
  } = useOCR({
    setPrefillQueue,
    setCurrentPrefill,
    goToView,
    user,
    fetchOrders,
    resetNavigation
  });


  return (
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: theme.surface,
      borderBottom: `1px solid ${theme.border}`,
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
        onChange={(e) => handleImage(e)}
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
            background: theme.surface,
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
            background: theme.surface,
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
            onClick={toggleMenu}
            style={{
              position: "relative",
              fontSize: 20,
              background: "transparent",
              border: "none",
              color: theme.text,
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
              background: theme.surface,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: "12px",
              boxShadow:
              "0 8px 25px rgba(0,0,0,0.15)",
              padding: "10px",
              zIndex: 9999,
            }}>
              
              <button style={menuItemStyle(theme)} onClick={() => setShowNotifications(prev => !prev)}>
                🔔 Notificaciones ({unreadCount})
              </button>

              {showNotifications && (
                <div style={{
                  marginTop: 10,
                  maxHeight: "200px",
                  overflowY: "auto",
                  borderTop: `1px solid ${theme.border}`,
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
                  onClick={() => resetNavigation("misOrdenes")}
                  style={menuItemStyle(theme)}
                >
                  <span style={{ fontSize: 20 }}>👤</span>
                  Mis ordenes
                </button>

              <button
                style={menuItemStyle(theme)}
                onClick={() => setDarkMode(prev => !prev)}
              >
                {darkMode
                  ? "☀️ Modo claro"
                  : "🌙 Modo oscuro"}
              </button>

              <button style={menuItemStyle(theme)} onClick={handleLogout}>
                🚪 Logout
              </button>

            </div>
          )}
        </div>

      </div>

      {showModeSelector && (
        <div 
        style={overlayStyle}
        onClick={() => closeModeSelector()}>
          <div 
          onClick={(e) => e.stopPropagation()}
          style={modalStyle(theme)}>
            
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

      {progress.active && (
        <div
          style={{
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
          }}
        >
          <div
            style={{
              color: "#E8E0D0",
              textAlign: "center",
              minWidth: "350px"
            }}
          >
            <h3>{progress.title}</h3>

            <progress
              value={progress.current}
              max={progress.total}
              style={{
                width: "100%"
              }}
            />

            <p>
              {progress.current} / {progress.total}
            </p>

            <p>
              {Math.round(
                (progress.current / progress.total) * 100
              )}%
            </p>
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

const modalStyle = (theme) => ({
  background: theme.surface,
  padding: "24px",
  borderRadius: "12px",
  color: theme.text,
  width: "320px",
  maxWidth: "90%",
  textAlign: "center",
  boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
});

const menuItemStyle = (theme) => ({
  width: "100%",
  padding: "10px",
  border: "none",
  background: theme.surface,
  color: theme.text,
  textAlign: "left",
  cursor: "pointer",
  borderRadius: "8px"
});

export default Header;