import { requireDatabase, validSlug } from "../../../_lib/data.js";
import { error, json } from "../../../_lib/responses.js";

export async function onRequestGet(context) {
  const slug = context.params.slug;
  if (!validSlug(slug)) return error("Policy not found.", 404);
  try {
    const database = requireDatabase(context.env);
    const policy = await database.prepare(`
      SELECT title, slug, summary, body, version, published_at, updated_at
      FROM policies WHERE slug = ?1 AND status = 'published'
    `).bind(slug).first();
    if (!policy) return error("Policy not found.", 404);
    return json({ policy }, 200, { "Cache-Control": "public, max-age=300" });
  } catch (databaseError) {
    return error(databaseError.message, 503);
  }
}
