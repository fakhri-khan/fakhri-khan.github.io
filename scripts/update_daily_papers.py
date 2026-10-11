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
import xml.etree.ElementTree as ET
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "data" / "venue-config.json"
ARCHIVE_PATH = ROOT / "data" / "daily-papers.json"
RIYADH = ZoneInfo("Asia/Riyadh")
USER_AGENT = "fakhri-khan.github.io daily research updater/1.0"
FIELDS = ("summary", "contribution", "methods", "relevance", "limitations")
CROSSREF_SUCCESSES = 0
ARXIV_SUCCESSES = 0

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
            retryable = error.code == 429 or 500 <= error.code < 600
            if retryable and attempt < 2:
                try:
                    delay = int(error.headers.get("Retry-After", "2")) if error.code == 429 else 2 * (attempt + 1)
                except (TypeError, ValueError):
                    delay = 2
                delay = min(max(delay, 2), 12)
                log(f"HTTP {error.code}, retrying in {delay}s")
                time.sleep(delay)
                continue
            log(f"request failed: {url.split('?')[0]} ({error})")
            return None
        except (URLError, TimeoutError, json.JSONDecodeError) as error:
            if attempt < 2:
                delay = 2 * (attempt + 1)
                log(f"temporary request failure, retrying in {delay}s ({error})")
                time.sleep(delay)
                continue
            log(f"request failed after retries: {url.split('?')[0]} ({error})")
            return None
    return None
def request_text(url: str) -> str | None:
    headers = {"User-Agent": USER_AGENT, "Accept": "application/atom+xml, application/xml"}
    for attempt in range(3):
        try:
            request = Request(url, headers=headers, method="GET")
            with urlopen(request, timeout=45) as response:
                return response.read().decode("utf-8")
        except HTTPError as error:
            retryable = error.code == 429 or 500 <= error.code < 600
            if retryable and attempt < 2:
                try:
                    delay = int(error.headers.get("Retry-After", "3")) if error.code == 429 else 3 * (attempt + 1)
                except (TypeError, ValueError):
                    delay = 3
                delay = min(max(delay, 3), 15)
                log(f"arXiv HTTP {error.code}, retrying in {delay}s")
                time.sleep(delay)
                continue
            log(f"arXiv request failed: {error}")
            return None
        except (URLError, TimeoutError, UnicodeDecodeError) as error:
            if attempt < 2:
                delay = 3 * (attempt + 1)
                log(f"temporary arXiv request failure, retrying in {delay}s ({error})")
                time.sleep(delay)
                continue
            log(f"arXiv request failed after retries: {error}")
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
    if doi:
        return f"doi:{doi.lower()}"
    arxiv_id = text_value(paper.get("arxivId")).strip()
    return f"arxiv:{arxiv_id.lower()}" if arxiv_id else f"title:{normalized(text_value(paper.get('title')))}"

def authors(item: dict[str, Any]) -> list[str]:
    names = []
    for author in item.get("author", []):
        name = " ".join(part for part in (author.get("given"), author.get("family")) if part)
        if name:
            names.append(name)
    return names

def fetch_venue(venue: dict[str, Any], start: date, end: date) -> list[dict[str, Any]]:
    global CROSSREF_SUCCESSES
    query = venue.get("query", venue["name"])
    if venue.get("type") == "journal" and venue.get("issn"):
        params = {"filter": f"issn:{venue['issn']},from-pub-date:{start.isoformat()},until-pub-date:{end.isoformat()}", "sort": "published", "order": "desc", "rows": 50}
    else:
        query_key = "query.bibliographic"
        params = {query_key: query, "filter": f"from-pub-date:{start.isoformat()},until-pub-date:{end.isoformat()}", "sort": "published", "order": "desc", "rows": 50}
    mailto = os.getenv("CROSSREF_MAILTO", "")
    if mailto:
        params["mailto"] = mailto
    response = request_json(f"https://api.crossref.org/works?{urlencode(params)}")
    if response is None:
        return []
    CROSSREF_SUCCESSES += 1
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

def fetch_arxiv(venue: dict[str, Any], start: date, end: date, tracks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Fetch recent arXiv records from the official Atom API and map them to research tracks."""
    global ARXIV_SUCCESSES
    categories = venue.get("categories", [])
    if not categories:
        log("arXiv source has no subject categories configured")
        return []
    category_query = " OR ".join(f"cat:{category}" for category in categories)
    date_query = f"submittedDate:[{start:%Y%m%d}0000 TO {end:%Y%m%d}2359]"
    search_query = f"({category_query}) AND {date_query}"
    papers: list[dict[str, Any]] = []
    page_size = 1000
    for offset in range(0, 10000, page_size):
        params = {"search_query": search_query, "start": offset, "max_results": page_size, "sortBy": "submittedDate", "sortOrder": "descending"}
        feed = request_text(f"https://export.arxiv.org/api/query?{urlencode(params)}")
        if feed is None:
            return papers
        try:
            root = ET.fromstring(feed)
        except ET.ParseError as error:
            log(f"arXiv returned invalid Atom XML ({error})")
            return papers
        if offset == 0:
            ARXIV_SUCCESSES += 1
        atom = "{http://www.w3.org/2005/Atom}"
        arxiv_ns = "{http://arxiv.org/schemas/atom}"
        opensearch = "{http://a9.com/-/spec/opensearch/1.1/}"
        entries = root.findall(f"{atom}entry")
        try:
            total = int(root.findtext(f"{opensearch}totalResults", "0"))
        except ValueError:
            total = 0
        for entry in entries:
            title = strip_markup(entry.findtext(f"{atom}title", ""))
            abstract = strip_markup(entry.findtext(f"{atom}summary", ""))
            identifier = entry.findtext(f"{atom}id", "")
            match = re.search(r"arxiv\.org/abs/([^?#]+)", identifier, re.I)
            arxiv_id = re.sub(r"v\d+$", "", match.group(1)) if match else ""
            published = entry.findtext(f"{atom}published", "")[:10]
            if not title or not arxiv_id or not in_window(published, start, end):
                continue
            paper_doi = clean_doi(entry.findtext(f"{arxiv_ns}doi", ""))
            paper = {
                "key": f"doi:{paper_doi.lower()}" if paper_doi else f"arxiv:{arxiv_id.lower()}",
                "title": title, "abstract": abstract,
                "authors": [name.text or "" for name in entry.findall(f"{atom}author/{atom}name") if name.text],
                "doi": paper_doi, "arxivId": arxiv_id,
                "url": f"https://arxiv.org/abs/{arxiv_id}",
                "venue": venue.get("name", "arXiv") + " preprint", "venueId": venue["id"],
                "publishedDate": published, "source": "arXiv", "trackIds": [],
            }
            paper["trackIds"] = [track["id"] for track in tracks if eligible_for_track(paper, track)]
            if paper["trackIds"]:
                papers.append(paper)
        if not entries or offset + len(entries) >= total or offset + len(entries) >= 10000:
            break
        # arXiv asks API clients to leave at least three seconds between requests.
        time.sleep(3.1)
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

COMPUTATIONAL_METHODS = (
    "machine learning", "deep learning", "artificial intelligence", "neural network",
    "computer vision", "image analysis", "image processing", "image quality",
    "image reconstruction", "image registration", "image acquisition", "segmentation",
    "classification", "object detection", "radiomics", "transformer", "multimodal",
    "large language model", "federated learning", "support vector machine",
    "random forest", "gradient boosting", "algorithm", "computational",
)
AI_METHODS = (
    "artificial intelligence", "machine learning", "deep learning", "neural network",
    "computer vision", "transformer", "multimodal", "large language model",
    "federated learning", "foundation model", "self-supervised learning",
    "explainable ai", "xai", "support vector machine", "random forest",
    "gradient boosting", "cnn", "vit", "ai",
)


def has_any_phrase(text: str, phrases: tuple[str, ...]) -> bool:
    normalized_text = f" {normalized(text)} "
    return any(f" {normalized(phrase)} " in normalized_text for phrase in phrases)


def keyword_hits(paper: dict[str, Any], track: dict[str, Any]) -> int:
    text = f"{paper.get('title', '')} {paper.get('abstract', '')}"
    haystack = f" {normalized(text)} "
    return sum(1 for word in track.get("keywords", []) if f" {normalized(word)} " in haystack)


def eligible_for_track(paper: dict[str, Any], track: dict[str, Any]) -> bool:
    text = f"{paper.get('title', '')} {paper.get('abstract', '')}"
    if keyword_hits(paper, track) == 0:
        return False
    if track["id"] == "medical-imaging":
        return has_any_phrase(text, COMPUTATIONAL_METHODS)
    if track["id"] in {"trustworthy-ai", "retinal-ai"}:
        return has_any_phrase(text, AI_METHODS)
    return True
def score(paper: dict[str, Any], track: dict[str, Any]) -> int:
    return keyword_hits(paper, track) * 100 + (80 if paper.get("abstract") else 0) + (20 if track["id"] in paper.get("trackIds", []) else 0) + int(paper.get("publishedDate", "0000-00-00").replace("-", "")[-4:])

def select_for_tracks(papers: list[dict[str, Any]], tracks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    available = {
        track["id"]: sorted(
            [paper for paper in papers if track["id"] in paper.get("trackIds", []) and eligible_for_track(paper, track)],
            key=lambda paper: score(paper, track),
            reverse=True,
        )
        for track in tracks
    }
    chosen: list[dict[str, Any]] = []
    selected: set[str] = set()
    counts = {track["id"]: 0 for track in tracks}
    arxiv_counts = {track["id"]: 0 for track in tracks}
    for _ in range(2):
        for track in sorted(tracks, key=lambda item: sum(paper["key"] not in selected for paper in available[item["id"]])):
            if counts[track["id"]] >= 2:
                continue
            for paper in available[track["id"]]:
                if paper["key"] in selected:
                    continue
                if paper.get("source") == "arXiv" and arxiv_counts[track["id"]] >= 1:
                    continue
                selected.add(paper["key"])
                counts[track["id"]] += 1
                if paper.get("source") == "arXiv":
                    arxiv_counts[track["id"]] += 1
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
    parser.add_argument("--refresh-today", action="store_true", help="replace today's edition even when no new eligible papers remain")
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
    day = next((item for item in archive["days"] if item.get("date") == edition.isoformat()), None)
    seen = {
        key_for(paper)
        for archived_day in archive["days"]
        if archived_day.get("date") != edition.isoformat()
        for paper in archived_day.get("papers", [])
    }
    all_papers: list[dict[str, Any]] = []
    for index, venue in enumerate(venues, 1):
        log(f"checking {index}/{len(venues)} {venue['name']}")
        if venue.get("source") == "arxiv":
            all_papers.extend(fetch_arxiv(venue, start, edition, tracks))
        else:
            all_papers.extend(fetch_venue(venue, start, edition))
            time.sleep(0.15)
    if CROSSREF_SUCCESSES == 0 and ARXIV_SUCCESSES == 0:
        raise SystemExit("All Crossref and arXiv requests failed; the existing archive was left unchanged")
    candidates = [paper for paper in unique(all_papers) if paper["key"] not in seen]
    chosen = select_for_tracks(candidates, tracks)
    log(f"found {len(candidates)} never-archived candidates and selected {len(chosen)} papers")
    if args.dry_run:
        return 0
    if day is not None and not chosen and not args.refresh_today:
        log("no new eligible papers; preserving the existing daily edition")
        return 0
    new_papers = []
    for paper in chosen:
        summary = summarize(paper)
        record = {key: paper[key] for key in ("trackId", "trackName", "title", "authors", "venue", "venueId", "publishedDate", "url", "source") if key in paper}
        for optional_key in ("doi", "arxivId"):
            if paper.get(optional_key):
                record[optional_key] = paper[optional_key]
        new_papers.append(record | summary)
    day = next((item for item in archive["days"] if item.get("date") == edition.isoformat()), None)
    if day is None:
        archive["days"].append({"date": edition.isoformat(), "generatedAt": now.isoformat(), "papers": new_papers})
    else:
        day["papers"] = new_papers
        day["generatedAt"] = now.isoformat()
    archive["days"].sort(key=lambda item: str(item.get("date", "")), reverse=True)
    archive["updatedAt"] = now.isoformat()
    ARCHIVE_PATH.write_text(json.dumps(archive, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    log(f"wrote {len(new_papers)} new papers to {ARCHIVE_PATH}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
