import { error } from "./responses.js";

let cachedKeys;
let cachedKeysAt = 0;

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function decodeJson(value) {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value)));
}

async function getKeys(teamDomain) {
  if (cachedKeys && Date.now() - cachedKeysAt < 60 * 60 * 1000) return cachedKeys;
  const response = await fetch(`${teamDomain.replace(/\/$/, "")}/cdn-cgi/access/certs`);
  if (!response.ok) throw new Error("Unable to retrieve Cloudflare Access signing keys.");
  cachedKeys = (await response.json()).keys;
  cachedKeysAt = Date.now();
  return cachedKeys;
}

async function verifyAccessJwt(token, env) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid Cloudflare Access token.");

  const header = decodeJson(parts[0]);
  const payload = decodeJson(parts[1]);
  if (header.alg !== "RS256" || !header.kid) throw new Error("Unsupported Cloudflare Access token.");

  const teamDomain = String(env.TEAM_DOMAIN || "").replace(/\/$/, "");
  const audience = String(env.POLICY_AUD || "");
  if (!teamDomain || !audience) throw new Error("Cloudflare Access server settings are incomplete.");

  const keys = await getKeys(teamDomain);
  const jwk = keys.find(key => key.kid === header.kid);
  if (!jwk) throw new Error("Cloudflare Access signing key was not found.");

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const signed = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, decodeBase64Url(parts[2]), signed);
  if (!valid) throw new Error("Cloudflare Access signature validation failed.");

  const acceptedAudiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!acceptedAudiences.includes(audience)) throw new Error("Cloudflare Access audience does not match.");
  if (payload.iss !== teamDomain) throw new Error("Cloudflare Access issuer does not match.");
  if (!payload.exp || payload.exp * 1000 <= Date.now()) throw new Error("Cloudflare Access session has expired.");

  return payload;
}

export async function requireAdmin(context) {
  const token = context.request.headers.get("cf-access-jwt-assertion");
  if (!token) return { response: error("Authentication required.", 401) };
  try {
    const identity = await verifyAccessJwt(token, context.env);
    return { identity };
  } catch (authError) {
    return { response: error(authError.message, authError.message.includes("settings") ? 503 : 403) };
  }
}
