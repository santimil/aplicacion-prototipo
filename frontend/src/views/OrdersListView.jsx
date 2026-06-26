import ListView from "../components/ListView";

function OrdersListView({
  filteredOrders,
  error,
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
    <ListView
      orders={filteredOrders}
      error={error}
      onSelectOrder={openOrderDetail}
      search={search}
      setSearch={setSearch}
      filterArea={filterArea}
      setFilterArea={setFilterArea}
      onOpenCuestionario={openCuestionarioView}
      onOpenConsultas={openConsultas}
      theme={theme}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    />
  );
}

export default OrdersListView;