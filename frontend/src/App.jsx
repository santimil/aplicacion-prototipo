import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Login from "./components/Login";
import OrderDetail from "./components/OrderDetail";
import Kanban from "./components/Kanban";
import OrderForm from "./components/OrderForm";
import { getOrders, createOrder, getUsuarios, updateOrder, 
  updateControlCheck, getControlByOrder, revisarControl } from "./services/api";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import ListView from "./components/ListView";
import CuestionarioModal from "./components/CuestionarioModal";
import CuestionarioView from "./components/CuestionarioView";
import HistorialView from "./components/HistorialView";
import ControlDetail from "./components/ControlDetail";
import Consultas from "./components/consultas/Consultas";

function App() {
  const [orders, setOrders] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [view, setView] = useState("kanban");
  const [prev, setPrev] = useState("kanban");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("all");
  const [prefillQueue, setPrefillQueue] = useState([]);
  const [currentPrefill, setCurrentPrefill] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [control, setControl] = useState(null);

  const moveOrder = async (orderId, newArea) => {
    const previousOrders = [...orders];

    try {

      // 1. actualización optimista
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId
            ? {
                ...o,
                area: newArea,
                asignado_a: null
              }
            : o
        )
      );

      // 2. backend
      const updatedOrder = await updateOrder(orderId, {
        area: newArea,
        asignado_a: null
      });

      // 3. sync DB
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId ? updatedOrder : o
        )
      );

    } catch (error) {

      console.error("Error moviendo orden:", error);

      setOrders(previousOrders);
    }
  };

  const handleCreateOrder = async (newOrder) => {
    const orderWithUser = {
      ...newOrder,
      usuario_id: user.id   // 👈 CLAVE
    };

    const missing = [];

    if (!newOrder.numero) missing.push("Número");
    if (!newOrder.cliente) missing.push("Cliente");

    if (missing.length > 0) {
      alert(`Faltan campos: ${missing.join(", ")}`);
      return;
    }

    const savedOrder = await createOrder(orderWithUser);


    setOrders(prev => [...prev, savedOrder]);

    setSelectedOrder({
      ...savedOrder,
      cuestionario: [currentPrefill?.cuestionario || {}]
    });

    setView("cuestionario");
  };

  const handleUpdateOrder = (updatedOrder) => {
    setOrders(prev =>
      prev.map(o => o.id === updatedOrder.id ? updatedOrder : o)
    );

    setSelectedOrder(updatedOrder);
  };

  const handleUpdateCuestionario = (ordenId, nuevoCuestionario) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== ordenId) return o;

        return {
          ...o,
          cuestionario: [nuevoCuestionario]
        };
      })
    );

    // 👇 manejar cola fuera del setState
    setPrefillQueue(prevQueue => {
      const remaining = prevQueue.slice(1);

      // actualizar current
      setCurrentPrefill(remaining[0] || null);

      // navegación
      if (remaining.length > 0) {
        setView("form");
      } else {
        setView("kanban");
      }

      return remaining;
    });
  };

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      console.log("ordenes", data);
      setOrders(data);

    } catch (err) {
      console.error("Error obteniendo órdenes:", err);
    }
  };

  useEffect(() => {
    if (loadingSession || !user) return;

    fetchOrders();

    getUsuarios().then(data => {
      console.log("usuarios:", data);
      setUsuarios(data);
    });

  }, [loadingSession, user]);

  useEffect(() => {
    const processUser = async (sessionUser) => {
      setLoadingSession(true);

      if (!sessionUser) {
        setUser(null);
        setLoadingSession(false);
        return;
      }

      const validUser = await validateUser(sessionUser);

      if (!validUser) {
        alert("No autorizado");
        await supabase.auth.signOut();
        setUser(null);
        setLoadingSession(false);
        return;
      }

      const mergedUser = {
        ...sessionUser,
        ...validUser
      };

      setUser(mergedUser);
      setLoadingSession(false);

      console.log("usuario", mergedUser);
    };

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      await processUser(data?.session?.user);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {

        console.log("AUTH EVENT:", _event);
        console.log("SESSION USER:", session?.user);

        setTimeout(() => {
          processUser(session?.user);
        }, 0);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loadingSession) {
    return (
      <div style={{ color: "#666", textAlign: "center", marginTop: 50 }}>
        Cargando...
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  async function validateUser(user) {
    console.log("VALIDANDO USUARIO");

    const { data, error } = await supabase
      .from("usuario")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data;
  }

  const filteredOrders = orders.filter(o => {
    const s = search.toLowerCase();

    const matchesSearch =
      o.cliente?.toLowerCase().includes(s) ||
      o.numero?.toLowerCase().includes(s) ||
      o.trabajo?.toLowerCase().includes(s);

    const matchesArea =
      filterArea === "all" || o.area === filterArea;

    const matchesUser =
      view !== "misOrdenes" || o.asignado_a === user.id;

    return matchesSearch && matchesArea && matchesUser;
  });

  const handleControl = async (id) => {
      window.scrollTo(0, 0);
      try {
        const data = await getControlByOrder(id);

        setControl(data);
        setView("control");

      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    };

    const handleRevisionControl = async (
    control_id,
    accion
  ) => {

    window.scrollTo(0, 0);

    try {

      const updated = await revisarControl(
        control_id,
        user.id,
        accion
      );

      console.log("UPDATED:", updated);

      setControl(updated.control);

      setSelectedOrder(updated.orden);

      setOrders(prev =>
        prev.map(o =>
          o.id === updated.orden.id
            ? updated.orden
            : o
        )
      );

      setView("detail");

    } catch (err) {

      console.error(
        `Error ${accion} orden`,
        err
      );
    }
  };

  const handleUpdateCheck = async ( checkId, estado, observacion ) => {
    try {

      const updated = await updateControlCheck(checkId, {
        estado,
        observacion,
        revisado_por: user.id
      });

      // 🔥 actualizar control en frontend
      setControl(prev => ({
        ...prev,
        control_chequeo: prev.control_chequeo.map(c =>
          c.id === checkId
            ? {
                ...c,
                estado: updated.estado,
                revisado_por: updated.revisado_por
              }
            : c
        )
      }));

    } catch (err) {
      console.error("Error actualizando chequeo", err);
    }
  };

  return (
    <>
      <Header 
        orders={orders}
        onNewOrder={() => setView("form")}
        setPrefillQueue={setPrefillQueue}
        setCurrentPrefill={setCurrentPrefill}
        fetchOrders={fetchOrders}
        setView={setView}
        selectO={(order) => {setSelectedOrder(order);}}
        user={user}
        view={view} 
        setView={setView} 
        setPrev={setPrev}
        handleLogout={handleLogout}
      />

      <div className="view-container">

        {view === "kanban" && (
          <Kanban 
            orders={filteredOrders}
            users={usuarios}
            search={search}
            setSearch={setSearch}
            filterArea={filterArea}
            setFilterArea={setFilterArea}
            onSelectOrder={(order) => {
              setSelectedOrder(order);
              setView("detail");
              window.scrollTo(0, 0);
            }}
            onOpenCuestionario={(order) => {
              setSelectedOrder(order);
              setView("cuestionarioView");
            }}
            onOpenConsultas={(order) => {
              setSelectedOrder(order);
              setView("Consultas");
            }}
          />
        )}

        {view === "misOrdenes" && (
          <ListView 
            orders={filteredOrders}
            onSelectOrder={(order) => {
              setSelectedOrder(order);
              setView("detail");
            }}
            search={search}
            setSearch={setSearch}
            filterArea={filterArea}
            setFilterArea={setFilterArea}
            onOpenCuestionario={(order) => {
              setSelectedOrder(order);
              setView("cuestionarioView");
            }}
            onOpenConsultas={(order) => {
              setSelectedOrder(order);
              setView("Consultas");
            }}
          />
        )}

        {view === "detail" && selectedOrder && (
          <OrderDetail 
            orderId={selectedOrder.id}
            orders={orders}
            onRefresh={fetchOrders}
            onBack={() => setView("kanban")}
            onMove={moveOrder}
            onUpdate={handleUpdateOrder}
            onOpenHistorial={(order) => {
              setSelectedOrder(order);
              setView("HistorialView");
            }}
            users={usuarios}
            user={user}
            handleControl={handleControl}
          />
        )}

        {view === "form" && (
          <OrderForm 
            prefill={currentPrefill}
            onCreate={handleCreateOrder}
            onCancel={() => setView(prev)}
          />
        )}

        {view === "list" && (
          <ListView 
            orders={filteredOrders}
            onSelectOrder={(order) => {
              setSelectedOrder(order);
              setView("detail");
            }}
            search={search}
            setSearch={setSearch}
            filterArea={filterArea}
            setFilterArea={setFilterArea}
            onOpenCuestionario={(order) => {
              setSelectedOrder(order);
              setView("cuestionarioView");
            }}
            onOpenConsultas={(order) => {
              setSelectedOrder(order);
              setView("Consultas");
            }}
          />
        )}

        {view === "cuestionarioView" && selectedOrder && (
          <CuestionarioView
            order={selectedOrder}
            onClose={() => setView(prev)}
            onEdit={(order) => {
              setSelectedOrder(order);
              setView("cuestionario"); // 👈 usa el modal de edición
            }}
          />
        )}

        {view === "cuestionario" && selectedOrder && (
          <CuestionarioModal
            order={selectedOrder}
            onClose={() => setView(prev)}
            onSaveLocal={handleUpdateCuestionario}
          />
        )}

        {view === "HistorialView" && selectedOrder && (
          <HistorialView
            order={selectedOrder}
            onClose={() => setView("detail")}
          />
        )}

        {view === "Consultas" && selectedOrder && (
          <Consultas
            order={selectedOrder}
            user={user}
            onClose={() => setView("kanban")}
          />
        )}


        {view === "control" && control && (
          <ControlDetail
            control={control}
            setView={setView}
            onUpdateCheck={handleUpdateCheck}
            handleSentToEntrega={() =>
              handleRevisionControl(control.id, "aprobar")
            }
            handleReject={() =>
              handleRevisionControl(control.id, "rechazar")
            }
          />
        )}

      </div>

      <BottomNav style={{ margintop: 10 }} view={view} setView={setView} setPrev={setPrev}/>
    </>
  );
}

export default App;