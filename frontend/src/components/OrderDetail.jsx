import {
  exportToExcel,
  exportToPDF
} from "../services/exportService";
import {
  PCOLORS,
  AREAS
} from "../constant/orderConstants";
import { getHistorial } from "../services/api"
import { useOrderDetail } from "../hooks/useOrderDetail";
import OrderDetailView from "../views/OrderDetailView";

function OrderDetail({ orderId, orders, onRefresh, onBack, onMove, onUpdate, onOpenHistorial, 
  users, user, handleControl, theme, darkMode, setDarkMode }) {

  const order = orders.find(o => o.id === orderId);

  const {
    form,
    errors,
    isEditing,
    showDeleteModal,

    areaActual,

    handleChange,
    handleSave,
    handleDelete,
    handleSendToControl,
    handleEnCamino,
    handleEntregar,
    handleReclamo,

    setIsEditing,
    setShowDeleteModal,
    setForm
  } = useOrderDetail({
    order,
    onUpdate,
    onBack,
    onRefresh
  });

  const isIneditable = areaActual === "control" || areaActual === "entrega";

  const handleExportPDF = async () => {
    const historial = await getHistorial(orderId);
    exportToPDF(order, historial);
  };

  const getUserName = (id) => {
    const user = users.find(u => u.id === id);
    return user ? user.nombre : "—";
  };

  // 🛑 seguridad (muy importante)
  if (!order) {
    return <div>Cargando...</div>;
  }

  const areaObj = AREAS.find(a => a.id === (isEditing ? form.area : order.area));

  const color = PCOLORS[order.prioridad] || "#999";

  return (
    <OrderDetailView
      order={order}

      form={form}
      errors={errors}

      isEditing={isEditing}
      showDeleteModal={showDeleteModal}

      areaActual={areaActual}
      areaObj={areaObj}

      color={color}

      user={user}
      users={users}

      isIneditable={isIneditable}

      handleChange={handleChange}
      handleSave={handleSave}
      handleDelete={handleDelete}

      handleSendToControl={handleSendToControl}
      handleEnCamino={handleEnCamino}
      handleEntregar={handleEntregar}
      handleReclamo={handleReclamo}

      handleExportPDF={handleExportPDF}

      setIsEditing={setIsEditing}
      setShowDeleteModal={setShowDeleteModal}
      setForm={setForm}

      onBack={onBack}
      onRefresh={onRefresh}
      onMove={onMove}
      onOpenHistorial={onOpenHistorial}
      handleControl={handleControl}

      getUserName={getUserName}

      exportToExcel={exportToExcel}

      theme={theme}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    />
  );
}

export default OrderDetail;