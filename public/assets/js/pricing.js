const services = [
  {
    name: "Quick Travel Support Call",
    description: "A focused 30-minute phone or video conversation, followed by a short summary email.",
    price: "£35",
    delivery: "Appointment subject to availability",
    features: ["General planning guidance", "Help narrowing your options", "Short summary email"]
  },
  {
    name: "Activity Finder",
    description: "A shortlist of suitable third-party attractions and experiences for one destination.",
    price: "£45",
    delivery: "2–4 working days",
    features: ["5–10 researched ideas", "Suitability notes", "Provider links where available"]
  },
  {
    name: "Check Before You Book",
    description: "A practical review of travel options or links you have already found.",
    price: "£49",
    delivery: "3–5 working days",
    features: ["Key public terms summarised", "Information gaps highlighted", "Questions to ask providers"]
  },
  {
    name: "Destination Finder",
    description: "A shortlist for customers who need help deciding where to go.",
    price: "£59",
    delivery: "3–5 working days",
    features: ["3–5 destination ideas", "Practical pros and considerations", "Official advice links where relevant"]
  },
  {
    name: "Accommodation Area Guide",
    description: "Compare neighbourhoods or areas before making your own accommodation booking.",
    price: "£69",
    delivery: "3–5 working days",
    features: ["3–5 areas compared", "Transport and atmosphere notes", "Points to check before booking"]
  },
  {
    name: "Mini Itinerary",
    description: "A practical one-to-three-day outline with a sensible pace and daily flow.",
    price: "£89",
    delivery: "Around 5 working days",
    features: ["Morning, afternoon and evening ideas", "Transport considerations", "One reasonable revision"]
  },
  {
    name: "Full Planning Pack",
    description: "Our main personalised planning service for one destination and a three-to-seven-day trip.",
    price: "£179",
    delivery: "7–10 working days",
    featured: true,
    features: ["Area and destination guidance", "Itinerary and activity shortlist", "Transport basics and checklist"]
  },
  {
    name: "Accessible Travel Research",
    description: "Focused public-information research for customers with access, mobility or sensory needs.",
    price: "From £149",
    delivery: "Scope confirmed individually",
    features: ["Public access details found", "Venue contacts", "Questions to confirm directly"]
  },
  {
    name: "Complex Planning Pack",
    description: "For multi-destination, group, longer or unusually detailed planning requests.",
    price: "From £249",
    delivery: "Normally 10–15 working days",
    features: ["Individually agreed scope", "Complexity-based pricing", "Written delivery schedule"]
  }
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;"
  })[character]);
}

const grid = document.querySelector("#pricingGrid");
if (grid) {
  grid.innerHTML = services.map(service => `
    <article class="price-card${service.featured ? " featured" : ""}">
      <span class="tag">${service.featured ? "Most complete" : "Planning service"}</span>
      <h2>${escapeHtml(service.name)}</h2>
      <p>${escapeHtml(service.description)}</p>
      <div class="price">${escapeHtml(service.price)} <small>one-off fee</small></div>
      <ul class="feature-list">
        ${service.features.map(feature => `<li>${escapeHtml(feature)}</li>`).join("")}
        <li>${escapeHtml(service.delivery)}</li>
      </ul>
      <a class="button" href="mailto:hello@jagroupservices.co.uk?subject=${encodeURIComponent(service.name)}%20enquiry">Enquire about this service</a>
    </article>
  `).join("");
}
