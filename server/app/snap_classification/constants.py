"""
Constants for SNAP classification keywords.
"""

# Income classification keywords
EXCLUDE_KEYWORDS = [
    "transfer",
    "zelle from self",
    "from my account",
    "internal transfer",
]

NOT_INCOME_KEYWORDS = [
    "reimbursement",
    "refund",
    "chargeback",
    "returned item",
    "cash advance",
    "loan",
    "disbursement",
    "venmo transfer between",
    "paypal transfer between",
]

EARNED_KEYWORDS = [
    "payroll",
    "paycheck",
    "wages",
    "salary",
    "direct deposit",
    "adp",
    "gusto",
    "workday",
    "paychex",
    "square payroll",
]

UNEARNED_KEYWORDS = [
    "unemployment",
    "social security",
    "ssi",
    "ssdi",
    "pension",
    "child support",
    "alimony",
]

BANK_INTEREST_KEYWORDS = [
    "interest earned",
    "interest",
    "int earned",
]

# Expense classification keywords
TRANSFER_KEYWORDS = [
    "transfer",
    "to savings",
    "internal transfer",
    "zelle to self",
    "venmo to self",
    "cash app to self",
]

CREDIT_CARD_PAYMENT_KEYWORDS = [
    "credit card payment",
    "cc payment",
    "payment to chase",
    "payment to amex",
    "payment to citi",
    "card payment",
]

SHELTER_KEYWORDS = [
    "rent",
    "landlord",
    "property mgmt",
    "property management",
    "leasing",
    "apt",
    "apartment",
    "mortgage",
    "mtg",
]

UTILITY_KEYWORDS = [
    "coned",
    "con ed",
    "con edison",
    "national grid",
    "electric",
    "gas bill",
    "energy",
    "xcel",
    "water",
    "sewer",
    "trash",
    "waste",
    "utility",
    "internet",
    "spectrum",
    "verizon fios",
    "comcast",
    "xfinity",
    "heat",
    "heating",
]

INTERNET_KEYWORDS = [
    "internet",
    "fios",
    "spectrum",
    "comcast",
    "xfinity",
]

ELECTRIC_KEYWORDS = [
    "electric",
    "coned",
    "con ed",
    "con edison",
]

GAS_KEYWORDS = [
    "national grid",
    "gas bill",
    "gas",
]

CHILDCARE_KEYWORDS = [
    "daycare",
    "childcare",
    "child care",
    "nursery",
    "preschool",
    "after school",
    "babysitter",
    "nanny",
    "care.com",
    "bright horizons",
    "kindercare",
]

MEDICAL_KEYWORDS = [
    "pharmacy",
    "rx",
    "prescription",
    "copay",
    "co-pay",
    "hospital",
    "clinic",
    "medical",
    "doctor",
    "dental",
    "vision",
    "therap",
    "medicare",
    "medicaid premium",
]

CHILD_SUPPORT_KEYWORDS = [
    "child support",
    "support payment",
    "iv-d",
    "ocse",
]
