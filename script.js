const themeToggle = document.querySelector(".theme-toggle");
const pageBackgroundImage = document.querySelector("#page-background-image");
const routeSections = document.querySelectorAll(".route-section");
const floatingDock = document.querySelector(".floating-dock");
const dockItems = [...document.querySelectorAll(".dock-item")];
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");
const brandNav = document.querySelector(".brand-nav");
const nestedRoutes = {
  "ai-projects": "works", "full-stack-projects": "works", "open-source": "works",
  "research-projects": "works", "case-studies": "works", "ai-tools": "tools",
  productivity: "tools", "dev-toolkit": "tools", "learning-resources": "tools",
  implementations: "blog", "paper-discussions": "blog", "podcast-notes": "blog",
  "engineering-notes": "blog", "ai-experiments": "blog",
};

function loadRoute() {
  const route = window.location.hash.slice(1) || "home";
  const parentRoute = nestedRoutes[route] || route;
  const activeSection = document.getElementById(parentRoute) || document.getElementById("home");

  routeSections.forEach((section) => section.classList.toggle("is-active", section === activeSection));
  if (nestedRoutes[route]) {
    requestAnimationFrame(() => document.getElementById(route)?.scrollIntoView({ block: "center" }));
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

window.addEventListener("hashchange", loadRoute);
loadRoute();

function updatePortraitNavigation() {
  const isPortraitMobile = window.matchMedia("(orientation: portrait) and (max-width: 700px)").matches;
  const header = document.querySelector(".site-header");
  const overflows = siteNav.scrollWidth > header.clientWidth - 80 || siteNav.scrollHeight > 32;
  document.documentElement.classList.toggle("portrait-nav", isPortraitMobile && overflows);
  if (!isPortraitMobile || !overflows) {
    siteNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
}

function closePortraitNavigation() {
  siteNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
}

menuToggle.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", `${isOpen ? "Close" : "Open"} navigation`);
});

siteNav.addEventListener("click", closePortraitNavigation);
document.addEventListener("click", (event) => {
  if (!brandNav.contains(event.target)) closePortraitNavigation();
});

window.addEventListener("resize", updatePortraitNavigation);
updatePortraitNavigation();

function resetDockMagnification() {
  dockItems.forEach((item) => {
    item.style.removeProperty("--dock-scale");
    item.style.removeProperty("--dock-rise");
  });
}

floatingDock.addEventListener("pointermove", (event) => {
  const dockBounds = floatingDock.getBoundingClientRect();
  const pointerX = event.clientX - dockBounds.left;
  const influenceRadius = 120;

  dockItems.forEach((item) => {
    const centerX = item.offsetLeft + item.offsetWidth / 2;
    const distance = Math.abs(pointerX - centerX);
    const influence = Math.exp(-((distance / influenceRadius) ** 2));
    const scale = 1 + (0.5 * influence);
    item.style.setProperty("--dock-scale", scale.toFixed(3));
    item.style.setProperty("--dock-rise", (7 * influence).toFixed(2));
  });
});

floatingDock.addEventListener("pointerleave", resetDockMagnification);

const certificationGrid = document.querySelector("#certification-grid");

function renderCertifications(certifications) {
  certificationGrid.innerHTML = certifications.map((certificate) => `
    <article class="certification-card">
      <p class="eyebrow">AI credential</p>
      <h3>${certificate.title}</h3>
      <p class="certification-provider">${certificate.provider}</p>
      <ul class="certification-skills">${certificate.skills.map((skill) => `<li>${skill}</li>`).join("")}</ul>
      <div class="certification-meta">
        <span>Credential: ${certificate.credentials}</span>
        <span>Obtained: ${certificate.obtainedOn}</span>
        <span>Expires: ${certificate.expiry}</span>
        ${certificate.url ? `<a class="nav-action-link" href="${certificate.url}" target="_blank" rel="noreferrer">View credential ↗</a>` : ""}
      </div>
    </article>
  `).join("");
}

fetch("cert-data.json")
  .then((response) => {
    if (!response.ok) throw new Error(`Certificate data request failed: ${response.status}`);
    return response.json();
  })
  .then(renderCertifications)
  .catch((error) => {
    certificationGrid.textContent = "Certificate data could not be loaded.";
    console.error(error);
  });

themeToggle.addEventListener("click", () => {
  const isLightMode = document.documentElement.dataset.theme === "light";
  const nextTheme = isLightMode ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  themeToggle.setAttribute("aria-pressed", String(!isLightMode));
  themeToggle.setAttribute("aria-label", `Switch to ${isLightMode ? "light" : "dark"} mode`);
  pageBackgroundImage.src = `assets/ai-architecture-${nextTheme}.jpeg`;
});
