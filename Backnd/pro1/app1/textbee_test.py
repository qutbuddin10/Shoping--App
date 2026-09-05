import requests

from django.conf import settings


# =========================================================
# TEXTBEE SMS SERVICE
# =========================================================

def send_textbee_sms(mobile, message):

    device_id = settings.TEXTBEE_DEVICE_ID
    api_key = settings.TEXTBEE_API_KEY

    # =====================================================
    # MOBILE NUMBER FORMAT
    # =====================================================

    mobile = str(mobile).strip()

    mobile = (
        mobile
        .replace("+91", "")
        .replace(" ", "")
        .replace("-", "")
    )

    if not mobile.isdigit():
        raise ValueError("Invalid mobile number")

    if len(mobile) != 10:
        raise ValueError("Mobile number must be 10 digits")

    # =====================================================
    # TEXTBEE API
    # =====================================================

    url = (
        "https://api.textbee.dev/api/v1/gateway/devices/"
        f"{device_id}/send-sms"
    )

    # =====================================================
    # HEADERS
    # =====================================================

    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key,
    }

    # =====================================================
    # PAYLOAD
    # =====================================================

    payload = {
        "recipients": [
            f"+91{mobile}"
        ],
        "message": message,
    }

    # =====================================================
    # SEND SMS
    # =====================================================

    response = requests.post(
        url,
        json=payload,
        headers=headers,
        timeout=30,
    )

    # =====================================================
    # ERROR HANDLING
    # =====================================================

    if response.status_code not in [200, 201]:
        raise Exception(
            f"TextBee Error: {response.text}"
        )

    # =====================================================
    # RESPONSE
    # =====================================================

    return response.json()