import { useState } from "react";
import imageCompression from "browser-image-compression";
import { uploadFile, createOrder, updateCuestionario } from "../services/api";
import { cleanData } from "../services/cleanData";

export function useOCR({
  setPrefillQueue,
  setCurrentPrefill,
  goToView,
  user,
  fetchOrders,
  resetNavigation
}) {

  const [loadingOCR, setLoadingOCR] =
    useState(false);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [totalFiles, setTotalFiles] =
    useState(0);

  const [showModeSelector, setShowModeSelector] =
    useState(false);

  function closeModeSelector() {
    setShowModeSelector(false);
  }

  const [progress, setProgress] = useState({
    active: false,
    title: "",
    current: 0,
    total: 0
  });

  const [pendingFiles, setPendingFiles] =
    useState([]);

  const [mode, setMode] =
    useState("manual");

  async function handleImage(e) {

    const files = Array.from(e.target.files);

    if (!files.length) return;

    if (files.length === 1) {

      setMode("manual");

      processFiles(files);

    } else {

      setPendingFiles(files);

      setShowModeSelector(true);
    }
  }

  function handleModeSelect(selectedMode) {

    setMode(selectedMode);

    setShowModeSelector(false);

    processFiles(pendingFiles);

    setPendingFiles([]);
  }

  function openPrefillForm(validResults) {

    setPrefillQueue(validResults);

    setCurrentPrefill(
        validResults[0] || null
    );

    goToView("form");
  }

  async function buildUploadFormData(file) {
      const formData = new FormData();
  
      if (file.type.startsWith("image/")) {
        const compressedFile =
          await imageCompression(file, {
            maxSizeMB: 0.35,
            maxWidthOrHeight: 1280,
            useWebWorker: true
          });
        formData.append("file", compressedFile);
  
      } else {
        formData.append("file", file);
      }
      return formData;
    }

  function normalizeOCRResponse(data) {

    if (data?.data) {
        if (data.skipped && data.skipped > 0) {
          alert(`⚠️ ${data.skipped} filas inválidas ignoradas`);
        }
        return data.data;
    }
    if (Array.isArray(data)) {
        return data;
    }
    return [data];
  }

  async function processFiles(files) {

    try {
      setProgress({
        active: true,
        title: "Escaneando archivos",
        current: 0,
        total: files.length
      });

      const results = [];

      for (let i = 0; i < files.length; i++) {

        const file = files[i];
        let data;

        try {

          const formData =
            await buildUploadFormData(file);

          data = await uploadFile(formData);

        } catch (err) {

          console.error(
            "Error procesando archivo:",
            file.name,
            err
          );

          continue;
        }

        const items = normalizeOCRResponse(data);

        const cleanedArray =
          items.map(d => cleanData(d));

        results.push(...cleanedArray);

        setProgress(prev => ({
          ...prev,
          current: i + 1
        }));
      }

      const validResults =
        results.filter(r => r.numero && r.cliente);

      if (validResults.length > 1) {

        const autoCreate = confirm(
          `Se detectaron ${validResults.length} órdenes.\n\n` +
          `Aceptar = crear automáticamente\n` +
          `Cancelar = revisar una por una`
        );

        if (autoCreate) {

          await handleAutoCreate(validResults);

        } else {

          openPrefillForm(validResults);
        }

      } else {

        openPrefillForm(validResults);
      }
    }
    finally {
      setProgress({
        active: false,
        title: "",
        current: 0,
        total: 0
      });
    }
  }

  async function handleAutoCreate(prefills) {
    try {

      setProgress({
        active: true,
        title: "Creando órdenes",
        current: 0,
        total: prefills.length
      });

      for (let i = 0; i < prefills.length; i++) {

        const prefill = prefills[i];
        console.log("PREFILL:", prefill);
        // 1️⃣ crear orden
        const order = await createOrder({
          ...prefill,
          diasAsignados: prefill.diasAsignados || 10,
          usuario_id: user.id
        });

        // 2️⃣ actualizar cuestionario
        if (prefill.cuestionario) {
          await updateCuestionario(order.id, prefill.cuestionario);
        }

        setProgress(prev => ({
          ...prev,
          current: i + 1
        }));
      }

      // 3️⃣ volver a kanban
      await fetchOrders();
      resetNavigation("kanban");

    } catch (err) {
      console.error("Error en auto create:", err);
    }
    finally {
      setProgress({
        active: false,
        title: "",
        current: 0,
        total: 0
      });
    }
  }

  return {
    progress,
    pendingFiles,
    showModeSelector,
    closeModeSelector,
    mode,
    handleImage,
    handleModeSelect
  }
}