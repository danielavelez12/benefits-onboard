"""
SNAP (Supplemental Nutrition Assistance Program) classification module.
Uses a rules engine pattern to evaluate rules in order and return the first match.
"""

from .classifiers import classify_income, classify_expense

__all__ = ["classify_income", "classify_expense"]
