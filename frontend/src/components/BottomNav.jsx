function BottomNav({ view, setView, setPrev }) {
  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "#111",
      borderTop: "1px solid #222",
      display: "flex",
      zIndex: 100
    }}>

      {/* TABLERO */}
      <button
        onClick={() => {setView("kanban"), setPrev("kanban")}}
        style={{
          flex: 1,
          padding: "10px 4px",
          background: "transparent",
          border: "none",
          color: view === "kanban" ? "#FFB74D" : "#555",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontSize: 10,
          cursor: "pointer"
        }}
      >
        <span style={{ fontSize: 20 }}>⊞</span>
        TABLERO
      </button>


      {/* LISTA */}
      <button
        onClick={() => {setView("list"), setPrev("list")}}
        style={{
          flex: 1,
          padding: "10px 4px",
          background: "transparent",
          border: "none",
          color: view === "list" ? "#FFB74D" : "#555",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontSize: 10,
          cursor: "pointer"
        }}
      >
        <span style={{ fontSize: 20 }}>☰</span>
        LISTA
      </button>

    </div>
  );
}

export default BottomNav;