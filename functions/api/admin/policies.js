import { requireAdmin } from "../../_lib/auth.js";
import { requireDatabase, validSlug } from "../../_lib/data.js";
import { error, json, readJson, requireSameOrigin } from "../../_lib/responses.js";

export async function onRequestGet(context) {
  const admin = await requireAdmin(context);
  if (admin.response) return admin.response;
  try {
    const database = requireDatabase(context.env);
    const result = await database.prepare("SELECT * FROM policies ORDER BY updated_at DESC").all();
    return json({ policies: result.results });
  } catch (databaseError) {
    return error(databaseError.message, 503);
  }
}

function validatePolicy(payload) {
  if (!payload.title || !payload.body) return "A title and policy body are required.";
  if (!validSlug(payload.slug)) return "The policy slug may contain lowercase letters, numbers and hyphens only.";
  if (!["draft", "published"].includes(payload.status)) return "Policy status is invalid.";
  if (String(payload.body).length > 100_000) return "Policy wording is too long.";
  return null;
}

async function savePolicy(context, mode) {
  const admin = await requireAdmin(context);
  if (admin.response) return admin.response;
  try {
    requireSameOrigin(context.request);
    const payload = await readJson(context.request);
    const validationError = validatePolicy(payload);
    if (validationError) return error(validationError);
    const database = requireDatabase(context.env);
    const publishedAt = payload.status === "published" ? new Date().toISOString() : null;

    if (mode === "create") {
      await database.prepare(`
        INSERT INTO policies (title, slug, summary, body, status, version, published_at, updated_by)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
      `).bind(
        String(payload.title).trim(),
        payload.slug,
        String(payload.summary || "").trim(),
        String(payload.body).trim(),
        payload.status,
        String(payload.version || "1.0").trim(),
        publishedAt,
        admin.identity.email || "unknown"
      ).run();
    } else {
      if (!Number.isInteger(Number(payload.id))) return error("A valid policy ID is required.");
      await database.prepare(`
        UPDATE policies SET
          title = ?1, slug = ?2, summary = ?3, body = ?4, status = ?5, version = ?6,
          published_at = CASE WHEN ?5 = 'published' THEN COALESCE(published_at, ?7) ELSE NULL END,
          updated_at = CURRENT_TIMESTAMP, updated_by = ?8
        WHERE id = ?9
      `).bind(
        String(payload.title).trim(),
        payload.slug,
        String(payload.summary || "").trim(),
        String(payload.body).trim(),
        payload.status,
        String(payload.version || "1.0").trim(),
        publishedAt,
        admin.identity.email || "unknown",
        Number(payload.id)
      ).run();
    }

    await database.prepare("INSERT INTO audit_log (actor, action, resource_type, resource_key) VALUES (?1, ?2, 'policy', ?3)")
      .bind(admin.identity.email || "unknown", mode, payload.slug).run();
    return json({ success: true });
  } catch (requestError) {
    const duplicate = String(requestError.message).includes("UNIQUE");
    return error(duplicate ? "That policy URL slug is already in use." : requestError.message, duplicate ? 409 : 503);
  }
}

export function onRequestPost(context) {
  return savePolicy(context, "create");
}

export function onRequestPut(context) {
  return savePolicy(context, "update");
}
