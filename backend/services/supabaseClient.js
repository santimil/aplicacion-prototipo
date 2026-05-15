import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

export function createSupabaseClient(req) {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
      global: {
        headers: {
          Authorization: req.headers.authorization
        }
      }
    }
  );
}