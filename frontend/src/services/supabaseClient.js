import { createClient } from "@supabase/supabase-js";

const supabaseUrl = window.__ENV?.VITE_SUPABASE_URL;
const supabaseKey = window.__ENV?.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase runtime config. Check /config.js and Cloud Run env vars.");
}

const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
