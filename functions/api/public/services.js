import { normaliseService, requireDatabase } from "../../_lib/data.js";
import { error, json } from "../../_lib/responses.js";

export async function onRequestGet(context) {
  try {
    const database = requireDatabase(context.env);
    const result = await database.prepare("SELECT * FROM services WHERE published = 1 ORDER BY sort_order, id").all();
    return json({ services: result.results.map(normaliseService) }, 200, { "Cache-Control": "public, max-age=60" });
  } catch (databaseError) {
    return error(databaseError.message, 503);
  }
}
