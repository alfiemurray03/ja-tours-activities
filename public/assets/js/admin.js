const state = { services: [], policies: [] };

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[character]);
}

function setMessage(id, text, type = "") {
  const element = document.querySelector(`#${id}`);
  element.textContent = text;
  element.className = `message ${type}`.trim();
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", Accept: "application/json", ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload;
}

function activateSection(id) {
  document.querySelectorAll(".admin-section").forEach(section => section.classList.toggle("active", section.id === id));
  document.querySelectorAll(".admin-nav button").forEach(button => button.classList.toggle("active", button.dataset.section === id));
}

document.querySelectorAll(".admin-nav button").forEach(button => button.addEventListener("click", () => activateSection(button.dataset.section)));

function statusCard(title, configured, detail) {
  return `<article class="admin-card"><span class="status ${configured ? "good" : "warn"}">${configured ? "Configured" : "Setup required"}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(detail)}</p></article>`;
}

async function loadStatus() {
  try {
    const payload = await api("/api/admin/status");
    document.querySelector("#statusCards").innerHTML = [
      statusCard("Cloudflare Access", payload.access, payload.access ? "Authenticated admin request verified." : "Protect /admin/* and /api/admin/* before launch."),
      statusCard("Content database", payload.database, payload.database ? "D1 content storage is available." : "Bind a D1 database as CONTENT_DB."),
      statusCard("Stripe", payload.stripe_secret && payload.webhook_secret, payload.stripe_secret && payload.webhook_secret ? "Server secrets are configured." : "Add encrypted Stripe secrets in Cloudflare.")
    ].join("");
    document.querySelector("#stripeCards").innerHTML = [
      statusCard("Stripe API key", payload.stripe_secret, payload.stripe_secret ? "A server-side key is configured." : "STRIPE_SECRET_KEY is missing."),
      statusCard("Webhook signing secret", payload.webhook_secret, payload.webhook_secret ? "Webhook signature verification is enabled." : "STRIPE_WEBHOOK_SECRET is missing."),
      statusCard("Webhook endpoint", true, "/api/stripe/webhook")
    ].join("");
  } catch (error) {
    document.querySelector("#statusCards").innerHTML = `<article class="admin-card"><span class="status bad">Unavailable</span><h3>Admin API</h3><p>${escapeHtml(error.message)}</p></article>`;
    document.querySelector("#stripeCards").innerHTML = "";
  }
}

function fillService(slug) {
  const service = state.services.find(item => item.slug === slug);
  if (!service) return;
  document.querySelector("#serviceName").value = service.name;
  document.querySelector("#servicePrice").value = (service.price_pence / 100).toFixed(2);
  document.querySelector("#serviceDelivery").value = service.delivery;
  document.querySelector("#serviceDescription").value = service.description;
  document.querySelector("#serviceFeatures").value = (service.features || []).join("\n");
  document.querySelector("#servicePublished").value = String(service.published);
  document.querySelector("#serviceFeatured").value = String(service.featured);
}

async function loadServices() {
  try {
    const payload = await api("/api/admin/services");
    state.services = payload.services;
    const select = document.querySelector("#serviceSlug");
    select.innerHTML = state.services.map(service => `<option value="${escapeHtml(service.slug)}">${escapeHtml(service.name)}</option>`).join("");
    fillService(select.value);
  } catch (error) {
    setMessage("serviceMessage", error.message, "error");
  }
}

document.querySelector("#serviceSlug").addEventListener("change", event => fillService(event.target.value));
document.querySelector("#serviceForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  try {
    await api("/api/admin/services", {
      method: "PUT",
      body: JSON.stringify({
        slug: form.get("slug"),
        name: form.get("name"),
        price_pence: Math.round(Number(form.get("price")) * 100),
        delivery: form.get("delivery"),
        description: form.get("description"),
        features: String(form.get("features")).split("\n").map(value => value.trim()).filter(Boolean),
        published: Number(form.get("published")),
        featured: Number(form.get("featured"))
      })
    });
    setMessage("serviceMessage", "Service saved successfully.", "success");
    await loadServices();
  } catch (error) {
    setMessage("serviceMessage", error.message, "error");
  }
});

function clearPolicyForm() {
  document.querySelector("#policyForm").reset();
  document.querySelector("#policyId").value = "";
  document.querySelector("#policyVersion").value = "1.0";
}

function fillPolicy(policy) {
  document.querySelector("#policyId").value = policy.id;
  document.querySelector("#policyTitle").value = policy.title;
  document.querySelector("#policySlug").value = policy.slug;
  document.querySelector("#policyStatus").value = policy.status;
  document.querySelector("#policyVersion").value = policy.version;
  document.querySelector("#policySummary").value = policy.summary || "";
  document.querySelector("#policyBody").value = policy.body;
  activateSection("policies");
}

function renderPolicies() {
  document.querySelector("#policyRows").innerHTML = state.policies.map(policy => `
    <tr>
      <td>${escapeHtml(policy.title)}</td>
      <td><span class="status ${policy.status === "published" ? "good" : "warn"}">${escapeHtml(policy.status)}</span></td>
      <td>${new Date(policy.updated_at).toLocaleString("en-GB")}</td>
      <td><button type="button" class="secondary edit-policy" data-id="${Number(policy.id)}">Edit</button></td>
    </tr>`).join("");
  document.querySelectorAll(".edit-policy").forEach(button => button.addEventListener("click", () => {
    const policy = state.policies.find(item => String(item.id) === button.dataset.id);
    if (policy) fillPolicy(policy);
  }));
}

async function loadPolicies() {
  try {
    const payload = await api("/api/admin/policies");
    state.policies = payload.policies;
    renderPolicies();
  } catch (error) {
    setMessage("policyMessage", error.message, "error");
  }
}

document.querySelector("#newPolicy").addEventListener("click", clearPolicyForm);
document.querySelector("#policyForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  try {
    await api("/api/admin/policies", {
      method: form.get("id") ? "PUT" : "POST",
      body: JSON.stringify(Object.fromEntries(form.entries()))
    });
    setMessage("policyMessage", "Policy saved successfully.", "success");
    clearPolicyForm();
    await loadPolicies();
  } catch (error) {
    setMessage("policyMessage", error.message, "error");
  }
});

loadStatus();
loadServices();
loadPolicies();
