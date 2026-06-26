import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Login from "./components/Login";
import OrderDetail from "./components/OrderDetail";
import KanbanView from "./views/KanbanView";
import OrderForm from "./components/OrderForm";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import OrdersListView from "./views/OrdersListView";
import CuestionarioModal from "./components/CuestionarioModal";
import CuestionarioView from "./components/CuestionarioView";
import HistorialView from "./components/HistorialView";
import ControlDetail from "./components/ControlDetail";
import Consultas from "./components/consultas/Consultas";
import { useAuth } from "./hooks/useAuth";
import { useOrders } from "./hooks/useOrders";
import { useControl } from "./hooks/useControl";
import { useUsers } from "./hooks/useUsers";
import { useNavigation } from "./hooks/useNavigation";
import { useFilteredOrders } from "./hooks/useFilteredOrders";
import { THEMES } from "./constant/themeConstants";

function App() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("all");
  const [prefillQueue, setPrefillQueue] = useState([]);
  const [currentPrefill, setCurrentPrefill] = useState(null);
  const {
    view,
    setView,
    goToView,
    goBack,
    resetNavigation
  } = useNavigation();
  const {
    user,
    loadingSession,
    handleLogout
  } = useAuth(resetNavigation);
  const {
    orders,
    setOrders,
    fetchOrders,
    moveOrder,
    updateLocalOrder,
    addOrder,
    ordersError
  } = useOrders(user);
  const filteredOrders = useFilteredOrders({
    orders,
    search,
    filterArea,
    view,
    user
  });
  const {
    usuarios,
    setUsuarios,
    fetchUsers
  } = useUsers(user);
  const {
    control,
    handleControl,
    handleRevisionControl,
    handleUpdateCheck
  } = useControl({
    user,
    goToView,
    setSelectedOrder,
    updateLocalOrder
  });

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("darkMode");

    return savedTheme === "true";
  });

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const theme = darkMode
    ? THEMES.dark
    : THEMES.light;

  if (loadingSession) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Login />;
  }


  const handleCreateOrder = async (newOrder) => {
    const orderWithUser = {
      ...newOrder,
      usuario_id: user.id
    };

    const missing = [];

    if (!newOrder.numero) missing.push("Número");
    if (!newOrder.cliente) missing.push("Cliente");

    if (missing.length > 0) {
      alert(`Faltan campos: ${missing.join(", ")}`);
      return;
    }

    try {
      const savedOrder =
        await addOrder(orderWithUser);

      setSelectedOrder({
        ...savedOrder,
        cuestionario: [
          currentPrefill?.cuestionario || {}
        ]
      });

      setView("cuestionario");
    } catch (err) {
      console.error(err);

      alert(
        "No se pudo crear la orden.\n\nVerifica la conexión con el servidor e inténtalo nuevamente."
      );
    }
  };

  const handleUpdateOrder = (
    updatedOrder
  ) => {

    updateLocalOrder(updatedOrder);

    setSelectedOrder(updatedOrder);
  };

  const advancePrefillQueue = () => {

    setPrefillQueue(prevQueue => {

      const remaining = prevQueue.slice(1);

      setCurrentPrefill(
        remaining[0] || null
      );

      if (remaining.length > 0) {

        setView("form");

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

      } else {

        goToView("kanban");
      }

      return remaining;
    });
  };

  const handleUpdateCuestionario = (
    ordenId,
    nuevoCuestionario
  ) => {

    setOrders(prev =>
      prev.map(o => {
        if (o.id !== ordenId) return o;

        return {
          ...o,
          cuestionario: [nuevoCuestionario]
        };
      })
    );

    advancePrefillQueue();
  };

  const handleCancelForm = () => {
    const hasQueue =
        prefillQueue &&
        prefillQueue.length > 0;

    if (hasQueue) {
      advancePrefillQueue();
    } else {
      goBack();
    }
  };

  const openHistorial = (order) => {

    setSelectedOrder(order);

    goToView("HistorialView");
  };

  const openCuestionarioEdit = (order) => {

    setSelectedOrder(order);

    goToView("cuestionario");
  };


  return (
    <>
    <div
      style={{
        minHeight: "100vh",
        background: theme.background,
        color: theme.text
      }}
    >
      <Header 
        orders={orders}
        onNewOrder={() => goToView("form")}
        setPrefillQueue={setPrefillQueue}
        setCurrentPrefill={setCurrentPrefill}
        fetchOrders={fetchOrders}
        selectO={setSelectedOrder}
        user={user}
        view={view} 
        goToView={goToView} 
        resetNavigation={resetNavigation}
        handleLogout={handleLogout}
        theme={theme}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <div className="view-container">

        {view === "kanban" && (
          <KanbanView
            filteredOrders={filteredOrders}
            error={ordersError}
            usuarios={usuarios}
            search={search}
            setSearch={setSearch}
            filterArea={filterArea}
            setFilterArea={setFilterArea}
            setSelectedOrder={setSelectedOrder}
            goToView={goToView}
            theme={theme}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        )}

        {view === "misOrdenes" && (
          <OrdersListView
            filteredOrders={filteredOrders}
            error={ordersError}
            search={search}
            setSearch={setSearch}
            filterArea={filterArea}
            setFilterArea={setFilterArea}
            setSelectedOrder={setSelectedOrder}
            goToView={goToView}
            theme={theme}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        )}

        {view === "detail" && selectedOrder && (
          <OrderDetail
            orderId={selectedOrder.id}
            orders={orders}
            onRefresh={fetchOrders}
            onBack={goBack}
            onMove={moveOrder}
            onUpdate={handleUpdateOrder}
            onOpenHistorial={openHistorial}
            users={usuarios}
            user={user}
            handleControl={handleControl}
            theme={theme}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        )}

        {view === "form" && (
          <OrderForm 
            prefill={currentPrefill}
            onCreate={handleCreateOrder}
            onCancel={handleCancelForm}
            theme={theme}
          />
        )}

        {view === "list" && (
          <OrdersListView
            filteredOrders={filteredOrders}
            error={ordersError}
            search={search}
            setSearch={setSearch}
            filterArea={filterArea}
            setFilterArea={setFilterArea}
            setSelectedOrder={setSelectedOrder}
            goToView={goToView}
            theme={theme}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        )}

        {view === "cuestionarioView" && selectedOrder && (
          <CuestionarioView
            order={selectedOrder}
            user={user}
            onClose={goBack}
            onEdit={openCuestionarioEdit}
            theme={theme}
          />
        )}

        {view === "cuestionario" && selectedOrder && (
          <CuestionarioModal
            order={selectedOrder}
            onClose={() => resetNavigation("kanban")}
            onSaveLocal={handleUpdateCuestionario}
            theme={theme}
          />
        )}

        {view === "HistorialView" && selectedOrder && (
          <HistorialView
            order={selectedOrder}
            onClose={goBack}
            theme={theme}
          />
        )}

        {view === "Consultas" && selectedOrder && (
          <Consultas
            order={selectedOrder}
            user={user}
            onClose={goBack}
            theme={theme}
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
            theme={theme}
          />
        )}

      </div>

      <BottomNav style={{ marginTop: 10 }} 
        view={view} 
        goToView={goToView} 
        theme={theme}
        darkMode={darkMode}
        setDarkMode={setDarkMode}/>
      </div>
    </>
  );
}

export default App;