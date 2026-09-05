import os

import razorpay


# =========================================================
# RAZORPAY CONFIGURATION
# =========================================================

RAZORPAY_KEY_ID = os.getenv(
    "RAZORPAY_KEY_ID"
)

RAZORPAY_KEY_SECRET = os.getenv(
    "RAZORPAY_KEY_SECRET"
)


# =========================================================
# RAZORPAY CLIENT
# =========================================================

client = razorpay.Client(
    auth=(
        RAZORPAY_KEY_ID,
        RAZORPAY_KEY_SECRET
    )
)


# =========================================================
# CREATE RAZORPAY ORDER
# =========================================================

def create_razorpay_order(
    amount,
    receipt,
    notes=None
):

    amount_in_paise = int(
        round(
            float(amount) * 100
        )
    )

    order_data = {
        "amount": amount_in_paise,
        "currency": "INR",
        "receipt": receipt,
    }

    if notes:

        order_data["notes"] = notes

    razorpay_order = client.order.create(
        data=order_data
    )

    return razorpay_order


# =========================================================
# VERIFY PAYMENT SIGNATURE
# =========================================================

def verify_razorpay_payment(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
):

    client.utility.verify_payment_signature(
        {
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature,
        }
    )

    return True


# =========================================================
# CREATE RAZORPAY REFUND
# =========================================================

def create_razorpay_refund(
    payment_id,
    amount,
    notes=None
):

    amount_in_paise = int(
        round(
            float(amount) * 100
        )
    )

    refund_data = {
        "amount": amount_in_paise,
    }

    if notes:

        refund_data["notes"] = notes

    refund = client.payment.refund(
        payment_id,
        refund_data
    )

    return refund