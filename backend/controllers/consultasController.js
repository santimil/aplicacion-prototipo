import { createSupabaseClient } from "../services/supabaseClient.js";

export async function createConsulta(req, res) {

  const supabase = createSupabaseClient(req);

  try {

    const {
      orden_id,
      mensaje,
      usuario_id
    } = req.body;

    const { data, error } = await supabase
      .from("consultas_orden")
      .insert([
        {
          orden_id,
          mensaje,
          usuario_id,
          estado: "pendiente"
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // 2️⃣ crear notificaciónes

    const { data: admins } = await supabase
      .from("usuario")
      .select("id")
      .eq("rol", "admin");

    const notifications = admins.map(admin => ({
      usuario_id: admin.id,
      order_id: orden_id,
      tipo: "consulta_nueva",
      mensaje: "Nueva consulta creada",
      leido: false,
      creado: new Date()
    }));

    await supabase
      .from("notificaciones")
      .insert(notifications);

    res.json(data);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Error creando consulta"
    });
  }
}

export async function getConsultasByOrden(req, res) {

  const supabase = createSupabaseClient(req);

  try {

    const { ordenId } = req.params;

    const { data, error } = await supabase
      .from("consultas_orden")
      .select("*")
      .eq("orden_id", ordenId)
      .order("created_at", {
        ascending: true
      });

    if (error) throw error;

    res.json(data);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Error obteniendo consultas"
    });
  }
}

export async function updateConsulta(req, res) {

  const supabase = createSupabaseClient(req);

  try {

    const { id } = req.params;

    const {
      respuesta,
      estado
    } = req.body;

    const { data, error } = await supabase
      .from("consultas_orden")
      .update({
        respuesta,
        estado,
        respondido_at: new Date()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from("notificaciones")
      .insert({
        usuario_id: data.usuario_id,
        order_id: data.orden_id,
        tipo: "consulta_respondida",
        mensaje: "Tu consulta fue respondida",
        leido: false,
        creado: new Date()
      });

    res.json(data);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Error actualizando consulta"
    });
  }
}