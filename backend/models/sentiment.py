# models/sentiment.py
"""
FinBERT sentiment module.

Provides:
- load_model(): lazily loads tokenizer & model (transformers)
- analyze_headlines(articles: list[dict], batch_size=16) -> dict:
    {
        "per_article": [ { **article, "sentiment": {"label": "positive", "score": 0.87} }, ... ],
        "overall": { "label": "positive"|"neutral"|"negative", "score": 0.72 }
    }

Notes:
- Requires `transformers` and `torch` installed (can run CPU-only).
- Model choice: uses a finance-tuned BERT variant. If you want a different model,
  change MODEL_NAME below. Typical options: "ProsusAI/finbert" or other community models.
"""

from __future__ import annotations

import logging
from typing import List, Dict, Any, Tuple
import math

import numpy as np

try:
    import torch
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    from torch.nn.functional import softmax
except Exception as e:
    # We'll defer raising until model loading if imports fail
    torch = None
    AutoTokenizer = None
    AutoModelForSequenceClassification = None
    softmax = None

logger = logging.getLogger(__name__)

# You can change this to another FinBERT model if you prefer
MODEL_NAME = "ProsusAI/finbert"  # common option; replace if unavailable

# module-level cache
_MODEL = None
_TOKENIZER = None
_LABEL_MAP = None
_DEVICE = None


def _load_model() -> Tuple[Any, Any, dict, Any]:
    """
    Lazily load tokenizer and model. Returns (model, tokenizer, id2label, device)
    """
    global _MODEL, _TOKENIZER, _LABEL_MAP, _DEVICE

    if _MODEL is not None and _TOKENIZER is not None:
        return _MODEL, _TOKENIZER, _LABEL_MAP, _DEVICE

    if AutoTokenizer is None or AutoModelForSequenceClassification is None:
        raise RuntimeError(
            "transformers/torch not installed or failed to import. "
            "Install `transformers` and `torch` (CPU version works)."
        )

    # device detection: GPU if available, else CPU
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info("Loading FinBERT model %s on device %s", MODEL_NAME, device)

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
    model.to(device)
    model.eval()

    # build id2label mapping
    # Transformers often provide config.id2label
    config = getattr(model, "config", None)
    if config and hasattr(config, "id2label"):
        id2label = {int(k): v.lower() for k, v in config.id2label.items()}
    else:
        # fallback: assume 3-class [negative, neutral, positive]
        id2label = {0: "negative", 1: "neutral", 2: "positive"}

    _MODEL = model
    _TOKENIZER = tokenizer
    _LABEL_MAP = id2label
    _DEVICE = device

    return _MODEL, _TOKENIZER, _LABEL_MAP, _DEVICE


def _predict_texts(texts: List[str], batch_size: int = 16) -> List[Tuple[str, float]]:
    """
    Predict sentiment labels & scores for a list of texts.
    Returns list of (label, score) where score is probability of chosen label (0..1).
    """

    model, tokenizer, id2label, device = _load_model()

    results = []
    # process in batches
    for i in range(0, len(texts), batch_size):
        batch_texts = texts[i : i + batch_size]
        # Tokenize (truncation to model max length)
        encoded = tokenizer(batch_texts, padding=True, truncation=True, return_tensors="pt")
        input_ids = encoded["input_ids"].to(device)
        attention_mask = encoded["attention_mask"].to(device)

        with torch.no_grad():
            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            logits = outputs.logits  # shape (batch, num_labels)
            probs = softmax(logits, dim=1).cpu().numpy()  # convert to numpy

        for prob_row in probs:
            idx = int(prob_row.argmax())
            label = id2label.get(idx, "neutral")
            score = float(prob_row[idx])
            results.append((label, score))

    return results


def analyze_headlines(articles: List[Dict[str, Any]], batch_size: int = 16) -> Dict[str, Any]:
    """
    Analyze a list of articles (each with 'title' and/or 'description').
    Returns per-article sentiments and an overall aggregated sentiment.

    Aggregation method:
    - Convert labels to scores: positive -> +score, negative -> -score, neutral -> 0
    - overall_score = mean(signed_scores) scaled to [0..1] via (x + 1)/2
    - overall_label chosen by sign of mean signed score with thresholds

    Output:
    {
        "per_article": [ { **article, "sentiment": {"label": str, "score": float} }, ... ],
        "overall": { "label": str, "score": float }
    }
    """
    if not articles:
        return {"per_article": [], "overall": {"label": None, "score": None}}

    # Build input texts from title + description fallback
    texts = []
    for a in articles:
        t = (a.get("title") or "").strip()
        d = (a.get("description") or "").strip()
        # prefer title; include description to give context
        combined = t if d == "" else f"{t}. {d}"
        if combined.strip() == "":
            combined = a.get("url", "")  # fallback: use url as last resort
        texts.append(combined)

    try:
        predictions = _predict_texts(texts, batch_size=batch_size)
    except Exception as e:
        logger.exception("Sentiment model prediction failed: %s", e)
        raise

    per_article = []
    signed_scores = []  # for aggregation
    for article, (label, score) in zip(articles, predictions):
        # For consistency, produce score in [0..1] with label
        article_sent = {"label": label, "score": round(float(score), 4)}
        per_article.append({**article, "sentiment": article_sent})

        if label == "positive":
            signed_scores.append(score)
        elif label == "negative":
            signed_scores.append(-score)
        else:  # neutral
            signed_scores.append(0.0)

    # aggregate
    mean_signed = float(np.mean(signed_scores)) if signed_scores else 0.0
    # rescale to [0..1]: (-1..1) -> (0..1)
    overall_score = (mean_signed + 1) / 2
    # choose label with thresholds
    if mean_signed >= 0.15:
        overall_label = "positive"
    elif mean_signed <= -0.15:
        overall_label = "negative"
    else:
        overall_label = "neutral"

    overall = {"label": overall_label, "score": round(overall_score, 4)}

    return {"per_article": per_article, "overall": overall}
