/* =============================================================
   index.js — Landing-page letter grid
   =============================================================
   Fetches data/letters.json, renders a card per letter in the
   grid, wires each card to navigate to letter.html?n=N.
   ============================================================= */
(function () {
  "use strict";

  const DATA_URL = "data/letters.json";
  const GRID_ID = "letter-grid";

  function escapeHTML(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map((s) => parseInt(s, 10));
    if (!y || !m || !d) return iso;
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return `${months[m - 1]} ${d}, ${y}`;
  }

  function teaser(body, maxLen = 180) {
    // First paragraph, collapsed whitespace, length-trimmed.
    const first = body.split(/\n{2,}/)[0] || "";
    const collapsed = first.replace(/\s+/g, " ").trim();
    if (collapsed.length <= maxLen) return collapsed;
    return collapsed.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
  }

  function renderCard(letter) {
    const n = letter.id.replace(/^LETTER-/, "");
    const url = `letter.html?n=${parseInt(n, 10)}`;
    return `
      <li>
        <a class="letter-card" href="${url}" aria-label="Read ${escapeHTML(letter.id)} — ${escapeHTML(letter.subject)}, dated ${formatDate(letter.date)}">
          <span class="chip">${escapeHTML(letter.id)}</span>
          <p class="date">${formatDate(letter.date)}</p>
          <p class="teaser">${escapeHTML(teaser(letter.body))}</p>
          <span class="read">Read →</span>
        </a>
      </li>
    `;
  }

  async function init() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;

    let letters;
    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      letters = await res.json();
    } catch (err) {
      grid.innerHTML = `<li style="grid-column:1/-1;text-align:center;color:#b00020;">Failed to load letters: ${escapeHTML(err.message)}</li>`;
      return;
    }

    if (!Array.isArray(letters) || letters.length === 0) {
      grid.innerHTML = `<li style="grid-column:1/-1;text-align:center;color:#b00020;">No letters found.</li>`;
      return;
    }

    letters.sort((a, b) => a.id.localeCompare(b.id));
    grid.innerHTML = letters.map(renderCard).join("\n");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
