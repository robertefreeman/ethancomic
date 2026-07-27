/* =============================================================
   viewer.js — Single-letter viewer for letter.html
   =============================================================
   Reads ?n=NN from the URL, fetches data/letters.json, renders
   the matching letter (chip + date + body + comic), wires up
   prev/next navigation + keyboard arrows + URL sync, and
   preloads the next letter's comic on idle.
   ============================================================= */
(function () {
  "use strict";

  const DATA_URL = "data/letters.json";
  const N_PARAM = "n";

  // ----- State --------------------------------------------------------
  let letters = [];
  let currentIndex = -1;
  let article, positionEl, prevBtn, nextBtn;

  // ----- Helpers ------------------------------------------------------

  function parseLetterId(id) {
    // "LETTER-007" → 7
    const m = /^LETTER-(\d{3})$/.exec(id);
    return m ? parseInt(m[1], 10) : NaN;
  }

  function getQueryNumber() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get(N_PARAM);
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  }

  function setQueryNumber(n, replace = true) {
    const url = new URL(window.location.href);
    if (n == null) {
      url.searchParams.delete(N_PARAM);
    } else {
      url.searchParams.set(N_PARAM, String(n));
    }
    const method = replace ? "replaceState" : "pushState";
    window.history[method](null, "", url.toString());
  }

  function formatDate(iso) {
    if (!iso) return "";
    // ISO YYYY-MM-DD → "June 14, 2025"
    const [y, m, d] = iso.split("-").map((s) => parseInt(s, 10));
    if (!y || !m || !d) return iso;
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return `${months[m - 1]} ${d}, ${y}`;
  }

  function escapeHTML(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function bodyToParagraphs(body) {
    // Split on blank lines, render each non-empty chunk as a <p>.
    return body
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${escapeHTML(p).replace(/\n/g, "<br>")}</p>`)
      .join("\n");
  }

  function comicPath(letterId, ext) {
    // letter.html lives at docs/, comics live at docs/assets/img/
    return `assets/img/${letterId}-comic.${ext}`;
  }

  function preloadNextLetter(currentIdx) {
    if (currentIdx < 0 || currentIdx >= letters.length - 1) return;
    const next = letters[currentIdx + 1];
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = comicPath(next.id, "webp");
    link.type = "image/webp";
    document.head.appendChild(link);
  }

  // ----- Render -------------------------------------------------------

  function renderLetter(idx) {
    if (idx < 0 || idx >= letters.length) {
      article.innerHTML = `<p style="text-align:center;color:var(--ink-soft);">Letter not found.</p>`;
      positionEl.textContent = "— of —";
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }

    const letter = letters[idx];
    const n = parseLetterId(letter.id);

    document.title = `${letter.id} · Ethan's Mission`;

    // Build comic <picture> with WebP source + PNG fallback
    const pngURL = comicPath(letter.id, "png");
    const webpURL = comicPath(letter.id, "webp");

    article.innerHTML = `
      <header class="letter-header">
        <span class="chip">${escapeHTML(letter.id)}</span>
        <p class="date"><time datetime="${escapeHTML(letter.date)}">${formatDate(letter.date)}</time></p>
        <hr class="rule">
      </header>
      <section class="letter-body" aria-label="Letter body">
        ${bodyToParagraphs(letter.body)}
      </section>
      <figure class="comic" aria-label="Comic illustration for ${escapeHTML(letter.id)}">
        <picture>
          <source srcset="${webpURL}" type="image/webp">
          <img src="${pngURL}"
               alt="Comic illustration for ${escapeHTML(letter.id)} — ${escapeHTML(letter.subject)}"
               loading="lazy" decoding="async" width="1254" height="1254">
        </picture>
        <figcaption>${escapeHTML(letter.id)} — ${escapeHTML(letter.subject)}</figcaption>
      </figure>
    `;

    positionEl.textContent = `Letter ${n} of ${letters.length}`;
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === letters.length - 1;
    prevBtn.setAttribute("aria-disabled", String(idx === 0));
    nextBtn.setAttribute("aria-disabled", String(idx === letters.length - 1));

    // Move keyboard focus to article for screen-reader users
    article.setAttribute("tabindex", "-1");
    article.focus({ preventScroll: false });

    // Preload next comic on idle
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => preloadNextLetter(idx));
    } else {
      setTimeout(() => preloadNextLetter(idx), 100);
    }
  }

  function navigate(delta) {
    const next = currentIndex + delta;
    if (next < 0 || next >= letters.length) return;
    currentIndex = next;
    const n = parseLetterId(letters[currentIndex].id);
    setQueryNumber(n, true);
    renderLetter(currentIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ----- Init ---------------------------------------------------------

  async function init() {
    article = document.getElementById("letter-article");
    positionEl = document.getElementById("position");
    prevBtn = document.getElementById("prev-btn");
    nextBtn = document.getElementById("next-btn");

    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      letters = await res.json();
    } catch (err) {
      article.innerHTML = `<p style="text-align:center;color:#b00020;">Failed to load letters: ${escapeHTML(err.message)}</p>`;
      return;
    }

    if (!Array.isArray(letters) || letters.length === 0) {
      article.innerHTML = `<p style="text-align:center;color:#b00020;">No letters found.</p>`;
      return;
    }

    // Sort by ID (already sorted on disk, but defensive)
    letters.sort((a, b) => a.id.localeCompare(b.id));

    // Resolve starting letter from ?n= param, default to 1
    let startIdx = 0;
    const qn = getQueryNumber();
    if (qn != null) {
      const found = letters.findIndex((l) => parseLetterId(l.id) === qn);
      if (found >= 0) startIdx = found;
    }
    currentIndex = startIdx;
    renderLetter(currentIndex);

    prevBtn.addEventListener("click", () => navigate(-1));
    nextBtn.addEventListener("click", () => navigate(1));

    document.addEventListener("keydown", (e) => {
      // Ignore when focus is in an input/textarea (none in this view, but defensive)
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigate(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigate(1);
      }
    });

    // Swipe support for touch devices
    let touchStartX = null;
    article.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    article.addEventListener("touchend", (e) => {
      if (touchStartX == null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 60) navigate(dx < 0 ? 1 : -1);
      touchStartX = null;
    }, { passive: true });

    // Handle browser back/forward
    window.addEventListener("popstate", () => {
      const qn = getQueryNumber();
      if (qn == null) return;
      const idx = letters.findIndex((l) => parseLetterId(l.id) === qn);
      if (idx >= 0 && idx !== currentIndex) {
        currentIndex = idx;
        renderLetter(currentIndex);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
