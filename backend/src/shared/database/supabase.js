import "dotenv/config";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_STORAGE_ENDPOINT;
const supabaseServiceRoleKey = process.env.SUPABASE_STORAGE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase credentials are missing");
}

export const supabase = createClient(
    supabaseUrl, 
    supabaseServiceRoleKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        },
    }

);