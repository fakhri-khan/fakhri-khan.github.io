(() => {
  const dataUrl = "/data/flagship-conferences.json";
  const trackFilters = document.querySelector("#conference-track-filters");
  const searchInput = document.querySelector("#conference-search");
  const resultCount = document.querySelector("#conference-result-count");
  const calendarGrid = document.querySelector("#conference-calendar-grid");
  const monthSelect = document.querySelector("#conference-month-select");
  const yearPicker = document.querySelector("#conference-year-select");
  const previousMonthButton = document.querySelector("#conference-previous-month");
  const nextMonthButton = document.querySelector("#conference-next-month");
  const calendarView = document.querySelector("#conference-calendar-view");
  const agendaView = document.querySelector("#conference-agenda-view");
  const agendaList = document.querySelector("#conference-agenda-list");
  const pendingList = document.querySelector("#conference-pending-list");
  const coverageList = document.querySelector("#conference-track-coverage");
  const dialog = document.querySelector("#conference-dialog");
  const today = new Date();
  const todayString = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
  const latestMonth = new Date(today.getFullYear() + 1, 11, 1);
  const firstMonth = new Date(today.getFullYear(), 0, 1);
  Array.from({ length: latestMonth.getFullYear() - today.getFullYear() + 1 }, (_, index) => {
    const year = today.getFullYear() + index;
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    yearPicker.append(option);
  });
  const state = {
    data: null,
    track: "all",
    search: "",
    view: window.matchMedia("(max-width: 680px)").matches ? "agenda" : "calendar",
    month: new Date(today.getFullYear(), today.getMonth(), 1)
  };

  const escText = (value) => String(value == null ? "" : value);
  const dateAtNoon = (value) => new Date(value + "T12:00:00");
  const dateText = (value, options) => new Intl.DateTimeFormat("en", options).format(dateAtNoon(value));
  const formatRange = (item) => {
    if (!item.startDate) {
      return item.nextDateText || (item.yearHint ? "Date to be announced for " + item.yearHint : "Date to be announced");
    }
    const start = dateAtNoon(item.startDate);
    const end = dateAtNoon(item.endDate || item.startDate);
    const startMonth = new Intl.DateTimeFormat("en", { month: "short" }).format(start);
    const endMonth = new Intl.DateTimeFormat("en", { month: "short" }).format(end);
    const year = end.getFullYear();
    if (start.getMonth() === end.getMonth()) {
      return startMonth + " " + start.getDate() + "–" + end.getDate() + ", " + year;
    }
    return startMonth + " " + start.getDate() + "–" + endMonth + " " + end.getDate() + ", " + year;
  };
  const fullDateRange = (item) => {
    if (!item.startDate) return item.nextDateText || "Date to be announced";
    return dateText(item.startDate, { month: "long", day: "numeric", year: "numeric" })
      + (item.startDate === item.endDate ? "" : " to " + dateText(item.endDate, { month: "long", day: "numeric", year: "numeric" }));
  };
  const trackName = (id) => {
    const match = state.data.tracks.find((track) => track.id === id);
    return match ? match.name : id;
  };
  const trackTag = (id) => {
    const tag = document.createElement("span");
    tag.className = "conference-track-tag";
    tag.dataset.track = id;
    const dot = document.createElement("i");
    dot.className = "conference-track-dot";
    const label = document.createElement("span");
    label.textContent = trackName(id);
    tag.append(dot, label);
    return tag;
  };
  const makeEmpty = (text) => {
    const p = document.createElement("p");
    p.className = "conference-empty";
    p.textContent = text;
    return p;
  };
  const filtered = () => {
    const term = state.search.trim().toLocaleLowerCase();
    return state.data.conferences.filter((item) => {
      if (state.track !== "all" && !item.trackIds.includes(state.track)) return false;
      if (term) {
        const haystack = [item.name, item.organizer, item.location, item.rating, item.nextDateText, item.trackIds.map(trackName).join(" ")].join(" ").toLocaleLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  };
  const openDetails = (item) => {
    document.querySelector("#conference-dialog-title").textContent = item.name;
    document.querySelector("#conference-dialog-dates").textContent = fullDateRange(item);
    document.querySelector("#conference-dialog-location").textContent = item.location || "Not listed";
    document.querySelector("#conference-dialog-organizer").textContent = item.organizer || "Not listed";
    document.querySelector("#conference-dialog-rating").textContent = item.rating || "Not listed";
    const trackBox = document.querySelector("#conference-dialog-tracks");
    trackBox.replaceChildren(...item.trackIds.map(trackTag));
    const link = document.querySelector("#conference-dialog-link");
    if (item.officialUrl) {
      link.href = item.officialUrl;
      link.hidden = false;
    } else {
      link.removeAttribute("href");
      link.hidden = true;
    }
    if (typeof dialog.showModal === "function") dialog.showModal();
  };
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const clickedOutsideCard = event.clientX < rect.left || event.clientX > rect.right
      || event.clientY < rect.top || event.clientY > rect.bottom;
    if (clickedOutsideCard) dialog.close();
  });
  const ratingClass = (item) => item.rating === "A*" ? "rating-a-star" : item.rating === "A" ? "rating-a" : "rating-other";
  const eventButton = (item, continuation) => {
    if (continuation) {
      const span = document.createElement("span");
      span.className = "calendar-span " + ratingClass(item);
      span.setAttribute("aria-hidden", "true");
      return span;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-event " + ratingClass(item);
    button.title = item.name + " · " + formatRange(item);
    button.setAttribute("aria-label", item.name + ", " + formatRange(item));
    button.addEventListener("click", () => openDetails(item));
    const label = document.createElement("span");
    label.className = "event-label";
    label.textContent = item.shortName;
    const dots = document.createElement("span");
    dots.className = "calendar-track-dots";
    dots.setAttribute("aria-hidden", "true");
    item.trackIds.forEach((id) => {
      const dot = document.createElement("i");
      dot.dataset.track = id;
      dots.append(dot);
    });
    button.append(label, dots);
    return button;
  };
  const eventCard = (item) => {
    const card = document.createElement("article");
    card.className = "conference-event-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", "Open details for " + item.name);
    card.addEventListener("click", () => openDetails(item));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDetails(item);
      }
    });
    const title = document.createElement("h4");
    title.textContent = item.name;
    const meta = document.createElement("div");
    meta.className = "conference-event-meta";
    const date = document.createElement("span");
    date.textContent = formatRange(item);
    const location = document.createElement("span");
    location.textContent = item.location || "Location to be announced";
    const rating = document.createElement("span");
    rating.className = "conference-rating " + ratingClass(item);
    rating.textContent = item.rating || "Rating not listed";
    meta.append(date, location, rating);
    const tags = document.createElement("div");
    tags.className = "conference-track-tags";
    item.trackIds.forEach((id) => tags.append(trackTag(id)));
    card.append(title, meta, tags);
    return card;
  };
  const buildTrackFilters = () => {
    trackFilters.replaceChildren();
    const all = [["all", "All tracks"], ...state.data.tracks.map((track) => [track.id, track.id + " · " + track.name])];
    all.forEach(([id, name]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "conference-track-node" + (id === "all" ? " is-root" : "");
      button.setAttribute("aria-pressed", String(state.track === id));
      if (id !== "all") button.dataset.track = id;
      const dot = document.createElement("i");
      dot.className = "conference-track-dot" + (id === "all" ? " is-all" : "");
      button.append(dot);
      const label = document.createElement("span");
      label.textContent = name;
      button.append(label);
      button.addEventListener("click", () => {
        state.track = id;
        render();
      });
      trackFilters.append(button);
    });
  };
  const renderCalendar = (items) => {
    const year = state.month.getFullYear();
    const month = state.month.getMonth();
    monthSelect.value = String(month);
    yearPicker.value = String(year);
    previousMonthButton.disabled = state.month <= firstMonth;
    nextMonthButton.disabled = state.month >= latestMonth;
    calendarGrid.replaceChildren();
    calendarGrid.setAttribute("aria-label", "Conference dates for " + new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(state.month));
    const offset = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < offset; i += 1) {
      const blank = document.createElement("div");
      blank.className = "conference-day is-empty";
      blank.setAttribute("role", "presentation");
      calendarGrid.append(blank);
    }
    for (let day = 1; day <= days; day += 1) {
      const cell = document.createElement("div");
      cell.className = "conference-day";
      cell.setAttribute("role", "gridcell");
      const monthString = String(month + 1).padStart(2, "0");
      const dayString = String(day).padStart(2, "0");
      const isoDate = year + "-" + monthString + "-" + dayString;
      const date = document.createElement("div");
      date.className = "conference-day-number";
      const time = document.createElement("time");
      time.dateTime = isoDate;
      time.textContent = String(day);
      date.append(time);
      cell.setAttribute("aria-label", dateText(isoDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" }));
      if (isoDate === todayString) cell.classList.add("is-today");
      cell.append(date);
      const active = items.filter((item) => item.startDate <= isoDate && item.endDate >= isoDate);
      active.forEach((item) => {
        const visibleStart = item.startDate === isoDate || (day === 1 && item.startDate < isoDate);
        cell.append(eventButton(item, !visibleStart));
      });
      calendarGrid.append(cell);
    }
  };
  const renderAgenda = (items) => {
    agendaList.replaceChildren();
    const known = items.filter((item) => item.startDate).sort((a, b) => a.startDate.localeCompare(b.startDate));
    const pending = items.filter((item) => !item.startDate).sort((a, b) => (a.yearHint || 9999) - (b.yearHint || 9999) || a.name.localeCompare(b.name));
    if (!known.length && !pending.length) {
      agendaList.append(makeEmpty("No conferences match these filters."));
      return;
    }
    const groups = new Map();
    known.forEach((item) => {
      const key = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(dateAtNoon(item.startDate));
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    groups.forEach((group, heading) => {
      const section = document.createElement("section");
      section.className = "conference-agenda-group";
      const h = document.createElement("h3");
      h.textContent = heading;
      section.append(h);
      group.forEach((item) => section.append(eventCard(item)));
      agendaList.append(section);
    });
    if (pending.length) {
      const section = document.createElement("section");
      section.className = "conference-agenda-group";
      const h = document.createElement("h3");
      h.textContent = "Dates to be confirmed";
      section.append(h);
      pending.forEach((item) => section.append(eventCard(item)));
      agendaList.append(section);
    }
  };
  const renderCoverage = () => {
    coverageList.replaceChildren();
    state.data.tracks.forEach((track) => {
      const count = state.data.conferences.filter((item) => item.trackIds.includes(track.id)).length;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "conference-coverage-row";
      button.dataset.track = track.id;
      const label = document.createElement("span");
      label.className = "conference-coverage-label";
      const dot = document.createElement("i");
      dot.className = "conference-track-dot";
      const name = document.createElement("span");
      name.textContent = track.name;
      label.append(dot, name);
      const number = document.createElement("strong");
      number.textContent = String(count).padStart(2, "0");
      button.append(label, number);
      button.addEventListener("click", () => {
        state.track = state.track === track.id ? "all" : track.id;
        render();
        document.querySelector("#conference-heading").scrollIntoView({ behavior: "smooth", block: "start" });
      });
      coverageList.append(button);
    });
  };
  const renderPending = (items) => {
    pendingList.replaceChildren();
    const pending = items.filter((item) => !item.startDate).sort((a, b) => (a.yearHint || 9999) - (b.yearHint || 9999) || a.name.localeCompare(b.name));
    if (!pending.length) {
      pendingList.append(makeEmpty("No date-pending conferences match these filters."));
      return;
    }
    pending.forEach((item) => {
      const row = document.createElement("div");
      row.className = "conference-pending-item";
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = item.shortName + " · " + item.name;
      button.addEventListener("click", () => openDetails(item));
      const hint = document.createElement("span");
      hint.textContent = item.yearHint ? "Expected " + item.yearHint : "Date pending";
      row.append(button, hint);
      pendingList.append(row);
    });
  };
  const render = () => {
    if (!state.data) return;
    buildTrackFilters();
    const items = filtered();
    const dated = items.filter((item) => item.startDate);
    const pending = items.filter((item) => !item.startDate);
    resultCount.textContent = items.length + " conferences · " + dated.length + " with dates · " + pending.length + " to confirm";
    renderCalendar(dated);
    renderAgenda(items);
    renderPending(items);
    document.querySelectorAll(".conference-view-switch button").forEach((button) => {
      const selected = button.dataset.view === state.view;
      button.setAttribute("aria-pressed", String(selected));
    });
    calendarView.hidden = state.view !== "calendar";
    agendaView.hidden = state.view !== "agenda";
  };
  searchInput.addEventListener("input", () => { state.search = searchInput.value; render(); });
  monthSelect.addEventListener("change", () => {
    state.month = new Date(state.month.getFullYear(), Number(monthSelect.value), 1);
    render();
  });
  yearPicker.addEventListener("change", () => {
    state.month = new Date(Number(yearPicker.value), state.month.getMonth(), 1);
    render();
  });
  previousMonthButton.addEventListener("click", () => {
    if (state.month > firstMonth) {
      state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1);
      render();
    }
  });
  nextMonthButton.addEventListener("click", () => {
    if (state.month < latestMonth) {
      state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1);
      render();
    }
  });
  document.querySelectorAll(".conference-view-switch button").forEach((button) => {
    button.addEventListener("click", () => { state.view = button.dataset.view; render(); });
  });

  fetch(dataUrl)
    .then((response) => {
      if (!response.ok) throw new Error("Conference data could not be loaded.");
      return response.json();
    })
    .then((data) => {
      state.data = data;
      document.querySelector("#conference-total").textContent = String(data.conferences.length).padStart(2, "0");
      document.querySelector("#conference-track-total").textContent = String(data.tracks.length).padStart(2, "0");
      document.querySelector("#conference-dated-total").textContent = String(data.conferences.filter((item) => item.startDate).length).padStart(2, "0");
      document.querySelector("#conference-pending-total").textContent = String(data.conferences.filter((item) => !item.startDate).length).padStart(2, "0");
      renderCoverage();
      render();
    })
    .catch(() => {
      resultCount.textContent = "Conference list could not be loaded.";
      calendarGrid.replaceChildren(makeEmpty("Reload the page to try again."));
    });
})();
