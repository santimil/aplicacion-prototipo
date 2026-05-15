import { createSupabaseClient } from "../services/supabaseClient.js";

export async function updateCuestionario(req, res) {
  const supabase = createSupabaseClient(req);
  
  try {
    const { ordenId } = req.params;

    const {
      color,
      llaves,
      marca_llaves,
      tablero_completo,
      tipo_cierre,
      espesor_chapa,
      tipo_chapa,
      planos,
      informacion_especifica
    } = req.body;

    const { error } = await supabase
      .from("cuestionario")
      .update({
        color,
        llaves,
        marca_llaves,
        tablero_completo,
        tipo_cierre,
        espesor_chapa,
        tipo_chapa,
        planos,
        informacion_especifica
      })
      .eq("orden_id", ordenId);

    if (error) throw error;

    res.json({ ok: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error actualizando cuestionario" });
  }
}