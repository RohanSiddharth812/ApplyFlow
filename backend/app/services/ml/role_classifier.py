"""Inference for the locally trained resume role classifier."""
from __future__ import annotations

import json
import math
import re
from collections import Counter
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.services.ml.train_role_classifier import EMAIL_RE, PHONE_RE, tokens

MODEL_PATH = Path(__file__).with_name("role_classifier.json")


@lru_cache(maxsize=1)
def load_model() -> dict[str, Any]:
    with MODEL_PATH.open(encoding="utf-8") as model_file:
        return json.load(model_file)


def classify_resume(text: str, private_values: list[str] | None = None, limit: int = 3) -> dict[str, Any]:
    model = load_model()
    cleaned = EMAIL_RE.sub(" ", text)
    cleaned = PHONE_RE.sub(" ", cleaned)
    for value in private_values or []:
        value = value.strip()
        if len(value) >= 3:
            cleaned = re.sub(re.escape(value), " ", cleaned, flags=re.IGNORECASE)

    vocabulary = set(model["vocabulary"])
    query = Counter(term for term in tokens(cleaned.lower()) if term in vocabulary)
    labels = model["labels"]
    docs = model["document_counts"]
    total_docs = sum(docs.values())
    alpha = model["alpha"]
    vocab_size = model["vocabulary_size"]
    log_scores = []
    for label in labels:
        class_terms = model["token_counts"][label]
        denominator = model["token_totals"][label] + alpha * vocab_size
        value = math.log(docs[label] / total_docs)
        for term, count in query.items():
            value += count * math.log((class_terms.get(term, 0) + alpha) / denominator)
        log_scores.append((label, value))

    ranked = sorted(log_scores, key=lambda item: item[1], reverse=True)
    return {
        "predictions": [
            {"role": label}
            for label, _score in ranked[:limit]
        ],
        "metrics": model["metrics"],
        "algorithm": model["algorithm"],
    }
