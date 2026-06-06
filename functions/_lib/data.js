export function requireDatabase(env) {
  if (!env.CONTENT_DB) throw new Error("The CONTENT_DB D1 binding is not configured.");
  return env.CONTENT_DB;
}

export function normaliseService(row) {
  return {
    ...row,
    published: Number(row.published),
    featured: Number(row.featured),
    features: JSON.parse(row.features_json || "[]")
  };
}

export function validSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || ""));
}
