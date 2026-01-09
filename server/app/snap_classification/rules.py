"""
SNAP classification rules.
Each rule is a class with an evaluate method that takes a transaction and returns Optional[Classification].
Rules are evaluated in order, and the first match wins.
"""

from typing import Dict, Any, Optional
from abc import ABC, abstractmethod
from app.models import (
    SnapClassification,
    ExpenseClassification,
    IncomeState,
    IncomeType,
    ExpenseState,
    DeductionType,
    Confidence,
    TransactionDirection,
    TransactionType,
)
from .constants import (
    EXCLUDE_KEYWORDS,
    NOT_INCOME_KEYWORDS,
    EARNED_KEYWORDS,
    UNEARNED_KEYWORDS,
    BANK_INTEREST_KEYWORDS,
    TRANSFER_KEYWORDS,
    CREDIT_CARD_PAYMENT_KEYWORDS,
    SHELTER_KEYWORDS,
    INTERNET_KEYWORDS,
    ELECTRIC_KEYWORDS,
    GAS_KEYWORDS,
    CHILDCARE_KEYWORDS,
    MEDICAL_KEYWORDS,
    CHILD_SUPPORT_KEYWORDS,
)
from .helpers import (
    contains_any_keyword,
    is_utility_category,
    matches_utility_keyword,
)


# ============================================================================
# Base Rule Classes
# ============================================================================


class IncomeRule(ABC):
    """Base class for income classification rules."""

    @abstractmethod
    def evaluate(self, transaction: Dict[str, Any]) -> Optional[SnapClassification]:
        """
        Evaluate the rule against a transaction.

        Args:
            transaction: Transaction dict with 'description', 'amount', 'type', 'direction'

        Returns:
            SnapClassification if rule matches, None otherwise
        """
        pass


class ExpenseRule(ABC):
    """Base class for expense classification rules."""

    @abstractmethod
    def evaluate(self, transaction: Dict[str, Any]) -> Optional[ExpenseClassification]:
        """
        Evaluate the rule against a transaction.

        Args:
            transaction: Transaction dict with 'description', 'amount', 'type', 'direction'

        Returns:
            ExpenseClassification if rule matches, None otherwise
        """
        pass


# ============================================================================
# Income Classification Rules
# ============================================================================


class NotInflowOrNegativeAmountRule(IncomeRule):
    """Rule: If not an inflow or has negative amount, it's not income."""

    def evaluate(self, transaction: Dict[str, Any]) -> Optional[SnapClassification]:
        direction = transaction.get("direction", "").strip().upper()
        amount = transaction.get("amount", 0)

        if direction == TransactionDirection.INFLOW.value and amount <= 0:
            return SnapClassification(
                final_state=IncomeState.NOT_INCOME,
                reason_code="OUTFLOW_OR_NONPOSITIVE",
                confidence=Confidence.HIGH,
            )

        if direction != TransactionDirection.INFLOW.value:
            return SnapClassification(
                final_state=IncomeState.NOT_INCOME,
                reason_code="OUTFLOW_TRANSACTION",
                confidence=Confidence.HIGH,
            )

        return None


class NotIncomeKeywordsRule(IncomeRule):
    """Rule: Check for keywords that indicate not income."""

    def evaluate(self, transaction: Dict[str, Any]) -> Optional[SnapClassification]:
        desc = (transaction.get("description") or "").strip().lower()

        if contains_any_keyword(desc, NOT_INCOME_KEYWORDS):
            return SnapClassification(
                final_state=IncomeState.NOT_INCOME,
                reason_code="REIMBURSEMENT_REFUND_LOAN_OR_SIMILAR",
                confidence=Confidence.MEDIUM,
            )

        return None


class ExcludeKeywordsRule(IncomeRule):
    """Rule: Check for exclude keywords (transfers, etc.)."""

    def evaluate(self, transaction: Dict[str, Any]) -> Optional[SnapClassification]:
        desc = (transaction.get("description") or "").strip().lower()

        if contains_any_keyword(desc, EXCLUDE_KEYWORDS):
            return SnapClassification(
                final_state=IncomeState.NOT_INCOME,
                reason_code="INTERNAL_TRANSFER_OR_NONINCOME_TRANSFER",
                confidence=Confidence.MEDIUM,
            )

        return None


class EarnedIncomeRule(IncomeRule):
    """Rule: Check for earned income keywords."""

    def evaluate(self, transaction: Dict[str, Any]) -> Optional[SnapClassification]:
        desc = (transaction.get("description") or "").strip().lower()
        txn_type = transaction.get("type", "").strip().lower()

        if contains_any_keyword(desc, EARNED_KEYWORDS) or "payroll" in txn_type:
            return SnapClassification(
                final_state=IncomeState.COUNTABLE_INCOME,
                income_type=IncomeType.EARNED_INCOME,
                category="WAGES_OR_PAYROLL",
                reason_code="EARNED_INCOME_SOURCE",
                confidence=Confidence.MEDIUM,
            )

        return None


class UnearnedIncomeRule(IncomeRule):
    """Rule: Check for unearned income keywords."""

    def evaluate(self, transaction: Dict[str, Any]) -> Optional[SnapClassification]:
        desc = (transaction.get("description") or "").strip().lower()

        if contains_any_keyword(desc, UNEARNED_KEYWORDS):
            return SnapClassification(
                final_state=IncomeState.COUNTABLE_INCOME,
                income_type=IncomeType.UNEARNED_INCOME,
                category="BENEFITS_OR_SUPPORT",
                reason_code="UNEARNED_INCOME_SOURCE",
                confidence=Confidence.MEDIUM,
            )

        return None


class BankInterestRule(IncomeRule):
    """Rule: Check for bank interest."""

    def evaluate(self, transaction: Dict[str, Any]) -> Optional[SnapClassification]:
        desc = (transaction.get("description") or "").strip().lower()
        txn_type = transaction.get("type", "").strip().lower()

        if contains_any_keyword(desc, BANK_INTEREST_KEYWORDS) or "interest" in txn_type:
            return SnapClassification(
                final_state=IncomeState.COUNTABLE_INCOME,
                income_type=IncomeType.UNEARNED_INCOME,
                category="BANK_INTEREST",
                reason_code="BANK_INTEREST_IS_UNEARNED_INCOME",
                confidence=Confidence.HIGH,
            )

        return None


class GiftOrIrregularRule(IncomeRule):
    """Rule: Check for gift or irregular income patterns."""

    def evaluate(self, transaction: Dict[str, Any]) -> Optional[SnapClassification]:
        desc = (transaction.get("description") or "").strip().lower()

        if "gift" in desc or "birthday" in desc:
            return SnapClassification(
                final_state=IncomeState.FLAG_FOR_REVIEW,
                reason_code="POSSIBLE_GIFT_OR_IRREGULAR_INCOME",
                confidence=Confidence.LOW,
            )

        return None


class DefaultIncomeRule(IncomeRule):
    """Default rule: Flag for review if we can't classify it."""

    def evaluate(self, transaction: Dict[str, Any]) -> SnapClassification:
        return SnapClassification(
            final_state=IncomeState.FLAG_FOR_REVIEW,
            reason_code="UNKNOWN_SOURCE",
            confidence=Confidence.LOW,
        )


# ============================================================================
# Expense Classification Rules
# ============================================================================


class MissingAmountRule(ExpenseRule):
    """Rule: Check for missing amount."""

    def evaluate(self, transaction: Dict[str, Any]) -> Optional[ExpenseClassification]:
        amount = transaction.get("amount", 0)

        if amount is None:
            return ExpenseClassification(
                final_state=ExpenseState.FLAG_FOR_REVIEW,
                reason_code="MISSING_AMOUNT",
                confidence=Confidence.LOW,
            )

        return None


class NotExpenseRule(ExpenseRule):
    """Rule: Check if it's not an expense transaction."""

    def evaluate(self, transaction: Dict[str, Any]) -> Optional[ExpenseClassification]:
        txn_type = (transaction.get("type") or "").strip().lower()
        amount = transaction.get("amount", 0)
        direction = transaction.get("direction", "").strip().upper()

        is_expense = (
            txn_type == TransactionType.EXPENSE.value
            or direction == TransactionDirection.OUTFLOW.value
            or amount < 0
        )

        if not is_expense:
            return ExpenseClassification(
                final_state=ExpenseState.NOT_EXPENSE,
                reason_code="NOT_AN_EXPENSE_TRANSACTION",
                confidence=Confidence.HIGH,
            )

        return None


class TransferKeywordsRule(ExpenseRule):
    """Rule: Check for transfer keywords."""

    def evaluate(self, transaction: Dict[str, Any]) -> Optional[ExpenseClassification]:
        desc = (transaction.get("description") or "").strip().lower()

        if contains_any_keyword(desc, TRANSFER_KEYWORDS):
            return ExpenseClassification(
                final_state=ExpenseState.NOT_EXPENSE,
                reason_code="INTERNAL_TRANSFER",
                confidence=Confidence.MEDIUM,
            )

        return None


class CreditCardPaymentRule(ExpenseRule):
    """Rule: Check for credit card payment keywords."""

    def evaluate(self, transaction: Dict[str, Any]) -> Optional[ExpenseClassification]:
        desc = (transaction.get("description") or "").strip().lower()

        if contains_any_keyword(desc, CREDIT_CARD_PAYMENT_KEYWORDS):
            return ExpenseClassification(
                final_state=ExpenseState.NOT_DEDUCTIBLE,
                deduction_type=DeductionType.NONE,
                category="CREDIT_CARD_PAYMENT",
                reason_code="PAYING_DEBT_NOT_DEDUCTION",
                confidence=Confidence.MEDIUM,
            )

        return None


class ShelterRule(ExpenseRule):
    """Rule: Check for shelter (rent/mortgage) keywords."""

    def evaluate(self, transaction: Dict[str, Any]) -> Optional[ExpenseClassification]:
        desc = (transaction.get("description") or "").strip().lower()
        merchant_name = (transaction.get("merchant_name") or "").strip().lower()
        plaid_category = transaction.get("personal_finance_category", {})
        is_rent_category = "RENT_AND_UTILITIES" in str(
            plaid_category.get("primary", "")
        ) and "RENT" in str(plaid_category.get("detailed", ""))

        if (
            is_rent_category
            or contains_any_keyword(desc, SHELTER_KEYWORDS)
            or contains_any_keyword(merchant_name, SHELTER_KEYWORDS)
        ):
            if "mortgage" in desc or "mtg" in desc:
                return ExpenseClassification(
                    final_state=ExpenseState.COUNTABLE_DEDUCTION,
                    deduction_type=DeductionType.SHELTER,
                    category="MORTGAGE",
                    reason_code="SHELTER_COST",
                    confidence=Confidence.MEDIUM,
                )
            return ExpenseClassification(
                final_state=ExpenseState.COUNTABLE_DEDUCTION,
                deduction_type=DeductionType.SHELTER,
                category="RENT",
                reason_code="SHELTER_COST",
                confidence=Confidence.MEDIUM,
            )

        return None


class UtilitiesRule(ExpenseRule):
    """Rule: Check for utility keywords."""

    def evaluate(self, transaction: Dict[str, Any]) -> Optional[ExpenseClassification]:
        desc = (transaction.get("description") or "").strip().lower()
        merchant_name = (transaction.get("merchant_name") or "").strip().lower()
        plaid_category = transaction.get("personal_finance_category", {})

        is_utility_category_result = is_utility_category(plaid_category)
        matches_utility_keyword_result = matches_utility_keyword(desc, merchant_name)

        if is_utility_category_result or matches_utility_keyword_result:
            if contains_any_keyword(desc, INTERNET_KEYWORDS):
                return ExpenseClassification(
                    final_state=ExpenseState.COUNTABLE_DEDUCTION,
                    deduction_type=DeductionType.UTILITIES,
                    category="INTERNET_OR_PHONE",
                    reason_code="UTILITY_EXPENSE_SUA_EVIDENCE",
                    confidence=Confidence.MEDIUM,
                )
            if contains_any_keyword(desc, ELECTRIC_KEYWORDS):
                return ExpenseClassification(
                    final_state=ExpenseState.COUNTABLE_DEDUCTION,
                    deduction_type=DeductionType.UTILITIES,
                    category="ELECTRIC",
                    reason_code="UTILITY_EXPENSE_SUA_EVIDENCE",
                    confidence=Confidence.MEDIUM,
                )
            if contains_any_keyword(desc, GAS_KEYWORDS):
                return ExpenseClassification(
                    final_state=ExpenseState.COUNTABLE_DEDUCTION,
                    deduction_type=DeductionType.UTILITIES,
                    category="GAS",
                    reason_code="UTILITY_EXPENSE_SUA_EVIDENCE",
                    confidence=Confidence.MEDIUM,
                )
            return ExpenseClassification(
                final_state=ExpenseState.COUNTABLE_DEDUCTION,
                deduction_type=DeductionType.UTILITIES,
                category="UTILITIES_OTHER",
                reason_code="UTILITY_EXPENSE_SUA_EVIDENCE",
                confidence=Confidence.LOW,
            )

        return None


class ChildcareRule(ExpenseRule):
    """Rule: Check for childcare keywords."""

    def evaluate(self, transaction: Dict[str, Any]) -> Optional[ExpenseClassification]:
        desc = (transaction.get("description") or "").strip().lower()

        if contains_any_keyword(desc, CHILDCARE_KEYWORDS):
            return ExpenseClassification(
                final_state=ExpenseState.COUNTABLE_DEDUCTION,
                deduction_type=DeductionType.CHILDCARE,
                category="DEPENDENT_CARE",
                reason_code="DEPENDENT_CARE_IF_WORK_OR_TRAINING",
                confidence=Confidence.MEDIUM,
            )

        return None


class MedicalRule(ExpenseRule):
    """Rule: Check for medical keywords."""

    def evaluate(self, transaction: Dict[str, Any]) -> Optional[ExpenseClassification]:
        desc = (transaction.get("description") or "").strip().lower()

        if contains_any_keyword(desc, MEDICAL_KEYWORDS):
            return ExpenseClassification(
                final_state=ExpenseState.FLAG_FOR_REVIEW,
                deduction_type=DeductionType.MEDICAL,
                category="MEDICAL_EXPENSE",
                reason_code="MEDICAL_DEDUCTION_ONLY_IF_ELDERLY_OR_DISABLED",
                confidence=Confidence.LOW,
            )

        return None


class ChildSupportRule(ExpenseRule):
    """Rule: Check for child support keywords."""

    def evaluate(self, transaction: Dict[str, Any]) -> Optional[ExpenseClassification]:
        desc = (transaction.get("description") or "").strip().lower()

        if contains_any_keyword(desc, CHILD_SUPPORT_KEYWORDS):
            return ExpenseClassification(
                final_state=ExpenseState.COUNTABLE_DEDUCTION,
                deduction_type=DeductionType.CHILD_SUPPORT_PAID,
                category="CHILD_SUPPORT",
                reason_code="CHILD_SUPPORT_PAYMENT",
                confidence=Confidence.MEDIUM,
            )

        return None


class DefaultExpenseRule(ExpenseRule):
    """Default rule: Not a countable deduction."""

    def evaluate(self, transaction: Dict[str, Any]) -> ExpenseClassification:
        return ExpenseClassification(
            final_state=ExpenseState.NOT_DEDUCTIBLE,
            reason_code="NOT_A_COUNTABLE_DEDUCTION",
            confidence=Confidence.MEDIUM,
        )
