import { requireAdmin } from "../../_lib/auth.js";
import { normaliseService, requireDatabase, validSlug } from "../../_lib/data.js";
import { error, json, readJson, requireSameOrigin } from "../../_lib/responses.js";

export async function onRequestGet(context) {
  const admin = await requireAdmin(context);
  if (admin.response) return admin.response;
  try {
    const database = requireDatabase(context.env);
    const result = await database.prepare("SELECT * FROM services ORDER BY sort_order, id").all();
    return json({ services: result.results.map(normaliseService) });
  } catch (databaseError) {
    return error(databaseError.message, 503);
  }
}

export async function onRequestPut(context) {
  const admin = await requireAdmin(context);
  if (admin.response) return admin.response;
  try {
    requireSameOrigin(context.request);
    const payload = await readJson(context.request);
    if (!validSlug(payload.slug)) return error("A valid service slug is required.");
    if (!payload.name || !payload.description || !payload.delivery) return error("Name, description and delivery wording are required.");
    if (!Number.isInteger(payload.price_pence) || payload.price_pence < 0) return error("A valid price is required.");
    if (!Array.isArray(payload.features)) return error("Features must be supplied as a list.");

    const database = requireDatabase(context.env);
    const result = await database.prepare(`
      UPDATE services SET
        name = ?1,
        description = ?2,
        price_pence = ?3,
        delivery = ?4,
        features_json = ?5,
        published = ?6,
        featured = ?7,
        updated_at = CURRENT_TIMESTAMP
      WHERE slug = ?8
    `).bind(
      String(payload.name).trim(),
      String(payload.description).trim(),
      payload.price_pence,
      String(payload.delivery).trim(),
      JSON.stringify(payload.features.map(value => String(value).trim()).filter(Boolean)),
      payload.published ? 1 : 0,
      payload.featured ? 1 : 0,
      payload.slug
    ).run();

    if (!result.meta.changes) return error("Service was not found.", 404);
    await database.prepare("INSERT INTO audit_log (actor, action, resource_type, resource_key) VALUES (?1, 'update', 'service', ?2)")
      .bind(admin.identity.email || "unknown", payload.slug).run();
    return json({ success: true });
  } catch (requestError) {
    return error(requestError.message, requestError instanceof SyntaxError ? 400 : 503);
  }
}
