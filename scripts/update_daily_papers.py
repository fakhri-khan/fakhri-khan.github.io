#!/usr/bin/env python3
"""Fetch new papers, summarize them, and append a Riyadh-time daily edition."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from datetime import date, datetime, timedelta, timezone
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


def log(message: str) -> None:
    print(f"[daily-papers] {message}")


def request_json(url: str, method: str = "GET", payload: dict[str, Any] | None = None, extra_headers: dict[str, str] | None = None) -> dict[str, Any] | None:
    body = None
    headers = {"User-Agent": USER_AGENT, "Accept": "application/json"}
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if extra_headers:
        headers.update(extra_headers)
    try:
        request = Request(url, data=body, headers=headers, method=method)
        with urlopen(request, timeout=45) as response:
            return json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as error:
        log(f"request skipped: {url.split('?')[0]} ({error})")
        return None


def text_value(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, list):
        return " ".join(text_value(item) for item in value)
    return str(value)


def strip_markup(value: Any) -> str:
    text = re.sub(r"<[^>]+>", " ", text_value(value))
    return re.sub(r"\s+", " ", text).strip()


def normalized(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def clean_doi(value: Any) -> str:
    doi = text_value(value).strip()
    doi = re.sub(r"^https?://doi.org/", "", doi, flags=re.I)
    return doi.rstrip(" .")


def date_from_crossref(item: dict[str, Any]) -> str:
    for field in ("published-online", "published-print", "published", "issued", "created"):
        parts = item.get(field, {}).get("date-parts", [[]])
        if parts and parts[0]:
            values = parts[0]
            return f"{values[0]:04d}-{values[1] if len(values) > 1 else 1:02d}-{values[2] if len(values) > 2 else 1:02d}"
    return ""


def date_from_openalex(item: dict[str, Any]) -> str:
    value = item.get("publication_date") or ""
    return value[:10]


def reconstruct_abstract(index: Any) -> str:
    if not isinstance(index, dict):
        return ""
    words: list[tuple[int, str]] = []
    for word, positions in index.items():
        for position in positions if isinstance(positions, list) else []:
            words.append((int(position), word))
    return " ".join(word for _, word in sorted(words))


def authors_from_openalex(item: dict[str, Any]) -> list[str]:
    return [
        text_value(authorship.get("author", {}).get("display_name"))
        for authorship in item.get("authorships", [])
        if authorship.get("author", {}).get("display_name")
    ]


def authors_from_crossref(item: dict[str, Any]) -> list[str]:
    names = []
    for author in item.get("author", []):
        name = " ".join(part for part in (author.get("given"), author.get("family")) if part)
        if name:
            names.append(name)
    return names


def candidate_key(item: dict[str, Any]) -> str:
    doi = clean_doi(item.get("doi"))
    return f"doi:{doi.lower()}" if doi else f"title:{normalized(text_value(item.get('title')))}"


def in_window(published: str, start: date, end: date) -> bool:
    try:
        value = date.fromisoformat(published[:10])
    except ValueError:
        return False
    return start <= value <= end


def openalex_journal(venue: dict[str, Any], start: date, end: date) -> list[dict[str, Any]]:
    mailto = os.getenv("OPENALEX_MAILTO", "")
    query = {"mailto": mailto} if mailto else {}
    source = request_json(f"https://api.openalex.org/sources/issn:{venue['issn']}?{urlencode(query)}")
    source_id = (source or {}).get("id", "").rsplit("/", 1)[-1]
    if not source_id:
        return crossref_venue(venue, start, end)
    filters = f"from_publication_date:{start.isoformat()},to_publication_date:{end.isoformat()},primary_location.source.id:{source_id}"
    params = {"filter": filters, "sort": "publication_date:desc", "per-page": 50}
    if mailto:
        params["mailto"] = mailto
    response = request_json(f"https://api.openalex.org/works?{urlencode(params)}") or {}
    candidates = []
    for item in response.get("results", []):
        published = date_from_openalex(item)
        if not published or not in_window(published, start, end):
            continue
        title = text_value(item.get("title")).strip()
        doi = clean_doi(item.get("doi"))
        if not title or not doi:
            continue
        landing = item.get("primary_location", {}).get("landing_page_url") or f"https://doi.org/{doi}"
        candidates.append({
            "key": f"doi:{doi.lower()}",
            "title": title,
            "abstract": reconstruct_abstract(item.get("abstract_inverted_index")),
            "authors": authors_from_openalex(item),
            "doi": doi,
            "url": landing,
            "venue": venue["name"],
            "venueId": venue["id"],
            "venueType": venue["type"],
            "publishedDate": published,
            "source": "OpenAlex",
            "trackIds": venue["tracks"],
        })
    return candidates or crossref_venue(venue, start, end)


def crossref_venue(venue: dict[str, Any], start: date, end: date) -> list[dict[str, Any]]:
    query_key = "query.container-title" if venue["type"] == "journal" else "query.bibliographic"
    query = venue.get("query", venue["name"])
    params = {
        query_key: query,
        "filter": f"from-pub-date:{start.isoformat()},until-pub-date:{end.isoformat()}",
        "sort": "published",
        "order": "desc",
        "rows": 50,
    }
    mailto = os.getenv("CROSSREF_MAILTO", "")
    if mailto:
        params["mailto"] = mailto
    response = request_json(f"https://api.crossref.org/works?{urlencode(params)}") or {}
    items = response.get("message", {}).get("items", [])
    candidates = []
    query_words = [word for word in normalized(query).split() if len(word) > 2]
    for item in items:
        published = date_from_crossref(item)
        title = text_value((item.get("title") or [""])[0]).strip()
        container = text_value((item.get("container-title") or [""])[0]).strip()
        blob = normalized(f"{title} {container} {item.get('publisher', '')}")
        matched = sum(1 for word in query_words if word in blob)
        minimum = 1 if len(query_words) <= 2 else 2
        if matched < minimum or not title or not published or not in_window(published, start, end):
            continue
        doi = clean_doi(item.get("DOI"))
        if not doi:
            continue
        candidates.append({
            "key": f"doi:{doi.lower()}",
            "title": title,
            "abstract": strip_markup(item.get("abstract")),
            "authors": authors_from_crossref(item),
            "doi": doi,
            "url": item.get("URL") or f"https://doi.org/{doi}",
            "venue": venue["name"],
            "venueId": venue["id"],
            "venueType": venue["type"],
            "publishedDate": published,
            "source": "Crossref",
            "trackIds": venue["tracks"],
        })
    return candidates


def unique_candidates(candidates: list[dict[str, Any]]) -> list[dict[str, Any]]:
    unique: dict[str, dict[str, Any]] = {}
    for candidate in candidates:
        key = candidate_key(candidate)
        if key in unique:
            existing = unique[key]
            existing["trackIds"] = sorted(set(existing.get("trackIds", [])) | set(candidate.get("trackIds", [])))
            if len(candidate.get("abstract", "")) > len(existing.get("abstract", "")):
                existing["abstract"] = candidate["abstract"]
            continue
        candidate["key"] = key
        unique[key] = candidate
    return list(unique.values())


def score(candidate: dict[str, Any], track: dict[str, Any]) -> int:
    haystack = normalized(f"{candidate.get('title', '')} {candidate.get('abstract', '')}")
    keyword_score = sum(haystack.count(normalized(keyword)) for keyword in track["keywords"])
    recency = int(candidate.get("publishedDate", "0000-00-00").replace("-", "")[-4:]) if candidate.get("publishedDate") else 0
    return (keyword_score * 100) + (80 if candidate.get("abstract") else 0) + (20 if track["id"] in candidate.get("trackIds", []) else 0) + recency


def select_for_tracks(candidates: list[dict[str, Any]], tracks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    available = {track["id"]: sorted([candidate for candidate in candidates if track["id"] in candidate.get("trackIds", [])], key=lambda item: score(item, track), reverse=True) for track in tracks for track in [track]}
    selected_keys: set[str] = set()
    chosen: list[dict[str, Any]] = []
    counts = {track["id"]: 0 for track in tracks}
    for _ in range(2):
        order = sorted(tracks, key=lambda track: sum(1 for item in available[track["id"]] if item["key"] not in selected_keys))
        for track in order:
            if counts[track["id"]] >= 2:
                continue
            for candidate in available[track["id"]]:
                if candidate["key"] in selected_keys:
                    continue
                selected_keys.add(candidate["key"])
                counts[track["id"]] += 1
                candidate = dict(candidate)
                candidate["trackId"] = track["id"]
                candidate["trackName"] = track["name"]
                chosen.append(candidate)
                break
    return chosen


def response_text(response: dict[str, Any]) -> str:
    if isinstance(response.get("output_text"), str):
        return response["output_text"]
    chunks: list[str] = []
    for item in response.get("output", []):
        for content in item.get("content", []):
            if isinstance(content.get("text"), str):
                chunks.append(content["text"])
    return "\n".join(chunks)


def summarize(candidate: dict[str, Any]) -> dict[str, str]:
    api_key = os.environ["OPENAI_API_KEY"]
    prompt = {
        "title": candidate["title"],
        "venue": candidate["venue"],
        "publication_date": candidate["publishedDate"],
        "abstract": candidate.get("abstract", "") or "Abstract not available in the source metadata.",
        "track": candidate["trackName"],
    }
    instruction = (
        "Summarize this research paper for a technical academic reading desk. Use only the supplied metadata and abstract. "
        "Do not infer results or claim details that are not stated. If a field is not supported, say 'Not stated in the abstract.' "
        "Return only valid JSON with exactly these string fields: summary, contribution, methods, relevance, limitations. "
        "Keep each field concise, specific, and readable."
    )
    payload = {
        "model": os.getenv("PAPER_SUMMARY_MODEL", "gpt-4.1-mini"),
        "input": [{"role": "system", "content": instruction}, {"role": "user", "content": json.dumps(prompt)}],
        "temperature": 0.2,
        "max_output_tokens": 650,
    }
    response = request_json(
        "https://api.openai.com/v1/responses",
        method="POST",
        payload=payload,
        extra_headers={"Authorization": f"Bearer {api_key}"},
    )
    if not response:
        raise RuntimeError("OpenAI summary request returned no response")
    raw = response_text(response).strip()
    raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.I)
    parsed = json.loads(raw)
    return {field: strip_markup(parsed.get(field)) or "Not stated in the abstract." for field in ("summary", "contribution", "methods", "relevance", "limitations")}


def load_json(path: Path, default: dict[str, Any]) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Fetch and report candidates without writing or summarizing")
    parser.add_argument("--date", help="Override the Riyadh edition date, useful for local validation")
    args = parser.parse_args()

    config = load_json(CONFIG_PATH, {})
    tracks = config.get("tracks", [])
    venues = config.get("venues", [])
    if not tracks or not venues:
        raise SystemExit("venue configuration is empty")
    now = datetime.now(RIYADH)
    edition_date = date.fromisoformat(args.date) if args.date else now.date()
    start = edition_date - timedelta(days=int(os.getenv("PAPER_LOOKBACK_DAYS", "7")))
    end = edition_date
    archive = load_json(ARCHIVE_PATH, {"version": 1, "timezone": "Asia/Riyadh", "tracks": tracks, "days": []})
    archive.setdefault("days", [])
    archive["tracks"] = [{"id": track["id"], "name": track["name"]} for track in tracks]
    seen = {candidate_key(paper) for day in archive["days"] for paper in day.get("papers", [])}

    all_candidates: list[dict[str, Any]] = []
    for index, venue in enumerate(venues, start=1):
        log(f"checking {index}/{len(venues)} {venue['name']}")
        if venue["type"] == "journal":
            all_candidates.extend(openalex_journal(venue, start, end))
        else:
            all_candidates.extend(crossref_venue(venue, start, end))
        time.sleep(0.15)
    candidates = [candidate for candidate in unique_candidates(all_candidates) if candidate["key"] not in seen]
    chosen = select_for_tracks(candidates, tracks)
    log(f"found {len(candidates)} never-archived candidates and selected {len(chosen)} papers")
    if args.dry_run:
        for paper in chosen:
            log(f"{paper['trackName']}: {paper['title']} ({paper['venue']})")
        return 0
    if not os.getenv("OPENAI_API_KEY"):
        raise SystemExit("OPENAI_API_KEY is required for automatic summaries; add it as a GitHub Actions repository secret")

    new_papers = []
    for paper in chosen:
        log(f"summarizing: {paper['title']}")
        summary = summarize(paper)
        new_papers.append({
            "trackId": paper["trackId"],
            "trackName": paper["trackName"],
            "title": paper["title"],
            "authors": paper["authors"],
            "venue": paper["venue"],
            "venueId": paper["venueId"],
            "publishedDate": paper["publishedDate"],
            "doi": paper["doi"],
            "url": paper["url"],
            "source": paper["source"],
            **summary,
        })

    existing_day = next((day for day in archive["days"] if day.get("date") == edition_date.isoformat()), None)
    if existing_day is None:
        archive["days"].append({"date": edition_date.isoformat(), "generatedAt": now.isoformat(), "papers": new_papers})
    else:
        existing_day.setdefault("papers", []).extend(new_papers)
        existing_day["generatedAt"] = now.isoformat()
    archive["days"].sort(key=lambda day: str(day.get("date", "")), reverse=True)
    archive["updatedAt"] = now.isoformat()
    ARCHIVE_PATH.write_text(json.dumps(archive, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    log(f"wrote {len(new_papers)} new papers to {ARCHIVE_PATH}")
    return 0

summarize_openai = summarize

def summarize(candidate: dict[str, Any]) -> dict[str, str]:
    if not os.getenv("OPENAI_API_KEY"):
        abstract = strip_markup(candidate.get("abstract", ""))
        sentences = [sentence.strip() for sentence in re.split(r"(?<=[.!?])\s+", abstract) if sentence.strip()]
        summary = " ".join(sentences[:2]) or f"This paper examines {candidate['title']}."
        methods = next((sentence for sentence in sentences if re.search(r"\b(propose|present|develop|design|introduce|method|framework|model|approach|experiment|evaluate)\w*\b", sentence, re.I)), "Not stated in the abstract.")
        return {"summary": summary, "contribution": sentences[0] if sentences else "Not stated in the abstract.", "methods": methods, "relevance": f"Relevant to {candidate['trackName']} based on the paper metadata and abstract.", "limitations": "Not stated in the abstract."}
    return summarize_openai(candidate)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        raise SystemExit(130)
