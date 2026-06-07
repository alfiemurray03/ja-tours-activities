import { onRequestGet as getAdminStatus } from "../functions/api/admin/status.js";
import {
  onRequestGet as getAdminPolicies,
  onRequestPost as createAdminPolicy,
  onRequestPut as updateAdminPolicy
} from "../functions/api/admin/policies.js";
import {
  onRequestGet as getAdminServices,
  onRequestPut as updateAdminService
} from "../functions/api/admin/services.js";
import { onRequestGet as getPublicServices } from "../functions/api/public/services.js";
import { onRequestGet as getPublicPolicy } from "../functions/api/public/policies/[slug].js";
import {
  onRequestGet as rejectWebhookGet,
  onRequestPost as receiveStripeWebhook
} from "../functions/api/stripe/webhook.js";
import { error, json } from "../functions/_lib/responses.js";

function context(request, env, params = {}) {
  return { request, env, params };
}

function methodNotAllowed() {
  return error("Method not allowed.", 405);
}

async function testDatabase(env) {
  if (!env.CONTENT_DB) return error("The CONTENT_DB D1 binding is not configured.", 503);
  try {
    const requiredTables = ["services", "policies", "audit_log", "stripe_events"];
    const placeholders = requiredTables.map(() => "?").join(",");
    const result = await env.CONTENT_DB.prepare(`
      SELECT name FROM sqlite_master
      WHERE type = 'table' AND name IN (${placeholders})
    `).bind(...requiredTables).all();
    return json({
      success: true,
      database: "connected",
      schema_ready: result.results.length === requiredTables.length,
      required_tables_found: result.results.length,
      required_tables_total: requiredTables.length
    });
  } catch {
    return error("Database connection failed.", 500);
  }
}

async function handleApi(request, env, url) {
  const requestContext = context(request, env);

  if (url.pathname === "/api/test-db") {
    return request.method === "GET" ? testDatabase(env) : methodNotAllowed();
  }

  if (url.pathname === "/api/admin/status") {
    return request.method === "GET" ? getAdminStatus(requestContext) : methodNotAllowed();
  }

  if (url.pathname === "/api/admin/services") {
    if (request.method === "GET") return getAdminServices(requestContext);
    if (request.method === "PUT") return updateAdminService(requestContext);
    return methodNotAllowed();
  }

  if (url.pathname === "/api/admin/policies") {
    if (request.method === "GET") return getAdminPolicies(requestContext);
    if (request.method === "POST") return createAdminPolicy(requestContext);
    if (request.method === "PUT") return updateAdminPolicy(requestContext);
    return methodNotAllowed();
  }

  if (url.pathname === "/api/public/services") {
    return request.method === "GET" ? getPublicServices(requestContext) : methodNotAllowed();
  }

  const policyMatch = url.pathname.match(/^\/api\/public\/policies\/([a-z0-9-]+)$/);
  if (policyMatch) {
    return request.method === "GET"
      ? getPublicPolicy(context(request, env, { slug: policyMatch[1] }))
      : methodNotAllowed();
  }

  if (url.pathname === "/api/stripe/webhook") {
    if (request.method === "POST") return receiveStripeWebhook(requestContext);
    if (request.method === "GET") return rejectWebhookGet(requestContext);
    return methodNotAllowed();
  }

  return error("API route not found.", 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return handleApi(request, env, url);
    return env.ASSETS.fetch(request);
  }
};
