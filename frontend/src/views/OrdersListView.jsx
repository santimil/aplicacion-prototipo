import ListView from "../components/ListView";

function OrdersListView({
  filteredOrders,
  search,
  setSearch,
  filterArea,
  setFilterArea,
  setSelectedOrder,
  goToView
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
      onSelectOrder={openOrderDetail}
      search={search}
      setSearch={setSearch}
      filterArea={filterArea}
      setFilterArea={setFilterArea}
      onOpenCuestionario={openCuestionarioView}
      onOpenConsultas={openConsultas}
    />
  );
}

export default OrdersListView;