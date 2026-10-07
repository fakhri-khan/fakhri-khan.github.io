(function () {
  "use strict";

  const archive = document.getElementById("daily-research-archive");
  const status = document.getElementById("daily-research-status");
  const fallbackTracks = [
    "Retinal AI and Computational Ophthalmology",
    "Medical Imaging and Multimodal Biomedical AI",
    "Trustworthy and Privacy-Preserving AI",
    "AI-Driven Cybersecurity and Secure Healthcare Systems",
    "Post-Quantum Cryptography and Embedded Systems Security"
  ];

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(value) {
    if (!value) return "Date not available";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(date);
  }

  function formatAuthors(authors) {
    if (!Array.isArray(authors) || authors.length === 0) return "Authors not listed";
    const names = authors.map((author) => typeof author === "string" ? author : author.name).filter(Boolean);
    if (names.length <= 4) return names.join(", ");
    return `${names.slice(0, 4).join(", ")}, et al.`;
  }

  function detail(label, value) {
    if (!value) return "";
    return `<div class="daily-paper-detail"><span>${escapeHtml(label)}</span><p>${escapeHtml(value)}</p></div>`;
  }

  function paperCard(paper) {
    const link = paper.url || (paper.doi ? `https://doi.org/${encodeURIComponent(paper.doi)}` : "#");
    const linkMarkup = link === "#"
      ? ""
      : `<a class="text-link" href="${escapeHtml(link)}" target="_blank" rel="noreferrer">Open paper <span aria-hidden="true">↗</span></a>`;
    return `<article class="daily-paper-card">
      <div class="daily-paper-meta"><span>${escapeHtml(paper.venue || "Selected venue")}</span><span>${escapeHtml(paper.publishedDate || "New")}</span></div>
      <h4>${escapeHtml(paper.title || "Untitled paper")}</h4>
      <p class="daily-paper-authors">${escapeHtml(formatAuthors(paper.authors))}</p>
      <div class="daily-paper-details">
        ${detail("Summary", paper.summary)}
        ${detail("Key contribution", paper.contribution)}
        ${detail("Methods", paper.methods)}
        ${detail("BASMIR relevance", paper.relevance)}
        ${detail("Limitations", paper.limitations)}
      </div>
      <div class="daily-paper-footer"><span class="daily-paper-badge">AI-generated summary</span>${linkMarkup}</div>
    </article>`;
  }

  function trackSection(track, papers) {
    const name = track.name || track;
    const visiblePapers = Array.isArray(papers) ? papers : [];
    const empty = `<div class="daily-paper-empty">No genuinely new papers were indexed for this track on this date. Older editions remain below.</div>`;
    return `<section class="daily-track" aria-labelledby="track-${escapeHtml(track.id || name).replace(/[^a-z0-9_-]/gi, "-")}">
      <div class="daily-track-heading"><p class="eyebrow">Research track</p><h3 id="track-${escapeHtml(track.id || name).replace(/[^a-z0-9_-]/gi, "-")}">${escapeHtml(name)}</h3><span>${visiblePapers.length} of 2 new papers</span></div>
      <div class="daily-paper-grid">${visiblePapers.length ? visiblePapers.map(paperCard).join("") : empty}</div>
    </section>`;
  }

  function render(data) {
    const tracks = Array.isArray(data.tracks) && data.tracks.length ? data.tracks : fallbackTracks.map((name, index) => ({ id: `track-${index + 1}`, name }));
    const days = Array.isArray(data.days) ? data.days.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))) : [];
    if (!days.length) {
      status.textContent = "The first daily edition will appear after the scheduled updater runs.";
      archive.innerHTML = `<div class="daily-empty-state"><p class="eyebrow">Archive ready</p><h3>No editions yet.</h3><p>The page is connected to the daily archive. It will show only new papers found after the first successful scheduled run.</p></div>`;
      return;
    }
    const totalPapers = days.reduce((count, day) => count + (Array.isArray(day.papers) ? day.papers.length : 0), 0);
    status.textContent = `${totalPapers} archived paper${totalPapers === 1 ? "" : "s"} · Updated ${data.updatedAt ? new Date(data.updatedAt).toLocaleString() : "recently"}`;
    archive.innerHTML = days.map((day) => {
      const papers = Array.isArray(day.papers) ? day.papers : [];
      const groups = tracks.map((track) => trackSection(track, papers.filter((paper) => paper.trackId === track.id)));
      return `<section class="daily-day" aria-labelledby="day-${escapeHtml(day.date)}"><div class="daily-day-heading"><div><p class="eyebrow">Daily edition</p><h3 id="day-${escapeHtml(day.date)}">${escapeHtml(formatDate(day.date))}</h3></div><span>${papers.length} new paper${papers.length === 1 ? "" : "s"}</span></div>${groups.join("")}</section>`;
    }).join("");
  }

  fetch("data/daily-papers.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error(`Archive request failed (${response.status})`);
      return response.json();
    })
    .then(render)
    .catch((error) => {
      status.textContent = "The archive could not be loaded.";
      archive.innerHTML = `<div class="daily-empty-state"><p class="eyebrow">Temporary issue</p><h3>Please try again later.</h3><p>${escapeHtml(error.message)}</p></div>`;
    });
}());
