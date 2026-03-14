import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://mzdamvilctcrliniqlck.supabase.co"

const supabaseKey = "sb_publishable_BN3-YOXkPbpOacC6DaVb3w_E8ixhLXg"

export const supabase = createClient(supabaseUrl, supabaseKey)