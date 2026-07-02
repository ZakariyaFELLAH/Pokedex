// ===== CONFIG =====
const API_URL = window.ENV_API_URL || "http://localhost:8081";


// ===== SONS =====
const soundBg   = new Audio("/static/sound/background.mp3");
const soundCard = new Audio("/static/sound/card.mp3");
const soundNew  = new Audio("/static/sound/new.mp3");

soundBg.loop     = true;
soundBg.volume   = 0.4;
soundCard.volume = 0.85;
soundNew.volume  = 0.9;

let bgMuted = false;

function playBg() {
  soundBg.play().catch(() => {});
}

function toggleBg() {
  bgMuted = !bgMuted;
  soundBg.muted = bgMuted;
  const btn     = document.getElementById("btn-music");
  const iconOn  = document.getElementById("icon-sound-on");
  const iconOff = document.getElementById("icon-sound-off");
  if (bgMuted) {
    btn.classList.add("muted");
    iconOn.style.display  = "none";
    iconOff.style.display = "block";
  } else {
    btn.classList.remove("muted");
    iconOn.style.display  = "block";
    iconOff.style.display = "none";
  }
}

// Démarre la musique au 1er clic utilisateur (requis par les navigateurs)
document.addEventListener("click", () => { if (soundBg.paused) playBg(); }, { once: true });

// ===== CONSTANTES =====
const TYPE_COLORS = {
  fire:     "#ff6b35", water:    "#4a90e2", grass:   "#5cb85c",
  electric: "#f5c518", psychic:  "#e91e8c", ice:     "#74d7d7",
  dragon:   "#7038f8", dark:     "#5a4a6b", fairy:   "#f4a7c3",
  normal:   "#9a9a9a", fighting: "#c03028", flying:  "#89aadd",
  poison:   "#a040a0", ground:   "#e0c068", rock:    "#b8a038",
  bug:      "#a8b820", ghost:    "#705898", steel:   "#b8b8d0",
};

const STAT_LABELS = {
  hp:               "HP",
  attack:           "Attaque",
  defense:          "Défense",
  attack_special:   "Att. Spé",
  defense_special:  "Déf. Spé",
  speed:            "Vitesse",
};

// ===== STATE =====
let allPokemons  = [];
let activeFilter = "all";
let searchQuery  = "";

// ===== DOM =====
const grid        = document.getElementById("pokemon-grid");
const searchInput = document.getElementById("search");
const counter     = document.getElementById("counter");
const filtersInner = document.querySelector(".filters-inner");

// Modal détail
const detailOverlay = document.getElementById("modal-overlay");
const detailContent = document.getElementById("modal-content");
const detailClose   = document.getElementById("modal-close");

// Modal ajout
const addOverlay = document.getElementById("add-overlay");
const addClose   = document.getElementById("add-close");
const btnAdd     = document.getElementById("btn-add");
const addForm    = document.getElementById("add-form");
const formMsg    = document.getElementById("form-msg");

// ===== FETCH =====
async function fetchPokemons() {
  try {
    const res = await fetch(`${API_URL}/pokemons`);
    if (!res.ok) throw new Error("Erreur réseau");
    allPokemons = await res.json();
    buildFilters();
    renderCards();
  } catch (err) {
    grid.innerHTML = `<div class="no-results">⚠️ Impossible de charger les Pokémon.<br><small>${err.message}</small></div>`;
    counter.textContent = "";
  }
}

// ===== FILTRES =====
function buildFilters() {
  document.querySelectorAll(".filter-btn:not([data-type='all'])").forEach(b => b.remove());

  const typesSet = new Set();
  allPokemons.forEach(p => parseTypes(p.types).forEach(t => typesSet.add(t.toLowerCase())));

  typesSet.forEach(type => {
    const btn = document.createElement("button");
    btn.className    = "filter-btn";
    btn.dataset.type = type;
    btn.textContent  = type;
    btn.addEventListener("click", () => setFilter(type));
    filtersInner.appendChild(btn);
  });
}

function setFilter(type) {
  activeFilter = type;
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.type === type);
  });
  renderCards();
}

// ===== RENDU =====
function renderCards() {
  const query = searchQuery.toLowerCase().trim();

  const filtered = allPokemons.filter(p => {
    const types       = parseTypes(p.types);
    const matchType   = activeFilter === "all" || types.some(t => t.toLowerCase() === activeFilter);
    const matchSearch = !query || p.name.toLowerCase().includes(query) || String(p.id).includes(query);
    return matchType && matchSearch;
  });

  counter.textContent = `${filtered.length} Pokémon trouvé${filtered.length > 1 ? "s" : ""}`;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="no-results">Aucun Pokémon trouvé 😕</div>`;
    return;
  }

  grid.innerHTML = "";
  filtered.forEach((pokemon, index) => grid.appendChild(createCard(pokemon, index)));
}

// ===== CARTE =====
function createCard(pokemon, index) {
  const types     = parseTypes(pokemon.types);
  const mainColor = TYPE_COLORS[types[0]?.toLowerCase()] || "#6c63ff";

  const card = document.createElement("div");
  card.className = "pokemon-card";
  card.style.animationDelay = `${Math.min(index * 40, 500)}ms`;
  card.style.setProperty("--card-glow", mainColor + "55");

  card.innerHTML = `
    <span class="pokemon-number">#${String(pokemon.id).padStart(3, "0")}</span>
    <div class="pokemon-image-wrapper">
      ${pokemon.image_url
        ? `<img class="pokemon-image" src="${pokemon.image_url}" alt="${pokemon.name}" loading="lazy" />`
        : `<div class="pokemon-image-placeholder">❓</div>`}
    </div>
    <span class="pokemon-name">${pokemon.name}</span>
    <div class="pokemon-types">
      ${types.map(t => `<span class="type-badge" style="background:${TYPE_COLORS[t.toLowerCase()] || "#888"}">${t}</span>`).join("")}
    </div>
  `;

  card.addEventListener("click", () => {
    soundCard.currentTime = 0;
    soundCard.play().catch(() => {});
    openDetail(pokemon);
  });

  return card;
}

// ===== MODAL DÉTAIL =====
function openDetail(pokemon) {
  const types     = parseTypes(pokemon.types);
  const mainColor = TYPE_COLORS[types[0]?.toLowerCase()] || "#6c63ff";

  const stats = ["hp", "attack", "defense", "attack_special", "defense_special", "speed"]
    .map(k => ({ key: k, value: pokemon[k] }));

  detailContent.innerHTML = `
    <div class="modal-header">
      ${pokemon.image_url
        ? `<img class="modal-image" src="${pokemon.image_url}" alt="${pokemon.name}" />`
        : `<div class="pokemon-image-placeholder" style="font-size:4rem">❓</div>`}
      <span class="modal-number">#${String(pokemon.id).padStart(3, "0")}</span>
      <h2 class="modal-name">${pokemon.name}</h2>
      <div class="modal-types">
        ${types.map(t => `<span class="type-badge" style="background:${TYPE_COLORS[t.toLowerCase()] || "#888"}">${t}</span>`).join("")}
      </div>
    </div>
    <div class="modal-stats">
      <div class="stat-row">
        <span class="stat-label">TOTAL</span>
        <span class="stat-value">${pokemon.total}</span>
        <div class="stat-bar-track">
          <div class="stat-bar-fill" data-width="${Math.min(pokemon.total / 720 * 100, 100)}" style="width:0;background:${mainColor}"></div>
        </div>
      </div>
      ${stats.map(({ key, value }) => `
        <div class="stat-row">
          <span class="stat-label">${STAT_LABELS[key]}</span>
          <span class="stat-value">${value}</span>
          <div class="stat-bar-track">
            <div class="stat-bar-fill" data-width="${Math.min(value / 255 * 100, 100)}" style="width:0;background:${mainColor}"></div>
          </div>
        </div>
      `).join("")}
      ${pokemon.evolution_id ? `
        <div class="stat-row" style="margin-top:0.4rem">
          <span class="stat-label">Évolution</span>
          <span class="stat-value" style="width:auto;color:var(--text-secondary);font-size:0.78rem">#${String(pokemon.evolution_id).padStart(3, "0")}</span>
          <div class="stat-bar-track"></div>
        </div>` : ""}
    </div>
  `;

  detailOverlay.classList.add("open");
  document.body.style.overflow = "hidden";

  setTimeout(() => {
    detailContent.querySelectorAll(".stat-bar-fill").forEach(bar => {
      bar.style.width = bar.dataset.width + "%";
    });
  }, 80);
}

function closeDetail() {
  detailOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

// ===== MODAL AJOUT =====
function openAdd() {
  addForm.reset();
  formMsg.textContent = "";
  formMsg.className   = "form-msg";

  const preview = document.getElementById("img-preview");
  const label   = document.getElementById("upload-label");
  const zone    = document.getElementById("upload-zone");
  if (preview) { preview.src = ""; preview.style.display = "none"; }
  if (label)   { label.textContent = "Glisser ou cliquer pour choisir un PNG"; }
  if (zone)    { zone.classList.remove("has-file"); }

  addOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeAdd() {
  addOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

// ===== PREVIEW IMAGE =====
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("image_file");
  const preview   = document.getElementById("img-preview");
  const label     = document.getElementById("upload-label");
  const zone      = document.getElementById("upload-zone");

  function applyFile(file) {
    if (!file) return;
    preview.src            = URL.createObjectURL(file);
    preview.style.display  = "block";
    label.textContent      = file.name;
    zone.classList.add("has-file");
  }

  if (fileInput) {
    fileInput.addEventListener("change", () => applyFile(fileInput.files[0]));
  }

  if (zone) {
    zone.addEventListener("dragover",  e => { e.preventDefault(); zone.style.borderColor = "var(--accent)"; });
    zone.addEventListener("dragleave", () => { zone.style.borderColor = ""; });
    zone.addEventListener("drop", e => {
      e.preventDefault();
      zone.style.borderColor = "";
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith(".png")) {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
        applyFile(file);
      }
    });
  }

  const slider = document.getElementById("volume-slider");
  if (slider) {
    slider.addEventListener("input", () => { soundBg.volume = parseFloat(slider.value); });
  }
});

// ===== SUBMIT FORMULAIRE =====
addForm.addEventListener("submit", async e => {
  e.preventDefault();

  const btn = addForm.querySelector(".btn-submit");
  btn.disabled    = true;
  btn.textContent = "Envoi...";
  formMsg.textContent = "";

  // Validation types
  const types = [...addForm.querySelectorAll('input[name="type"]:checked')].map(c => c.value);
  if (types.length === 0) {
    formMsg.textContent = "Sélectionne au moins un type.";
    formMsg.className   = "form-msg error";
    btn.disabled    = false;
    btn.textContent = "Ajouter le Pokémon";
    return;
  }

  // Validation image
  const fileInput = document.getElementById("image_file");
  if (fileInput.files.length === 0) {
    formMsg.textContent = "Sélectionne une image PNG.";
    formMsg.className   = "form-msg error";
    btn.disabled    = false;
    btn.textContent = "Ajouter le Pokémon";
    return;
  }

  try {
    const pokemonData = {
      id:               parseInt(addForm.id_pokemon.value),
      name:             addForm.poke_name.value.trim(),
      types,
      total:            parseInt(addForm.total.value),
      hp:               parseInt(addForm.hp.value),
      attack:           parseInt(addForm.attack.value),
      defense:          parseInt(addForm.defense.value),
      attack_special:   parseInt(addForm.attack_special.value),
      defense_special:  parseInt(addForm.defense_special.value),
      speed:            parseInt(addForm.speed.value),
      evolution_id:     addForm.evolution_id.value ? parseInt(addForm.evolution_id.value) : null,
    };

    // Un seul appel multipart/form-data
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("data", JSON.stringify(pokemonData));

    const res = await fetch(`${API_URL}/pokemons`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Erreur serveur");
    }

    soundNew.currentTime = 0;
    soundNew.play().catch(() => {});

    formMsg.textContent = "✅ Pokémon ajouté avec succès !";
    formMsg.className   = "form-msg success";
    addForm.reset();

    const preview = document.getElementById("img-preview");
    const zone    = document.getElementById("upload-zone");
    const label   = document.getElementById("upload-label");
    if (preview) { preview.src = ""; preview.style.display = "none"; }
    if (zone)    { zone.classList.remove("has-file"); }
    if (label)   { label.textContent = "Glisser ou cliquer pour choisir un PNG"; }

    await fetchPokemons();

  } catch (err) {
    formMsg.textContent = "❌ " + err.message;
    formMsg.className   = "form-msg error";
  } finally {
    btn.disabled    = false;
    btn.textContent = "Ajouter le Pokémon";
  }
});

// ===== ÉVÉNEMENTS =====
detailClose.addEventListener("click", closeDetail);
detailOverlay.addEventListener("click", e => { if (e.target === detailOverlay) closeDetail(); });

addClose.addEventListener("click", closeAdd);
addOverlay.addEventListener("click", e => { if (e.target === addOverlay) closeAdd(); });

btnAdd.addEventListener("click", openAdd);

document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeDetail(); closeAdd(); }
});

searchInput.addEventListener("input", e => {
  searchQuery = e.target.value;
  renderCards();
});

document.querySelector(".filter-btn[data-type='all']").addEventListener("click", () => setFilter("all"));

// ===== UTILS =====
function parseTypes(types) {
  if (Array.isArray(types)) return types;
  try { return JSON.parse(types); } catch { return [types]; }
}

// ===== INIT =====
fetchPokemons();