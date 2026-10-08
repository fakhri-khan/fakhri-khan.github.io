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
    # OpenAI summaries are optional; summarize() uses source-grounded fallbacks when no key is configured.




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







def summarize(candidate: dict[str, Any]) -> dict[str, str]:
    if True:
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
