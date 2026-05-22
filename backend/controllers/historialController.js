import { createSupabaseClient } from "../services/supabaseClient.js";

export async function getHistorial(req, res) {

  const supabase = createSupabaseClient(req);

  const { id } = req.params;

  const { data, error } = await supabase
    .from("historial")
    .select(`
      *,
      usuario:usuario_id (
        nombre
      )
    `)
    .eq("order_id", id)
    .order("timestamp", { ascending: false });

  if (error) {
    return res.status(500).json({ error });
  }

  res.json(data);
}