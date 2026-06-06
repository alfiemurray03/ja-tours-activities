import { requireAdmin } from "../../_lib/auth.js";
import { json } from "../../_lib/responses.js";

export async function onRequestGet(context) {
  const admin = await requireAdmin(context);
  if (admin.response) return admin.response;

  return json({
    access: true,
    database: Boolean(context.env.CONTENT_DB),
    stripe_secret: Boolean(context.env.STRIPE_SECRET_KEY),
    webhook_secret: Boolean(context.env.STRIPE_WEBHOOK_SECRET),
    administrator: admin.identity.email || null
  });
}
