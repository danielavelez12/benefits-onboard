"""
Data models for the benefits onboarding application.
All data classes used throughout the application are defined here.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Dict, Any, List


class IncomeState(str, Enum):
    """States for income classification."""

    COUNTABLE_INCOME = "COUNTABLE_INCOME"
    EXCLUDED_INCOME = "EXCLUDED_INCOME"
    NOT_INCOME = "NOT_INCOME"
    FLAG_FOR_REVIEW = "FLAG_FOR_REVIEW"


class IncomeType(str, Enum):
    """Types of income."""

    EARNED_INCOME = "EARNED_INCOME"
    UNEARNED_INCOME = "UNEARNED_INCOME"


class ExpenseState(str, Enum):
    """States for expense classification."""

    COUNTABLE_DEDUCTION = "COUNTABLE_DEDUCTION"
    NOT_DEDUCTIBLE = "NOT_DEDUCTIBLE"
    NOT_EXPENSE = "NOT_EXPENSE"
    FLAG_FOR_REVIEW = "FLAG_FOR_REVIEW"


class DeductionType(str, Enum):
    """Types of SNAP deductions."""

    SHELTER = "SHELTER"
    UTILITIES = "UTILITIES"
    MEDICAL = "MEDICAL"
    CHILDCARE = "CHILDCARE"
    CHILD_SUPPORT_PAID = "CHILD_SUPPORT_PAID"
    LEGAL_CHILD_SUPPORT = "LEGAL_CHILD_SUPPORT"
    NONE = "NONE"


class Confidence(str, Enum):
    """Confidence levels for classifications."""

    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class TransactionDirection(str, Enum):
    """Transaction direction."""

    INFLOW = "INFLOW"
    OUTFLOW = "OUTFLOW"


class TransactionType(str, Enum):
    """Transaction type."""

    INCOME = "income"
    EXPENSE = "expense"


@dataclass
class SnapClassification:
    """Classification result for SNAP income purposes."""

    final_state: IncomeState
    income_type: Optional[IncomeType] = None
    category: Optional[str] = None  # e.g., BANK_INTEREST, WAGES, etc.
    reason_code: Optional[str] = None  # WHY it was classified this way
    confidence: Confidence = Confidence.MEDIUM

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        result = {
            "final_state": self.final_state.value,
            "confidence": self.confidence.value,
        }
        if self.income_type is not None:
            result["income_type"] = self.income_type.value
        if self.category is not None:
            result["category"] = self.category
        if self.reason_code is not None:
            result["reason_code"] = self.reason_code
        return result


@dataclass
class ExpenseClassification:
    """Classification result for SNAP expense/deduction purposes."""

    final_state: ExpenseState
    deduction_type: Optional[DeductionType] = None
    category: Optional[str] = None  # RENT, ELECTRIC, RX_COPAY, etc.
    reason_code: Optional[str] = None
    confidence: Confidence = Confidence.MEDIUM

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        result = {
            "final_state": self.final_state.value,
            "confidence": self.confidence.value,
        }
        if self.deduction_type is not None:
            result["deduction_type"] = self.deduction_type.value
        if self.category is not None:
            result["category"] = self.category
        if self.reason_code is not None:
            result["reason_code"] = self.reason_code
        return result


@dataclass
class Transaction:
    """Represents a financial transaction."""

    id: Optional[str] = None
    date: Optional[str] = None
    description: str = ""
    amount: float = 0.0
    direction: Optional[TransactionDirection] = None
    type: Optional[TransactionType] = None
    iso_currency_code: str = "USD"
    merchant_name: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    entity_id: Optional[str] = None
    personal_finance_category: Optional[Dict[str, Any]] = None
    payment_channel: Optional[str] = None
    location: Optional[Dict[str, Any]] = None
    counterparties: Optional[List[Dict[str, Any]]] = None
    snap_classification: Optional[Dict[str, Any]] = None
    city: Optional[str] = None
    region: Optional[str] = None
    date_posted: Optional[str] = None
    mcc: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        result: Dict[str, Any] = {
            "id": self.id,
            "date": self.date,
            "description": self.description,
            "amount": self.amount,
            "iso_currency_code": self.iso_currency_code,
        }
        if self.direction is not None:
            result["direction"] = self.direction.value
        if self.type is not None:
            result["type"] = self.type.value

        # Add optional fields if they exist
        if self.merchant_name:
            result["merchant_name"] = self.merchant_name
        if self.logo_url:
            result["logo_url"] = self.logo_url
        if self.website:
            result["website"] = self.website
        if self.entity_id:
            result["entity_id"] = self.entity_id
        if self.personal_finance_category:
            result["personal_finance_category"] = self.personal_finance_category
        if self.payment_channel:
            result["payment_channel"] = self.payment_channel
        if self.location:
            result["location"] = self.location
        if self.counterparties:
            result["counterparties"] = self.counterparties
        if self.snap_classification:
            result["snap_classification"] = self.snap_classification
        if self.city:
            result["city"] = self.city
        if self.region:
            result["region"] = self.region
        if self.date_posted:
            result["date_posted"] = self.date_posted
        if self.mcc:
            result["mcc"] = self.mcc

        return result


@dataclass
class BankStatementResult:
    """Result from processing a bank statement."""

    transactions: List[Dict[str, Any]] = field(default_factory=list)
    total_expenses: float = 0.0
    total_income: float = 0.0
    period: str = ""
    error: Optional[str] = None
    raw_response: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        result = {
            "transactions": self.transactions,
            "totalExpenses": float(self.total_expenses),
            "totalIncome": float(self.total_income),
            "period": self.period,
        }
        if self.error:
            result["error"] = self.error
        if self.raw_response:
            result["raw_response"] = self.raw_response
        return result
