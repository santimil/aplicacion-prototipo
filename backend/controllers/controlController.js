import { createSupabaseClient } from "../services/supabaseClient.js";

export async function createControl(req, res) {
  const supabase = createSupabaseClient(req);

  try {
    const { orderId } = req.params;

    // 1️⃣ Buscar orden
    const { data: order, error: orderError } = await supabase
      .from("orden")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        error: "Orden no encontrada"
      });
    }

    // 2️⃣ Validar área
    if (order.area !== "armado") {
      return res.status(400).json({
        error: "La orden debe estar en armado"
      });
    }

    // 3️⃣ Crear control
    const { data: control, error: controlError } = await supabase
      .from("control")
      .insert([{
        orden_id: order.id,
        estado: "pendiente"
      }])
      .select()
      .single();

    if (controlError) throw controlError;

    // 4️⃣ Traer chequeos base
    const { data: checks, error: checksError } = await supabase
      .from("chequeo")
      .select("*");

    if (checksError) throw checksError;

    // 5️⃣ Crear relaciones control_chequeo
    const relations = checks.map(check => ({
      control_id: control.id,
      chequeo_id: check.id,
      estado: "pendiente"
    }));

    const { error: relationError } = await supabase
      .from("control_chequeo")
      .insert(relations);

    if (relationError) {
      console.error("ERROR RELACIONES:", relationError);
    }

    // 6️⃣ Mover orden a área control
    const { error: updateError } = await supabase
      .from("orden")
      .update({
        area: "control"
      })
      .eq("id", order.id);


    if (updateError) {
      return res.status(500).json({
        error: "Error moviendo orden a control"
      });
    }

    const { error: historialError } = await supabase
    .from("historial")
    .insert([
      {
        order_id: order.id,
        area_anterior: order.area,
        area_nueva: "control",
        timestamp: new Date().toISOString(),
        usuario_id: order.asignado_a
      }
    ]);

    if (historialError) {
      return res.status(500).json({
          error: "Error guardando historial: " + historialError 
        });
    }

    res.json({
      message: "Control creado correctamente",
      control
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Error creando control"
    });
  }
}

export async function getControl(req, res) {

  const { orderId } = req.params;

  const supabase = createSupabaseClient(req);

  // 1️⃣ buscar controles de la orden
  const { data: controles, error } = await supabase
    .from("control")
    .select(`
      *,
      orden (
        id,
        numero,
        cliente
      ),
      control_chequeo (
        *,
        chequeo (*)
      )
    `)
    .eq("orden_id", orderId)
    .order("creado", {
      ascending: false
    });

  if (error) {
    return res.status(500).json({
      error
    });
  }

  // 2️⃣ buscar pendiente
  let control =
    controles.find(c => c.estado === "pendiente");

  // 3️⃣ si no hay pendiente → usar más reciente
  if (!control) {
    control = controles[0];
  }

  console.log("control seleccionado", control);

  res.json(control);
}

export async function updateControlCheck(req, res) {

  const { id } = req.params;
  const { estado, observacion, revisado_por } = req.body;

  const supabase = createSupabaseClient(req);

  console.log("BODY:", req.body);
  console.log("REVISADO POR:", revisado_por);

  const { data, error } = await supabase
    .from("control_chequeo")
    .update({
      estado,
      observacion,
      revisado_por,
      fecha_revision: new Date()
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error });
  }

  res.json(data);
}

export async function revisarOrden(req, res) {

  const { id } = req.params;
  const {
    revisado_por,
    accion
  } = req.body;

  const supabase = createSupabaseClient(req);

  const config = {
    aprobar: {
      estado: "aprobado",
      nextArea: "entrega",

      validate: checks =>
        checks.every(
          c =>
            c.estado === "aprobado" ||
            c.estado === "no_aplica"
        ),

      errorMessage: "Hay chequeos pendientes"
    },

    rechazar: {
      estado: "rechazado",
      nextArea: "armado",

      validate: checks =>
        checks.some(
          c => c.estado === "rechazado"
        ),

      errorMessage: "No hay chequeos rechazados"
    }
  };

  const current = config[accion];

  if (!current) {
    return res.status(400).json({
      error: "Acción inválida"
    });
  }

  // 1️⃣ buscar chequeos
  const { data: checks, error: checksError } =
    await supabase
      .from("control_chequeo")
      .select("*")
      .eq("control_id", id);

  if (checksError) {
    return res.status(500).json({
      error: checksError
    });
  }

  // 2️⃣ validar
  const isValid = current.validate(checks);

  if (!isValid) {
    return res.status(400).json({
      error: current.errorMessage
    });
  }

  const observacionesGenerales = checks
  .filter(c => c.observacion)
  .map(c => c.observacion)
  .join("\n");

  // 3️⃣ aactualizar control

  const { data: control, error: controlError } = await supabase
    .from("control")
    .update({
      estado: current.estado,
      observaciones: observacionesGenerales,
      revisado_por,
      fecha_revision: new Date()
    })
    .eq("id", id)
    .select()
    .single();

  if (controlError) {
    return res.status(500).json({
      error: controlError
    });
  }

  // 4️⃣ mover orden

  const orden_id = control.orden_id;

  const { data: orden, error: ordenError } = await supabase
    .from("orden")
    .update({
      area: current.nextArea
    })
    .eq("id", orden_id)
    .select()
    .single();

  if (ordenError) {
    return res.status(500).json({
      error: ordenError
    });
  }

  // 5️⃣ guardar historial
  const { error: historialError } =
    await supabase
      .from("historial")
      .insert([
        {
          order_id: orden_id,
          area_anterior: "control",
          area_nueva: current.nextArea,
          usuario_id: revisado_por,
          timestamp: new Date().toISOString()
        }
      ]);

  if (historialError) {
    console.error(
      "Error guardando historial:",
      historialError
    );
  }

  console.log("orden", orden);

  res.json({ control, orden });
}