# utils/news_fetcher.py

import os
from datetime import datetime, timedelta

import requests

from dotenv import load_dotenv
load_dotenv()

NEWS_API_BASE_URL = "https://newsapi.org/v2/everything"
NEWS_API_KEY = os.getenv("NEWS_API_KEY")


class NewsAPIError(Exception):
    """Custom exception for news fetching errors."""
    pass


def _build_query(ticker: str, company_name: str | None = None) -> str:
    """
    Build a search query for NewsAPI.
    Example: '"AAPL" OR "Apple Inc" stock'
    """
    if company_name:
        return f'"{ticker}" OR "{company_name}" stock'
    return f'"{ticker}" stock'


def get_news_for_ticker(
    ticker: str,
    limit: int = 10,
    company_name: str | None = None,
    days_back: int = 7,
) -> list[dict]:
    """
    Fetch recent financial/business news for a given ticker.

    Returns a list of dictionaries:
    [
      {
        "title": str,
        "description": str,
        "url": str,
        "source": str,
        "published_at": str (ISO 8601),
      },
      ...
    ]
    """

    if not NEWS_API_KEY:
        raise NewsAPIError("NEWS_API_KEY not set in environment")

    # Time window for news
    to_date = datetime.utcnow()
    from_date = to_date - timedelta(days=days_back)

    query = _build_query(ticker, company_name)

    params = {
        "q": query,
        "language": "en",
        "from": from_date.isoformat(timespec="seconds") + "Z",
        "to": to_date.isoformat(timespec="seconds") + "Z",
        "sortBy": "publishedAt",
        "pageSize": limit,
        "apiKey": NEWS_API_KEY,
    }

    try:
        resp = requests.get(NEWS_API_BASE_URL, params=params, timeout=10)
    except requests.RequestException as e:
        raise NewsAPIError(f"Request to NewsAPI failed: {e}") from e

    if resp.status_code != 200:
        # Useful error for debugging
        raise NewsAPIError(
            f"NewsAPI returned status {resp.status_code}: {resp.text[:200]}"
        )

    data = resp.json()

    # NewsAPI uses "status": "ok" / "error"
    if data.get("status") != "ok":
        raise NewsAPIError(f"NewsAPI error: {data}")

    articles = data.get("articles", [])

    # Normalize to a clean, consistent format for your API
    normalized = []
    for article in articles:
        normalized.append(
            {
                "title": article.get("title"),
                "description": article.get("description"),
                "url": article.get("url"),
                "source": (article.get("source") or {}).get("name"),
                "published_at": article.get("publishedAt"),
            }
        )

    return normalized