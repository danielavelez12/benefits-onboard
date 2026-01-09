"""
General helper functions for transaction processing and enrichment.
"""

import csv
import os
import httpx
from typing import Dict, List, Any
from datetime import datetime
from app.models import Transaction
from app.snap_classification import classify_income, classify_expense


def read_csv_transactions(csv_path: str) -> List[Dict[str, Any]]:
    """
    Read transactions from CSV file and return as list of dictionaries.

    Args:
        csv_path: Path to the CSV file

    Returns:
        List of transaction dictionaries
    """
    transactions = []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            transactions.append(
                {
                    "id": row["id"],
                    "description": row["description"],
                    "amount": float(row["amount"]),
                    "direction": row["direction"],
                    "iso_currency_code": row["iso_currency_code"],
                    "city": row.get("city", ""),
                    "region": row.get("region", ""),
                    "date_posted": row.get("date_posted", ""),
                    "mcc": row.get("mcc", ""),
                }
            )
    return transactions


def format_transactions_for_plaid(
    transactions: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Format transactions for Plaid enrich API.

    Args:
        transactions: List of transaction dictionaries from CSV

    Returns:
        List of transactions formatted for Plaid API
    """
    formatted = []
    for txn in transactions:
        plaid_txn = {
            "id": txn["id"],
            "description": txn["description"],
            "amount": txn["amount"],
            "direction": txn["direction"],
            "iso_currency_code": txn["iso_currency_code"],
        }

        # Add location if available
        if txn.get("city") or txn.get("region"):
            plaid_txn["location"] = {}
            if txn.get("city"):
                plaid_txn["location"]["city"] = txn["city"]
            if txn.get("region"):
                plaid_txn["location"]["region"] = txn["region"]

        # Add date_posted (use from CSV or current date as fallback)
        plaid_txn["date_posted"] = txn.get("date_posted") or datetime.now().strftime(
            "%Y-%m-%d"
        )

        # Add mcc if available
        if txn.get("mcc"):
            plaid_txn["mcc"] = txn["mcc"]

        formatted.append(plaid_txn)

    return formatted


async def enrich_transactions_with_plaid(
    transactions: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Enrich transactions using Plaid's enrich API.

    Args:
        transactions: List of transactions formatted for Plaid API

    Returns:
        Dictionary with enriched transactions
    """
    plaid_url = "https://sandbox.plaid.com/transactions/enrich"

    # Get Plaid credentials from environment variables
    client_id = os.getenv("PLAID_CLIENT_ID")
    secret = os.getenv("PLAID_SECRET")

    if not client_id:
        raise ValueError("PLAID_CLIENT_ID environment variable is not set")
    if not secret:
        raise ValueError("PLAID_SECRET environment variable is not set")

    payload = {
        "client_id": client_id,
        "secret": secret,
        "account_type": "depository",
        "transactions": transactions,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            plaid_url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30.0,
        )

        if response.status_code != 200:
            raise Exception(
                f"Plaid API error: {response.status_code} - {response.text}"
            )

        response_data = response.json()
        # Debug: print the response structure (more visible than logging)
        print("=" * 50)
        print("PLAID API RESPONSE DEBUG")
        print("=" * 50)
        if isinstance(response_data, dict):
            print(f"Response is a dict with keys: {list(response_data.keys())}")
            if "transactions" in response_data:
                transactions_list = response_data.get("transactions", [])
                print(f"Number of transactions in response: {len(transactions_list)}")
                if transactions_list:
                    print(
                        f"Sample transaction keys: {list(transactions_list[0].keys())}"
                    )
                    print(f"Sample transaction (first one): {transactions_list[0]}")
            else:
                print("No 'transactions' key in response")
                print(f"Full response: {response_data}")
        elif isinstance(response_data, list):
            print(f"Response is a list with {len(response_data)} items")
            if response_data:
                print(f"Sample item keys: {list(response_data[0].keys())}")
                print(f"Sample item (first one): {response_data[0]}")
        else:
            print(f"Response type: {type(response_data)}")
            print(f"Full response: {response_data}")
        print("=" * 50)

        return response_data  # type: ignore[no-any-return]


def merge_enriched_data(
    base_transactions: List[Dict[str, Any]],
    enriched_response: Dict[str, Any] | List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Merge enriched data from Plaid with base transaction data.

    Args:
        base_transactions: Original transactions from CSV
        enriched_response: Response from Plaid enrich API

    Returns:
        List of transactions with enriched data and SNAP classifications
    """
    # Plaid enrich API returns transactions in "enriched_transactions" key
    if isinstance(enriched_response, list):
        enriched_transactions: List[Dict[str, Any]] = enriched_response
    else:
        enriched_transactions = enriched_response.get("enriched_transactions", [])

    # Debug: print merge information
    print("=" * 50)
    print("MERGING ENRICHED DATA")
    print("=" * 50)
    print(f"Enriched transactions count: {len(enriched_transactions)}")
    if enriched_transactions:
        print(
            f"Sample enriched transaction keys: {list(enriched_transactions[0].keys())}"
        )
        if "enrichments" in enriched_transactions[0]:
            print(
                f"Sample enrichments keys: {list(enriched_transactions[0]['enrichments'].keys())}"
            )

    # Create a mapping by matching description, amount, and direction
    # (enriched transactions don't have IDs, they're matched by these fields)
    enriched_map = {}
    for txn in enriched_transactions:
        # Create a key from description, amount, and direction for matching
        key = (
            txn.get("description", ""),
            txn.get("amount"),
            txn.get("direction", ""),
        )
        enriched_map[key] = txn

    print(f"Enriched map size: {len(enriched_map)}")
    print(f"Base transactions count: {len(base_transactions)}")

    # Merge data
    merged: List[Dict[str, Any]] = []
    for base_txn in base_transactions:
        txn_id = str(base_txn["id"])
        # Match by description, amount, and direction
        match_key = (
            base_txn.get("description", ""),
            base_txn.get("amount"),
            base_txn.get("direction", ""),
        )
        enriched_txn = enriched_map.get(match_key, {})

        # Debug: print if we found enriched data (only print first few to avoid spam)
        if len(merged) < 3:
            if enriched_txn:
                enrichments = enriched_txn.get("enrichments", {})
                has_merchant = bool(enrichments.get("counterparties"))
                has_category = bool(enrichments.get("personal_finance_category"))
                print(
                    f"✓ Found enriched data for transaction {txn_id}: has merchant={has_merchant}, category={has_category}"
                )
            else:
                print(f"✗ No enriched data found for transaction {txn_id}")

        # Build merged transaction
        merged_txn = {
            "id": txn_id,
            "description": base_txn["description"],
            "amount": base_txn["amount"],
            "direction": base_txn["direction"],
            "iso_currency_code": base_txn["iso_currency_code"],
            "date": base_txn.get("date_posted")
            or base_txn.get("date")
            or datetime.now().strftime("%Y-%m-%d"),
            "type": "income" if base_txn["direction"] == "INFLOW" else "expense",
        }

        # Extract enriched fields from enrichments
        if enriched_txn:
            enrichments = enriched_txn.get("enrichments", {})

            # Get counterparties (merchants)
            counterparties = enrichments.get("counterparties", [])
            # Find the merchant counterparty (type == "merchant")
            merchant_counterparty = next(
                (cp for cp in counterparties if cp.get("type") == "merchant"), None
            )

            if merchant_counterparty:
                merged_txn["merchant_name"] = merchant_counterparty.get("name")
                merged_txn["logo_url"] = merchant_counterparty.get("logo_url")
                merged_txn["website"] = merchant_counterparty.get("website")
                merged_txn["entity_id"] = merchant_counterparty.get("entity_id")

            # Get personal finance category
            merged_txn["personal_finance_category"] = enrichments.get(
                "personal_finance_category", {}
            )

            # Get payment channel
            merged_txn["payment_channel"] = enrichments.get("payment_channel")

            # Get location
            merged_txn["location"] = enrichments.get("location", {})

            # Store all counterparties
            merged_txn["counterparties"] = counterparties

        # Add SNAP classification (income or expense based on type)
        if merged_txn.get("type") == "income":
            income_classification = classify_income(merged_txn)
            merged_txn["snap_classification"] = income_classification.to_dict()
        else:
            expense_classification = classify_expense(merged_txn)
            merged_txn["snap_classification"] = expense_classification.to_dict()
            # Debug for XCEL ENERGY
            if (
                "xcel" in merged_txn.get("description", "").lower()
                or "energy" in merged_txn.get("description", "").lower()
            ):
                print(
                    f"DEBUG XCEL: desc={merged_txn.get('description')}, merchant={merged_txn.get('merchant_name')}, category={merged_txn.get('personal_finance_category')}, result={expense_classification.to_dict()}"
                )

        merged.append(merged_txn)

    return merged
