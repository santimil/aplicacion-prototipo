import { createSupabaseClient } from "../services/supabaseClient.js";

export async function getHistorial(req, res) {
  const supabase = createSupabaseClient(req);
  
  const { id } = req.params;

  const { data, error } = await supabase
    .from("historial")
    .select("*")
    .eq("order_id", id)
    .order("timestamp", { ascending: false });

  console.log("ID", id);

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) return res.status(500).json({ error });

  res.json(data);
}