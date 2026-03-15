import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { signHmac } from "/Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/supabase/functions/_shared/hmac.ts";
import { SubmissionDetailSchema } from "/Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/src/services/bff/schemas.ts";

const BLUEPRINT_API_URL = "https://ovfctbpwclkrbfjjzssj.supabase.co/functions/v1";

async function run() {
    const blueprintId = "b3f81e33-72ad-4835-abfa-25ad1c4f51fd"; // the one from earlier testing
    const proxyBody = JSON.stringify({ blueprint_id: blueprintId });
    
    // We need to set the environment variable locally for hmac.ts to work, wait, hmac.ts probably uses Deno.env.get("BLUEPRINT_HMAC_SECRET")
    // Or we can just mock the HMAC and run it in Deno.

    const { signature, timestamp } = await signHmac(proxyBody);

    console.log("Fetching project A...");
    const projectAResponse = await fetch(`${BLUEPRINT_API_URL}/get-blueprint-report-snapshot`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Dashboard-Signature": signature,
            "X-Dashboard-Timestamp": timestamp,
        },
        body: proxyBody,
    });

    console.log("Status:", projectAResponse.status);
    const data = await projectAResponse.json();
    console.log("Raw Project A Data:", JSON.stringify(data, null, 2));

    // Now let's apply the bad logic
    const enrichedData = { ...data };
    const pdfUrlSource = "https://pdf.example.com/test.pdf";
    if (pdfUrlSource) {
        if (!enrichedData.artifacts) enrichedData.artifacts = {};
        if (!enrichedData.artifacts.latest) enrichedData.artifacts.latest = {};
        if (!enrichedData.artifacts.latest.pdf?.url) {
            enrichedData.artifacts.latest.pdf = {
                version: enrichedData.artifacts.latest.pdf?.version || 1,
                url: pdfUrlSource,
            };
        }
    }

    try {
        console.log("Parsing with Zod...");
        const parsed = SubmissionDetailSchema.parse(enrichedData);
        console.log("Success!");
    } catch (e: any) {
        console.error("Zod Error:", JSON.stringify(e.issues, null, 2));
    }
}

run();
