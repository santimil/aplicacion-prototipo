// services/adminSupabase.js

import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default adminSupabase;