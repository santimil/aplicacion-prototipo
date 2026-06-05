import { useEffect, useState } from "react";
import { getNotifications, markNotificationAsRead } from "../services/api";

export function useNotifications({
  orders,
  selectO,
  goToView
}) {

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount =
    notifications.filter(n => !n.leido).length;

  const fetchNotifications = async () => {
    try {

      const data =
        await getNotifications();

      setNotifications(data);

    } catch (err) {

      console.error(
        "Error cargando notificaciones",
        err
      );
    }
  };

  const handleNotificationClick = async (n) => {

    try {

      setNotifications(prev =>
        prev.map(item =>
          item.id === n.id
            ? { ...item, leido: true }
            : item
        )
      );

      if (!n.leido) {

        await markNotificationAsRead(n.id);
      }

      const order =
        orders.find(o => o.id === n.order_id);

      if (!order) return;

      selectO(order);

      if (
        n.tipo === "consulta_nueva" ||
        n.tipo === "consulta_respondida"
      ) {

        goToView("Consultas");

      } else {

        goToView("detail");
      }

      setShowNotifications(false);

    } catch (err) {

      console.error(
        "Error abriendo notificación",
        err
      );
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    unreadCount,
    showNotifications,
    setShowNotifications,
    handleNotificationClick,
    fetchNotifications
  };
}