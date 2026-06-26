import { useEffect, useState } from "react";

import {
  getOrders,
  createOrder,
  updateOrder
} from "../services/api";

export function useOrders(user) {

  const [orders, setOrders] = useState([]);

  const [ordersError, setOrdersError] = useState(null);

  const fetchOrders = async () => {

    try {

      const data = await getOrders();

      console.log("ordenes", data);

      setOrders(data);

      setOrdersError(null);

    } catch (err) {

      setOrdersError(
        "No se pudo conectar con el servidor."
      );

      console.error(
        "Error obteniendo órdenes:",
        err
      );

      console.error(err);
    }
  };

  useEffect(() => {

    if (!user) return;

    fetchOrders();

  }, [user]);

  const moveOrder = async (
    orderId,
    newArea
  ) => {

    const previousOrders = [...orders];

    try {

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

      const updatedOrder =
        await updateOrder(orderId, {
          area: newArea,
          asignado_a: null
        });

      setOrders(prev =>
        prev.map(o =>
          o.id === orderId
            ? updatedOrder
            : o
        )
      );

    } catch (error) {

      console.error(
        "Error moviendo orden:",
        error
      );

      setOrders(previousOrders);
    }
  };

  const updateLocalOrder = (
    updatedOrder
    ) => {

    setOrders(prev =>
        prev.map(o =>
        o.id === updatedOrder.id
            ? updatedOrder
            : o
        )
    );
  };

  const addOrder = async (
    orderData
    ) => {

    const savedOrder =
        await createOrder(orderData);

    setOrders(prev => [
        ...prev,
        savedOrder
    ]);

    return savedOrder;
  };

  return {
    orders,
    setOrders,
    fetchOrders,
    moveOrder,
    updateLocalOrder,
    addOrder,
    ordersError
  };
}