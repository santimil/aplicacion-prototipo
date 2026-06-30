import { createSupabaseClient } from "../services/supabaseClient.js";

export async function getOrders(req, res) {

  const supabase = createSupabaseClient(req);

  const { data, error } = await supabase
    .from("orden")
    .select(`
      *,
      cuestionario (*)
    `);

  if (error) return res.status(500).json({ error });

  res.json(data);
}

export async function createOrder(req, res) {
  const supabase = createSupabaseClient(req);

  const MAX_NUMERO_LENGTH = 30;
  const MAX_CLIENTE_LENGTH = 100;
  const MAX_TRABAJO_LENGTH = 300;

  try {
    let {
      numero,
      cliente,
      trabajo,
      fechaIngreso,
      prioridad,
      notas,
      usuario_id
    } = req.body;

    numero = String(numero ?? "").trim();
    cliente = cliente?.trim();
    trabajo = trabajo?.trim();

    if (!numero || !cliente || !trabajo) {
      return res.status(400).json({
        error: "Faltan campos obligatorios"
      });
    }

    if (numero.trim().length > MAX_NUMERO_LENGTH) {
      return res.status(400).json({
        error: `El número no puede superar los ${MAX_NUMERO_LENGTH} caracteres`
      });
    }

    if (cliente.trim().length > MAX_CLIENTE_LENGTH) {
      return res.status(400).json({
        error: `El cliente no puede superar los ${MAX_CLIENTE_LENGTH} caracteres`
      });
    }

    if (trabajo.trim().length > MAX_TRABAJO_LENGTH) {
      return res.status(400).json({
        error: `El trabajo no puede superar los ${MAX_TRABAJO_LENGTH} caracteres`
      });
    }

    if (!isValidDate(fechaIngreso)) {
      fechaIngreso = new Date().toISOString();
    }

    let nuevaOrden = {
      numero,
      cliente,
      trabajo,
      fecha_ingreso: fechaIngreso,
      dias_asignados: 0,
      fecha_entrega: null,
      area: "inicio",
      prioridad,
      notas: notas || null,
      creado_por: usuario_id,
      creado: new Date()
    };

    const { data: existing, error: existingError } = await supabase
      .from("orden")
      .select("id")
      .eq("numero", numero)
      .limit(1);

    if (existingError) throw existingError;

    if (existing?.length > 0) {
      return res.status(400).json({
        error: "Ya existe una orden con ese número"
      });
    }

    // 1️⃣ Crear orden
    const { data: orderData, error: orderError } = await supabase
      .from("orden")
      .insert([nuevaOrden])
      .select();

    if (orderError) throw orderError;

    const order = orderData[0];

    // 2️⃣ Crear cuestionario vacío
    const { error: cuestionarioError } = await supabase
      .from("cuestionario")
      .insert([{
        orden_id: order.id,
        color: null,
        llaves: false,
        marca_llaves: null,
        tablero_completo: false,
        tipo_cierre: null,
        espesor_chapa: null,
        tipo_chapa: null,
        planos: false,
        informacion_especifica: null
      }]);

    if (cuestionarioError) throw cuestionarioError;

    // 3️⃣ Devolver orden (por ahora sin cuestionario)
    res.json(order);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creando orden" });
  }
}

function isValidDate(date) {
  return date && !isNaN(new Date(date).getTime());
}

export async function updateOrder(req, res) {
  const supabase = createSupabaseClient(req);

  const MAX_CLIENTE_LENGTH = 100;
  const MAX_TRABAJO_LENGTH = 300;

  try {
    const { id } = req.params;

    const {
      numero,
      cliente,
      trabajo,
      area,
      prioridad,
      dias_asignados,
      creado_por,
      asignado_a,
      notas
    } = req.body;


    const updates = {};
    let oldArea = null;
    let oldAssigned = null;

    if (numero !== undefined) updates.numero = numero;
    if (cliente !== undefined) updates.cliente = cliente;
    if (trabajo !== undefined) updates.trabajo = trabajo;

    if (cliente.trim().length > MAX_CLIENTE_LENGTH) {
      return res.status(400).json({
        error: `El cliente no puede superar los ${MAX_CLIENTE_LENGTH} caracteres`
      });
    }

    if (trabajo.trim().length > MAX_TRABAJO_LENGTH) {
      return res.status(400).json({
        error: `El trabajo no puede superar los ${MAX_TRABAJO_LENGTH} caracteres`
      });
    }
    
    if (area !== undefined) {
      updates.area = area;

      const { data: existingOrder, error: fetchError } = await supabase
        .from("orden")
        .select("area, asignado_a")
        .eq("id", id)
        .single();

      if (fetchError) {
        return res.status(404).json({
          error: "La orden ya no existe"
        });
      }

      oldArea = existingOrder.area;
      oldAssigned = existingOrder.asignado_a;
    }
    if (prioridad !== undefined) updates.prioridad = prioridad;
    if (dias_asignados !== undefined) {
      const dias = Number(dias_asignados);

      if (isNaN(dias) || dias < 0) {
        return res.status(400).json({
          error: "dias_asignados inválido"
        });
      }

      updates.dias_asignados = dias;

      // 🔹 traer fecha_ingreso desde DB
      const { data: existingOrder, error: fetchError } = await supabase
        .from("orden")
        .select("fecha_ingreso")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const fechaIngreso = new Date(existingOrder.fecha_ingreso);

      const fechaEntrega = new Date(fechaIngreso);
      fechaEntrega.setDate(fechaEntrega.getDate() + Number(dias_asignados));

      updates.fecha_entrega = fechaEntrega.toISOString();
    }
    if (asignado_a !== undefined) updates.asignado_a = asignado_a;
    if (notas !== undefined) updates.notas = notas;


    const { data, error } = await supabase
      .from("orden")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: "La orden ya no existe"
      });
    }

    if (area !== undefined && area !== oldArea) {
      const { error: historyError } = await supabase
        .from("historial")
        .insert([
          {
            order_id: id,
            area_anterior: oldArea,
            area_nueva: area,
            timestamp:  new Date().toISOString(),
            usuario_id: oldAssigned
          }
        ]);

      if (historyError) {
        console.error("Error guardando historial:", historyError);
        // no tiramos error para no romper el flujo principal
      }
    }

    res.json(data[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error actualizando orden" });
  }
}

export async function deleteOrder(req, res) {
  const supabase = createSupabaseClient(req);

  try {
    const { id } = req.params;

    const { data: cuestionario, error: cuestionarioError } = await supabase
      .from("cuestionario")
      .select("id")
      .eq("orden_id", id)
      .single();

    if (cuestionarioError) throw cuestionarioError;

    const { data: rutas, error: rutasError } = await supabase
      .from("planos_archivos")
      .select("path")
      .eq("cuestionario_id", cuestionario.id);

    if (rutasError) throw rutasError;

    const paths = rutas
      .map(r => r.path)
      .filter(Boolean);

    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("planos")
        .remove(paths);

      if (storageError) throw storageError;
    }

    const { error } = await supabase
      .from("orden")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error eliminando orden" });
  }
}

export async function marcarEnCamino(req, res) {
  const supabase = createSupabaseClient(req);

  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("orden")
      .update({
        estado_entrega: "en_camino"
      })
      .eq("id", id)
      .eq("area", "entrega")
      .select();

    if (error) throw error;

    res.json(data[0]);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Error actualizando estado"
    });
  }
}

export async function entregarOrder(req, res) {
  const supabase = createSupabaseClient(req);

  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("orden")
      .update({
        fecha_entregado: new Date().toISOString(),
        estado_entrega: "entregada"
      })
      .eq("id", id)
      .eq("area", "entrega")
      .is("fecha_entregado", null)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(400).json({
        error: "La orden no puede marcarse como entregada"
      });
    }

    res.json(data[0]);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Error asignando fecha de entrega"
    });
  }
}

export async function marcarReclama(req, res) {
  const supabase = createSupabaseClient(req);

  try {
    const { id } = req.params;
    const { descripcion } = req.body;

    const { data, error } = await supabase
      .from("orden")
      .update({
        estado_entrega: "reclamada",
        reclamo_descripcion: descripcion,
        fecha_reclamo: new Date().toISOString()
      })
      .eq("id", id)
      .eq("area", "entrega")
      .select();

    if (error) throw error;

    res.json(data[0]);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Error actualizando estado"
    });
  }
}

export async function actualizarReclamo(req, res) {
  const supabase = createSupabaseClient(req);

  try {
    const { id } = req.params;
    const {
      actualizacion,
      resuelto
    } = req.body;

    // Obtener reclamo actual
    const { data: orden, error: getError } =
      await supabase
        .from("orden")
        .select("reclamo_descripcion")
        .eq("id", id)
        .single();

    if (getError) throw getError;

    const fecha = new Date().toLocaleString("es-UY");

    let nuevoTexto = orden.reclamo_descripcion || "";

    if (actualizacion?.trim()) {

      nuevoTexto += `

    [${fecha}]
    ${actualizacion}`;
    }

    const { data, error } = await supabase
      .from("orden")
      .update({
        reclamo_descripcion: nuevoTexto,
        reclamo_resuelto: !!resuelto
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    res.json(data[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Error actualizando reclamo"
    });
  }
}