import { createClient } from "@supabase/supabase-js"

const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  "https://lchldvdygmkdgefiklli.supabase.co"

const supabaseKey =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SUPABASE_KEY) ||
  "sb_publishable_fsBKZBVK9drCVRHgzG4i3Q_ZBMOzclW"

export const supabase = createClient(supabaseUrl, supabaseKey)