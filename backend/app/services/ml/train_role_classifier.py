"""Train the local resume role classifier from a labeled JSONL ZIP archive.

Only Summary, Skills, Experience, and Education are used. Contact fields and
names are removed before tokenization; raw records are never written to output.
"""
from __future__ import annotations

import argparse
import json
import math
import random
import re
import zipfile
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

TOKEN_RE = re.compile(r"[a-z][a-z0-9+#.]{1,}")
EMAIL_RE = re.compile(r"\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b")
PHONE_RE = re.compile(r"(?<!\w)\+?\d[\d\s().-]{7,}\d(?!\w)")
FIELDS = ("Summary", "Skills", "Experience", "Education")


def document(row: dict[str, Any]) -> str:
    name = str(row.get("Name", "")).strip()
    parts = []
    for field in FIELDS:
        value = str(row.get(field, ""))
        if name:
            value = re.sub(re.escape(name), " ", value, flags=re.IGNORECASE)
        value = EMAIL_RE.sub(" ", value)
        value = PHONE_RE.sub(" ", value)
        parts.append(value)
    return " ".join(parts).lower()


def tokens(text: str) -> list[str]:
    return TOKEN_RE.findall(text)


def load_records(archive: Path) -> list[tuple[str, str]]:
    records: list[tuple[str, str]] = []
    with zipfile.ZipFile(archive) as zf:
        jsonl_files = [name for name in zf.namelist() if name.lower().endswith(".jsonl")]
        if len(jsonl_files) != 1:
            raise ValueError(f"Expected one JSONL file in archive; found {len(jsonl_files)}")
        with zf.open(jsonl_files[0]) as stream:
            for line_number, raw in enumerate(stream, start=1):
                row = json.loads(raw)
                label = str(row.get("Category", "")).strip()
                text = document(row)
                if not label or len(text.strip()) < 30:
                    continue
                records.append((label, text))
    return records


def stratified_split(records: list[tuple[str, str]], seed: int) -> tuple[list[tuple[str, str]], list[tuple[str, str]]]:
    grouped: dict[str, list[str]] = defaultdict(list)
    for label, text in records:
        grouped[label].append(text)
    rng = random.Random(seed)
    train: list[tuple[str, str]] = []
    test: list[tuple[str, str]] = []
    for label, docs in sorted(grouped.items()):
        rng.shuffle(docs)
        test_size = max(1, round(len(docs) * 0.2))
        test.extend((label, text) for text in docs[:test_size])
        train.extend((label, text) for text in docs[test_size:])
    rng.shuffle(train)
    rng.shuffle(test)
    return train, test


def fit(records: list[tuple[str, str]]) -> dict[str, Any]:
    labels = sorted({label for label, _ in records})
    class_docs: Counter[str] = Counter()
    class_terms: dict[str, Counter[str]] = {label: Counter() for label in labels}
    vocabulary_counts: Counter[str] = Counter()
    for label, text in records:
        term_counts = Counter(tokens(text))
        class_docs[label] += 1
        class_terms[label].update(term_counts)
        vocabulary_counts.update(term_counts)
    vocabulary = {term for term, count in vocabulary_counts.items() if count >= 2}
    if not vocabulary:
        raise ValueError("Training data produced an empty vocabulary")
    filtered = {
        label: {term: count for term, count in class_terms[label].items() if term in vocabulary}
        for label in labels
    }
    totals = {label: sum(filtered[label].values()) for label in labels}
    return {
        "format_version": 1,
        "algorithm": "multinomial_naive_bayes",
        "alpha": 1.0,
        "labels": labels,
        "vocabulary": sorted(vocabulary),
        "vocabulary_size": len(vocabulary),
        "document_counts": dict(class_docs),
        "token_totals": totals,
        "token_counts": filtered,
        "training_documents": len(records),
    }


def score(model: dict[str, Any], text: str) -> list[tuple[str, float]]:
    vocabulary = set(model["vocabulary"])
    query = Counter(term for term in tokens(text) if term in vocabulary)
    labels = model["labels"]
    doc_counts = model["document_counts"]
    total_docs = sum(doc_counts.values())
    alpha = model["alpha"]
    vocab_size = model["vocabulary_size"]
    logs: list[tuple[str, float]] = []
    for label in labels:
        counts = model["token_counts"][label]
        denom = model["token_totals"][label] + alpha * vocab_size
        value = math.log(doc_counts[label] / total_docs)
        for term, count in query.items():
            value += count * math.log((counts.get(term, 0) + alpha) / denom)
        logs.append((label, value))
    max_log = max(value for _, value in logs)
    exp_scores = [(label, math.exp(value - max_log)) for label, value in logs]
    normalizer = sum(value for _, value in exp_scores)
    return sorted(((label, value / normalizer) for label, value in exp_scores), key=lambda item: item[1], reverse=True)


def evaluate(model: dict[str, Any], records: list[tuple[str, str]]) -> dict[str, float]:
    correct = 0
    top3 = 0
    for label, text in records:
        guesses = score(model, text)
        correct += guesses[0][0] == label
        top3 += label in {guess for guess, _ in guesses[:3]}
    count = max(1, len(records))
    return {"top1_accuracy": correct / count, "top3_accuracy": top3 / count, "holdout_documents": len(records)}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path, help="Path to the dataset ZIP")
    parser.add_argument("--output", type=Path, default=Path(__file__).with_name("role_classifier.json"))
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    records = load_records(args.archive)
    # Deduplicate by content (regardless of label) to prevent holdout leakage.
    seen_texts: set[str] = set()
    deduplicated: list[tuple[str, str]] = []
    for label, text in records:
        if text not in seen_texts:
            seen_texts.add(text)
            deduplicated.append((label, text))
    train, test = stratified_split(deduplicated, args.seed)
    model = fit(train)
    metrics = evaluate(model, test)
    model["metrics"] = metrics
    model["source_documents"] = len(records)
    model["deduplicated_documents"] = len(deduplicated)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(model, separators=(",", ":")), encoding="utf-8")

    print(f"Loaded documents: {len(records)}")
    print(f"Unique labeled documents: {len(deduplicated)}")
    print(f"Categories: {len(model['labels'])}")
    print(f"Vocabulary: {model['vocabulary_size']}")
    print(f"Holdout top-1 accuracy: {metrics['top1_accuracy']:.1%}")
    print(f"Holdout top-3 accuracy: {metrics['top3_accuracy']:.1%}")
    print(f"Model artifact: {args.output}")


if __name__ == "__main__":
    main()
