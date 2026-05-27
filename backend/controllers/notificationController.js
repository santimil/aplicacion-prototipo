import adminSupabase from "../services/adminSupabase.js";
import { createSupabaseClient } from "../services/supabaseClient.js";

export async function checkOrderDeadlines() {

  const { data: orders } = await adminSupabase.from("orden").select("*");

  const today = new Date();

  for (const order of orders) {
    const entrega = new Date(order.fecha_entrega);
    const diffDays = Math.ceil((entrega - today) / (1000 * 60 * 60 * 24));

    let tipo = null;
    let mensaje = null;

    if (diffDays <= 0) {
      tipo = "alerta";
      mensaje = "Orden vencida";
    } else if (diffDays <= 2) {
      tipo = "advertencia";
      mensaje = "Orden cerca de vencimiento";
    }

    if (!tipo) continue;

    const { data: existing, error } = await adminSupabase
      .from("notificaciones")
      .select("*")
      .eq("order_id", order.id)
      .eq("mensaje", mensaje)
      .limit(1);

    if (error) {
      console.error("Error buscando notificación existente:", error);
      continue;
    }

    if (existing?.length > 0) continue;

    const { data: inserted, error: insertError } = await adminSupabase
    .from("notificaciones")
    .insert([{
        order_id: order.id,
        tipo,
        mensaje,
        leido: false,
        creado: new Date()
    }])
    .select();

    if (insertError) {
        console.error("❌ Error insertando:", insertError);
    } else {
        console.log("✅ Insertado:", inserted);
    }
  }
}

export async function getNotifications(req, res) {
  const supabase = createSupabaseClient(req);

  try {

    const {
      data: { user }
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("notificaciones")
      .select("*")
      .or(`usuario_id.eq.${user.id},usuario_id.is.null`)
      .order("creado", { ascending: false });

    if (error) throw error;

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo notificaciones" });
  }
}

export async function markAsRead(req, res) {
  const supabase = createSupabaseClient(req);

  const { id } = req.params;

  const { data, error } = await supabase
    .from("notificaciones")
    .update({ leido: true })
    .eq("id", id)
    .select();

  if (error) return res.status(500).json({ error });

  res.json(data?.[0] || null);
}