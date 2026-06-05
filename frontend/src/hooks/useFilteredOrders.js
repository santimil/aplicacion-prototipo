export function useFilteredOrders({
  orders,
  search,
  filterArea,
  view,
  user
}) {

  return orders.filter(o => {

    const s = search.toLowerCase();

    const matchesSearch =
      o.cliente?.toLowerCase().includes(s) ||
      o.numero?.toLowerCase().includes(s) ||
      o.trabajo?.toLowerCase().includes(s);

    const matchesArea =
      filterArea === "all" ||
      o.area === filterArea;

    const matchesUser =
      view !== "misOrdenes" ||
      o.asignado_a === user.id;

    return (
      matchesSearch &&
      matchesArea &&
      matchesUser
    );
  });
}