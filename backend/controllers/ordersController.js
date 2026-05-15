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

  try {
    let {
      numero,
      cliente,
      trabajo,
      fechaIngreso,
      diasAsignados,
      area,
      prioridad,
      notas,
      usuario_id
    } = req.body;

    if (!numero || !cliente || !trabajo) {
      return res.status(400).json({
        error: "Faltan campos obligatorios"
      });
    }

    const dias = Number(diasAsignados);

    if (isNaN(dias) || dias <= 0) {
      return res.status(400).json({
        error: "Días asignados inválidos"
      });
    }

    if (!isValidDate(fechaIngreso)) {
      fechaIngreso = new Date().toISOString();
    }

    const fechaEntrega = new Date(fechaIngreso);
    fechaEntrega.setDate(fechaEntrega.getDate() + dias);

    let nuevaOrden = {
      numero,
      cliente,
      trabajo,
      fecha_ingreso: fechaIngreso,
      dias_asignados: dias,
      fecha_entrega: fechaEntrega,
      area,
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

  try {
    const { id } = req.params;

    const { fecha_ingreso } = req.params;

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

    if (numero !== undefined) updates.numero = numero;
    if (cliente !== undefined) updates.cliente = cliente;
    if (trabajo !== undefined) updates.trabajo = trabajo;
    if (area !== undefined) {
      updates.area = area;

      const { data: existingOrder, error: fetchError } = await supabase
        .from("orden")
        .select("area")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      oldArea = existingOrder.area;
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
      
      updates.dias_asignados = dias_asignados;

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

    if (area !== undefined && area !== oldArea) {
      const { error: historyError } = await supabase
        .from("historial")
        .insert([
          {
            order_id: id,
            area_anterior: oldArea,
            area_nueva: area,
            timestamp:  new Date().toISOString(),
            usuario_id: creado_por
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

export async function entregarOrder(req, res) {
  const supabase = createSupabaseClient(req);

  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("orden")
      .update({
        fecha_entregado: new Date().toISOString()
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