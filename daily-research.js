(function () {
  "use strict";

  const archive = document.getElementById("daily-research-archive");
  const status = document.getElementById("daily-research-status");
  const trackNav = document.getElementById("daily-research-track-nav");
  const dateNav = document.getElementById("daily-research-date-nav");
  const todayButton = document.getElementById("daily-research-today");
  const fallbackTracks = [
    "Medical Imaging and Multimodal Biomedical AI",
    "Trustworthy and Privacy-Preserving AI",
    "AI-Driven Cybersecurity and Secure Healthcare Systems",
    "Post-Quantum Cryptography and Embedded Systems Security",
    "Retinal AI and Computational Ophthalmology"
  ];
  let latestDate = "";

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function slug(value) {
    return String(value || "track")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "track";
  }

  function formatDate(value) {
    if (!value) return "Date not available";
    const date = new Date(value + "T00:00:00");
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(date);
  }

  function formatAuthors(authors) {
    if (!Array.isArray(authors) || !authors.length) return "Authors not listed";
    const names = authors.map(function (author) { return typeof author === "string" ? author : author.name; }).filter(Boolean);
    return names.length <= 4 ? names.join(", ") : names.slice(0, 4).join(", ") + ", et al.";
  }

  function detail(label, value) {
    return value ? "<div class=\"daily-paper-detail\"><span>" + escapeHtml(label) + "</span><p>" + escapeHtml(value) + "</p></div>" : "";
  }

  function paperCard(paper) {
    const link = paper.url || (paper.doi ? "https://doi.org/" + encodeURIComponent(paper.doi) : "#");
    const linkMarkup = link === "#" ? "" : "<a class=\"text-link\" href=\"" + escapeHtml(link) + "\" target=\"_blank\" rel=\"noreferrer\">Open paper <span aria-hidden=\"true\">↗</span></a>";
    return "<details class=\"daily-paper-card\"><summary class=\"daily-paper-card-summary\"><div class=\"daily-paper-meta\"><span>" + escapeHtml(paper.venue || "Selected venue") + "</span><span>" + escapeHtml(paper.publishedDate || "New") + "</span></div><h4>" + escapeHtml(paper.title || "Untitled paper") + "</h4><p class=\"daily-paper-authors\">" + escapeHtml(formatAuthors(paper.authors)) + "</p><div class=\"daily-paper-card-trigger\"><span>Read summary</span><span aria-hidden=\"true\">+</span></div></summary><div class=\"daily-paper-card-body\"><div class=\"daily-paper-details\">" + detail("Summary", paper.summary) + detail("Key contribution", paper.contribution) + detail("Methods", paper.methods) + detail("BASMIR relevance", paper.relevance) + detail("Limitations", paper.limitations) + "</div><div class=\"daily-paper-footer\"><span class=\"daily-paper-badge\">AI-generated summary</span>" + linkMarkup + "</div></div></details>";
  }

  function trackSection(track, papers, date) {
    const name = track.name || track;
    const visible = Array.isArray(papers) ? papers : [];
    const empty = "<div class=\"daily-paper-empty\">No genuinely new papers were indexed for this track on this date. Older editions remain below.</div>";
    const trackKey = slug(track.id || name);
    const sectionId = "track-" + trackKey + "-" + date;
    const headingId = sectionId + "-heading";
    return "<section class=\"daily-track\" id=\"" + sectionId + "\" data-track-key=\"" + trackKey + "\" aria-labelledby=\"" + headingId + "\"><details class=\"daily-track-details\" open><summary class=\"daily-track-summary\"><div class=\"daily-track-heading\"><p class=\"eyebrow\">Research track</p><h3 id=\"" + headingId + "\">" + escapeHtml(name) + "</h3><span>" + visible.length + " of 2 new papers</span></div></summary><div class=\"daily-paper-grid\">" + (visible.length ? visible.map(paperCard).join("") : empty) + "</div></details></section>";
  }

  function setActiveLink(selector, attribute, value) {
    document.querySelectorAll(selector).forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute(attribute) === value);
    });
  }

  function scrollToTarget(targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;
    const details = target.querySelector("details");
    if (details) details.open = true;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", "#" + targetId);
  }

  function buildNavigation(tracks, days) {
    latestDate = days.length ? days[0].date : "";
    if (!trackNav || !dateNav) return;
    trackNav.innerHTML = tracks.map(function (track) {
      const name = track.name || track;
      const trackKey = slug(track.id || name);
      const targetId = latestDate ? "track-" + trackKey + "-" + latestDate : "";
      return "<a class=\"daily-toc-link\" href=\"#" + targetId + "\" data-track-target=\"" + trackKey + "\"><span>" + escapeHtml(name) + "</span><span aria-hidden=\"true\">↗</span></a>";
    }).join("");
    dateNav.innerHTML = days.map(function (day) {
      const count = Array.isArray(day.papers) ? day.papers.length : 0;
      return "<a class=\"daily-toc-date-link\" href=\"#day-" + escapeHtml(day.date) + "\" data-date-target=\"" + escapeHtml(day.date) + "\"><span>" + escapeHtml(formatDate(day.date)) + "</span><span>" + count + "</span></a>";
    }).join("");
    if (todayButton) todayButton.disabled = !latestDate;
  }

  function bindNavigation() {
    if (trackNav) {
      trackNav.addEventListener("click", function (event) {
        const link = event.target.closest("a[data-track-target]");
        if (!link) return;
        event.preventDefault();
        setActiveLink(".daily-toc-link", "data-track-target", link.getAttribute("data-track-target"));
        scrollToTarget(link.getAttribute("href").slice(1));
      });
    }
    if (dateNav) {
      dateNav.addEventListener("click", function (event) {
        const link = event.target.closest("a[data-date-target]");
        if (!link) return;
        event.preventDefault();
        setActiveLink(".daily-toc-date-link", "data-date-target", link.getAttribute("data-date-target"));
        scrollToTarget(link.getAttribute("href").slice(1));
      });
    }
    if (todayButton) {
      todayButton.addEventListener("click", function () {
        if (!latestDate) return;
        setActiveLink(".daily-toc-date-link", "data-date-target", latestDate);
        scrollToTarget("day-" + latestDate);
      });
    }
  }

  function bindScrollTracking() {
    if (!window.IntersectionObserver) return;
    const trackObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActiveLink(".daily-toc-link", "data-track-target", entry.target.getAttribute("data-track-key"));
      });
    }, { rootMargin: "-112px 0px -62% 0px", threshold: 0 });
    document.querySelectorAll(".daily-track").forEach(function (section) { trackObserver.observe(section); });
    const dateObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActiveLink(".daily-toc-date-link", "data-date-target", entry.target.id.replace("day-", ""));
      });
    }, { rootMargin: "-112px 0px -70% 0px", threshold: 0 });
    document.querySelectorAll(".daily-day").forEach(function (section) { dateObserver.observe(section); });
  }

  function render(data) {
    const tracks = Array.isArray(data.tracks) && data.tracks.length ? data.tracks : fallbackTracks.map(function (name, index) { return { id: "track-" + (index + 1), name: name }; });
    const days = Array.isArray(data.days) ? data.days.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); }) : [];
    buildNavigation(tracks, days);
    if (!days.length) {
      status.textContent = "The first daily edition will appear after the scheduled updater runs.";
      archive.innerHTML = "<div class=\"daily-empty-state\"><p class=\"eyebrow\">Archive ready</p><h3>No editions yet.</h3><p>The page is connected to the daily archive. It will show only new papers found after the first successful scheduled run.</p></div>";
      return;
    }
    const total = days.reduce(function (count, day) { return count + (Array.isArray(day.papers) ? day.papers.length : 0); }, 0);
    status.textContent = total + " archived paper" + (total === 1 ? "" : "s") + " · Updated " + (data.updatedAt ? new Date(data.updatedAt).toLocaleString() : "recently");
    archive.innerHTML = days.map(function (day) {
      const papers = Array.isArray(day.papers) ? day.papers : [];
      const groups = tracks.map(function (track) { return trackSection(track, papers.filter(function (paper) { return paper.trackId === track.id; }), day.date); }).join("");
      return "<section class=\"daily-day\" id=\"day-" + escapeHtml(day.date) + "\" aria-labelledby=\"day-heading-" + escapeHtml(day.date) + "\"><div class=\"daily-day-heading\"><div><p class=\"eyebrow\">Daily edition</p><h3 id=\"day-heading-" + escapeHtml(day.date) + "\">" + escapeHtml(formatDate(day.date)) + "</h3></div><span>" + papers.length + " new paper" + (papers.length === 1 ? "" : "s") + "</span></div>" + groups + "</section>";
    }).join("");
    bindNavigation();
    bindScrollTracking();
    if (latestDate) setActiveLink(".daily-toc-date-link", "data-date-target", latestDate);
  }

  fetch("/data/daily-papers.json?v=" + Date.now(), { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) throw new Error("Archive request failed (" + response.status + ")");
      return response.json();
    })
    .then(render)
    .catch(function (error) {
      status.textContent = "The archive could not be loaded.";
      archive.innerHTML = "<div class=\"daily-empty-state\"><p class=\"eyebrow\">Temporary issue</p><h3>Please try again later.</h3><p>" + escapeHtml(error.message) + "</p></div>";
    });
}());
