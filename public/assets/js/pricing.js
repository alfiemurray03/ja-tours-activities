const fallbackServices = [
  {
    slug: "destination-research-pack",
    name: "Destination Research Pack",
    description: "A practical introduction to your chosen destination, including areas, arrival notes, local transport and activity ideas.",
    price_pence: 4900,
    delivery: "Estimated delivery: 3–5 working days",
    features: ["Destination and area overview", "Arrival and local transport notes", "Activity and practical planning ideas"]
  },
  {
    slug: "mini-itinerary",
    name: "Mini Itinerary",
    description: "A clear one-to-three-day itinerary outline with a sensible route, suggested activities and practical travel notes.",
    price_pence: 5900,
    delivery: "Estimated delivery: 3–5 working days",
    features: ["Morning, afternoon and evening ideas", "Suggested route and daily flow", "Local transport considerations"]
  },
  {
    slug: "full-trip-planning-pack",
    name: "Full Trip Planning Pack",
    description: "Our most complete service, bringing destination research, area guidance, activities and an itinerary outline together.",
    price_pence: 14900,
    delivery: "Estimated delivery: 5–10 working days",
    features: ["Destination and area research", "Activity shortlist and transport notes", "Itinerary outline and pre-travel checklist"],
    featured: true
  },
  {
    slug: "activity-shortlist",
    name: "Activity Shortlist",
    description: "A curated shortlist of attractions, experiences and things to do based on your destination and interests.",
    price_pence: 3900,
    delivery: "Estimated delivery: 2–4 working days",
    features: ["Ideas grouped around your interests", "Location and suitability notes", "Selected third-party provider links"]
  },
  {
    slug: "accommodation-area-guide",
    name: "Accommodation Area Guide",
    description: "A comparison of suitable neighbourhoods or areas to help you choose where to make your own accommodation booking.",
    price_pence: 4900,
    delivery: "Estimated delivery: 3–5 working days",
    features: ["Area character and comparison", "Transport and location considerations", "Guidance based on your preferences"]
  }
];

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[character]);
}

function renderServices(services) {
  const grid = document.querySelector("#pricingGrid");
  grid.innerHTML = services.map(service => {
    const features = Array.isArray(service.features) ? service.features : JSON.parse(service.features_json || "[]");
    const price = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0 }).format(service.price_pence / 100);
    return `
      <article class="price-card${service.featured ? " featured" : ""}">
        <span class="tag">Coming soon</span>
        <h2>${escapeHtml(service.name)}</h2>
        <p>${escapeHtml(service.description)}</p>
        <div class="price">${price} <small>proposed price</small></div>
        <ul class="feature-list">
          ${features.map(feature => `<li>${escapeHtml(feature)}</li>`).join("")}
          <li>${escapeHtml(service.delivery)}</li>
          <li>One minor revision included</li>
        </ul>
        <span class="button" aria-disabled="true">Coming soon</span>
      </article>`;
  }).join("");
}

renderServices(fallbackServices);
