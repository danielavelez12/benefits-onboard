"""
SNAP classification functions using a rules engine pattern.
"""

from typing import Dict, Any, List
from app.models import SnapClassification, ExpenseClassification
from .rules import (
    IncomeRule,
    ExpenseRule,
    NotInflowOrNegativeAmountRule,
    NotIncomeKeywordsRule,
    ExcludeKeywordsRule,
    EarnedIncomeRule,
    UnearnedIncomeRule,
    BankInterestRule,
    GiftOrIrregularRule,
    DefaultIncomeRule,
    MissingAmountRule,
    NotExpenseRule,
    TransferKeywordsRule,
    CreditCardPaymentRule,
    ShelterRule,
    UtilitiesRule,
    ChildcareRule,
    MedicalRule,
    ChildSupportRule,
    DefaultExpenseRule,
)

# Income classification rules in evaluation order
INCOME_RULES: List[IncomeRule] = [
    NotInflowOrNegativeAmountRule(),
    NotIncomeKeywordsRule(),
    ExcludeKeywordsRule(),
    EarnedIncomeRule(),
    UnearnedIncomeRule(),
    BankInterestRule(),
    GiftOrIrregularRule(),
]

# Expense classification rules in evaluation order
EXPENSE_RULES: List[ExpenseRule] = [
    MissingAmountRule(),
    NotExpenseRule(),
    TransferKeywordsRule(),
    CreditCardPaymentRule(),
    ShelterRule(),
    UtilitiesRule(),
    ChildcareRule(),
    MedicalRule(),
    ChildSupportRule(),
]


def classify_income(transaction: Dict[str, Any]) -> SnapClassification:
    """
    Classify a transaction for SNAP income purposes using a rules engine.

    Args:
        transaction: Transaction dict with 'description', 'amount', 'type', 'direction'

    Returns:
        SnapClassification object
    """
    # Evaluate rules in order, return first match
    for rule in INCOME_RULES:
        result = rule.evaluate(transaction)
        if result is not None:
            return result

    # If no rule matched, use default
    default_rule = DefaultIncomeRule()
    return default_rule.evaluate(transaction)


def classify_expense(transaction: Dict[str, Any]) -> ExpenseClassification:
    """
    Classify an outflow as a SNAP deduction candidate using a rules engine.

    Args:
        transaction: Transaction dict with 'description', 'amount', 'type', 'direction'

    Returns:
        ExpenseClassification object
    """
    # Evaluate rules in order, return first match
    for rule in EXPENSE_RULES:
        result = rule.evaluate(transaction)
        if result is not None:
            return result

    # If no rule matched, use default
    default_rule = DefaultExpenseRule()
    return default_rule.evaluate(transaction)
