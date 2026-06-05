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
    addOrder
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

  if (loadingSession) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Login />;
  }


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

    const savedOrder = await addOrder(orderWithUser);

    setOrders(prev => [...prev, savedOrder]);

    setSelectedOrder({
      ...savedOrder,
      cuestionario: [currentPrefill?.cuestionario || {}]
    });

    setView("cuestionario");
  };

  const handleUpdateOrder = (
    updatedOrder
  ) => {

    updateLocalOrder(updatedOrder);

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
        goToView("kanban");
      }

      return remaining;
    });
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
      <Header 
        orders={orders}
        onNewOrder={() => setView("form")}
        setPrefillQueue={setPrefillQueue}
        setCurrentPrefill={setCurrentPrefill}
        fetchOrders={fetchOrders}
        selectO={setSelectedOrder}
        user={user}
        view={view} 
        goToView={goToView} 
        resetNavigation={resetNavigation}
        handleLogout={handleLogout}
      />

      <div className="view-container">

        {view === "kanban" && (
          <KanbanView
            filteredOrders={filteredOrders}
            usuarios={usuarios}
            search={search}
            setSearch={setSearch}
            filterArea={filterArea}
            setFilterArea={setFilterArea}
            setSelectedOrder={setSelectedOrder}
            goToView={goToView}
          />
        )}

        {view === "misOrdenes" && (
          <OrdersListView
            filteredOrders={filteredOrders}
            search={search}
            setSearch={setSearch}
            filterArea={filterArea}
            setFilterArea={setFilterArea}
            setSelectedOrder={setSelectedOrder}
            goToView={goToView}
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
          />
        )}

        {view === "form" && (
          <OrderForm 
            prefill={currentPrefill}
            onCreate={handleCreateOrder}
            onCancel={goBack}
          />
        )}

        {view === "list" && (
          <OrdersListView
            filteredOrders={filteredOrders}
            search={search}
            setSearch={setSearch}
            filterArea={filterArea}
            setFilterArea={setFilterArea}
            setSelectedOrder={setSelectedOrder}
            goToView={goToView}
          />
        )}

        {view === "cuestionarioView" && selectedOrder && (
          <CuestionarioView
            order={selectedOrder}
            onClose={goBack}
            onEdit={openCuestionarioEdit}
          />
        )}

        {view === "cuestionario" && selectedOrder && (
          <CuestionarioModal
            order={selectedOrder}
            onClose={() => resetNavigation("kanban")}
            onSaveLocal={handleUpdateCuestionario}
          />
        )}

        {view === "HistorialView" && selectedOrder && (
          <HistorialView
            order={selectedOrder}
            onClose={goBack}
          />
        )}

        {view === "Consultas" && selectedOrder && (
          <Consultas
            order={selectedOrder}
            user={user}
            onClose={goBack}
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

      <BottomNav style={{ margintop: 10 }} view={view} view={view} goToView={goToView}/>
    </>
  );
}

export default App;