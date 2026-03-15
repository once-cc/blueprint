import crypto from "crypto";

const BLUEPRINT_API_URL = "https://ovfctbpwclkrbfjjzssj.supabase.co/functions/v1";
const HMAC_SECRET = "395af72d3cad0f2a19c80e36cddbbc3816ddf9f334de041630d9686c195f4c87";

async function signHmac(body) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const message = `${timestamp}:${body}`;
    const hmac = crypto.createHmac("sha256", HMAC_SECRET);
    hmac.update(message);
    return {
        signature: hmac.digest("hex"),
        timestamp,
    };
}

async function run() {
    const proxyBody = JSON.stringify({ blueprint_id: "a581f14f-8ba7-411a-ba22-7b09482151ec" });
    const { signature, timestamp } = await signHmac(proxyBody);

    console.log("Fetching project A...");
    const res = await fetch(`${BLUEPRINT_API_URL}/get-blueprint-report-snapshot`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Dashboard-Signature": signature,
            "X-Dashboard-Timestamp": timestamp,
        },
        body: proxyBody,
    });

    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Data keys:", Object.keys(data));
    if (data.data) {
        console.log("data.data length:", data.data.length);
        if (data.data.length > 0) {
           console.log("First item id:", data.data[0].id);
        }
    } else {
        console.log("Entire returned data:", JSON.stringify(data, null, 2));
    }
}

run();
