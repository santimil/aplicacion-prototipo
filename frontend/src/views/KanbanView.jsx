import Kanban from "../components/Kanban";

function KanbanView({
  filteredOrders,
  error,
  usuarios,
  search,
  setSearch,
  filterArea,
  setFilterArea,
  setSelectedOrder,
  goToView,
  theme, darkMode, setDarkMode
}) {

  const openOrderDetail = (order) => {

    setSelectedOrder(order);

    goToView("detail");

    window.scrollTo(0, 0);
  };

  const openCuestionarioView = (order) => {

    setSelectedOrder(order);

    goToView("cuestionarioView");
  };

  const openConsultas = (order) => {

    setSelectedOrder(order);

    goToView("Consultas");
  };

  return (
    <Kanban
      orders={filteredOrders}
      error={error}
      users={usuarios}
      search={search}
      setSearch={setSearch}
      filterArea={filterArea}
      setFilterArea={setFilterArea}
      onSelectOrder={openOrderDetail}
      onOpenCuestionario={openCuestionarioView}
      onOpenConsultas={openConsultas}
      theme={theme}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    />
  );
}

export default KanbanView;