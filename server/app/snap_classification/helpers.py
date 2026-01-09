"""
Helper functions for SNAP classification.
"""

from typing import Dict, Any, List
from .constants import UTILITY_KEYWORDS


def contains_any_keyword(text: str, keywords: List[str]) -> bool:
    """Check if any keyword is present in the text."""
    return any(k in text for k in keywords)


def is_utility_category(plaid_category: Dict[str, Any]) -> bool:
    """Check if Plaid category indicates a utility."""
    if not plaid_category:
        return False
    primary = str(plaid_category.get("primary", "")).upper()
    detailed = str(plaid_category.get("detailed", "")).upper()
    return (
        "RENT_AND_UTILITIES" in primary
        or "RENT_AND_UTILITIES" in detailed
        or "GAS_AND_ELECTRICITY" in detailed
        or "UTILITIES" in primary
    )


def matches_utility_keyword(desc: str, merchant_name: str) -> bool:
    """Check if description or merchant name matches utility keywords."""
    matches = any(k in desc or k in merchant_name for k in UTILITY_KEYWORDS)

    # Additional check: if merchant name contains "energy" or "utility" companies
    if not matches and merchant_name:
        matches = any(
            term in merchant_name for term in ["energy", "electric", "gas", "utility", "power"]
        )

    return matches
