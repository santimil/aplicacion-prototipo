import { supabase } from "../supabaseClient";

const API_URL = import.meta.env.VITE_API_URL;

async function authFetch(endpoint, options = {}) {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const token = session?.access_token;

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`
  };

  // ✅ solo agregar json si NO es FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(API_URL + endpoint, {
    ...options,
    headers
  });

  if (!res.ok) {
    let message = "Error en request";

    try {
      const err = await res.json();
      message = err.error || message;
    } catch {}

    throw new Error(message);
  }

  return res;
}












export async function getOrders() {
  const res = await authFetch("/orders");

  return res.json();
}

export async function createOrder(order) {
  const res = await authFetch("/orders", {
    method: "POST",
    body: JSON.stringify(order)
  });

  return res.json();
}

export async function updateOrder(id, updates) {
  const res = await authFetch(`/orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates)
  });

  return res.json();
}

export async function deleteOrder(id) {
  const res = await authFetch(`/orders/${id}`, {
    method: "DELETE"
  });

  return res.json();
}











export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await authFetch("/ocr", {
    method: "POST",
    body: formData
  });

  return res.json();
}


export async function uploadFile(formData) {
  const res = await authFetch("/file", {
    method: "POST",
    body: formData
  });

  return res.json();
}















export async function getNotifications() {
  const res = await authFetch("/notificacion");

  return res.json();
}


export async function markNotificationAsRead(id) {
  const res = await authFetch(
    `/notificacion/${id}/read`,
    {
      method: "PUT"
    }
  );

  return res.json();
}













export async function updateCuestionario(
  ordenId,
  data
) {
  const res = await authFetch(
    `/cuestionario/${ordenId}`,
    {
      method: "PUT",
      body: JSON.stringify(data)
    }
  );

  return res.json();
}












export async function getHistorial(ordenId) {
  const res = await authFetch(`/historial/${ordenId}`);
  return res.json();
} 















export async function getUsuarios() {

  const res = await authFetch("/usuario");

  const text = await res.text();

  return JSON.parse(text);
}


















export async function uploadPlanos(
  cuestionarioId,
  formData
) {
  const res = await authFetch(
    `/planos/${cuestionarioId}`,
    {
      method: "POST",
      body: formData
    }
  );

  return res.json();
}

export async function getPlanos(cuestionarioId) {

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const token = session?.access_token;

  const res = await authFetch(`/planos/${cuestionarioId}`);

  return res.json();
}

export async function deletePlano(id) {

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const res = await authFetch(`/planos/${id}`,{
      method: "DELETE",});

  return res.json();
}














export async function getControlByOrder(id) {
  const res = await authFetch(`/control/${id}`, {
    method: "GET"
  });

  return res.json();
}

export async function sendOrderToControl(orderId) {
  const res = await authFetch(
    `/control/${orderId}`,
    {
      method: "POST"
    }
  );

  return res.json();
}

export async function revisarControl(
  controlId,
  revisadoPor,
  accion
) {
  const res = await authFetch(
    `/control/revisar/${controlId}`,
    {
      method: "PUT",
      body: JSON.stringify({
        revisado_por: revisadoPor,
        accion
      })
    }
  );

  return res.json();
}

export async function updateControlCheck(
  checkId,
  updates
) {
  const res = await authFetch(
    `/control/${checkId}`,
    {
      method: "PUT",
      body: JSON.stringify(updates)
    }
  );

  return res.json();
}

export async function entregarOrden(orderId) {
  const res = await authFetch(
    `/orders/entregar/${orderId}`,
    {
      method: "PUT"
    }
  );

  return res.json();
}








export async function getConsultas(ordenId) {

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const res = await authFetch(`/consultas/${ordenId}`);

  return res.json();
}

export async function createConsulta(data) {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const res = await authFetch(`/consultas`,
    {
      method: "POST",
      body: JSON.stringify(data)
    }
  );

  return res.json();
}

export async function updateConsulta(
  consultaId,
  updates
) {

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const res = await authFetch(`/consultas/${consultaId}`,
    {
      method: "PUT",
      body: JSON.stringify(updates)
    }
  );

  return res.json();
}