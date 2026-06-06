import { error, json } from "../../_lib/responses.js";

function parseStripeSignature(header) {
  return header.split(",").reduce((result, item) => {
    const [key, value] = item.split("=", 2);
    if (key && value) {
      result[key] ||= [];
      result[key].push(value);
    }
    return result;
  }, {});
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function verifySignature(payload, signatureHeader, secret) {
  const signatures = parseStripeSignature(signatureHeader);
  const timestamp = Number(signatures.t?.[0]);
  if (!timestamp || !signatures.v1?.length) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`));
  const expected = toHex(digest);
  return signatures.v1.some(signature => timingSafeEqual(expected, signature));
}

export async function onRequestPost(context) {
  const secret = context.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return error("Stripe webhook signing secret is not configured.", 503);

  const signature = context.request.headers.get("stripe-signature");
  if (!signature) return error("Stripe signature is missing.", 400);

  const payload = await context.request.text();
  if (!(await verifySignature(payload, signature, secret))) return error("Stripe signature verification failed.", 400);

  let event;
  try {
    event = JSON.parse(payload);
  } catch {
    return error("Stripe event payload is invalid.", 400);
  }

  if (context.env.CONTENT_DB) {
    try {
      await context.env.CONTENT_DB.prepare(`
        INSERT OR IGNORE INTO stripe_events (stripe_event_id, event_type, payload_json)
        VALUES (?1, ?2, ?3)
      `).bind(event.id, event.type, payload).run();
    } catch {
      return error("The verified Stripe event could not be recorded.", 500);
    }
  }

  return json({ received: true });
}

export function onRequestGet() {
  return error("Method not allowed.", 405);
}
