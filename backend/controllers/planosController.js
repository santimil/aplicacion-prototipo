import fs from "fs";

import { createSupabaseClient }
  from "../services/supabaseClient.js";

export async function uploadPlanos(req, res) {
  const supabase = createSupabaseClient(req);

  try {
    const { cuestionarioId } = req.params;

    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({
        error: "No se enviaron archivos"
      });
    }

    const uploaded = [];

    for (const file of files) {

      const fileBuffer = fs.readFileSync(file.path);

      const fileName =
        `${Date.now()}-${file.originalname}`;

      const storagePath =
        `${cuestionarioId}/${fileName}`;

      // 1️⃣ subir a storage
      const { error: uploadError } =
        await supabase.storage
          .from("planos")
          .upload(storagePath, fileBuffer, {
            contentType: file.mimetype
          });

      if (uploadError) {
        console.error(uploadError);
        continue;
      }

      // 2️⃣ obtener url pública
      const {
        data: publicUrlData
      } = supabase.storage
        .from("planos")
        .getPublicUrl(storagePath);

      // 3️⃣ guardar metadata
      const { data, error } =
        await supabase
          .from("planos_archivos")
          .insert([{
            cuestionario_id: cuestionarioId,

            nombre: file.originalname,

            path: storagePath,

            url: publicUrlData.publicUrl,

            tipo: file.mimetype,

            tamaño: file.size
          }])
          .select()
          .single();

      if (error) {
        console.error(error);
        continue;
      }

      uploaded.push(data);

      // 4️⃣ limpiar temp
      fs.unlinkSync(file.path);
    }

    res.json(uploaded);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Error subiendo planos"
    });
  }
}

export async function getPlanos(req, res) {

  const supabase = createSupabaseClient(req);

  try {

    const { cuestionarioId } = req.params;

    const { data, error } = await supabase
      .from("planos_archivos")
      .select("*")
      .eq("cuestionario_id", cuestionarioId)
      .order("creado", {
        ascending: false
      });

    if (error) throw error;

    res.json(data);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Error obteniendo planos"
    });
  }
}

export async function deletePlano(req, res) {

  const supabase = createSupabaseClient(req);

  try {

    const { id } = req.params;

    // 1️⃣ buscar plano
    const { data: plano, error: fetchError } = await supabase
      .from("planos_archivos")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // 2️⃣ eliminar archivo del bucket
    const { error: storageError } = await supabase
      .storage
      .from("planos")
      .remove([plano.path]);

    if (storageError) throw storageError;

    // 3️⃣ eliminar registro DB
    const { error: deleteError } = await supabase
      .from("planos_archivos")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Error eliminando plano"
    });
  }
}