import { createSupabaseClient } from "../services/supabaseClient.js";

export async function getUsuarios(req, res) {
  const supabase = createSupabaseClient(req);
  
  const { data, error } = await supabase
    .from("usuario")
    .select(`*`);

  if (error) return res.status(500).json({ error });

  res.json(data);
}