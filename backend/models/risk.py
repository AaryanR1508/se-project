# models/risk.py
"""
Risk module with enhanced accuracy for stock risk assessment.

Provides:
- compute_daily_returns(prices: List[float]) -> List[float]
- compute_volatility(prices: List[float]) -> float
- risk_level_from_volatility(vol: float) -> "Low"|"Medium"|"High"
- recommend_action(...) -> "Buy"|"Hold"|"Sell"
- assemble_risk_report(...) -> dict
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


def risk_level_from_volatility(vol: float, low_threshold: float = 0.012, high_threshold: float = 0.030) -> str:
    """
    Map volatility to risk level with calibrated thresholds.
    
    Thresholds based on typical stock market volatility:
    - Low: < 1.2% daily volatility (stable stocks)
    - Medium: 1.2% - 3.0% daily volatility (normal market)
    - High: > 3.0% daily volatility (volatile/risky stocks)
    
    For context:
    - S&P 500 average: ~1.0-1.5%
    - Individual stocks: ~1.5-2.5%
    - Volatile stocks: >3.0%
    """
    if vol < low_threshold:
        return "Low"
    if vol < high_threshold:
        return "Medium"
    return "High"


def compute_short_term_trend(prices: List[float], days: int = 5) -> float:
    """
    Compute a simple short-term trend (slope) over the last `days` days.
    Returns slope normalized by price.
    """
    n = min(days, len(prices))
    if n < 2:
        return 0.0
    y = np.array(prices[-n:], dtype=float)
    x = np.arange(n, dtype=float)
    
    x_mean = x.mean()
    y_mean = y.mean()
    denom = ((x - x_mean) ** 2).sum()
    
    if denom == 0:
        return 0.0
        
    slope = ((x - x_mean) * (y - y_mean)).sum() / denom
    
    # normalize slope by mean price to get relative change per day
    rel_slope = float(slope / (y_mean if y_mean != 0 else 1.0))
    return rel_slope


def recommend_action(volatility: float, overall_sentiment_score: float | None, short_term_trend: float) -> str:
    """
    Enhanced decision logic with weighted scoring system.
    
    Combines sentiment, trend, and volatility for actionable recommendations.
    Calibrated to avoid excessive "Hold" recommendations.
    """
    score = 0
    
    # --- 1. Sentiment Scoring (Weight: High) ---
    sent = overall_sentiment_score if overall_sentiment_score is not None else 0.5
    
    if sent > 0.70:       # Very Positive
        score += 3
    elif sent > 0.55:     # Positive
        score += 2
    elif sent > 0.52:     # Mildly Positive
        score += 1
    elif sent < 0.30:     # Very Negative
        score -= 3
    elif sent < 0.45:     # Negative
        score -= 2
    elif sent < 0.48:     # Mildly Negative
        score -= 1
    # else: Neutral (0)

    # --- 2. Trend Scoring (Weight: High) ---
    # 0.001 = 0.1% daily change, 0.003 = 0.3% daily change
    if short_term_trend > 0.005:      # Strong Uptrend (>0.5% daily)
        score += 3
    elif short_term_trend > 0.002:    # Uptrend (>0.2% daily)
        score += 2
    elif short_term_trend > 0.0005:   # Mild Uptrend
        score += 1
    elif short_term_trend < -0.005:   # Strong Downtrend
        score -= 3
    elif short_term_trend < -0.002:   # Downtrend
        score -= 2
    elif short_term_trend < -0.0005:  # Mild Downtrend
        score -= 1

    # --- 3. Volatility/Risk Adjustment (Weight: Medium) ---
    risk = risk_level_from_volatility(volatility)
    
    if risk == "High":
        # High volatility increases risk - penalize buying
        if score > 0:
            score -= 2
        else:
            score -= 1
    elif risk == "Low":
        # Low volatility is favorable - slight boost
        if score > 0:
            score += 1

    # --- 4. Final Decision with Calibrated Thresholds ---
    if score >= 2:
        return "Buy"
    elif score <= -2:
        return "Sell"
    else:
        return "Hold"


def assemble_risk_report(historical_prices: List[float], overall_sentiment_score: float | None) -> Dict[str, Any]:
    """
    Produce a comprehensive risk report dictionary.
    """
    if not historical_prices:
        return {
            "volatility": None,
            "risk_level": None,
            "short_term_trend": None,
            "recommendation": "Hold",
            "note": "No historical prices provided",
        }

    vol = compute_volatility(historical_prices)
    level = risk_level_from_volatility(vol)
    trend = compute_short_term_trend(historical_prices, days=5)
    rec = recommend_action(vol, overall_sentiment_score, trend)

    return {
        "volatility": round(vol * 100, 2),  # Convert to percentage for display
        "risk_level": level,
        "short_term_trend": round(trend, 6),
        "recommendation": rec,
    }