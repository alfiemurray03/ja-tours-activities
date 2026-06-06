export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders
    }
  });
}

export function error(message, status = 400) {
  return json({ error: message }, status);
}

export async function readJson(request, maximumBytes = 100_000) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > maximumBytes) throw new Error("Request body is too large.");
  const text = await request.text();
  if (text.length > maximumBytes) throw new Error("Request body is too large.");
  return JSON.parse(text || "{}");
}

export function requireSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const expected = new URL(request.url).origin;
  if (origin !== expected) throw new Error("Cross-origin admin requests are not permitted.");
}
