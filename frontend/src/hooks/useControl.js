import { useState } from "react";

import {
  getControlByOrder,
  revisarControl,
  updateControlCheck
} from "../services/api";

export function useControl({
  user,
  goToView,
  setSelectedOrder,
  updateLocalOrder
}) {

  const [control, setControl] =
    useState(null);

  const handleControl = async (id) => {

    window.scrollTo(0, 0);

    try {

      const data =
        await getControlByOrder(id);

      setControl(data);

      goToView("control");

    } catch (err) {

      console.error(err);

      alert(err.message);
    }
  };

  const handleRevisionControl =
    async (
      control_id,
      accion
    ) => {

      window.scrollTo(0, 0);

      try {

        const updated =
          await revisarControl(
            control_id,
            user.id,
            accion
          );

        console.log(
          "UPDATED:",
          updated
        );

        setControl(updated.control);

        setSelectedOrder(
          updated.orden
        );

        updateLocalOrder(
          updated.orden
        );

        goToView("detail");

      } catch (err) {

        console.error(
          `Error ${accion} orden`,
          err
        );
      }
    };

  const handleUpdateCheck =
    async (
      checkId,
      estado,
      observacion
    ) => {

      try {

        const updated =
          await updateControlCheck(
            checkId,
            {
              estado,
              observacion,
              revisado_por: user.id
            }
          );

        setControl(prev => ({
          ...prev,

          control_chequeo:
            prev.control_chequeo.map(c =>
              c.id === checkId
                ? {
                    ...c,
                    estado: updated.estado,
                    revisado_por:
                      updated.revisado_por
                  }
                : c
            )
        }));

      } catch (err) {

        console.error(
          "Error actualizando chequeo",
          err
        );
      }
    };

  return {
    control,
    setControl,
    handleControl,
    handleRevisionControl,
    handleUpdateCheck
  };
}