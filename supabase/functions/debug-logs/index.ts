import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { data, error } = await supabase
            .from("blueprint_emails")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10);

        return new Response(JSON.stringify({ data, error }, null, 2), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        return new Response(String(e), { status: 500 });
    }
});
