# models/risk.py
"""
Risk module.

Provides:
- compute_daily_returns(prices: List[float]) -> List[float]
- compute_volatility(prices: List[float]) -> float  # std of daily returns
- risk_level_from_volatility(vol: float) -> "Low"|"Medium"|"High"
- recommend_action(volatility, overall_sentiment_score, short_term_trend) -> "Buy"|"Hold"|"Sell"
- assemble_risk_report(historical_prices: List[float], overall_sentiment_score: float) -> dict

Notes:
- historical_prices should be ordered oldest -> newest (e.g., 30-day history)
- overall_sentiment_score: from sentiment.overall["score"] (0..1 where >0.5 positive)
- short_term_trend is computed as slope over last N days (simple linear fit)
"""

from __future__ import annotations

import math
from typing import List, Dict, Any

import numpy as np


def compute_daily_returns(prices: List[float]) -> List[float]:
    """
    Compute simple daily returns: (p_t / p_{t-1}) - 1
    Returns length = len(prices) - 1
    """
    returns = []
    for i in range(1, len(prices)):
        prev = prices[i - 1]
        cur = prices[i]
        if prev == 0:
            returns.append(0.0)
        else:
            returns.append((cur / prev) - 1.0)
    return returns


def compute_volatility(prices: List[float]) -> float:
    """
    Compute volatility as the standard deviation of daily returns.
    Returns a positive float (e.g., 0.015 -> 1.5% daily stdev).
    """
    if len(prices) < 2:
        return 0.0
    returns = compute_daily_returns(prices)
    # use sample std (ddof=1) if more than 1 observation
    if len(returns) > 1:
        vol = float(np.std(returns, ddof=1))
    else:
        vol = float(np.std(returns, ddof=0))
    return vol


def risk_level_from_volatility(vol: float, low_threshold: float = 0.01, high_threshold: float = 0.025) -> str:
    """
    Map volatility to risk level:
    - vol < low_threshold -> Low
    - low_threshold <= vol < high_threshold -> Medium
    - vol >= high_threshold -> High

    Thresholds are daily volatility. Tune as needed.
    """
    if vol < low_threshold:
        return "Low"
    if vol < high_threshold:
        return "Medium"
    return "High"


def compute_short_term_trend(prices: List[float], days: int = 5) -> float:
    """
    Compute a simple short-term trend (slope) over the last `days` days.
    Returns slope normalized by price (approx percentage).
    If insufficient data, returns 0.0.

    Implementation: linear regression slope on (x, price) for last `days` points.
    """
    n = min(days, len(prices))
    if n < 2:
        return 0.0
    y = np.array(prices[-n:], dtype=float)
    x = np.arange(n, dtype=float)
    # slope via least squares: slope = cov(x,y)/var(x)
    x_mean = x.mean()
    y_mean = y.mean()
    denom = ((x - x_mean) ** 2).sum()
    if denom == 0:
        return 0.0
    slope = ((x - x_mean) * (y - y_mean)).sum() / denom
    # normalize slope by mean price to get relative change per day
    rel_slope = float(slope / (y_mean if y_mean != 0 else 1.0))
    return rel_slope


def recommend_action(volatility: float, overall_sentiment_score: float, short_term_trend: float) -> str:
    """
    Decision logic (simple heuristic):
    - sentiment_score in [0,1], where >0.55 is positive, <0.45 negative, else neutral
    - trend positive when short_term_trend > 0.001 (~0.1% per day)
    - volatility penalizes buys when High

    Returns "Buy", "Hold" or "Sell".
    """
    # sentiment
    if overall_sentiment_score is None:
        sentiment = "neutral"
    elif overall_sentiment_score > 0.55:
        sentiment = "positive"
    elif overall_sentiment_score < 0.45:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    # trend
    trend_pos = short_term_trend > 0.001
    trend_neg = short_term_trend < -0.001

    # volatility risk
    risk = risk_level_from_volatility(volatility)

    # heuristics
    if sentiment == "positive" and trend_pos and risk != "High":
        return "Buy"
    if sentiment == "negative" and trend_neg:
        return "Sell"
    # if volatility high and sentiment neutral, prefer Hold
    if risk == "High" and sentiment == "neutral":
        return "Hold"
    # if sentiment positive but volatility high -> Hold
    if sentiment == "positive" and risk == "High":
        return "Hold"
    # default
    return "Hold"


def assemble_risk_report(historical_prices: List[float], overall_sentiment_score: float | None) -> Dict[str, Any]:
    """
    Produce a risk report dictionary:
    {
        "volatility": 0.0123,
        "risk_level": "Medium",
        "short_term_trend": 0.0012,
        "recommendation": "Buy"
    }
    """
    if not historical_prices:
        return {
            "volatility": None,
            "risk_level": None,
            "short_term_trend": None,
            "recommendation": None,
            "note": "No historical prices provided",
        }

    vol = compute_volatility(historical_prices)
    level = risk_level_from_volatility(vol)
    trend = compute_short_term_trend(historical_prices, days=5)
    rec = recommend_action(vol, overall_sentiment_score, trend)

    return {
        "volatility": round(vol, 6),
        "risk_level": level,
        "short_term_trend": round(trend, 6),
        "recommendation": rec,
    }