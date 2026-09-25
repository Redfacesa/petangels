import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

async function hmacHex(secret: string, body: string, algo: "SHA-512" | "SHA-256") {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: algo },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }

  const body = await req.text();
  const paystackSig = req.headers.get("x-paystack-signature") || "";
  const redfaceSig = req.headers.get("x-redface-signature") || "";
  const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY") || "";
  const redfaceSecret = Deno.env.get("REDFACE_WEBHOOK_SECRET") || "";

  let provider: "paystack" | "redface" | null = null;
  if (paystackSig && paystackSecret) {
    const expected = await hmacHex(paystackSecret, body, "SHA-512");
    if (!timingSafeEqual(expected, paystackSig.toLowerCase())) {
      return new Response("bad paystack signature", { status: 401 });
    }
    provider = "paystack";
  } else if (redfaceSig && redfaceSecret) {
    const expected = await hmacHex(redfaceSecret, body, "SHA-256");
    if (!timingSafeEqual(expected, redfaceSig.toLowerCase())) {
      return new Response("bad redface signature", { status: 401 });
    }
    provider = "redface";
  } else {
    return new Response("unsigned webhook", { status: 401 });
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(body) as Record<string, unknown>;
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  const data = (payload.data || payload) as Record<string, unknown>;
  const event = String(payload.event || payload.type || "");
  const success =
    event === "charge.success" ||
    event === "payment.success" ||
    event === "charge.success.inactive" ||
    String(data.status || "") === "success";
  if (!success) {
    return new Response(JSON.stringify({ ok: true, ignored: event }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const reference = String(data.reference || data.ref || payload.reference || "");
  const amountKobo = Number(data.amount || 0);
  const amountZar = amountKobo >= 100 ? amountKobo / 100 : Number(data.amount_zar || data.amount || 0);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
  );

  const row = {
    provider,
    provider_ref: reference || `${provider}-${Date.now()}`,
    amount_zar: amountZar,
    label: String(data.metadata && typeof data.metadata === "object"
      ? (data.metadata as { label?: string }).label || "Pet Angels payment"
      : "Pet Angels payment"),
    kind: "product",
    status: "paid",
    paid_at: new Date().toISOString(),
    raw_event: payload,
  };

  const { data: existing } = await supabase
    .from("pa_pay_events")
    .select("id")
    .eq("provider", provider)
    .eq("provider_ref", row.provider_ref)
    .maybeSingle();

  if (existing?.id) {
    await supabase.from("pa_pay_events").update({
      status: "paid",
      paid_at: row.paid_at,
      amount_zar: row.amount_zar,
      raw_event: payload,
    }).eq("id", existing.id);
  } else {
    await supabase.from("pa_pay_events").insert(row);
  }

  return new Response(JSON.stringify({ ok: true, provider, reference }), {
    headers: { "Content-Type": "application/json" },
  });
});
