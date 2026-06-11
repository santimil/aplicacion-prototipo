import { useState, useEffect } from "react";
import { updateOrder, deleteOrder, sendOrderToControl, marcarOrdenEnCamino, 
  entregarOrden, reclamarOrden } from "../services/api";

export function useOrderDetail({
  order,
  onUpdate,
  onBack,
  onRefresh
}) {

  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState(order);
  const [areaActual, setArea] = useState(order.area);

  useEffect(() => {
    setForm(order);
  }, [order]);

  useEffect(() => {
    setArea(order.area);
  }, [order.area]);

  function handleChange(field, value) {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  }

  function validate() {

    const newErrors = {};

    if (!form.cliente?.trim()) {
      newErrors.cliente = "Requerido";
    }

    if (!form.trabajo?.trim()) {
      newErrors.trabajo = "Requerido";
    }

    if (
      form.dias_asignados !== "" &&
      form.dias_asignados < 0
    ) {
      newErrors.dias_asignados =
        "No puede ser negativo";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {

    if (!validate()) return;

    const { id, creado, ...updates } = form;

    const updated =
      await updateOrder(order.id, updates);

    onUpdate(updated);

    setIsEditing(false);
  }

  async function handleDelete() {

    await deleteOrder(order.id);

    setShowDeleteModal(false);

    onBack();

    onUpdate({
      id: order.id,
      deleted: true
    });
  }

  async function handleSendToControl() {
    try {
      await sendOrderToControl(order.id);

      await onRefresh();

      alert("Orden enviada a control");

      onBack();

    } catch (err) {
      console.error(err);

      alert(
        err.message || "Error enviando a control"
      );
    }
  }

  async function handleEnCamino() {
    try {

      const updated = await marcarOrdenEnCamino(order.id);

      onUpdate(updated);

      alert("Orden en camino");

    } catch (err) {
      console.error(err);

      alert(
        err.message || "Error marcando viaje"
      );
    }
  }

  async function handleEntregar() {
    try {

      const updated = await entregarOrden(order.id);

      onUpdate(updated);

      alert("Orden entregada");

    } catch (err) {
      console.error(err);

      alert(
        err.message || "Error marcando entrega"
      );
    }
  }

  async function handleReclamo() {
    try {

      const updated = await reclamarOrden(order.id);

      onUpdate(updated);

      alert("Orden reclamada");

    } catch (err) {
      console.error(err);

      alert(
        err.message || "Error marcando reclamo"
      );
    }
  }

  return {
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
  };
}