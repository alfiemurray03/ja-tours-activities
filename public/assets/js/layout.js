document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("#site-header");
  const footer = document.querySelector("#site-footer");

  if (header) {
    header.innerHTML = `
      <div class="concept">
        JA Tours & Experiences is currently being prepared for launch.
      </div>

      <header class="header">
        <div class="wrap nav">
          <a class="brand" href="/">
            <span class="mark">JA</span>
            <span>
              JA Tours & Experiences
              <small>Discover more of the world</small>
            </span>
          </a>

          <button class="menu" id="menu" aria-label="Open menu">☰</button>

          <nav class="links" id="links">
            <a href="/">Home</a>
            <a href="/destinations/">Destinations</a>
            <a href="/activities/">Activities</a>
            <a href="/how-it-works/">How It Works</a>
            <a href="/booking-partners/">Booking Partners</a>
            <a class="cta" href="/contact/">Contact</a>
          </nav>
        </div>
      </header>
    `;
  }

  if (footer) {
    footer.innerHTML = `
      <footer>
        <div class="wrap">
          <div class="footer">
            <div>
              <a class="brand" href="/">
                <span class="mark">JA</span>
                <span>
                  JA Tours & Experiences
                  <small style="color:#ffffff88">A JA Group Services website</small>
                </span>
              </a>

              <p>
                Helping travellers discover memorable activities from trusted booking partners.
              </p>
            </div>

            <div class="col">
              <strong>Website</strong>
              <a href="/">Home</a>
              <a href="/destinations/">Destinations</a>
              <a href="/activities/">Activities</a>
              <a href="/how-it-works/">How It Works</a>
            </div>

            <div class="col">
              <strong>Information</strong>
              <a href="/booking-partners/">Booking Partners</a>
              <a href="/affiliate-disclosure/">Affiliate Disclosure</a>
              <a href="/contact/">Contact Us</a>
            </div>

            <div class="col">
              <strong>Legal</strong>
              <a href="/legal/privacy/">Privacy Notice</a>
              <a href="/legal/cookies/">Cookie Policy</a>
              <a href="/legal/terms/">Terms of Use</a>
            </div>
          </div>

          <div class="bottom">
            © 2026 JA Group Services Ltd. JA Tours & Experiences is currently being prepared for launch.
          </div>
        </div>
      </footer>
    `;
  }

  const menu = document.querySelector("#menu");
  const links = document.querySelector("#links");

  if (menu && links) {
    menu.addEventListener("click", () => {
      links.classList.toggle("open");
    });
  }
});