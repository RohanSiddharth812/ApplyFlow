import re
from typing import List, Dict, Any

def normalize_string(val: str) -> str:
    if not val:
        return ""
    # remove punctuation, multiple spaces, lowercase
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', '', val).lower()
    return " ".join(cleaned.split())

def deduplicate_jobs(raw_jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Groups jobs with similar title and company into a single canonical job entry
    with a merged list of job sources.
    """
    unique_map: Dict[str, Dict[str, Any]] = {}

    for item in raw_jobs:
        norm_title = normalize_string(item.get("title", ""))
        # simplify common suffix in title like "[Fresher]", "(Remote)", "- Full Time"
        norm_title = re.sub(r'\b(fresher|intern|remote|full time|entry level)\b', '', norm_title).strip()
        norm_company = normalize_string(item.get("company", ""))
        
        # Key on company + simplified title
        dedup_key = f"{norm_company}::{norm_title}"

        if dedup_key in unique_map:
            # Merge sources
            existing = unique_map[dedup_key]
            existing_sources = existing.setdefault("sources", [])
            new_source = {
                "source_name": item.get("source", "External"),
                "source_url": item.get("source_url", item.get("application_url", ""))
            }
            if not any(s.get("source_name") == new_source["source_name"] for s in existing_sources):
                existing_sources.append(new_source)
        else:
            canonical = dict(item)
            sources = canonical.setdefault("sources", [])
            sources.append({
                "source_name": item.get("source", "Direct"),
                "source_url": item.get("source_url", item.get("application_url", ""))
            })
            unique_map[dedup_key] = canonical

    return list(unique_map.values())
