(() => {
  const dataUrl = "/data/flagship-conferences.json?v=20261017a";
  const worldMapUrl = "/data/world-countries.json?v=20261013a";
  const trackFilters = document.querySelector("#conference-track-filters");
  const searchInput = document.querySelector("#conference-search");
  const ratingButtons = Array.from(document.querySelectorAll(".rating-filter-button"));
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
  const worldMapElement = document.querySelector("#conference-world-map");
  const worldMapStatus = document.querySelector("#conference-map-status");
  const mapPopover = document.querySelector("#conference-map-popover");
  const today = new Date();
  const todayString = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
  let latestMonth = new Date(today.getFullYear() + 1, 11, 1);
  const firstMonth = new Date(today.getFullYear(), 0, 1);
  const populateYearPicker = (lastYear) => {
    yearPicker.replaceChildren();
    for (let year = today.getFullYear(); year <= lastYear; year += 1) {
      const option = document.createElement("option");
      option.value = String(year);
      option.textContent = String(year);
      yearPicker.append(option);
    }
  };
  populateYearPicker(latestMonth.getFullYear());
  const state = {
    data: null,
    mapData: null,
    track: "all",
    rating: "all",
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
      if (state.rating !== "all" && item.rating !== state.rating) return false;
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
    const all = [["all", "All tracks"], ...state.data.tracks.map((track) => [track.id, track.id === "Misc" ? track.name : track.id + " · " + track.name])];
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

  const normalizeGeoText = (value) => String(value || "").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  const cityCoordinates = {"auckland":[-36.85,174.76],"lausanne":[46.52,6.63],"vancouver":[49.28,-123.12],"singapore":[1.35,103.82],"sydney":[-33.87,151.21],"seattle":[47.61,-122.33],"hong kong":[22.32,114.17],"osaka":[34.69,135.5],"amsterdam":[52.37,4.9],"washington dc":[38.91,-77.04],"dallas":[32.78,-96.8],"shanghai":[31.23,121.47],"athens":[37.98,23.73],"montreal":[45.5,-73.57],"kyoto":[35.01,135.77],"atlanta":[33.75,-84.39],"seoul":[37.57,126.98],"denver":[39.74,-104.99],"los angeles":[34.05,-118.24],"tokyo":[35.68,139.69],"berlin":[52.52,13.4],"egham":[51.43,-0.55],"wollongong":[-34.43,150.89],"santa barbara":[34.42,-119.7],"eindhoven":[51.44,5.48],"new york city":[40.71,-74.01],"boulder":[40.02,-105.27],"abu dhabi":[24.45,54.65],"tampa":[27.95,-82.46],"rockley":[13.07,-59.59],"rome":[41.9,12.5],"las palmas de gran canaria":[28.12,-15.43],"tirana":[41.33,19.82],"kitakyushu":[33.88,130.88],"seville":[37.39,-5.99],"orlando":[28.54,-81.38],"boston":[42.36,-71.06],"sao paulo":[-23.55,-46.63],"luxembourg city":[49.61,6.13],"birmingham":[33.52,-86.8],"baltimore":[39.29,-76.61],"sendai":[38.27,140.87],"santa clara":[37.35,-121.96],"ghent":[51.05,3.72],"rio de janeiro":[-22.91,-43.17],"springfield":[39.78,-89.65],"bali":[-8.34,115.09],"heraklion":[35.34,25.13],"perth":[-31.95,115.86],"munich":[48.14,11.58],"campo grande":[-20.47,-54.62],"pittsburgh":[40.44,-79.99],"macau":[22.2,113.54],"san francisco":[37.77,-122.42],"tampere":[61.5,23.76],"salt lake city":[40.76,-111.89],"dresden":[51.05,13.74],"san jose":[37.34,-121.89],"bruges":[51.21,3.22],"shenzhen":[22.54,114.06],"graz":[47.07,15.44],"copenhagen":[55.68,12.57],"rabat":[34.02,-6.84],"delhi":[28.61,77.21],"lisbon":[38.72,-9.14],"porto":[41.16,-8.63],"xiamen":[24.48,118.09],"melbourne":[-37.81,144.96],"daytona beach":[29.21,-81.02],"honolulu":[21.31,-157.86],"shenyang":[41.8,123.43],"xi an":[34.34,108.94],"ho chi minh city":[10.82,106.63],"lafayette":[30.22,-92.02],"milan":[45.46,9.19],"madrid":[40.42,-3.7],"provo":[40.23,-111.66],"ortigia syracuse":[37.06,15.29],"syracuse":[37.07,15.29],"las vegas":[36.17,-115.14],"dublin":[53.35,-6.26],"raleigh":[35.78,-78.64],"lake buena vista":[28.37,-81.51],"redondo beach":[33.85,-118.39],"cape town":[-33.92,18.42],"magdeburg":[52.13,11.63],"adelaide":[-34.93,138.6],"hanoi":[21.03,105.85],"moscow":[55.75,37.62],"richmond":[37.54,-77.44],"san sebastian":[43.32,-1.98],"toulouse":[43.6,1.44],"philadelphia":[39.95,-75.16],"bordeaux":[44.84,-0.58],"california":[36.78,-119.42],"taipa":[22.16,113.56],"barcelona":[41.39,2.17],"florence":[43.77,11.25],"austin":[30.27,-97.74],"providence":[41.82,-71.41],"wellington":[-41.29,174.78],"goa":[15.5,73.83],"reykjavik":[64.15,-21.94],"huntington beach":[33.66,-117.99],"mexico city":[19.43,-99.13],"budapest":[47.5,19.04],"hawaii":[19.9,-155.58],"gwangju":[35.16,126.85],"chicago":[41.88,-87.63],"naples":[40.85,14.27],"karlstad":[59.38,13.5],"basel":[47.56,7.59],"detroit":[42.33,-83.05],"bangkok":[13.76,100.5],"toronto":[43.65,-79.38]};
  const countryAliases = {
    "usa": "United States of America",
    "united states": "United States of America",
    "united states of america": "United States of America",
    "the netherlands": "Netherlands",
    "republic of korea": "South Korea",
    "south korea": "South Korea",
    "hong kong": "China",
    "macao sar": "China"
  };
  const mapLocationParts = (location) => {
    const clean = String(location || "").replace(/\s*\([^)]*\)/g, "").trim();
    const parts = clean.split(",").map((part) => part.trim()).filter(Boolean);
    let city = parts[0] || "";
    if (normalizeGeoText(city) === "washington" && normalizeGeoText(parts[1]) === "dc") city = "Washington DC";
    return { clean, parts, city };
  };
  const countryForLocation = (location) => {
    const { parts, city } = mapLocationParts(location);
    if (!parts.length || normalizeGeoText(city) === "south america") return "";
    let candidate = parts.length > 1 ? parts[parts.length - 1] : city;
    const normalized = normalizeGeoText(candidate);
    if (normalized === "hong kong" || normalized === "macao sar") return "China";
    return countryAliases[normalized] || candidate;
  };
  const pointForLocation = (location) => {
    const { city } = mapLocationParts(location);
    const point = cityCoordinates[normalizeGeoText(city)];
    return point ? { lat: point[0], lon: point[1] } : null;
  };
  const mapProject = (lon, lat) => [20 + (lon + 180) * (960 / 360), 10 + (90 - lat) * (480 / 180)];
  const ringPath = (ring) => {
    if (!ring || ring.length < 4) return "";
    const segments = [];
    let current = [ring[0]];
    for (let index = 1; index < ring.length; index += 1) {
      const previous = ring[index - 1];
      const point = ring[index];
      if (Math.abs(point[0] - previous[0]) > 180) {
        const boundary = previous[0] > 0 ? 180 : -180;
        const adjustedLon = point[0] + (boundary === 180 ? 360 : -360);
        const ratio = (boundary - previous[0]) / (adjustedLon - previous[0]);
        const lat = previous[1] + ratio * (point[1] - previous[1]);
        current.push([boundary, lat]);
        segments.push(current);
        current = [[-boundary, lat], point];
      } else {
        current.push(point);
      }
    }
    segments.push(current);
    return segments.filter((segment) => segment.length >= 3).map((segment) => {
      const projected = segment.map((point) => mapProject(point[0], point[1]));
      return "M" + projected.map((point) => point[0].toFixed(1) + "," + point[1].toFixed(1)).join("L") + "Z";
    }).join("");
  };
  const geometryPath = (geometry) => {
    if (!geometry) return "";
    const polygons = geometry.type === "Polygon" ? [geometry.coordinates]
      : geometry.type === "MultiPolygon" ? geometry.coordinates : [];
    return polygons.flatMap((polygon) => polygon.map(ringPath)).join("");
  };
  const openMapLocation = (cluster) => {
    const cities = cluster.cities;
    if (cities.length === 1 && cities[0].items.length === 1) {
      openDetails(cities[0].items[0]);
      return;
    }
    mapPopover.replaceChildren();
    const heading = document.createElement("h3");
    heading.textContent = cities.length === 1 ? cities[0].label : "Nearby conference cities";
    const close = document.createElement("button");
    close.type = "button";
    close.className = "conference-map-popover-close";
    close.setAttribute("aria-label", "Close location list");
    close.textContent = "×";
    close.addEventListener("click", () => { mapPopover.hidden = true; });
    const top = document.createElement("div");
    top.className = "conference-map-popover-heading";
    top.append(heading, close);
    mapPopover.append(top);
    cities.forEach((city) => {
      if (cities.length > 1) {
        const cityHeading = document.createElement("p");
        cityHeading.className = "conference-map-city-name";
        cityHeading.textContent = city.label;
        mapPopover.append(cityHeading);
      }
      const list = document.createElement("div");
      list.className = "conference-map-popover-list";
      city.items.forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = (item.shortName || item.name) + " · " + formatRange(item);
        button.addEventListener("click", () => openDetails(item));
        list.append(button);
      });
      mapPopover.append(list);
    });
    mapPopover.hidden = false;
    mapPopover.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  const renderWorldMap = (items) => {
    if (!worldMapElement || !worldMapStatus || !state.mapData) return;
    const locatedItems = items.filter((item) => item.location);
    const activeCountries = new Set(locatedItems.map((item) => normalizeGeoText(countryForLocation(item.location))).filter(Boolean));
    worldMapElement.replaceChildren();
    const svgNs = "http://www.w3.org/2000/svg";
    const svgTitle = document.createElementNS(svgNs, "title");
    svgTitle.textContent = "World map with confirmed conference locations";
    worldMapElement.append(svgTitle);
    state.mapData.features.forEach((feature) => {
      const path = document.createElementNS(svgNs, "path");
      const name = feature.properties.name;
      const highlighted = activeCountries.has(normalizeGeoText(name));
      path.setAttribute("d", geometryPath(feature.geometry));
      path.setAttribute("class", "conference-map-country" + (highlighted ? " is-highlighted" : ""));
      path.setAttribute("aria-label", name + (highlighted ? ", confirmed conference location" : ""));
      const title = document.createElementNS(svgNs, "title");
      const count = locatedItems.filter((item) => normalizeGeoText(countryForLocation(item.location)) === normalizeGeoText(name)).length;
      title.textContent = name + (count ? " · " + count + (count === 1 ? " conference" : " conferences") : "");
      path.append(title);
      worldMapElement.append(path);
    });
    const cityGroups = new Map();
    locatedItems.forEach((item) => {
      const point = pointForLocation(item.location);
      if (!point) return;
      const key = point.lat.toFixed(2) + "," + point.lon.toFixed(2);
      if (!cityGroups.has(key)) {
        const parts = mapLocationParts(item.location);
        cityGroups.set(key, {
          lat: point.lat, lon: point.lon, label: item.location,
          locations: new Set(), items: []
        });
      }
      const group = cityGroups.get(key);
      group.locations.add(item.location);
      group.items.push(item);
    });
    const cities = Array.from(cityGroups.values()).map((city) => {
      city.items.sort((a, b) => String(a.startDate || "").localeCompare(String(b.startDate || "")) || a.name.localeCompare(b.name));
      if (city.locations.size > 1) city.label = Array.from(city.locations).join(" / ");
      return city;
    });
    const clusters = [];
    cities.forEach((city) => {
      const [x, y] = mapProject(city.lon, city.lat);
      let cluster = clusters.find((candidate) => Math.hypot(candidate.x - x, candidate.y - y) < 13);
      if (!cluster) {
        cluster = { x, y, cities: [] };
        clusters.push(cluster);
      }
      cluster.cities.push(city);
      cluster.x = cluster.cities.reduce((sum, entry) => sum + mapProject(entry.lon, entry.lat)[0], 0) / cluster.cities.length;
      cluster.y = cluster.cities.reduce((sum, entry) => sum + mapProject(entry.lon, entry.lat)[1], 0) / cluster.cities.length;
    });
    clusters.forEach((cluster) => {
      const eventCount = cluster.cities.reduce((sum, city) => sum + city.items.length, 0);
      const marker = document.createElementNS(svgNs, "g");
      marker.setAttribute("class", "conference-map-marker");
      marker.setAttribute("transform", "translate(" + cluster.x.toFixed(1) + " " + cluster.y.toFixed(1) + ")");
      marker.setAttribute("role", "button");
      marker.setAttribute("tabindex", "0");
      marker.setAttribute("aria-label", cluster.cities.map((city) => city.label).join(", ") + ", " + eventCount + (eventCount === 1 ? " conference" : " conferences"));
      const hit = document.createElementNS(svgNs, "circle");
      hit.setAttribute("class", "conference-map-marker-hit");
      hit.setAttribute("r", "12");
      const dot = document.createElementNS(svgNs, "circle");
      dot.setAttribute("class", "conference-map-marker-dot");
      dot.setAttribute("r", eventCount > 1 || cluster.cities.length > 1 ? "8" : "6");
      marker.append(hit, dot);
      if (eventCount > 1 || cluster.cities.length > 1) {
        const label = document.createElementNS(svgNs, "text");
        label.setAttribute("class", "conference-map-marker-count");
        label.setAttribute("y", "3.3");
        label.textContent = String(eventCount);
        marker.append(label);
      }
      const title = document.createElementNS(svgNs, "title");
      title.textContent = cluster.cities.map((city) => city.label).join(" · ");
      marker.append(title);
      marker.addEventListener("click", () => openMapLocation(cluster));
      marker.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openMapLocation(cluster);
        }
      });
      worldMapElement.append(marker);
    });
    mapPopover.hidden = true;
    worldMapStatus.textContent = cities.length + " mapped cities across " + activeCountries.size + " countries with confirmed locations. Select a marker to view conference details.";
    worldMapElement.setAttribute("aria-label", cities.length + " mapped conference cities. Countries with a confirmed location are highlighted. Select a city marker for details.");
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
    renderWorldMap(items);
    document.querySelectorAll(".conference-view-switch button").forEach((button) => {
      const selected = button.dataset.view === state.view;
      button.setAttribute("aria-pressed", String(selected));
    });
    ratingButtons.forEach((button) => {
      const selected = button.dataset.rating === state.rating;
      button.setAttribute("aria-pressed", String(selected));
      button.classList.toggle("is-selected", selected);
    });
    calendarView.hidden = state.view !== "calendar";
    agendaView.hidden = state.view !== "agenda";
  };
  searchInput.addEventListener("input", () => { state.search = searchInput.value; render(); });
  ratingButtons.forEach((button) => button.addEventListener("click", () => {
    state.rating = state.rating === button.dataset.rating ? "all" : button.dataset.rating;
    render();
  }));
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

  fetch(worldMapUrl)
    .then((response) => {
      if (!response.ok) throw new Error("World map could not be loaded.");
      return response.json();
    })
    .then((mapData) => { state.mapData = mapData; if (state.data) renderWorldMap(filtered()); })
    .catch(() => { if (worldMapStatus) worldMapStatus.textContent = "The map could not be loaded. Conference details remain available in the calendar."; });

  fetch(dataUrl)
    .then((response) => {
      if (!response.ok) throw new Error("Conference data could not be loaded.");
      return response.json();
    })
    .then((data) => {
      state.data = data;
      const eventYears = data.conferences
        .filter((item) => item.startDate)
        .map((item) => Number((item.endDate || item.startDate).slice(0, 4)));
      const lastCalendarYear = Math.max(today.getFullYear() + 1, ...eventYears);
      latestMonth = new Date(lastCalendarYear, 11, 1);
      populateYearPicker(lastCalendarYear);
      renderCoverage();
      render();
    })
    .catch(() => {
      resultCount.textContent = "Conference list could not be loaded.";
      calendarGrid.replaceChildren(makeEmpty("Reload the page to try again."));
    });
})();

