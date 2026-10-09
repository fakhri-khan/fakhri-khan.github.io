#!/usr/bin/env python3
"""Fetch new papers and append a Riyadh-time daily edition."""
from __future__ import annotations
import argparse
import json
import os
import re
import time
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "data" / "venue-config.json"
ARCHIVE_PATH = ROOT / "data" / "daily-papers.json"
RIYADH = ZoneInfo("Asia/Riyadh")
USER_AGENT = "fakhri-khan.github.io daily research updater/1.0"
FIELDS = ("summary", "contribution", "methods", "relevance", "limitations")

def log(message: str) -> None:
    print(f"[daily-papers] {message}")

def request_json(url: str, method: str = "GET", payload: dict[str, Any] | None = None, headers_extra: dict[str, str] | None = None) -> dict[str, Any] | None:
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    headers = {"User-Agent": USER_AGENT, "Accept": "application/json"}
    if payload is not None:
        headers["Content-Type"] = "application/json"
    if headers_extra:
        headers.update(headers_extra)
    for attempt in range(3):
        try:
            request = Request(url, data=body, headers=headers, method=method)
            with urlopen(request, timeout=45) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError as error:
            if error.code == 429 and attempt < 2:
                delay = min(max(int(error.headers.get("Retry-After", "2")), 2), 12)
                log(f"rate limited, retrying in {delay}s")
                time.sleep(delay)
                continue
            log(f"request skipped: {url.split('?')[0]} ({error})")
            return None
        except (URLError, TimeoutError, json.JSONDecodeError) as error:
            log(f"request skipped: {url.split('?')[0]} ({error})")
            return None
    return None

def text_value(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, list):
        return " ".join(text_value(item) for item in value)
    return str(value)

def strip_markup(value: Any) -> str:
    return re.sub(r"\\s+", " ", re.sub(r"<[^>]+>", " ", text_value(value))).strip()

def normalized(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()

def clean_doi(value: Any) -> str:
    return re.sub(r"^https?://doi.org/", "", text_value(value).strip(), flags=re.I).rstrip(" .")

def crossref_date(item: dict[str, Any]) -> str:
    for field in ("published-online", "published-print", "published", "issued", "created"):
        parts = item.get(field, {}).get("date-parts", [[]])
        if parts and parts[0]:
            values = parts[0]
            return f"{values[0]:04d}-{values[1] if len(values) > 1 else 1:02d}-{values[2] if len(values) > 2 else 1:02d}"
    return ""

def in_window(value: str, start: date, end: date) -> bool:
    try:
        return start <= date.fromisoformat(value[:10]) <= end
    except ValueError:
        return False

def key_for(paper: dict[str, Any]) -> str:
    doi = clean_doi(paper.get("doi"))
    return f"doi:{doi.lower()}" if doi else f"title:{normalized(text_value(paper.get('title')))}"

def authors(item: dict[str, Any]) -> list[str]:
    names = []
    for author in item.get("author", []):
        name = " ".join(part for part in (author.get("given"), author.get("family")) if part)
        if name:
            names.append(name)
    return names

def fetch_venue(venue: dict[str, Any], start: date, end: date) -> list[dict[str, Any]]:
    query = venue.get("query", venue["name"])
    if venue.get("type") == "journal" and venue.get("issn"):
        params = {"filter": f"issn:{venue['issn']},from-pub-date:{start.isoformat()},until-pub-date:{end.isoformat()}", "sort": "published", "order": "desc", "rows": 50}
    else:
        query_key = "query.bibliographic"
        params = {query_key: query, "filter": f"from-pub-date:{start.isoformat()},until-pub-date:{end.isoformat()}", "sort": "published", "order": "desc", "rows": 50}
    mailto = os.getenv("CROSSREF_MAILTO", "")
    if mailto:
        params["mailto"] = mailto
    response = request_json(f"https://api.crossref.org/works?{urlencode(params)}") or {}
    query_words = [word for word in normalized(query).split() if len(word) > 2]
    papers = []
    for item in response.get("message", {}).get("items", []):
        published = crossref_date(item)
        title = text_value((item.get("title") or [""])[0]).strip()
        container = text_value((item.get("container-title") or [""])[0]).strip()
        blob = normalized(f"{title} {container} {item.get('publisher', '')}")
        minimum = 1 if len(query_words) <= 2 else 2
        event = item.get("event") if isinstance(item.get("event"), dict) else {}
        actual_venue = normalized(f"{container} {event.get('name', '')} {event.get('acronym', '')}")
        conference_words = [word for word in normalized(venue["name"]).split() if len(word) >= 2 and word not in {"annual", "conference", "international", "meeting", "on", "and", "the", "of", "proceedings", "symposium"}]
        required_matches = 1 if len(conference_words) <= 1 else 2
        conference_ok = venue.get("type") != "conference" or sum(word in actual_venue for word in conference_words) >= required_matches
        if sum(word in blob for word in query_words) < minimum or not conference_ok or not title or not in_window(published, start, end):
            continue
        doi = clean_doi(item.get("DOI"))
        if not doi:
            continue
        papers.append({"key": f"doi:{doi.lower()}", "title": title, "abstract": strip_markup(item.get("abstract")), "authors": authors(item), "doi": doi, "url": item.get("URL") or f"https://doi.org/{doi}", "venue": venue["name"], "venueId": venue["id"], "publishedDate": published, "source": "Crossref", "trackIds": venue["tracks"]})
    return papers

def unique(papers: list[dict[str, Any]]) -> list[dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for paper in papers:
        key = key_for(paper)
        if key in result:
            result[key]["trackIds"] = sorted(set(result[key].get("trackIds", [])) | set(paper.get("trackIds", [])))
            if len(paper.get("abstract", "")) > len(result[key].get("abstract", "")):
                result[key]["abstract"] = paper["abstract"]
        else:
            paper["key"] = key
            result[key] = paper
    return list(result.values())

def score(paper: dict[str, Any], track: dict[str, Any]) -> int:
    haystack = normalized(f"{paper.get('title', '')} {paper.get('abstract', '')}")
    keywords = sum(haystack.count(normalized(word)) for word in track.get("keywords", []))
    return keywords * 100 + (80 if paper.get("abstract") else 0) + (20 if track["id"] in paper.get("trackIds", []) else 0) + int(paper.get("publishedDate", "0000-00-00").replace("-", "")[-4:])

def select_for_tracks(papers: list[dict[str, Any]], tracks: list[dict[str, Any]], existing_papers: list[dict[str, Any]] | None = None) -> list[dict[str, Any]]:
    available = {track["id"]: sorted([paper for paper in papers if track["id"] in paper.get("trackIds", [])], key=lambda paper: score(paper, track), reverse=True) for track in tracks}
    chosen: list[dict[str, Any]] = []
    selected: set[str] = set()
    counts = {track["id"]: 0 for track in tracks}
    for paper in existing_papers or []:
        track_id = paper.get("trackId")
        if track_id in counts:
            counts[track_id] += 1
            selected.add(key_for(paper))
    for _ in range(2):
        for track in sorted(tracks, key=lambda item: sum(paper["key"] not in selected for paper in available[item["id"]])):
            if counts[track["id"]] >= 2:
                continue
            for paper in available[track["id"]]:
                if paper["key"] in selected:
                    continue
                selected.add(paper["key"])
                counts[track["id"]] += 1
                chosen_paper = dict(paper)
                chosen_paper["trackId"] = track["id"]
                chosen_paper["trackName"] = track["name"]
                chosen.append(chosen_paper)
                break
    return chosen

def summarize(paper: dict[str, Any]) -> dict[str, str]:
    abstract = strip_markup(paper.get("abstract", ""))
    sentences = [part.strip() for part in re.split(r"(?<=[.!?])\\s+", abstract) if part.strip()]
    method = next((part for part in sentences if re.search(r"\\b(propose|present|develop|design|introduce|method|framework|model|approach|experiment|evaluate)\\w*\\b", part, re.I)), "Not stated in the abstract.")
    return {"summary": " ".join(sentences[:2]) or f"This paper examines {paper['title']}.", "contribution": sentences[0] if sentences else "Not stated in the abstract.", "methods": method, "relevance": f"Relevant to {paper['trackName']} based on the paper metadata and abstract.", "limitations": "Not stated in the abstract."}

def load_json(path: Path, default: dict[str, Any]) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return default

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--date")
    args = parser.parse_args()
    config = load_json(CONFIG_PATH, {})
    tracks, venues = config.get("tracks", []), config.get("venues", [])
    if not tracks or not venues:
        raise SystemExit("venue configuration is empty")
    now = datetime.now(RIYADH)
    edition = date.fromisoformat(args.date) if args.date else now.date()
    start = edition - timedelta(days=int(os.getenv("PAPER_LOOKBACK_DAYS", "7")))
    archive = load_json(ARCHIVE_PATH, {"version": 1, "timezone": "Asia/Riyadh", "tracks": tracks, "days": []})
    archive.setdefault("days", [])
    archive["tracks"] = [{"id": track["id"], "name": track["name"]} for track in tracks]
    seen = {key_for(paper) for day in archive["days"] for paper in day.get("papers", [])}
    all_papers: list[dict[str, Any]] = []
    for index, venue in enumerate(venues, 1):
        log(f"checking {index}/{len(venues)} {venue['name']}")
        all_papers.extend(fetch_venue(venue, start, edition))
        time.sleep(0.15)
    candidates = [paper for paper in unique(all_papers) if paper["key"] not in seen]
    day = next((item for item in archive["days"] if item.get("date") == edition.isoformat()), None)
    existing_today = day.get("papers", []) if day is not None else []
    chosen = select_for_tracks(candidates, tracks, existing_today)
    log(f"found {len(candidates)} never-archived candidates and selected {len(chosen)} papers")
    if args.dry_run:
        return 0
    if day is not None and not chosen:
        log("no new eligible papers; preserving the existing daily edition")
        return 0
    new_papers = []
    for paper in chosen:
        summary = summarize(paper)
        new_papers.append({key: paper[key] for key in ("trackId", "trackName", "title", "authors", "venue", "venueId", "publishedDate", "doi", "url", "source")} | summary)
    day = next((item for item in archive["days"] if item.get("date") == edition.isoformat()), None)
    if day is None:
        archive["days"].append({"date": edition.isoformat(), "generatedAt": now.isoformat(), "papers": new_papers})
    else:
        day.setdefault("papers", []).extend(new_papers)
        day["generatedAt"] = now.isoformat()
    archive["days"].sort(key=lambda item: str(item.get("date", "")), reverse=True)
    archive["updatedAt"] = now.isoformat()
    ARCHIVE_PATH.write_text(json.dumps(archive, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    log(f"wrote {len(new_papers)} new papers to {ARCHIVE_PATH}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
