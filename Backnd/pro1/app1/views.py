from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .services.razorpay_service import (
    RAZORPAY_KEY_ID,
    client,
    create_razorpay_order,
    verify_razorpay_payment,
    create_razorpay_refund,
)
import json
from decimal import Decimal
from datetime import datetime, timedelta
import requests as http_requests
from django.core.files.storage import default_storage
from django.db import transaction
from pip._internal.network import session
from django.db.models import Q,Sum
from .models import *
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.contrib.auth.hashers import check_password
import random
from django.core.mail import send_mail
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone

GOOGLE_CLIENT = "916796302479-qnoocdhcklebt40ajm7sjv06eehol1r2.apps.googleusercontent.com"

def google_login(req):
    if req.method != "POST":
        return JsonResponse(
            {"msg": "Invalid Request Method"},status=405
        )
    try:
        body = json.loads(req.body)
        token = body.get("token")

        if not token:
            return JsonResponse({"msg": "Token missing"}, status=400)

        user_info = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            GOOGLE_CLIENT,
            clock_skew_in_seconds=300
        )

        email = user_info["email"]
        name = user_info["name"]
        picture = user_info.get("picture","")

        user = users.objects.filter(
            email=email
        ).first()

        if not user:
            user = users.objects.create(
                full_name=name,
                email=email,
                password="0",
            )

        req.session["user_id"] = user.id
        req.session["user_email"] = user.email
        req.session["user_name"] = user.full_name
        req.session.modified = True


        return JsonResponse({
                "msg": "Login Successful",
                "user": {
                    "id":user.id,
                    "name":user.full_name,
                    "email":user.email,
                    "picture":picture,
                }
            },status=200)

    except ValueError as v:
        import traceback

        traceback.print_exc()

        return JsonResponse(
            {
                "msg":str(v),
                "type":str(type(v)),
            },status=401
        )
    except Exception as e:
        return JsonResponse(
            {
                "msg":str(e),
            },status=500
        )


def register(req):

    if req.method == "POST":

        data = json.loads(req.body)

        r_name = data.get("fn")
        r_email = data.get("em")
        r_mobile = data.get("mb")
        r_password = data.get("pw")

        # Empty Field Validation
        if not r_name or not r_email or not r_mobile or not r_password:
            return JsonResponse(
                {"msg": "All Fields Are Required"},
                status=400
            )

        # Email Already Exists
        if users.objects.filter(email=r_email).exists():
            return JsonResponse(
                {"msg": "Email Already Exists"},
                status=400
            )

        # Mobile Already Exists
        if users.objects.filter(mobile=r_mobile).exists():
            return JsonResponse(
                {"msg": "Mobile Number Already Exists"},
                status=400
            )

        # Mobile Must Be Numeric
        if not r_mobile.isdigit():
            return JsonResponse(
                {"msg": "Mobile Number Must Contain Only Digits"},
                status=400
            )

        # Mobile Length
        if len(r_mobile) != 10:
            return JsonResponse(
                {"msg": "Mobile Number Must Be 10 Digits"},
                status=400
            )

        # Password Length
        if len(r_password) < 8:
            return JsonResponse(
                {"msg": "Password Must Be At Least 8 Characters"},
                status=400
            )


        # Save User
        users.objects.create(
            full_name=r_name,
            email=r_email,
            mobile=r_mobile,
            password=r_password
        )

        return JsonResponse(
            {"msg": "Registration Successful"},
            status=200
        )

    else:

        return JsonResponse(
        {"msg": "Invalid Request Method"},
        status=405)



def login(req):

    if req.method != "POST":
        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    try:

        data = json.loads(req.body)

        l_email = data.get("em")
        l_password = data.get("pw")

        if not l_email or not l_password:
            return JsonResponse(
                {
                    "msg": "All Fields Are Required"
                },
                status=400
            )

        user = users.objects.filter(
            email=l_email
        ).first()

        if not user:
            return JsonResponse(
                {
                    "msg": "Invalid Email or password !!"
                },
                status=400
            )

        if user.password != l_password:
            return JsonResponse(
                {
                    "msg": "Invalid Email or password !!"
                },
                status=400
            )

        # =====================================================
        # IMPORTANT SESSION RULE
        # =====================================================
        # A browser shares the Django session cookie between tabs.
        #
        # Therefore:
        #   - admin login MUST NOT overwrite user_id
        #   - user login MUST NOT remove admin_id
        #
        # This allows a customer tab and an admin tab to work
        # at the same time without changing the customer attached
        # to a newly placed order.

        # =====================================================
        # ADMIN LOGIN
        # =====================================================

        if user.Role and user.Role.lower() == "admin":

            # Find the actual Admin record using the same email.
            # The admin session MUST store Admin.id,
            # because all admin APIs validate against Admin.objects.

            admin = Admin.objects.filter(
                email__iexact=user.email
            ).first()

            if not admin:
                return JsonResponse(
                    {
                        "msg": "Admin account not found"
                    },
                    status=404
                )

            # IMPORTANT:
            # Do NOT set user_id here.
            # Keep the customer session independent.

            req.session["admin_id"] = admin.id
            req.session["admin_email"] = admin.email
            req.session["admin_name"] = admin.full_name

            req.session.modified = True
            req.session.save()

            return JsonResponse(
                {
                    "msg": "Login Successful",
                    "role": "admin",
                    "user": {
                        "id": user.id,
                        "name": user.full_name,
                        "email": user.email,
                    },
                    "admin": {
                        "id": admin.id,
                        "name": admin.full_name,
                        "email": admin.email,
                    }
                },
                status=200
            )

        # =====================================================
        # NORMAL CUSTOMER LOGIN
        # =====================================================
        # Set only customer session keys.
        # Never remove/overwrite an existing admin session.

        req.session["user_id"] = user.id
        req.session["user_email"] = user.email
        req.session["user_name"] = user.full_name
        req.session["role"] = user.Role

        req.session.modified = True
        req.session.save()

        # =====================================================
        # RESPONSE
        # =====================================================

        return JsonResponse(
            {
                "msg": "Login Successful",
                "role": "user",
                "user": {
                    "id": user.id,
                    "name": user.full_name,
                    "email": user.email,
                }
            },
            status=200
        )

    except Exception as e:

        return JsonResponse(
            {
                "msg": str(e)
            },
            status=500
        )
        
def send_textbee_sms(mobile, message):

    device_id = settings.TEXTBEE_DEVICE_ID
    api_key = settings.TEXTBEE_API_KEY

    url = (
        "https://api.textbee.dev/api/v1/gateway/devices/"
        f"{device_id}/send-sms"
    )

    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key,
    }

    payload = {
        "recipients": [
            f"+91{mobile}"
        ],
        "message": message,
    }

    response = http_requests.post(
        url,
        json=payload,
        headers=headers,
        timeout=30,
    )

    if response.status_code not in [200, 201]:
        raise Exception(
            f"TextBee Error: {response.text}"
        )

    return response.json()


def forget_password(req):

    if req.method != "POST":

        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    try:

        data = json.loads(req.body)

        identifier = str(
            data.get("identifier", "")
        ).strip()

        if not identifier:

            return JsonResponse(
                {
                    "msg": "Email or Mobile Number is Required"
                },
                status=400
            )

        # =====================================================
        # FIND USER BY EMAIL OR MOBILE
        # =====================================================

        user = None
        reset_method = None

        # First check email
        if "@" in identifier:

            user = users.objects.filter(
                email__iexact=identifier
            ).first()

            if user:
                reset_method = "email"

        # If not email user, check mobile
        if not user:

            mobile = (
                identifier
                .replace("+91", "")
                .replace(" ", "")
                .replace("-", "")
            )

            if not mobile.isdigit() or len(mobile) != 10:

                return JsonResponse(
                    {
                        "msg": "Enter a valid email or 10 digit mobile number"
                    },
                    status=400
                )

            user = users.objects.filter(
                mobile=mobile
            ).first()

            if user:
                reset_method = "mobile"

        # =====================================================
        # USER NOT FOUND
        # =====================================================

        if not user:

            return JsonResponse(
                {
                    "msg": "Email or Mobile Number Not Found"
                },
                status=404
            )

        # =====================================================
        # GENERATE 6 DIGIT OTP
        # =====================================================

        otp = random.randint(
            100000,
            999999
        )

        # =====================================================
        # OTP EXPIRY - 5 MINUTES
        # =====================================================

        otp_expiry = (
            timezone.now()
            + timedelta(minutes=5)
        )

        # =====================================================
        # SEND OTP
        # =====================================================

        if reset_method == "email":

            send_mail(
                subject="Password Reset OTP",
                message=(
                    f"Your OTP for password reset is {otp}. "
                    f"This OTP is valid for 5 minutes. "
                    f"Do not share this OTP with anyone."
                ),
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[
                    user.email
                ],
                fail_silently=False,
            )

        elif reset_method == "mobile":

            message = (
                f"Your OTP for password reset is {otp}. "
                f"This OTP is valid for 5 minutes. "
                f"Do not share this OTP with anyone."
            )

            send_textbee_sms(
                user.mobile,
                message
            )

        # =====================================================
        # SAVE RESET DATA IN SESSION
        # =====================================================

        req.session["otp"] = str(otp)

        req.session["reset_user_id"] = user.id

        req.session["reset_method"] = reset_method

        req.session["otp_expiry"] = otp_expiry.isoformat()

        req.session["otp_verified"] = False

        req.session.save()

        # =====================================================
        # DEBUG
        # =====================================================

        print(
            "Password Reset Method:",
            reset_method
        )

        print(
            "Password Reset User ID:",
            user.id
        )

        print(
            "Generated OTP:",
            otp
        )

        print(
            "Session OTP:",
            req.session.get("otp")
        )

        # =====================================================
        # RESPONSE
        # =====================================================

        return JsonResponse(
            {
                "msg": (
                    "OTP sent successfully"
                    if reset_method == "email"
                    else "OTP sent successfully on your mobile"
                ),

                "method": reset_method
            },
            status=200
        )

    except Exception as e:

        print(
            "Forget Password Error:",
            str(e)
        )

        return JsonResponse(
            {
                "msg": str(e)
            },
            status=500
        )

def verify_otp(req):

    if req.method != "POST":

        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    try:

        data = json.loads(req.body)

        otp = str(
            data.get("otp", "")
        ).strip()

        session_otp = str(
            req.session.get("otp", "")
        ).strip()

        otp_expiry = req.session.get(
            "otp_expiry"
        )

        print(
            "User OTP:",
            otp
        )

        print(
            "Session OTP:",
            session_otp
        )

        print(
            "Session Key:",
            req.session.session_key
        )

        # =====================================================
        # OTP REQUIRED
        # =====================================================

        if not otp:

            return JsonResponse(
                {
                    "msg": "OTP is required"
                },
                status=400
            )

        # =====================================================
        # SESSION OTP CHECK
        # =====================================================

        if not session_otp:

            return JsonResponse(
                {
                    "msg": "OTP session expired or not found"
                },
                status=400
            )

        # =====================================================
        # EXPIRY CHECK
        # =====================================================

        if not otp_expiry:

            return JsonResponse(
                {
                    "msg": "OTP session expired"
                },
                status=400
            )

        expiry_time = datetime.fromisoformat(
            otp_expiry
        )

        if timezone.now() > expiry_time:

            req.session.pop(
                "otp",
                None
            )

            req.session.pop(
                "otp_expiry",
                None
            )

            req.session["otp_verified"] = False

            req.session.save()

            return JsonResponse(
                {
                    "msg": "OTP has expired. Please request a new OTP."
                },
                status=400
            )

        # =====================================================
        # OTP MATCH
        # =====================================================

        if otp != session_otp:

            return JsonResponse(
                {
                    "msg": "Invalid OTP"
                },
                status=400
            )

        # =====================================================
        # OTP VERIFIED
        # =====================================================

        req.session["otp_verified"] = True

        req.session.save()

        return JsonResponse(
            {
                "msg": "OTP Verified Successfully"
            },
            status=200
        )

    except Exception as e:

        return JsonResponse(
            {
                "msg": str(e)
            },
            status=500
        )



def reset_password(req):

    if req.method != "POST":

        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    try:

        data = json.loads(req.body)

        password = data.get(
            "pw"
        )

        confirm_password = data.get(
            "pw1"
        )

        # =====================================================
        # PASSWORD REQUIRED
        # =====================================================

        if not password or not confirm_password:

            return JsonResponse(
                {
                    "msg": "All fields are required"
                },
                status=400
            )

        # =====================================================
        # PASSWORD MATCH
        # =====================================================

        if password != confirm_password:

            return JsonResponse(
                {
                    "msg": "Passwords do not match"
                },
                status=400
            )

        # =====================================================
        # OTP VERIFIED CHECK
        # =====================================================

        otp_verified = req.session.get(
            "otp_verified"
        )

        if not otp_verified:

            return JsonResponse(
                {
                    "msg": "Please verify OTP first"
                },
                status=400
            )

        # =====================================================
        # USER ID FROM SESSION
        # =====================================================

        user_id = req.session.get(
            "reset_user_id"
        )

        print(
            "Reset User ID:",
            user_id
        )

        print(
            "Session Data:",
            dict(req.session.items())
        )

        if not user_id:

            return JsonResponse(
                {
                    "msg": "Session Expired"
                },
                status=400
            )

        # =====================================================
        # FIND USER
        # =====================================================

        user = users.objects.filter(
            id=user_id
        ).first()

        if not user:

            return JsonResponse(
                {
                    "msg": "User Not Found"
                },
                status=404
            )

        # =====================================================
        # UPDATE PASSWORD
        # =====================================================

        user.password = password

        user.save()

        # =====================================================
        # CLEAR RESET SESSION
        # =====================================================

        req.session.flush()

        # =====================================================
        # SUCCESS
        # =====================================================

        return JsonResponse(
            {
                "msg": "Password Updated Successfully"
            },
            status=200
        )

    except Exception as e:

        return JsonResponse(
            {
                "msg": str(e)
            },
            status=500
        )


    # Admin - login


def admin_login(req):

    if req.method != "POST":
        return JsonResponse(
            {"msg": "Invalid Request Method"},
            status=405
        )

    try:

        data = json.loads(req.body)

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return JsonResponse(
                {"msg": "Email and Password are required"},
                status=400
            )

        admin = Admin.objects.filter(email=email).first()

        if not admin:
            return JsonResponse(
                {"msg": "Admin not found"},
                status=401
            )

        if not check_password(password, admin.password):
            return JsonResponse(
                {"msg": "Invalid Password"},
                status=401
            )

        # ==========================================
        # ADMIN SESSION
        # ==========================================
        # Do NOT clear user_id. A customer can remain
        # logged in while the admin panel is open in
        # another tab.

        req.session["admin_id"] = admin.id
        req.session["admin_email"] = admin.email
        req.session["admin_name"] = admin.full_name
        req.session.modified = True
        req.session.save()

        return JsonResponse(
            {
                "msg": "Admin Login Successful",
                "admin": {
                    "id": admin.id,
                    "name": admin.full_name,
                    "email": admin.email,
                }
            },
            status=200
        )

    except Exception as e:

        return JsonResponse(
            {"msg": str(e)},
            status=500
        )


def admin_check(req):
    # =====================================================
    # GET ADMIN SESSION
    # =====================================================

    admin_id = req.session.get(
        "admin_id"
    )

    if not admin_id:
        return JsonResponse(
            {
                "msg": "Admin Login Required"
            },
            status=401
        )

    # =====================================================
    # VERIFY ADMIN
    # =====================================================

    admin = Admin.objects.filter(
        id=admin_id
    ).first()

    if not admin:
        # =================================================
        # REMOVE ONLY ADMIN SESSION
        # DO NOT DESTROY USER SESSION
        # =================================================

        req.session.pop(
            "admin_id",
            None
        )

        req.session.pop(
            "admin_email",
            None
        )

        req.session.pop(
            "admin_name",
            None
        )

        req.session.modified = True

        return JsonResponse(
            {
                "msg": "Admin Not Found"
            },
            status=401
        )

    # =====================================================
    # ADMIN AUTHENTICATED
    # =====================================================

    return JsonResponse(
        {
            "msg": "Admin Authenticated",
            "admin": {
                "id": admin.id,
                "name": admin.full_name,
                "email": admin.email
            }
        },
        status=200
    )


def admin_logout(req):
    # =====================================================
    # REMOVE ONLY ADMIN SESSION
    # DO NOT DESTROY USER SESSION
    # =====================================================

    req.session.pop(
        "admin_id",
        None
    )

    req.session.pop(
        "admin_email",
        None
    )

    req.session.pop(
        "admin_name",
        None
    )

    req.session.modified = True
    req.session.save()

    return JsonResponse(
        {
            "msg": "Admin Logout Successful"
        },
        status=200
    )

# =========================================================
# ADMIN REVIEWS - GET ALL REVIEWS
# =========================================================

def admin_reviews(req):

    if req.method != "GET":
        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    # =====================================================
    # ADMIN AUTHENTICATION
    # =====================================================

    admin_id = req.session.get("admin_id")

    if not admin_id:
        return JsonResponse(
            {
                "msg": "Admin Login Required"
            },
            status=401
        )

    try:

        reviews = Review.objects.select_related(
            "product",
            "user"
        ).order_by(
            "-created_at"
        )

        data = []

        for review in reviews:

            data.append({
                "id": review.id,
                "product_id": review.product.id,
                "product_name": review.product.name,
                "user_id": review.user.id,
                "user_name": review.user.full_name,
                "user_email": review.user.email,
                "rating": review.rating,
                "comment": review.comment,
                "is_approved": review.is_approved,
                "status": (
                    "Approved"
                    if review.is_approved
                    else "Pending"
                ),
                "created_at": review.created_at.strftime(
                    "%d %b %Y"
                ),
            })

        return JsonResponse(
            {
                "reviews": data,
                "count": len(data)
            },
            status=200
        )

    except Exception as e:

        return JsonResponse(
            {
                "msg": str(e)
            },
            status=500
        )


# =========================================================
# ADMIN REVIEW - APPROVE
# =========================================================

def admin_review_approve(req, id):

    if req.method != "PATCH":
        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    # =====================================================
    # ADMIN AUTHENTICATION
    # =====================================================

    admin_id = req.session.get("admin_id")

    if not admin_id:
        return JsonResponse(
            {
                "msg": "Admin Login Required"
            },
            status=401
        )

    try:

        review = Review.objects.select_related(
            "product",
            "user"
        ).get(
            id=id
        )

        # =================================================
        # ALREADY APPROVED
        # =================================================

        if review.is_approved:

            return JsonResponse(
                {
                    "msg": "Review is already approved"
                },
                status=400
            )

        # =================================================
        # APPROVE REVIEW
        # =================================================

        review.is_approved = True

        review.save(
            update_fields=[
                "is_approved"
            ]
        )

        return JsonResponse(
            {
                "msg": "Review approved successfully",
                "review": {
                    "id": review.id,
                    "product_id": review.product.id,
                    "product_name": review.product.name,
                    "user_id": review.user.id,
                    "user_name": review.user.full_name,
                    "rating": review.rating,
                    "comment": review.comment,
                    "is_approved": review.is_approved,
                    "status": "Approved",
                }
            },
            status=200
        )

    except Review.DoesNotExist:

        return JsonResponse(
            {
                "msg": "Review not found"
            },
            status=404
        )

    except Exception as e:

        return JsonResponse(
            {
                "msg": str(e)
            },
            status=500
        )


# =========================================================
# ADMIN REVIEW - DELETE
# =========================================================

def admin_review_delete(req, id):

    if req.method != "DELETE":
        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    # =====================================================
    # ADMIN AUTHENTICATION
    # =====================================================

    admin_id = req.session.get("admin_id")

    if not admin_id:
        return JsonResponse(
            {
                "msg": "Admin Login Required"
            },
            status=401
        )

    try:

        review = Review.objects.get(
            id=id
        )

        review.delete()

        return JsonResponse(
            {
                "msg": "Review deleted successfully"
            },
            status=200
        )

    except Review.DoesNotExist:

        return JsonResponse(
            {
                "msg": "Review not found"
            },
            status=404
        )

    except Exception as e:

        return JsonResponse(
            {
                "msg": str(e)
            },
            status=500
        )



def categories_api(req):

    # =========================
    # GET - All Categories
    # =========================

    if req.method == "GET":

        categories = Category.objects.all().order_by("-created_at")

        data = []

        for category in categories:

            image_url = None

            if category.image:
                image_url = req.build_absolute_uri(
                    category.image.url
                )

            data.append({
                "id": category.id,
                "name": category.name,
                "slug": category.slug,
                "description": category.description,
                "image": image_url,
                "status": category.status,
                "products": 0,
                "created_at": category.created_at,
            })

        return JsonResponse(
            data,
            safe=False,
            status=200
        )

    # =========================
    # POST - Add Category
    # =========================

    if req.method == "POST":

        # Admin authentication
        admin_id = req.session.get("admin_id")

        if not admin_id:

            return JsonResponse(
                {
                    "msg": "Admin Login Required"
                },
                status=401
            )

        try:

            name = req.POST.get("name")
            description = req.POST.get("description", "")
            image = req.FILES.get("image")

            if not name:

                return JsonResponse(
                    {
                        "msg": "Category name is required"
                    },
                    status=400
                )

            if Category.objects.filter(
                name__iexact=name
            ).exists():

                return JsonResponse(
                    {
                        "msg": "Category already exists"
                    },
                    status=400
                )

            slug = slugify(name)

            # Make slug unique
            original_slug = slug
            counter = 1

            while Category.objects.filter(
                slug=slug
            ).exists():

                slug = f"{original_slug}-{counter}"
                counter += 1

            category = Category.objects.create(

                name=name,

                slug=slug,

                description=description,

                image=image,

                status=True
            )

            image_url = None

            if category.image:

                image_url = req.build_absolute_uri(
                    category.image.url
                )

            return JsonResponse(
                {
                    "msg": "Category added successfully",

                    "category": {
                        "id": category.id,
                        "name": category.name,
                        "slug": category.slug,
                        "description": category.description,
                        "image": image_url,
                        "status": category.status,
                        "products": 0,
                    }
                },
                status=201
            )

        except Exception as e:

            return JsonResponse(
                {
                    "msg": str(e)
                },
                status=500
            )

    return JsonResponse(
        {
            "msg": "Invalid Request Method"
        },
        status=405
    )



def category_delete(req, id):

    if req.method != "DELETE":

        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    admin_id = req.session.get("admin_id")

    if not admin_id:

        return JsonResponse(
            {
                "msg": "Admin Login Required"
            },
            status=401
        )

    try:

        category = Category.objects.get(id=id)

        category.delete()

        return JsonResponse(
            {
                "msg": "Category deleted successfully"
            },
            status=200
        )

    except Category.DoesNotExist:

        return JsonResponse(
            {
                "msg": "Category not found"
            },
            status=404
        )



def category_update(req, id):

    if req.method not in ["POST", "PUT"]:

        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    admin_id = req.session.get("admin_id")

    if not admin_id:

        return JsonResponse(
            {
                "msg": "Admin Login Required"
            },
            status=401
        )

    try:

        category = Category.objects.get(id=id)

        # =====================================================
        # MULTIPART FORM DATA
        # Frontend sends POST when image is included
        # =====================================================

        if req.method == "POST":

            name = req.POST.get("name")
            description = req.POST.get(
                "description",
                category.description
            )

            image = req.FILES.get("image")

        # =====================================================
        # JSON DATA
        # Keep PUT support also
        # =====================================================

        else:

            data = json.loads(req.body)

            name = data.get("name")

            description = data.get(
                "description",
                category.description
            )

            image = None

        # =====================================================
        # VALIDATION
        # =====================================================

        if not name or not name.strip():

            return JsonResponse(
                {
                    "msg": "Category name is required"
                },
                status=400
            )

        name = name.strip()

        # =====================================================
        # DUPLICATE CATEGORY CHECK
        # Ignore current category
        # =====================================================

        if Category.objects.filter(
            name__iexact=name
        ).exclude(
            id=category.id
        ).exists():

            return JsonResponse(
                {
                    "msg": "Category already exists"
                },
                status=400
            )

        # =====================================================
        # UPDATE BASIC DATA
        # =====================================================

        category.name = name

        category.description = description

        category.slug = slugify(name)

        # =====================================================
        # UPDATE IMAGE ONLY IF NEW IMAGE SELECTED
        # =====================================================

        if image:

            category.image = image

        category.save()

        # =====================================================
        # IMAGE URL
        # =====================================================

        image_url = None

        if category.image:

            image_url = req.build_absolute_uri(
                category.image.url
            )

        # =====================================================
        # RESPONSE
        # =====================================================

        return JsonResponse(
            {
                "msg": "Category updated successfully",

                "category": {
                    "id": category.id,
                    "name": category.name,
                    "slug": category.slug,
                    "description": category.description,
                    "image": image_url,
                    "status": category.status,
                    "products": 0,
                }
            },
            status=200
        )

    except Category.DoesNotExist:

        return JsonResponse(
            {
                "msg": "Category not found"
            },
            status=404
        )

    except Exception as e:

        return JsonResponse(
            {
                "msg": str(e)
            },
            status=500
        )


def products_api(req):

    # =========================================================
    # GET - ALL PRODUCTS
    # =========================================================

    if req.method == "GET":

        products = Product.objects.select_related(
            "category"
        ).prefetch_related(
            "sizes",
            "images"
        ).all().order_by("-created_at")

        data = []

        for product in products:

            # =================================================
            # MAIN PRODUCT IMAGE
            # =================================================

            image_url = None

            if product.image:
                image_url = req.build_absolute_uri(
                    product.image.url
                )

            # =================================================
            # PRODUCT GALLERY IMAGES
            # =================================================

            gallery_images = []

            for product_image in product.images.all():

                if product_image.image:
                    gallery_images.append(
                        req.build_absolute_uri(
                            product_image.image.url
                        )
                    )

            # =================================================
            # PRODUCT SIZES
            # =================================================

            sizes = []

            for product_size in product.sizes.all():

                sizes.append({
                    "id": product_size.id,
                    "size": product_size.size,
                    "stock": product_size.stock,
                })

            # =================================================
            # PRODUCT DATA
            # =================================================

            data.append({

                "id": product.id,

                "name": product.name,

                "slug": product.slug,

                "description": product.description,

                "price": str(product.price),

                "old_price": (
                    str(product.old_price)
                    if product.old_price
                    else None
                ),

                "stock": product.stock,

                # Main Image
                "image": image_url,

                # Gallery Images
                "images": gallery_images,

                "status": product.status,

                # =================================================
                # SIZES
                # =================================================

                "sizes": sizes,

                # =================================================
                # CATEGORY
                # =================================================

                "category": {
                    "id": product.category.id,
                    "name": product.category.name,
                    "slug": product.category.slug
                },

                "created_at": product.created_at,

                "updated_at": product.updated_at
            })

        return JsonResponse(
            data,
            safe=False,
            status=200
        )

    # =========================================================
    # POST - ADD PRODUCT
    # =========================================================

    if req.method == "POST":

        # =====================================================
        # ADMIN AUTHENTICATION
        # =====================================================

        admin_id = req.session.get("admin_id")

        if not admin_id:

            return JsonResponse(
                {
                    "msg": "Admin Login Required"
                },
                status=401
            )

        try:

            # =================================================
            # FORM DATA
            # =================================================

            name = req.POST.get("name")

            description = req.POST.get(
                "description",
                ""
            )

            price = req.POST.get("price")

            stock = req.POST.get("stock")

            category_id = req.POST.get(
                "category_id"
            )

            # =================================================
            # MAIN IMAGE
            # =================================================

            image = req.FILES.get("image")

            # =================================================
            # GALLERY IMAGES
            # =================================================

            gallery_images = req.FILES.getlist(
                "gallery_images"
            )

            # =================================================
            # VALIDATION
            # =================================================

            if not name:

                return JsonResponse(
                    {
                        "msg": "Product name is required"
                    },
                    status=400
                )

            if not price:

                return JsonResponse(
                    {
                        "msg": "Product price is required"
                    },
                    status=400
                )

            if not stock:

                return JsonResponse(
                    {
                        "msg": "Product stock is required"
                    },
                    status=400
                )

            if not category_id:

                return JsonResponse(
                    {
                        "msg": "Category is required"
                    },
                    status=400
                )

            # =================================================
            # CHECK CATEGORY
            # =================================================

            try:

                category = Category.objects.get(
                    id=category_id
                )

            except Category.DoesNotExist:

                return JsonResponse(
                    {
                        "msg": "Category not found"
                    },
                    status=404
                )

            # =================================================
            # CHECK PRODUCT NAME
            # =================================================

            if Product.objects.filter(
                name__iexact=name
            ).exists():

                return JsonResponse(
                    {
                        "msg": "Product already exists"
                    },
                    status=400
                )

            # =================================================
            # CREATE SLUG
            # =================================================

            slug = slugify(name)

            original_slug = slug

            counter = 1

            while Product.objects.filter(
                slug=slug
            ).exists():

                slug = f"{original_slug}-{counter}"

                counter += 1

            # =================================================
            # CREATE PRODUCT
            # =================================================

            product = Product.objects.create(

                category=category,

                name=name,

                slug=slug,

                description=description,

                price=price,

                stock=stock,

                image=image,

                status=True
            )

            # =================================================
            # SAVE GALLERY IMAGES
            # =================================================

            for gallery_image in gallery_images:

                ProductImage.objects.create(
                    product=product,
                    image=gallery_image
                )

            # =================================================
            # MAIN IMAGE URL
            # =================================================

            image_url = None

            if product.image:

                image_url = req.build_absolute_uri(
                    product.image.url
                )

            # =================================================
            # GALLERY IMAGE URLS
            # =================================================

            gallery_image_urls = []

            for product_image in product.images.all():

                if product_image.image:

                    gallery_image_urls.append(
                        req.build_absolute_uri(
                            product_image.image.url
                        )
                    )

            # =================================================
            # RESPONSE
            # =================================================

            return JsonResponse(
                {
                    "msg": "Product added successfully",

                    "product": {

                        "id": product.id,

                        "name": product.name,

                        "slug": product.slug,

                        "description": product.description,

                        "price": str(
                            product.price
                        ),

                        "stock": product.stock,

                        # Main Image
                        "image": image_url,

                        # Gallery Images
                        "images": gallery_image_urls,

                        "status": product.status,

                        "sizes": [],

                        "category": {

                            "id": category.id,

                            "name": category.name,

                            "slug": category.slug
                        }
                    }
                },
                status=201
            )

        except Exception as e:

            return JsonResponse(
                {
                    "msg": str(e)
                },
                status=500
            )

    # =========================================================
    # INVALID METHOD
    # =========================================================

    return JsonResponse(
        {
            "msg": "Invalid Request Method"
        },
        status=405
    )

# =========================
# PRODUCT SIZE API
# =========================

def product_sizes(req, product_id):

    # =========================
    # CHECK PRODUCT
    # =========================

    try:

        product = Product.objects.get(
            id=product_id
        )

    except Product.DoesNotExist:

        return JsonResponse(
            {
                "msg": "Product not found"
            },
            status=404
        )

    # =========================
    # GET - PRODUCT SIZES
    # =========================

    if req.method == "GET":

        sizes = ProductSize.objects.filter(
            product=product
        ).order_by("size")

        data = []

        for item in sizes:

            data.append({
                "id": item.id,
                "product_id": product.id,
                "product_name": product.name,
                "size": item.size,
                "stock": item.stock,
                "created_at": item.created_at
            })

        return JsonResponse(
            {
                "product": {
                    "id": product.id,
                    "name": product.name
                },
                "sizes": data
            },
            status=200
        )

    # =========================
    # POST - ADD SIZE
    # =========================

    if req.method == "POST":

        # Admin authentication

        admin_id = req.session.get(
            "admin_id"
        )

        if not admin_id:

            return JsonResponse(
                {
                    "msg": "Admin Login Required"
                },
                status=401
            )

        try:

            data = json.loads(
                req.body
            )

            size = str(
                data.get("size", "")
            ).strip()

            stock = data.get(
                "stock"
            )

            # =========================
            # VALIDATION
            # =========================

            if not size:

                return JsonResponse(
                    {
                        "msg": "Size is required"
                    },
                    status=400
                )

            if stock is None:

                return JsonResponse(
                    {
                        "msg": "Stock is required"
                    },
                    status=400
                )

            try:

                stock = int(stock)

            except (ValueError, TypeError):

                return JsonResponse(
                    {
                        "msg": "Stock must be a number"
                    },
                    status=400
                )

            if stock < 0:

                return JsonResponse(
                    {
                        "msg": "Stock cannot be negative"
                    },
                    status=400
                )

            # =========================
            # DUPLICATE SIZE CHECK
            # =========================

            if ProductSize.objects.filter(
                product=product,
                size__iexact=size
            ).exists():

                return JsonResponse(
                    {
                        "msg": "This size already exists"
                    },
                    status=400
                )

            # =========================
            # CREATE SIZE
            # =========================

            product_size = ProductSize.objects.create(

                product=product,

                size=size,

                stock=stock
            )

            return JsonResponse(
                {
                    "msg": "Product size added successfully",

                    "size": {
                        "id": product_size.id,
                        "product_id": product.id,
                        "product_name": product.name,
                        "size": product_size.size,
                        "stock": product_size.stock,
                        "created_at": product_size.created_at
                    }
                },
                status=201
            )

        except json.JSONDecodeError:

            return JsonResponse(
                {
                    "msg": "Invalid JSON data"
                },
                status=400
            )

        except Exception as e:

            return JsonResponse(
                {
                    "msg": str(e)
                },
                status=500
            )

    return JsonResponse(
        {
            "msg": "Invalid Request Method"
        },
        status=405
    )




def product_delete(req, id):

    if req.method != "DELETE":

        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    # Admin authentication
    admin_id = req.session.get("admin_id")

    if not admin_id:

        return JsonResponse(
            {
                "msg": "Admin Login Required"
            },
            status=401
        )

    try:

        product = Product.objects.get(
            id=id
        )

        product.delete()

        return JsonResponse(
            {
                "msg": "Product deleted successfully"
            },
            status=200
        )

    except Product.DoesNotExist:

        return JsonResponse(
            {
                "msg": "Product not found"
            },
            status=404
        )


def product_update(req, id):

    if req.method != "POST":
        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    # Admin authentication
    admin_id = req.session.get("admin_id")

    if not admin_id:
        return JsonResponse(
            {
                "msg": "Admin Login Required"
            },
            status=401
        )

    try:

        product = Product.objects.get(id=id)

        # -------------------------------------------------
        # FORM DATA
        # -------------------------------------------------

        name = req.POST.get(
            "name",
            product.name
        ).strip()

        description = req.POST.get(
            "description",
            product.description or ""
        )

        price = req.POST.get(
            "price",
            product.price
        )

        old_price = req.POST.get(
            "old_price",
            product.old_price if hasattr(product, "old_price") else ""
        )

        stock = req.POST.get(
            "stock",
            product.stock
        )

        category_id = req.POST.get("category_id")

        # -------------------------------------------------
        # VALIDATION
        # -------------------------------------------------

        if not name:
            return JsonResponse(
                {
                    "msg": "Product name is required"
                },
                status=400
            )

        if price in [None, ""]:
            return JsonResponse(
                {
                    "msg": "Product price is required"
                },
                status=400
            )

        if stock in [None, ""]:
            stock = product.stock

        # -------------------------------------------------
        # CATEGORY
        # -------------------------------------------------

        if category_id:

            try:

                category = Category.objects.get(
                    id=category_id
                )

                product.category = category

            except Category.DoesNotExist:

                return JsonResponse(
                    {
                        "msg": "Category not found"
                    },
                    status=404
                )

        # -------------------------------------------------
        # PRODUCT BASIC DATA
        # -------------------------------------------------

        product.name = name
        product.description = description
        product.price = price
        product.stock = stock

        # old_price field exists hoy to update karo
        if hasattr(product, "old_price"):
            product.old_price = old_price if old_price else None

        product.slug = slugify(name)

        # -------------------------------------------------
        # MAIN IMAGE
        # -------------------------------------------------

        new_main_image = req.FILES.get("image")

        old_main_image = None

        if new_main_image:

            if product.image:
                old_main_image = product.image.name

            product.image = new_main_image

        # -------------------------------------------------
        # SAVE PRODUCT
        # -------------------------------------------------

        product.save()

        # -------------------------------------------------
        # DELETE OLD MAIN IMAGE FILE
        # -------------------------------------------------

        if new_main_image and old_main_image:

            try:

                if default_storage.exists(old_main_image):

                    default_storage.delete(
                        old_main_image
                    )

            except Exception:
                pass

        # -------------------------------------------------
        # GALLERY IMAGES
        # -------------------------------------------------

        gallery_images = req.FILES.getlist(
            "gallery_images"
        )

        for gallery_image in gallery_images:

            ProductImage.objects.create(
                product=product,
                image=gallery_image
            )

        # -------------------------------------------------
        # SIZES
        # -------------------------------------------------

        sizes_data = req.POST.get("sizes")

        if sizes_data is not None:

            try:

                sizes = json.loads(
                    sizes_data
                )

                if not isinstance(sizes, list):

                    return JsonResponse(
                        {
                            "msg": "Invalid sizes format"
                        },
                        status=400
                    )

                existing_size_ids = []

                for size_data in sizes:

                    if not isinstance(size_data, dict):
                        continue

                    size_id = size_data.get("id")

                    size_value = str(
                        size_data.get(
                            "size",
                            ""
                        )
                    ).strip()

                    size_stock = size_data.get(
                        "stock",
                        0
                    )

                    if not size_value:
                        continue

                    try:
                        size_stock = int(size_stock)
                    except (TypeError, ValueError):

                        return JsonResponse(
                            {
                                "msg": f"Invalid stock for size {size_value}"
                            },
                            status=400
                        )

                    if size_stock < 0:

                        return JsonResponse(
                            {
                                "msg": f"Stock cannot be negative for size {size_value}"
                            },
                            status=400
                        )

                    # -----------------------------------------
                    # UPDATE EXISTING SIZE
                    # -----------------------------------------

                    if size_id:

                        try:

                            product_size = ProductSize.objects.get(
                                id=size_id,
                                product=product
                            )

                            product_size.size = size_value
                            product_size.stock = size_stock

                            product_size.save()

                            existing_size_ids.append(
                                product_size.id
                            )

                        except ProductSize.DoesNotExist:

                            return JsonResponse(
                                {
                                    "msg": f"Size with id {size_id} not found"
                                },
                                status=404
                            )

                    # -----------------------------------------
                    # CREATE NEW SIZE
                    # -----------------------------------------

                    else:

                        existing_size = ProductSize.objects.filter(
                            product=product,
                            size=size_value
                        ).first()

                        if existing_size:

                            existing_size.stock = size_stock
                            existing_size.save()

                            existing_size_ids.append(
                                existing_size.id
                            )

                        else:

                            new_size = ProductSize.objects.create(
                                product=product,
                                size=size_value,
                                stock=size_stock
                            )

                            existing_size_ids.append(
                                new_size.id
                            )

                # ---------------------------------------------
                # DELETE REMOVED SIZES
                # ---------------------------------------------

                ProductSize.objects.filter(
                    product=product
                ).exclude(
                    id__in=existing_size_ids
                ).delete()

            except json.JSONDecodeError:

                return JsonResponse(
                    {
                        "msg": "Invalid sizes JSON"
                    },
                    status=400
                )

        # -------------------------------------------------
        # MAIN IMAGE URL
        # -------------------------------------------------

        image_url = None

        if product.image:

            image_url = req.build_absolute_uri(
                product.image.url
            )

        # -------------------------------------------------
        # GALLERY RESPONSE
        # -------------------------------------------------

        gallery_data = []

        for product_image in product.images.all():

            if product_image.image:

                gallery_data.append(
                    {
                        "id": product_image.id,
                        "image": req.build_absolute_uri(
                            product_image.image.url
                        )
                    }
                )

        # -------------------------------------------------
        # SIZE RESPONSE
        # -------------------------------------------------

        sizes_response = []

        for product_size in product.sizes.all():

            sizes_response.append(
                {
                    "id": product_size.id,
                    "size": product_size.size,
                    "stock": product_size.stock
                }
            )

        # -------------------------------------------------
        # FINAL RESPONSE
        # -------------------------------------------------

        return JsonResponse(
            {
                "msg": "Product updated successfully",

                "product": {
                    "id": product.id,
                    "name": product.name,
                    "slug": product.slug,
                    "description": product.description,
                    "price": str(product.price),

                    "old_price": (
                        str(product.old_price)
                        if hasattr(product, "old_price")
                        and product.old_price is not None
                        else None
                    ),

                    "stock": product.stock,

                    "image": image_url,

                    "images": gallery_data,

                    "sizes": sizes_response,

                    "status": product.status,

                    "category": (
                        {
                            "id": product.category.id,
                            "name": product.category.name,
                            "slug": product.category.slug
                        }
                        if product.category
                        else None
                    )
                }
            },
            status=200
        )

    except Product.DoesNotExist:

        return JsonResponse(
            {
                "msg": "Product not found"
            },
            status=404
        )

    except Exception as e:

        return JsonResponse(
            {
                "msg": str(e)
            },
            status=500
        )

def category_products(req, category_id):
    if req.method != "GET":
        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    try:
        category = Category.objects.get(
            id=category_id
        )

        products = (
            Product.objects
            .filter(
                category=category,
                status=True
            )
            .prefetch_related(
                "reviews"
            )
            .order_by(
                "-created_at"
            )
        )

        data = []

        for product in products:
            image_url = None

            if product.image:
                image_url = req.build_absolute_uri(
                    product.image.url
                )

            approved_reviews = product.reviews.filter(
                is_approved=True
            )

            review_count = approved_reviews.count()

            total_rating = sum(
                review.rating
                for review in approved_reviews
            )

            avg_rating = (
                round(
                    total_rating / review_count,
                    1
                )
                if review_count > 0
                else 0
            )

            data.append(
                {
                    "id": product.id,
                    "name": product.name,
                    "slug": product.slug,
                    "description": product.description,
                    "price": str(product.price),
                    "old_price": (
                        str(product.old_price)
                        if product.old_price
                        else None
                    ),
                    "stock": product.stock,
                    "image": image_url,
                    "avg_rating": avg_rating,
                    "review_count": review_count,
                    "category": {
                        "id": category.id,
                        "name": category.name,
                        "slug": category.slug
                    }
                }
            )

        return JsonResponse(
            data,
            safe=False,
            status=200
        )

    except Category.DoesNotExist:
        return JsonResponse(
            {
                "msg": "Category not found"
            },
            status=404
        )

# =====================================================
# CART API
# =====================================================

def cart_api(req):

    # =================================================
    # CHECK USER LOGIN
    # =================================================

    user_id = req.session.get("user_id")

    if not user_id:

        return JsonResponse(
            {
                "msg": "Login Required"
            },
            status=401
        )

    try:

        user = users.objects.get(
            id=user_id
        )

    except users.DoesNotExist:

        return JsonResponse(
            {
                "msg": "User not found"
            },
            status=404
        )

    # =================================================
    # GET CART
    # =================================================

    if req.method == "GET":

        cart, created = Cart.objects.get_or_create(
            user=user
        )

        items = CartItem.objects.select_related(
            "product",
            "product__category",
            "size"
        ).filter(
            cart=cart
        ).order_by("-created_at")

        data = []

        subtotal = 0
        total_items = 0

        for item in items:

            product = item.product

            image_url = None

            if product.image:

                image_url = req.build_absolute_uri(
                    product.image.url
                )

            # =========================================
            # ITEM TOTAL
            # =========================================

            item_total = (
                product.price * item.quantity
            )

            subtotal += item_total
            total_items += item.quantity

            # =========================================
            # SIZE DATA
            # =========================================

            size_id = None
            size = None
            size_stock = None

            if item.size:

                size_id = item.size.id
                size = item.size.size
                size_stock = item.size.stock

            # =========================================
            # CART DATA
            # =========================================

            data.append({

                "id": item.id,

                "product_id": product.id,

                "name": product.name,

                "slug": product.slug,

                "description": product.description,

                "price": str(product.price),

                "old_price": (
                    str(product.old_price)
                    if product.old_price
                    else None
                ),

                "quantity": item.quantity,

                # Product stock
                "stock": product.stock,

                # Selected size
                "size_id": size_id,

                "size": size,

                # Size-specific stock
                "size_stock": size_stock,

                "image": image_url,

                "category": {

                    "id": product.category.id,

                    "name": product.category.name,

                    "slug": product.category.slug
                }

            })

        return JsonResponse(
            {
                "cart": data,

                "subtotal": str(subtotal),

                "total_items": total_items
            },
            status=200
        )
    # =====================================================
    # ADD TO CART
    # =====================================================

    if req.method == "POST":

        try:

            body = json.loads(req.body)

            product_id = body.get("product_id")
            size_id = body.get("size_id")

            if not product_id:
                return JsonResponse(
                    {
                        "msg": "Product ID is required"
                    },
                    status=400
                )

            with transaction.atomic():

                # =========================================
                # LOCK PRODUCT
                # =========================================

                product = Product.objects.select_for_update().get(
                    id=product_id
                )

                # =========================================
                # SIZE
                # =========================================

                product_size = None

                if size_id:

                    product_size = ProductSize.objects.select_for_update().filter(
                        id=size_id,
                        product=product
                    ).first()

                    if not product_size:
                        return JsonResponse(
                            {
                                "msg": "Selected size not found"
                            },
                            status=404
                        )

                    available_stock = product_size.stock

                else:

                    available_stock = product.stock

                # =========================================
                # GET / CREATE CART
                # =========================================

                cart, created = Cart.objects.get_or_create(
                    user=user
                )

                # =========================================
                # FIND SAME PRODUCT + SAME SIZE
                # =========================================

                cart_item = CartItem.objects.filter(
                    cart=cart,
                    product=product,
                    size=product_size
                ).first()

                # =========================================
                # EXISTING CART ITEM
                # =========================================

                if cart_item:

                    # Already added quantity cannot exceed stock

                    if cart_item.quantity >= available_stock:
                        return JsonResponse(
                            {
                                "msg": "No more stock available"
                            },
                            status=400
                        )

                    cart_item.quantity += 1
                    cart_item.save(
                        update_fields=["quantity"]
                    )

                # =========================================
                # NEW CART ITEM
                # =========================================

                else:

                    if available_stock <= 0:
                        return JsonResponse(
                            {
                                "msg": (
                                    f"Size {product_size.size} "
                                    "is out of stock"
                                )
                                if product_size
                                else "Product is out of stock"
                            },
                            status=400
                        )

                    cart_item = CartItem.objects.create(
                        cart=cart,
                        product=product,
                        size=product_size,
                        quantity=1
                    )

                # =========================================
                # STOCK IS NOT DECREASED HERE
                # =========================================

                current_stock = available_stock

            return JsonResponse(
                {
                    "msg": "Product added to cart",

                    "product_id": product.id,

                    "size_id": (
                        product_size.id
                        if product_size
                        else None
                    ),

                    "size": (
                        product_size.size
                        if product_size
                        else None
                    ),

                    "quantity": cart_item.quantity,

                    "stock": current_stock
                },
                status=200
            )

        except Product.DoesNotExist:

            return JsonResponse(
                {
                    "msg": "Product not found"
                },
                status=404
            )

        except json.JSONDecodeError:

            return JsonResponse(
                {
                    "msg": "Invalid JSON data"
                },
                status=400
            )

        except Exception as e:

            return JsonResponse(
                {
                    "msg": str(e)
                },
                status=500
            )

            # =========================================
            # PRODUCT ID VALIDATION
            # =========================================

            if not product_id:

                return JsonResponse(
                    {
                        "msg": "Product ID is required"
                    },
                    status=400
                )

            with transaction.atomic():

                # =====================================
                # LOCK PRODUCT
                # =====================================

                product = Product.objects.select_for_update().get(
                    id=product_id
                )

                # =====================================
                # SIZE
                # =====================================

                product_size = None

                if size_id:

                    product_size = ProductSize.objects.select_for_update().filter(
                        id=size_id,
                        product=product
                    ).first()

                    if not product_size:

                        return JsonResponse(
                            {
                                "msg": "Selected size not found"
                            },
                            status=404
                        )

                    # =================================
                    # SIZE STOCK CHECK
                    # =================================

                    if product_size.stock <= 0:

                        return JsonResponse(
                            {
                                "msg": (
                                    f"Size {product_size.size} "
                                    "is out of stock"
                                )
                            },
                            status=400
                        )

                else:

                    # =================================
                    # NORMAL PRODUCT STOCK CHECK
                    # =================================

                    if product.stock <= 0:

                        return JsonResponse(
                            {
                                "msg": "Product is out of stock"
                            },
                            status=400
                        )

                # =====================================
                # GET / CREATE CART
                # =====================================

                cart, created = Cart.objects.get_or_create(
                    user=user
                )

                # =====================================
                # FIND SAME PRODUCT + SAME SIZE
                # =====================================

                cart_item = CartItem.objects.filter(
                    cart=cart,
                    product=product,
                    size=product_size
                ).first()

                # =====================================
                # EXISTING ITEM
                # =====================================

                if cart_item:

                    cart_item.quantity += 1
                    cart_item.save()

                # =====================================
                # NEW ITEM
                # =====================================

                else:

                    cart_item = CartItem.objects.create(
                        cart=cart,
                        product=product,
                        size=product_size,
                        quantity=1
                    )



            # =========================================
            # RESPONSE
            # =========================================

            return JsonResponse(
                {
                    "msg": "Product added to cart",

                    "product_id": product.id,

                    "size_id": (
                        product_size.id
                        if product_size
                        else None
                    ),

                    "size": (
                        product_size.size
                        if product_size
                        else None
                    ),

                    "quantity": cart_item.quantity,

                    "stock": current_stock
                },
                status=200
            )

        except Product.DoesNotExist:

            return JsonResponse(
                {
                    "msg": "Product not found"
                },
                status=404
            )

        except json.JSONDecodeError:

            return JsonResponse(
                {
                    "msg": "Invalid JSON data"
                },
                status=400
            )

        except Exception as e:

            return JsonResponse(
                {
                    "msg": str(e)
                },
                status=500
            )

    # =================================================
    # INVALID METHOD
    # =================================================

    return JsonResponse(
        {
            "msg": "Invalid Request Method"
        },
        status=405
    )


# =====================================================
# CART INCREMENT
# =====================================================

def cart_increment(req, item_id):

    if req.method != "PATCH":

        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    user_id = req.session.get("user_id")

    if not user_id:

        return JsonResponse(
            {
                "msg": "Login Required"
            },
            status=401
        )

    try:

        with transaction.atomic():

            # =========================================
            # CART
            # =========================================

            cart = Cart.objects.get(
                user_id=user_id
            )

            # =========================================
            # CART ITEM
            # =========================================

            item = CartItem.objects.select_related(
                "product",
                "size"
            ).select_for_update().get(
                id=item_id,
                cart=cart
            )

            # =========================================
            # SIZE PRODUCT
            # =========================================

            if item.size:

                product_size = ProductSize.objects.select_for_update().get(
                    id=item.size.id
                )

                # =====================================
                # SIZE STOCK CHECK
                # =====================================

                if product_size.stock <= 0:

                    return JsonResponse(
                        {
                            "msg": (
                                f"Size {product_size.size} "
                                "is out of stock"
                            )
                        },
                        status=400
                    )

                # =====================================
                # CART +1
                # =====================================

                item.quantity += 1
                item.save()

                # =====================================
                # SIZE STOCK -1
                # =====================================

                product_size.stock -= 1
                product_size.save()

                current_stock = product_size.stock

                current_size = product_size.size

            # =========================================
            # NORMAL PRODUCT
            # =========================================

            else:

                product = Product.objects.select_for_update().get(
                    id=item.product.id
                )

                if product.stock <= 0:

                    return JsonResponse(
                        {
                            "msg": "No more stock available"
                        },
                        status=400
                    )

                # CART +1
                item.quantity += 1
                item.save()

                # STOCK -1
                product.stock -= 1
                product.save()

                current_stock = product.stock
                current_size = None

        return JsonResponse(
            {
                "msg": "Quantity increased",

                "quantity": item.quantity,

                "size": current_size,

                "stock": current_stock
            },
            status=200
        )

    except Cart.DoesNotExist:

        return JsonResponse(
            {
                "msg": "Cart not found"
            },
            status=404
        )

    except CartItem.DoesNotExist:

        return JsonResponse(
            {
                "msg": "Cart item not found"
            },
            status=404
        )

    except Exception as e:

        return JsonResponse(
            {
                "msg": str(e)
            },
            status=500
        )

# =====================================================
# CART DECREMENT
# =====================================================

def cart_decrement(req, item_id):

    if req.method != "PATCH":

        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    user_id = req.session.get("user_id")

    if not user_id:

        return JsonResponse(
            {
                "msg": "Login Required"
            },
            status=401
        )

    try:

        with transaction.atomic():

            cart = Cart.objects.get(
                user_id=user_id
            )

            item = CartItem.objects.select_related(
                "product",
                "size"
            ).select_for_update().get(
                id=item_id,
                cart=cart
            )

            # =========================================
            # QUANTITY = 1
            # =========================================

            if item.quantity == 1:

                item.delete()

                return JsonResponse(
                    {
                        "msg": "Product removed from cart",
                        "deleted": True,
                        "quantity": 0
                    },
                    status=200
                )

            # =========================================
            # QUANTITY -1
            # =========================================

            item.quantity -= 1

            item.save(
                update_fields=["quantity"]
            )

            # =========================================
            # CURRENT STOCK
            # =========================================

            if item.size:

                current_stock = item.size.stock
                current_size = item.size.size

            else:

                current_stock = item.product.stock
                current_size = None

        return JsonResponse(
            {
                "msg": "Quantity decreased",

                "deleted": False,

                "quantity": item.quantity,

                "size": current_size,

                "stock": current_stock
            },
            status=200
        )

    except Cart.DoesNotExist:

        return JsonResponse(
            {
                "msg": "Cart not found"
            },
            status=404
        )

    except CartItem.DoesNotExist:

        return JsonResponse(
            {
                "msg": "Cart item not found"
            },
            status=404
        )

    except Exception as e:

        return JsonResponse(
            {
                "msg": str(e)
            },
            status=500
        )

# =====================================================
# CART REMOVE
# =====================================================

def cart_remove(req, item_id):

    if req.method != "DELETE":

        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    user_id = req.session.get("user_id")

    if not user_id:

        return JsonResponse(
            {
                "msg": "Login Required"
            },
            status=401
        )

    try:

        cart = Cart.objects.get(
            user_id=user_id
        )

        item = CartItem.objects.select_for_update().get(
            id=item_id,
            cart=cart
        )

        item.delete()

        return JsonResponse(
            {
                "msg": "Product removed from cart",
                "deleted": True
            },
            status=200
        )

    except Cart.DoesNotExist:

        return JsonResponse(
            {
                "msg": "Cart not found"
            },
            status=404
        )

    except CartItem.DoesNotExist:

        return JsonResponse(
            {
                "msg": "Cart item not found"
            },
            status=404
        )

    except Exception as e:

        return JsonResponse(
            {
                "msg": str(e)
            },
            status=500
        )


def admin_customers(req):

    # Admin login check
    admin_id = req.session.get("admin_id")

    if not admin_id:
        return JsonResponse(
            {
                "msg": "Admin Login Required"
            },
            status=401
        )

    try:

        customers = users.objects.all().order_by("-created_at")

        customer_list = []

        for user in customers:

            customer_list.append({
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "mobile": user.mobile,
                "created_at": user.created_at.strftime("%d %b %Y"),
            })

        return JsonResponse(
            {
                "msg": "Customers fetched successfully",
                "customers": customer_list,
                "total": len(customer_list)
            },
            status=200
        )

    except Exception as e:

        return JsonResponse(
            {
                "msg": str(e)
            },
            status=500
        )

def admin_customer_delete(req, id):

    if req.method != "DELETE":

        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    # =====================================================
    # ADMIN LOGIN CHECK
    # =====================================================

    admin_id = req.session.get("admin_id")

    if not admin_id:

        return JsonResponse(
            {
                "msg": "Admin Login Required"
            },
            status=401
        )

    try:

        # =================================================
        # FIND CUSTOMER
        # =================================================

        user = users.objects.filter(
            id=id
        ).first()

        if not user:

            return JsonResponse(
                {
                    "msg": "Customer not found"
                },
                status=404
            )

        # =================================================
        # STORE NAME FOR RESPONSE
        # =================================================

        customer_name = user.full_name

        # =================================================
        # DELETE CUSTOMER
        # =================================================

        user.delete()

        return JsonResponse(
            {
                "msg": "Customer deleted successfully",
                "customer": customer_name
            },
            status=200
        )

    except Exception as e:

        return JsonResponse(
            {
                "msg": str(e)
            },
            status=500
        )

# =========================================================
# ADMIN GLOBAL SEARCH
# =========================================================

def admin_global_search(req):

    # =====================================================
    # ADMIN AUTHENTICATION
    # =====================================================

    admin_id = req.session.get("admin_id")

    if not admin_id:
        return JsonResponse(
            {
                "msg": "Admin Login Required"
            },
            status=401
        )

    # =====================================================
    # GET SEARCH QUERY
    # =====================================================

    query = str(
        req.GET.get("q", "")
    ).strip()

    if not query:
        return JsonResponse(
            {
                "products": [],
                "customers": [],
                "orders": [],
                "categories": [],
                "reviews": [],
                "total": 0
            },
            status=200
        )

    if len(query) < 2:
        return JsonResponse(
            {
                "products": [],
                "customers": [],
                "orders": [],
                "categories": [],
                "reviews": [],
                "total": 0
            },
            status=200
        )

    try:

        # =================================================
        # PRODUCTS
        # =================================================

        products = (
            Product.objects
            .select_related("category")
            .filter(
                Q(name__icontains=query) |
                Q(slug__icontains=query) |
                Q(category__name__icontains=query)
            )
            .order_by("-created_at")[:6]
        )

        product_results = []

        for product in products:

            image_url = None

            if product.image:
                image_url = req.build_absolute_uri(
                    product.image.url
                )

            product_results.append({
                "id": product.id,
                "name": product.name,
                "price": str(product.price),
                "image": image_url,
                "category": (
                    product.category.name
                    if product.category
                    else None
                ),
            })

        # =================================================
        # CUSTOMERS
        # =================================================

        customers = (
            users.objects
            .filter(
                Q(full_name__icontains=query) |
                Q(email__icontains=query) |
                Q(mobile__icontains=query)
            )
            .order_by("-created_at")[:6]
        )

        customer_results = []

        for user in customers:

            customer_results.append({
                "id": user.id,
                "name": user.full_name,
                "email": user.email,
                "mobile": user.mobile,
            })

        # =================================================
        # ORDERS
        # =================================================

        orders = (
            Order.objects
            .select_related("user")
            .filter(
                Q(order_number__icontains=query) |
                Q(tracking_number__icontains=query) |
                Q(payment_method__icontains=query) |
                Q(payment_status__icontains=query) |
                Q(order_status__icontains=query) |
                Q(user__full_name__icontains=query) |
                Q(user__email__icontains=query) |
                Q(user__mobile__icontains=query)
            )
            .order_by("-created_at")[:6]
        )

        order_results = []

        for order in orders:

            order_results.append({
                "id": order.id,
                "order_number": order.order_number,
                "tracking_number": order.tracking_number,
                "customer": (
                    order.user.full_name
                    if order.user
                    else "Guest"
                ),
                "total_amount": str(
                    order.total_amount
                ),
                "status": order.order_status,
                "payment_status": order.payment_status,
            })

        # =================================================
        # CATEGORIES
        # =================================================

        categories = (
            Category.objects
            .filter(
                Q(name__icontains=query) |
                Q(slug__icontains=query) |
                Q(description__icontains=query)
            )
            .order_by("-created_at")[:6]
        )

        category_results = []

        for category in categories:

            category_results.append({
                "id": category.id,
                "name": category.name,
                "slug": category.slug,
                "description": category.description,
            })

        # =================================================
        # REVIEWS
        # =================================================

        reviews = (
            Review.objects
            .select_related(
                "product",
                "user"
            )
            .filter(
                Q(product__name__icontains=query) |
                Q(user__full_name__icontains=query) |
                Q(user__email__icontains=query) |
                Q(comment__icontains=query)
            )
            .order_by("-created_at")[:6]
        )

        review_results = []

        for review in reviews:

            review_results.append({
                "id": review.id,
                "product_id": review.product.id,
                "product_name": review.product.name,
                "user_id": review.user.id,
                "user_name": review.user.full_name,
                "rating": review.rating,
                "comment": review.comment,
                "is_approved": review.is_approved,
            })

        # =================================================
        # RESPONSE
        # =================================================

        total = (
            len(product_results) +
            len(customer_results) +
            len(order_results) +
            len(category_results) +
            len(review_results)
        )

        return JsonResponse(
            {
                "products": product_results,
                "customers": customer_results,
                "orders": order_results,
                "categories": category_results,
                "reviews": review_results,
                "total": total,
            },
            status=200
        )

    except Exception as e:

        return JsonResponse(
            {
                "msg": str(e)
            },
            status=500
        )



def admin_dashboard(req):

    # =========================
    # ADMIN LOGIN CHECK
    # =========================

    admin_id = req.session.get("admin_id")

    if not admin_id:
        return JsonResponse(
            {
                "msg": "Admin Login Required"
            },
            status=401
        )

    try:

        # =========================
        # CUSTOMERS
        # =========================

        total_customers = users.objects.count()

        # =========================
        # PRODUCTS
        # =========================

        total_products = Product.objects.count()

        # =========================
        # CATEGORIES
        # =========================

        total_categories = Category.objects.count()

        # =========================
        # TOTAL STOCK
        # =========================

        total_stock = Product.objects.aggregate(
            total=Sum("stock")
        )["total"] or 0

        # =========================
        # ACTIVE PRODUCTS
        # =========================

        active_products = Product.objects.filter(
            status=True
        ).count()

        # =========================
        # ACTIVE CATEGORIES
        # =========================

        active_categories = Category.objects.filter(
            status=True
        ).count()

        return JsonResponse(
            {
                "msg": "Dashboard data fetched successfully",

                "dashboard": {
                    "total_customers": total_customers,
                    "total_products": total_products,
                    "total_categories": total_categories,
                    "total_stock": total_stock,
                    "active_products": active_products,
                    "active_categories": active_categories,
                }
            },
            status=200
        )

    except Exception as e:

        return JsonResponse(
            {
                "msg": str(e)
            },
            status=500
        )



def addresses(req):

    user_id = req.session.get("user_id")

    if not user_id:
        return JsonResponse(
            {"msg": "Login required"},
            status=401
        )

    user = users.objects.filter(id=user_id).first()

    if not user:
        return JsonResponse(
            {"msg": "User not found"},
            status=404
        )


    # =========================
    # GET ADDRESSES
    # =========================

    if req.method == "GET":

        address_list = UserAddress.objects.filter(
            user=user
        ).order_by("-created_at")

        data = []

        for address in address_list:

            data.append({
                "id": address.id,
                "full_name": address.full_name,
                "mobile": address.mobile,
                "house": address.house,
                "area": address.area,
                "city": address.city,
                "state": address.state,
                "pincode": address.pincode,
                "address_type": address.address_type,
            })

        return JsonResponse({
            "addresses": data
        })


    # =========================
    # CREATE ADDRESS
    # =========================

    if req.method == "POST":

        data = json.loads(req.body)

        address = UserAddress.objects.create(
            user=user,
            full_name=data.get("full_name"),
            mobile=data.get("mobile"),
            house=data.get("house"),
            area=data.get("area"),
            city=data.get("city"),
            state=data.get("state"),
            pincode=data.get("pincode"),
            address_type=data.get(
                "address_type",
                "Home"
            )
        )

        return JsonResponse({
            "msg": "Address saved successfully",
            "id": address.id
        }, status=201)


    return JsonResponse(
        {"msg": "Invalid request"},
        status=405
    )


# =========================================================
# ADDRESS DETAIL
# =========================================================

def address_detail(req, id):

    user_id = req.session.get("user_id")

    if not user_id:

        return JsonResponse(
            {
                "msg": "Login required"
            },
            status=401
        )

    address = UserAddress.objects.filter(
        id=id,
        user_id=user_id
    ).first()

    if not address:

        return JsonResponse(
            {
                "msg": "Address not found"
            },
            status=404
        )

    # =====================================================
    # GET - SINGLE ADDRESS
    # =====================================================

    if req.method == "GET":

        return JsonResponse(
            {
                "address": {
                    "id": address.id,
                    "full_name": address.full_name,
                    "mobile": address.mobile,
                    "house": address.house,
                    "area": address.area,
                    "city": address.city,
                    "state": address.state,
                    "pincode": address.pincode,
                    "address_type": address.address_type,
                }
            },
            status=200
        )

    # =====================================================
    # UPDATE ADDRESS
    # =====================================================

    if req.method == "PUT":

        try:

            data = json.loads(
                req.body
            )

            address.full_name = data.get(
                "full_name",
                address.full_name
            )

            address.mobile = data.get(
                "mobile",
                address.mobile
            )

            address.house = data.get(
                "house",
                address.house
            )

            address.area = data.get(
                "area",
                address.area
            )

            address.city = data.get(
                "city",
                address.city
            )

            address.state = data.get(
                "state",
                address.state
            )

            address.pincode = data.get(
                "pincode",
                address.pincode
            )

            address.address_type = data.get(
                "address_type",
                address.address_type
            )

            address.save()

            return JsonResponse(
                {
                    "msg": "Address updated successfully"
                },
                status=200
            )

        except json.JSONDecodeError:

            return JsonResponse(
                {
                    "msg": "Invalid JSON data"
                },
                status=400
            )

        except Exception as e:

            return JsonResponse(
                {
                    "msg": str(e)
                },
                status=500
            )

    # =====================================================
    # DELETE ADDRESS
    # =====================================================

    if req.method == "DELETE":

        address.delete()

        return JsonResponse(
            {
                "msg": "Address deleted successfully"
            },
            status=200
        )

    # =====================================================
    # INVALID METHOD
    # =====================================================

    return JsonResponse(
        {
            "msg": "Invalid request method"
        },
        status=405
    )
def place_order(req):

    # =====================================================
    # CHECK LOGIN
    # =====================================================

    user_id = req.session.get("user_id")

    if not user_id:
        return JsonResponse(
            {
                "msg": "Login Required"
            },
            status=401
        )

    try:
        user = users.objects.get(
            id=user_id
        )

    except users.DoesNotExist:

        return JsonResponse(
            {
                "msg": "User not found"
            },
            status=404
        )

    # =====================================================
    # ONLY POST
    # =====================================================

    if req.method != "POST":

        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    try:

        body = json.loads(req.body)

        # =================================================
        # GET DATA FROM FRONTEND
        # =================================================

        address_id = body.get(
            "address_id"
        )

        payment_method = body.get(
            "payment_method"
        )

        # =================================================
        # VALIDATE ADDRESS
        # =================================================

        if not address_id:

            return JsonResponse(
                {
                    "msg": "Address is required"
                },
                status=400
            )

        try:

            address = UserAddress.objects.get(
                id=address_id,
                user=user
            )

        except UserAddress.DoesNotExist:

            return JsonResponse(
                {
                    "msg": "Address not found"
                },
                status=404
            )

        # =================================================
        # VALIDATE PAYMENT
        # =================================================

        valid_payment_methods = [
            "COD",
            "UPI",
            "CARD"
        ]

        if payment_method not in valid_payment_methods:

            return JsonResponse(
                {
                    "msg": "Invalid payment method"
                },
                status=400
            )

        # =================================================
        # GET CART
        # =================================================

        try:

            cart = Cart.objects.get(
                user=user
            )

        except Cart.DoesNotExist:

            return JsonResponse(
                {
                    "msg": "Cart is empty"
                },
                status=400
            )

        # =================================================
        # TRANSACTION
        # =================================================

        with transaction.atomic():

            cart_items = CartItem.objects.select_related(
                "product",
                "size"
            ).select_for_update().filter(
                cart=cart
            )

            if not cart_items.exists():

                return JsonResponse(
                    {
                        "msg": "Cart is empty"
                    },
                    status=400
                )

            # =================================================
            # CALCULATE TOTAL
            # =================================================

            subtotal = 0

            for cart_item in cart_items:

                product = cart_item.product

                # ---------------------------------------------
                # SIZE PRODUCT
                # ---------------------------------------------

                if cart_item.size:

                    product_size = ProductSize.objects.select_for_update().get(
                        id=cart_item.size.id,
                        product=product
                    )

                    if product_size.stock < cart_item.quantity:

                        return JsonResponse(
                            {
                                "msg": (
                                    f"Size {product_size.size} "
                                    f"of {product.name} "
                                    "does not have enough stock"
                                )
                            },
                            status=400
                        )

                # ---------------------------------------------
                # NORMAL PRODUCT
                # ---------------------------------------------

                else:

                    product = Product.objects.select_for_update().get(
                        id=product.id
                    )

                    if product.stock < cart_item.quantity:

                        return JsonResponse(
                            {
                                "msg": (
                                    f"{product.name} "
                                    "does not have enough stock"
                                )
                            },
                            status=400
                        )

                # ---------------------------------------------
                # ITEM TOTAL
                # ---------------------------------------------

                subtotal += (
                    product.price *
                    cart_item.quantity
                )

            # =================================================
            # SHIPPING
            # =================================================

            shipping_charge = 0

            # =================================================
            # GRAND TOTAL
            # =================================================

            total_amount = (
                subtotal +
                shipping_charge
            )

            # =================================================
            # PAYMENT STATUS
            # =================================================

            if payment_method == "COD":

                payment_status = "Pending"
                payment_reference = None
                paid_at = None

            elif payment_method in [
                "UPI",
                "CARD",
            ]:

                payment_verified = body.get(
                    "payment_verified",
                    False
                )

                payment_reference = body.get(
                    "payment_reference"
                )

                if not payment_verified:

                    return JsonResponse(
                        {
                            "msg": "Online payment verification required"
                        },
                        status=400
                    )

                if not payment_reference:

                    return JsonResponse(
                        {
                            "msg": "Payment reference is required"
                        },
                        status=400
                    )

                payment_status = "Paid"
                paid_at = timezone.now()

            # =================================================
            # CREATE ORDER
            # =================================================

            order = Order.objects.create(

                user=user,

                order_number=None,

                # ---------------------------------------------
                # ADDRESS SNAPSHOT
                # ---------------------------------------------

                full_name=address.full_name,

                mobile=address.mobile,

                house=address.house,

                area=address.area,

                city=address.city,

                state=address.state,

                pincode=address.pincode,

                address_type=address.address_type,

                # ---------------------------------------------
                # AMOUNT
                # ---------------------------------------------

                subtotal=subtotal,

                shipping_charge=shipping_charge,

                total_amount=total_amount,

                # ---------------------------------------------
                # PAYMENT
                # ---------------------------------------------

                payment_method=payment_method,

                payment_status=payment_status,

                payment_reference=payment_reference,

                paid_at=paid_at,

                # ---------------------------------------------
                # ORDER STATUS
                # ---------------------------------------------

                order_status="Pending"
            )

            # =================================================
            # ORDER NUMBER
            # =================================================

            order.order_number = (
                generate_order_number()
            )

            order.tracking_number = (
                generate_tracking_number()
            )

            order.save(
                update_fields=[
                    "order_number",
                    "tracking_number"
                ]
            )

            # =================================================
            # CREATE INITIAL TRACKING HISTORY
            # =================================================

            OrderTracking.objects.create(
                order=order,
                status="Pending",
                message="Your order has been placed successfully."
            )

            # =========================================================
            # CREATE ADMIN NOTIFICATION - NEW ORDER
            # =========================================================

            AdminNotification.objects.create(
                type="ORDER",
                title="New Order",
                message=(
                    f"New order #{order.order_number} "
                    f"received from {user.full_name}."
                ),
                target_id=order.id,
                target_url="/admin/orders",
                is_read=False
            )

            # =================================================
            # CREATE ORDER ITEMS
            # =================================================

            for cart_item in cart_items:

                product = cart_item.product

                # ---------------------------------------------
                # IMAGE URL
                # ---------------------------------------------

                image_url = None

                if product.image:

                    image_url = req.build_absolute_uri(
                        product.image.url
                    )

                # ---------------------------------------------
                # SIZE
                # ---------------------------------------------

                selected_size = None

                if cart_item.size:

                    selected_size = (
                        cart_item.size.size
                    )

                # ---------------------------------------------
                # ITEM TOTAL
                # ---------------------------------------------

                item_total = (
                    product.price *
                    cart_item.quantity
                )

                # ---------------------------------------------
                # CREATE ORDER ITEM
                # ---------------------------------------------

                OrderItem.objects.create(

                    order=order,

                    product=product,

                    product_name=product.name,

                    size=selected_size,

                    price=product.price,

                    quantity=cart_item.quantity,

                    total=item_total,

                    image=image_url
                )

                # ---------------------------------------------
                # DECREASE STOCK
                # ---------------------------------------------

                if cart_item.size:

                    product_size = ProductSize.objects.select_for_update().get(
                        id=cart_item.size.id,
                        product=product
                    )

                    product_size.stock -= (
                        cart_item.quantity
                    )

                    product_size.save(
                        update_fields=[
                            "stock"
                        ]
                    )

                else:

                    product.stock -= (
                        cart_item.quantity
                    )

                    product.save(
                        update_fields=[
                            "stock"
                        ]
                    )

            # =================================================
            # CLEAR CART
            # =================================================

            cart_items.delete()

            # =====================================================
            # SEND ORDER CONFIRMATION SMS
            # =====================================================

            try:

                sms_message = (
                    f"Order placed successfully! "
                    f"Order No: {order.order_number}. "
                    f"Amount: Rs.{order.total_amount}. "
                    f"Payment: {order.payment_method}. "
                    f"Thank you for shopping with us."
                )

                send_textbee_sms(
                    order.mobile,
                    sms_message
                )

            except Exception as sms_error:

                print(
                    "Order SMS Error:",
                    str(sms_error)
                )

        # =====================================================
        # SUCCESS RESPONSE
        # =====================================================

        return JsonResponse(
            {
                "status": True,

                "msg": "Order placed successfully",

                "order_id": order.id,

                "order_number": order.order_number,

                "tracking_number": order.tracking_number,

                "payment_method": order.payment_method,

                "payment_status": order.payment_status,

                "order_status": order.order_status,

                "subtotal": str(
                    order.subtotal
                ),

                "shipping_charge": str(
                    order.shipping_charge
                ),

                "total_amount": str(
                    order.total_amount
                )
            },
            status=201
        )

    except json.JSONDecodeError:

        return JsonResponse(
            {
                "msg": "Invalid JSON data"
            },
            status=400
        )

    except Exception as e:

        return JsonResponse(
            {
                "msg": str(e)
            },
            status=500
        )



# =========================================================
# ADMIN ORDERS API
# =========================================================
def admin_orders_api(req):

    # =====================================================
    # CHECK ADMIN LOGIN
    # =====================================================

    admin_id = req.session.get("admin_id")

    if not admin_id:

        return JsonResponse(
            {
                "msg": "Admin Login Required"
            },
            status=401
        )

    # =====================================================
    # CHECK ADMIN EXISTS
    # =====================================================

    try:

        admin = Admin.objects.get(
            id=admin_id
        )

    except Admin.DoesNotExist:

        return JsonResponse(
            {
                "msg": "Admin not found"
            },
            status=404
        )

    # =====================================================
    # GET ALL ORDERS
    # =====================================================

    if req.method == "GET":

        orders = (
            Order.objects
            .select_related("user")
            .prefetch_related(
                "items",
                "items__product",
                "tracking_history"
            )
            .order_by("-created_at")
        )

        data = []


        for order in orders:

            tracking_history = []

            for tracking in order.tracking_history.all():
                tracking_history.append({
                    "status": tracking.status,
                    "message": tracking.message,
                    "created_at": tracking.created_at.isoformat(),
                })

            # =============================================
            # CUSTOMER
            # =============================================

            customer = None

            if order.user:

                customer = {
                    "id": order.user.id,
                    "name": order.user.full_name,
                    "email": order.user.email,
                    "mobile": order.user.mobile,
                }

            # =============================================
            # ORDER ITEMS
            # =============================================

            items = []

            for item in order.items.all():

                image_url = None

                if item.image:

                    image_url = item.image

                    # If stored image is relative path
                    if image_url.startswith("/media/"):

                        image_url = req.build_absolute_uri(
                            image_url
                        )

                elif item.product and item.product.image:

                    image_url = req.build_absolute_uri(
                        item.product.image.url
                    )

                items.append({

                    "id": item.id,

                    "product_id": (
                        item.product.id
                        if item.product
                        else None
                    ),

                    "product_name": item.product_name,

                    "size": item.size,

                    "price": str(item.price),

                    "quantity": item.quantity,

                    "total": str(item.total),

                    "image": image_url,

                })

            # =============================================
            # ORDER DATA
            # =============================================

            data.append({

                "id": order.id,

                "order_number": order.order_number,

                "tracking_number": order.tracking_number,

                "tracking_history": tracking_history,

                # Customer
                "customer": customer,

                # Address
                "address": {

                    "full_name": order.full_name,

                    "mobile": order.mobile,

                    "house": order.house,

                    "area": order.area,

                    "city": order.city,

                    "state": order.state,

                    "pincode": order.pincode,

                    "address_type": order.address_type,

                },

                # Amount
                "subtotal": str(order.subtotal),

                "shipping_charge": str(
                    order.shipping_charge
                ),

                "total_amount": str(
                    order.total_amount
                ),

                # Payment
                "payment_method": order.payment_method,

                "payment_status": order.payment_status,

                "payment_reference": (
                    order.payment_reference
                ),

                "paid_at": (
                    order.paid_at.isoformat()
                    if order.paid_at
                    else None
                ),

                # Order status
                "order_status": order.order_status,

                # Items
                "items": items,

                # Dates
                "created_at": order.created_at.isoformat(),

                "updated_at": order.updated_at.isoformat(),

            })

        # =================================================
        # SUMMARY
        # =================================================

        total_orders = orders.count()

        pending_orders = orders.filter(
            order_status="Pending"
        ).count()

        confirmed_orders = orders.filter(
            order_status="Confirmed"
        ).count()

        shipped_orders = orders.filter(
            order_status="Shipped"
        ).count()

        delivered_orders = orders.filter(
            order_status="Delivered"
        ).count()

        cancelled_orders = orders.filter(
            order_status="Cancelled"
        ).count()

        return JsonResponse(
            {

                "orders": data,

                "summary": {

                    "total_orders": total_orders,

                    "pending": pending_orders,

                    "confirmed": confirmed_orders,

                    "shipped": shipped_orders,

                    "delivered": delivered_orders,

                    "cancelled": cancelled_orders,

                }

            },
            status=200
        )

    # =====================================================
    # UPDATE ORDER STATUS
    # =====================================================

    if req.method == "PATCH":

        try:

            body = json.loads(
                req.body
            )

            order_id = body.get(
                "order_id"
            )

            new_status = body.get(
                "order_status"
            )

            # =============================================
            # VALIDATION
            # =============================================

            if not order_id:

                return JsonResponse(
                    {
                        "msg": "Order ID is required"
                    },
                    status=400
                )

            if not new_status:

                return JsonResponse(
                    {
                        "msg": "Order status is required"
                    },
                    status=400
                )

            # =============================================
            # VALID STATUS
            # =============================================

            valid_statuses = [
                "Pending",
                "Confirmed",
                "Shipped",
                "Out for Delivery",
                "Delivered",
                "Cancelled",
            ]

            if new_status not in valid_statuses:

                return JsonResponse(
                    {
                        "msg": "Invalid order status"
                    },
                    status=400
                )

            # =============================================
            # GET ORDER
            # =============================================

            try:

                order = (
                    Order.objects
                    .select_related("user")
                    .get(
                        id=order_id
                    )
                )

            except Order.DoesNotExist:

                return JsonResponse(
                    {
                        "msg": "Order not found"
                    },
                    status=404
                )

            # =============================================
            # OLD STATUS
            # =============================================

            old_status = order.order_status

            if old_status == new_status:
                return JsonResponse(
                    {
                        "msg": "Order is already in this status",
                        "order_id": order.id,
                        "order_number": order.order_number,
                        "order_status": order.order_status,
                    },
                    status=200
                )

            order.order_status = new_status

            order.save(
                update_fields=[
                    "order_status",
                    "updated_at"
                ]
            )

            # =================================================
            # CREATE TRACKING HISTORY
            # =================================================

            tracking_messages = {
                "Pending": "Your order has been placed successfully.",
                "Confirmed": "Your order has been confirmed.",
                "Shipped": "Your order has been shipped.",
                "Out for Delivery": "Your order is out for delivery.",
                "Delivered": "Your order has been delivered successfully.",
                "Cancelled": "Your order has been cancelled.",
            }

            OrderTracking.objects.create(
                order=order,
                status=new_status,
                message=tracking_messages.get(
                    new_status,
                    f"Order status changed to {new_status}."
                )
            )
            # =============================================
            # CUSTOMER MOBILE
            # =============================================

            mobile = order.mobile

            if not mobile and order.user:

                mobile = order.user.mobile

            # =============================================
            # SMS MESSAGE
            # =============================================

            sms_message = None

            if new_status == "Confirmed":

                sms_message = (
                    f"ShopNest: Your order "
                    f"{order.order_number} has been confirmed. "
                    f"Thank you for shopping with us."
                )

            elif new_status == "Shipped":

                sms_message = (
                    f"ShopNest: Your order "
                    f"{order.order_number} has been shipped "
                    f"and is on the way."
                )

            elif new_status == "Delivered":

                sms_message = (
                    f"ShopNest: Your order "
                    f"{order.order_number} has been delivered "
                    f"successfully. "
                    f"Thank you for shopping with us."
                )

            elif new_status == "Cancelled":

                sms_message = (
                    f"ShopNest: Your order "
                    f"{order.order_number} has been cancelled."
                )

            # =============================================
            # SEND SMS
            # =============================================

            sms_sent = False

            sms_error = None

            if mobile and sms_message:

                try:

                    send_textbee_sms(
                        mobile=mobile,
                        message=sms_message
                    )

                    sms_sent = True

                except Exception as sms_exception:

                    sms_error = str(
                        sms_exception
                    )

                    print(
                        "TextBee SMS Error:",
                        sms_error
                    )

            # =============================================
            # RESPONSE
            # =============================================

            return JsonResponse(
                {

                    "msg": "Order status updated",

                    "order_id": order.id,

                    "order_number": order.order_number,

                    "old_status": old_status,

                    "order_status": order.order_status,

                    "sms_sent": sms_sent,

                    "sms_error": sms_error,

                },
                status=200
            )

        except json.JSONDecodeError:

            return JsonResponse(
                {
                    "msg": "Invalid JSON data"
                },
                status=400
            )

        except Exception as e:

            return JsonResponse(
                {
                    "msg": str(e)
                },
                status=500
            )

    # =====================================================
    # INVALID METHOD
    # =====================================================

    return JsonResponse(
        {
            "msg": "Invalid Request Method"
        },
        status=405
    )


# =========================================================
# ADMIN - GET ALL RETURN REQUESTS
# =========================================================

def admin_return_requests(req):

    # =====================================================
    # ONLY GET
    # =====================================================

    if req.method != "GET":

        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    # =====================================================
    # CHECK ADMIN LOGIN
    # =====================================================

    admin_id = req.session.get("admin_id")

    if not admin_id:

        return JsonResponse(
            {
                "msg": "Admin Login Required"
            },
            status=401
        )

    # =====================================================
    # CHECK ADMIN
    # =====================================================

    try:

        Admin.objects.get(
            id=admin_id
        )

    except Admin.DoesNotExist:

        return JsonResponse(
            {
                "msg": "Admin not found"
            },
            status=404
        )

    # =====================================================
    # GET RETURN REQUESTS
    # =====================================================

    try:

        return_requests = (
            ReturnRequest.objects
            .select_related(
                "order",
                "user"
            )
            .prefetch_related(
                "order__items",
                "order__items__product"
            )
            .order_by(
                "-requested_at"
            )
        )

        data = []

        for return_request in return_requests:

            order = return_request.order

            # =================================================
            # REFUND INFORMATION
            # =================================================

            refund_data = None

            refund = (
                Refund.objects
                .filter(
                    return_request=return_request
                )
                .first()
            )

            if refund:

                refund_data = {

                    "id": refund.id,

                    "amount": str(
                        refund.amount
                    ),

                    "method": refund.method,

                    "status": refund.status,

                    "razorpay_refund_id": (
                        refund.razorpay_refund_id
                    ),

                    "refund_reference": (
                        refund.refund_reference
                    ),

                    "processed_at": (
                        refund.processed_at.isoformat()
                        if refund.processed_at
                        else None
                    ),

                }

            # =================================================
            # RETURN DATA
            # =================================================

            data.append({

                "id": return_request.id,

                "order_id": (
                    order.id
                ),

                "order_number": (
                    order.order_number
                ),

                "user_id": (
                    return_request.user.id
                    if return_request.user
                    else None
                ),

                "customer_name": (
                    return_request.user.full_name
                    if return_request.user
                    else order.full_name
                ),

                "customer_email": (
                    return_request.user.email
                    if return_request.user
                    else None
                ),

                "customer_mobile": (
                    order.mobile
                ),

                "reason": (
                    return_request.reason
                ),

                "description": (
                    return_request.description
                ),

                "status": (
                    return_request.status
                ),

                "requested_at": (
                    return_request.requested_at.isoformat()
                    if return_request.requested_at
                    else None
                ),

                "approved_at": (
                    return_request.approved_at.isoformat()
                    if return_request.approved_at
                    else None
                ),

                "rejected_at": (
                    return_request.rejected_at.isoformat()
                    if return_request.rejected_at
                    else None
                ),

                "product_received_at": (
                    return_request.product_received_at.isoformat()
                    if return_request.product_received_at
                    else None
                ),

                "payment_method": (
                    order.payment_method
                ),

                "payment_status": (
                    order.payment_status
                ),

                "payment_reference": (
                    order.payment_reference
                ),

                "order_amount": (
                    str(order.total_amount)
                ),

                "refund": refund_data,

            })

        # =====================================================
        # RESPONSE
        # =====================================================

        return JsonResponse(
            {
                "status": True,

                "msg": (
                    "Return requests fetched successfully"
                ),

                "returns": data,

                "total_returns": len(data),

            },
            status=200
        )

    except Exception as e:

        return JsonResponse(
            {
                "status": False,

                "msg": str(e)

            },
            status=500
        )



# =========================================================
# ADMIN RETURN REQUEST STATUS
# =========================================================

def admin_return_update(req, id):

    # =====================================================
    # ONLY PATCH
    # =====================================================

    if req.method != "PATCH":

        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    # =====================================================
    # CHECK ADMIN LOGIN
    # =====================================================

    admin_id = req.session.get(
        "admin_id"
    )

    if not admin_id:

        return JsonResponse(
            {
                "msg": "Admin Login Required"
            },
            status=401
        )

    # =====================================================
    # CHECK ADMIN EXISTS
    # =====================================================

    try:

        Admin.objects.get(
            id=admin_id
        )

    except Admin.DoesNotExist:

        return JsonResponse(
            {
                "msg": "Admin not found"
            },
            status=404
        )

    try:

        # =================================================
        # GET REQUEST BODY
        # =================================================

        body = json.loads(
            req.body
        )

        new_status = body.get(
            "status"
        )

        # =================================================
        # VALIDATION
        # =================================================

        if not new_status:

            return JsonResponse(
                {
                    "msg": "Return status is required"
                },
                status=400
            )

        valid_statuses = [
            "Approved",
            "Rejected",
        ]

        if new_status not in valid_statuses:

            return JsonResponse(
                {
                    "msg": (
                        "Invalid return status. "
                        "Use Approved or Rejected."
                    )
                },
                status=400
            )

        # =================================================
        # GET RETURN REQUEST
        # =================================================

        try:

            return_request = (
                ReturnRequest.objects
                .select_related(
                    "order",
                    "user"
                )
                .get(
                    id=id
                )
            )

        except ReturnRequest.DoesNotExist:

            return JsonResponse(
                {
                    "msg": "Return request not found"
                },
                status=404
            )

        # =================================================
        # CHECK CURRENT STATUS
        # =================================================

        if return_request.status != "Requested":

            return JsonResponse(
                {
                    "msg": (
                        "Return request cannot be updated "
                        f"because its current status is "
                        f"{return_request.status}"
                    )
                },
                status=400
            )

        # =================================================
        # UPDATE STATUS
        # =================================================

        old_status = (
            return_request.status
        )

        return_request.status = new_status

        if new_status == "Approved":

            return_request.approved_at = (
                timezone.now()
            )

            return_request.rejected_at = None

        elif new_status == "Rejected":

            return_request.rejected_at = (
                timezone.now()
            )

            return_request.approved_at = None

        return_request.save(
            update_fields=[
                "status",
                "approved_at",
                "rejected_at",
                "updated_at",
            ]
        )

        # =================================================
        # RETURN STATUS SMS
        # =================================================

        sms_sent = False

        try:

            if new_status == "Approved":

                message = (
                    f"ShopNest: Your return request for "
                    f"order "
                    f"{return_request.order.order_number} "
                    f"has been approved. "
                    f"Please follow the return instructions."
                )

            else:

                message = (
                    f"ShopNest: Your return request for "
                    f"order "
                    f"{return_request.order.order_number} "
                    f"has been rejected. "
                    f"Please contact support for more details."
                )

            send_textbee_sms(
                return_request.order.mobile,
                message
            )

            sms_sent = True

        except Exception as sms_error:

            print(
                "Return Status SMS Error:",
                sms_error
            )

        # =================================================
        # RESPONSE
        # =================================================

        return JsonResponse(
            {
                "status": True,

                "msg": (
                    "Return request status updated"
                ),

                "sms_sent": sms_sent,

                "return": {

                    "id": (
                        return_request.id
                    ),

                    "order_id": (
                        return_request.order.id
                    ),

                    "order_number": (
                        return_request
                        .order
                        .order_number
                    ),

                    "old_status": (
                        old_status
                    ),

                    "status": (
                        return_request.status
                    ),

                    "reason": (
                        return_request.reason
                    ),

                    "approved_at": (
                        return_request
                        .approved_at
                        .isoformat()
                        if return_request.approved_at
                        else None
                    ),

                    "rejected_at": (
                        return_request
                        .rejected_at
                        .isoformat()
                        if return_request.rejected_at
                        else None
                    ),

                },
            },
            status=200
        )

    # =====================================================
    # INVALID JSON
    # =====================================================

    except json.JSONDecodeError:

        return JsonResponse(
            {
                "msg": "Invalid JSON data"
            },
            status=400
        )

    # =====================================================
    # OTHER ERROR
    # =====================================================

    except Exception as e:

        return JsonResponse(
            {
                "status": False,
                "msg": str(e)
            },
            status=500
        )

# =========================================================
# ADMIN RETURN REFUND
# =========================================================

def admin_return_refund(req, id):

    # =====================================================
    # ONLY POST
    # =====================================================

    if req.method != "POST":

        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    # =====================================================
    # CHECK ADMIN LOGIN
    # =====================================================

    admin_id = req.session.get(
        "admin_id"
    )

    if not admin_id:

        return JsonResponse(
            {
                "msg": "Admin Login Required"
            },
            status=401
        )

    # =====================================================
    # CHECK ADMIN
    # =====================================================

    try:

        Admin.objects.get(
            id=admin_id
        )

    except Admin.DoesNotExist:

        return JsonResponse(
            {
                "msg": "Admin not found"
            },
            status=404
        )

    try:

        # =================================================
        # GET RETURN REQUEST
        # =================================================

        try:

            return_request = (
                ReturnRequest.objects
                .select_related(
                    "order",
                    "user"
                )
                .get(
                    id=id
                )
            )

        except ReturnRequest.DoesNotExist:

            return JsonResponse(
                {
                    "msg": "Return request not found"
                },
                status=404
            )

        # =================================================
        # ONLY PRODUCT RECEIVED
        # =================================================

        if return_request.status != "Product Received":

            return JsonResponse(
                {
                    "msg": (
                        "Refund can only be processed "
                        "after the returned product is received"
                    ),

                    "current_status": (
                        return_request.status
                    ),
                },
                status=400
            )

        # =================================================
        # GET ORDER
        # =================================================

        order = return_request.order

        # =================================================
        # CHECK EXISTING REFUND
        # =================================================

        existing_refund = (
            Refund.objects
            .filter(
                return_request=return_request
            )
            .first()
        )

        if existing_refund:

            return JsonResponse(
                {
                    "msg": "Refund already exists",

                    "refund": {

                        "id": (
                            existing_refund.id
                        ),

                        "status": (
                            existing_refund.status
                        ),

                        "amount": str(
                            existing_refund.amount
                        ),

                        "method": (
                            existing_refund.method
                        ),
                    },
                },
                status=400
            )

        # =================================================
        # REQUEST BODY
        # =================================================

        try:

            body = json.loads(
                req.body
            )

        except json.JSONDecodeError:

            return JsonResponse(
                {
                    "msg": "Invalid JSON data"
                },
                status=400
            )

        # =================================================
        # REFUND AMOUNT
        # =================================================

        refund_amount = body.get(
            "amount"
        )

        if refund_amount in [
            None,
            "",
        ]:

            refund_amount = (
                order.total_amount
            )

        try:

            refund_amount = Decimal(
                str(refund_amount)
            )

        except Exception:

            return JsonResponse(
                {
                    "msg": "Invalid refund amount"
                },
                status=400
            )

        # =================================================
        # VALIDATE REFUND AMOUNT
        # =================================================

        if refund_amount <= 0:

            return JsonResponse(
                {
                    "msg": (
                        "Refund amount must be greater than 0"
                    )
                },
                status=400
            )

        order_total = Decimal(
            str(
                order.total_amount
            )
        )

        if refund_amount > order_total:

            return JsonResponse(
                {
                    "msg": (
                        "Refund amount cannot be greater "
                        "than order amount"
                    ),

                    "order_amount": str(
                        order_total
                    ),

                    "refund_amount": str(
                        refund_amount
                    ),
                },
                status=400
            )

        # =================================================
        # PAYMENT METHOD
        # =================================================

        payment_method = str(
            order.payment_method or ""
        ).strip().upper()

        payment_reference = (
            order.payment_reference
        )

        # =================================================
        # RAZORPAY PAYMENT
        # =================================================

        razorpay_methods = [
            "RAZORPAY",
            "ONLINE",
            "UPI",
            "CARD",
            "CREDIT CARD",
            "DEBIT CARD",
            "NETBANKING",
        ]

        if (
            payment_method in razorpay_methods
            and payment_reference
        ):

            # =============================================
            # REFUND PROCESSING
            # =============================================

            return_request.status = (
                "Refund Processing"
            )

            return_request.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            try:

                # =========================================
                # CREATE RAZORPAY REFUND
                # =========================================

                refund_response = (
                    create_razorpay_refund(
                        payment_id=payment_reference,
                        amount=refund_amount,
                        notes={
                            "order_number": (
                                order.order_number
                            ),

                            "return_request_id": (
                                return_request.id
                            ),

                            "reason": (
                                return_request.reason
                            ),
                        },
                    )
                )

                # =========================================
                # RAZORPAY REFUND ID
                # =========================================

                razorpay_refund_id = (
                    refund_response.get(
                        "id"
                    )
                )

                if not razorpay_refund_id:

                    raise Exception(
                        "Razorpay refund ID not received"
                    )

                # =========================================
                # CREATE REFUND RECORD
                # =========================================

                refund = Refund.objects.create(
                    return_request=(
                        return_request
                    ),

                    order=order,

                    amount=refund_amount,

                    method="RAZORPAY",

                    status="Completed",

                    razorpay_refund_id=(
                        razorpay_refund_id
                    ),

                    refund_reference=(
                        razorpay_refund_id
                    ),

                    processed_at=(
                        timezone.now()
                    ),
                )

                # =========================================
                # FINAL RETURN STATUS
                # =========================================

                return_request.status = (
                    "Refunded"
                )

                return_request.save(
                    update_fields=[
                        "status",
                        "updated_at",
                    ]
                )

                # =========================================
                # REFUND SUCCESS SMS
                # =========================================

                sms_sent = False

                try:

                    send_textbee_sms(
                        order.mobile,
                        (
                            f"ShopNest: Refund of Rs."
                            f"{refund_amount} for order "
                            f"{order.order_number} has been "
                            f"processed successfully. "
                            f"Refund reference: "
                            f"{razorpay_refund_id}."
                        )
                    )

                    sms_sent = True

                except Exception as sms_error:

                    print(
                        "Refund SMS Error:",
                        sms_error
                    )

                # =========================================
                # RESPONSE
                # =========================================

                return JsonResponse(
                    {
                        "status": True,

                        "msg": (
                            "Razorpay refund processed "
                            "successfully"
                        ),

                        "sms_sent": sms_sent,

                        "refund": {

                            "id": refund.id,

                            "order_id": (
                                order.id
                            ),

                            "order_number": (
                                order.order_number
                            ),

                            "amount": str(
                                refund.amount
                            ),

                            "method": (
                                refund.method
                            ),

                            "status": (
                                refund.status
                            ),

                            "razorpay_refund_id": (
                                refund
                                .razorpay_refund_id
                            ),

                            "refund_reference": (
                                refund
                                .refund_reference
                            ),

                            "processed_at": (
                                refund
                                .processed_at
                                .isoformat()
                            ),
                        },
                    },
                    status=200
                )

            except Exception as e:

                # =========================================
                # REFUND FAILED
                # =========================================

                return_request.status = (
                    "Product Received"
                )

                return_request.save(
                    update_fields=[
                        "status",
                        "updated_at",
                    ]
                )

                return JsonResponse(
                    {
                        "status": False,

                        "msg": (
                            "Razorpay refund failed"
                        ),

                        "error": str(e),
                    },
                    status=500
                )

        # =================================================
        # COD PAYMENT
        # =================================================

        else:

            refund_method = body.get(
                "refund_method"
            )

            refund_reference = body.get(
                "refund_reference"
            )

            # =============================================
            # VALID REFUND METHOD
            # =============================================

            if refund_method not in [
                "UPI",
                "BANK",
            ]:

                return JsonResponse(
                    {
                        "msg": (
                            "For COD refund, "
                            "refund_method must be "
                            "UPI or BANK"
                        )
                    },
                    status=400
                )

            # =============================================
            # REFUND REFERENCE
            # =============================================

            if not refund_reference:

                return JsonResponse(
                    {
                        "msg": (
                            "Refund reference is required "
                            "for COD refund"
                        )
                    },
                    status=400
                )

            # =============================================
            # CREATE MANUAL REFUND RECORD
            # =============================================

            refund = Refund.objects.create(
                return_request=(
                    return_request
                ),

                order=order,

                amount=refund_amount,

                method=refund_method,

                status="Completed",

                refund_reference=(
                    refund_reference
                ),

                customer_upi_id=(
                    body.get(
                        "customer_upi_id"
                    )
                ),

                customer_bank_name=(
                    body.get(
                        "customer_bank_name"
                    )
                ),

                customer_account_number=(
                    body.get(
                        "customer_account_number"
                    )
                ),

                customer_ifsc=(
                    body.get(
                        "customer_ifsc"
                    )
                ),

                processed_at=(
                    timezone.now()
                ),
            )

            # =============================================
            # FINAL RETURN STATUS
            # =============================================

            return_request.status = (
                "Refunded"
            )

            return_request.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            # =============================================
            # COD REFUND SMS
            # =============================================

            sms_sent = False

            try:

                send_textbee_sms(
                    order.mobile,
                    (
                        f"ShopNest: Refund of Rs."
                        f"{refund_amount} for order "
                        f"{order.order_number} has been "
                        f"processed via "
                        f"{refund_method}. "
                        f"Reference: "
                        f"{refund_reference}."
                    )
                )

                sms_sent = True

            except Exception as sms_error:

                print(
                    "COD Refund SMS Error:",
                    sms_error
                )

            # =============================================
            # RESPONSE
            # =============================================

            return JsonResponse(
                {
                    "status": True,

                    "msg": (
                        "COD refund recorded successfully"
                    ),

                    "sms_sent": sms_sent,

                    "refund": {

                        "id": refund.id,

                        "order_id": (
                            order.id
                        ),

                        "order_number": (
                            order.order_number
                        ),

                        "amount": str(
                            refund.amount
                        ),

                        "method": (
                            refund.method
                        ),

                        "status": (
                            refund.status
                        ),

                        "refund_reference": (
                            refund
                            .refund_reference
                        ),

                        "processed_at": (
                            refund
                            .processed_at
                            .isoformat()
                        ),
                    },
                },
                status=200
            )

    except Exception as e:

        return JsonResponse(
            {
                "status": False,
                "msg": str(e)
            },
            status=500
        )
# =========================================================
# ADMIN MARK PRODUCT RECEIVED
# =========================================================

def admin_return_received(req, id):

    # =====================================================
    # ONLY PATCH
    # =====================================================

    if req.method != "PATCH":

        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    # =====================================================
    # CHECK ADMIN LOGIN
    # =====================================================

    admin_id = req.session.get(
        "admin_id"
    )

    if not admin_id:

        return JsonResponse(
            {
                "msg": "Admin Login Required"
            },
            status=401
        )

    # =====================================================
    # CHECK ADMIN
    # =====================================================

    try:

        Admin.objects.get(
            id=admin_id
        )

    except Admin.DoesNotExist:

        return JsonResponse(
            {
                "msg": "Admin not found"
            },
            status=404
        )

    try:

        # =================================================
        # GET RETURN REQUEST
        # =================================================

        try:

            return_request = (
                ReturnRequest.objects
                .select_related(
                    "order",
                    "user"
                )
                .get(
                    id=id
                )
            )

        except ReturnRequest.DoesNotExist:

            return JsonResponse(
                {
                    "msg": "Return request not found"
                },
                status=404
            )

        # =================================================
        # ONLY APPROVED RETURN
        # =================================================

        if return_request.status != "Approved":

            return JsonResponse(
                {
                    "msg": (
                        "Product can be marked received "
                        "only after return is approved"
                    ),

                    "current_status": (
                        return_request.status
                    ),
                },
                status=400
            )

        # =================================================
        # UPDATE STATUS
        # =================================================

        return_request.status = (
            "Product Received"
        )

        return_request.product_received_at = (
            timezone.now()
        )

        return_request.save(
            update_fields=[
                "status",
                "product_received_at",
                "updated_at",
            ]
        )

        # =================================================
        # PRODUCT RECEIVED SMS
        # =================================================

        sms_sent = False

        try:

            send_textbee_sms(
                return_request.order.mobile,
                (
                    f"ShopNest: We have received the "
                    f"returned product for order "
                    f"{return_request.order.order_number}. "
                    f"Your refund will be processed shortly."
                )
            )

            sms_sent = True

        except Exception as sms_error:

            print(
                "Product Received SMS Error:",
                sms_error
            )

        # =================================================
        # RESPONSE
        # =================================================

        return JsonResponse(
            {
                "status": True,

                "msg": (
                    "Returned product marked as received"
                ),

                "sms_sent": sms_sent,

                "return": {

                    "id": (
                        return_request.id
                    ),

                    "order_id": (
                        return_request
                        .order
                        .id
                    ),

                    "order_number": (
                        return_request
                        .order
                        .order_number
                    ),

                    "status": (
                        return_request.status
                    ),

                    "product_received_at": (
                        return_request
                        .product_received_at
                        .isoformat()
                    ),
                },
            },
            status=200
        )

    except Exception as e:

        return JsonResponse(
            {
                "status": False,
                "msg": str(e)
            },
            status=500
        )




# =====================================================
# USER ORDERS API
# =====================================================
def user_orders(req):

    # =========================================
    # USER LOGIN
    # =========================================

    user_id = req.session.get(
        "user_id"
    )

    if not user_id:

        return JsonResponse(
            {
                "msg": "Login Required"
            },
            status=401
        )

    # =========================================
    # ONLY GET
    # =========================================

    if req.method != "GET":

        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    try:

        # =========================================
        # GET USER
        # =========================================

        user = users.objects.get(
            id=user_id
        )

        # =========================================
        # GET ORDERS
        # =========================================

        orders = (
            Order.objects
            .filter(
                user=user
            )
            .prefetch_related(
                "items",
                "items__product",
                "return_request",
                "tracking_history"
            )
            .order_by(
                "-created_at"
            )
        )

        order_list = []

        # =========================================
        # LOOP ORDERS
        # =========================================

        for order in orders:

            # =====================================
            # ORDER ITEMS
            # =====================================

            items = []

            for item in order.items.all():

                image_url = None

                # ---------------------------------
                # SAVED ORDER IMAGE
                # ---------------------------------

                if item.image:

                    image_url = item.image

                    if image_url.startswith(
                        "/media/"
                    ):

                        image_url = (
                            req.build_absolute_uri(
                                image_url
                            )
                        )

                # ---------------------------------
                # PRODUCT IMAGE
                # ---------------------------------

                elif (
                    item.product
                    and item.product.image
                ):

                    image_url = (
                        req.build_absolute_uri(
                            item.product.image.url
                        )
                    )

                items.append(
                    {
                        "id": item.id,

                        "product_id": (
                            item.product.id
                            if item.product
                            else None
                        ),

                        "product_name": (
                            item.product_name
                        ),

                        "size": item.size,

                        "price": str(
                            item.price
                        ),

                        "quantity": (
                            item.quantity
                        ),

                        "total": str(
                            item.total
                        ),

                        "image": image_url,
                    }
                )

            # =====================================
            # RETURN REQUEST
            # =====================================

            return_data = None

            try:

                return_request = (
                    order.return_request
                )

                return_data = {
                    "id": (
                        return_request.id
                    ),

                    "reason": (
                        return_request.reason
                    ),

                    "description": (
                        return_request.description
                    ),

                    "status": (
                        return_request.status
                    ),

                    "requested_at": (
                        return_request
                        .requested_at
                        .isoformat()
                    ),

                    "approved_at": (
                        return_request
                        .approved_at
                        .isoformat()
                        if return_request.approved_at
                        else None
                    ),

                    "rejected_at": (
                        return_request
                        .rejected_at
                        .isoformat()
                        if return_request.rejected_at
                        else None
                    ),

                    "product_received_at": (
                        return_request
                        .product_received_at
                        .isoformat()
                        if return_request
                        .product_received_at
                        else None
                    ),
                }

                # =================================
                # REFUND INFORMATION
                # =================================

                try:

                    refund = (
                        return_request.refund
                    )

                    return_data[
                        "refund"
                    ] = {

                        "id": refund.id,

                        "amount": str(
                            refund.amount
                        ),

                        "method": (
                            refund.method
                        ),

                        "status": (
                            refund.status
                        ),

                        "refund_reference": (
                            refund.refund_reference
                        ),

                        "razorpay_refund_id": (
                            refund.razorpay_refund_id
                        ),

                        "processed_at": (
                            refund
                            .processed_at
                            .isoformat()
                            if refund.processed_at
                            else None
                        ),
                    }

                except Refund.DoesNotExist:

                    return_data[
                        "refund"
                    ] = None

            except ReturnRequest.DoesNotExist:

                return_data = None

            # =================================================
            # TRACKING HISTORY
            # =================================================

            tracking_history = []

            for tracking in order.tracking_history.all():
                tracking_history.append({
                    "status": tracking.status,
                    "message": tracking.message,
                    "created_at": tracking.created_at.isoformat(),
                })

            # =====================================
            # ORDER DATA
            # =====================================
            order_list.append(
                {
                    "id": order.id,

                    "order_number": order.order_number,

                    "tracking_number": order.tracking_number,

                    "items": items,

                    "address": {
                        "full_name": order.full_name,
                        "mobile": order.mobile,
                        "house": order.house,
                        "area": order.area,
                        "city": order.city,
                        "state": order.state,
                        "pincode": order.pincode,
                        "address_type": order.address_type,
                    },

                    "subtotal": str(
                        order.subtotal
                    ),

                    "shipping_charge": str(
                        order.shipping_charge
                    ),

                    "total_amount": str(
                        order.total_amount
                    ),

                    "payment_method": (
                        order.payment_method
                    ),

                    "payment_status": (
                        order.payment_status
                    ),

                    "payment_reference": (
                        order.payment_reference
                    ),

                    "paid_at": (
                        order.paid_at.isoformat()
                        if order.paid_at
                        else None
                    ),

                    "order_status": (
                        order.order_status
                    ),

                    "tracking_history": tracking_history,

                    # =====================================
                    # RETURN REQUEST
                    # =====================================

                    "return": return_data,

                    "created_at": (
                        order.created_at.isoformat()
                    ),

                    "updated_at": (
                        order.updated_at.isoformat()
                    ),
                }
            )

        # =========================================
        # RESPONSE
        # =========================================

        return JsonResponse(
            {
                "msg": (
                    "Orders fetched successfully"
                ),

                "orders": order_list,

                "total_orders": (
                    len(order_list)
                ),
            },
            status=200
        )

    # =========================================
    # USER NOT FOUND
    # =========================================

    except users.DoesNotExist:

        return JsonResponse(
            {
                "msg": "User not found"
            },
            status=404
        )

    # =========================================
    # OTHER ERROR
    # =========================================

    except Exception as e:

        return JsonResponse(
            {
                "msg": str(e)
            },
            status=500
        )



def cancel_order(req, id):

    if req.method != "PATCH":
        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    # =====================================================
    # CHECK USER LOGIN
    # =====================================================

    user_id = req.session.get("user_id")

    if not user_id:
        return JsonResponse(
            {
                "msg": "Login Required"
            },
            status=401
        )

    try:

        # =================================================
        # GET ORDER (must belong to this user)
        # =================================================

        try:

            order = Order.objects.get(
                id=id,
                user_id=user_id
            )

        except Order.DoesNotExist:

            return JsonResponse(
                {
                    "msg": "Order not found"
                },
                status=404
            )

        # =================================================
        # ONLY PENDING / CONFIRMED CAN BE CANCELLED
        # =================================================

        non_cancellable = [
            "Shipped",
            "Delivered",
            "Cancelled",
        ]

        if order.order_status in non_cancellable:

            return JsonResponse(
                {
                    "msg": (
                        f"Order cannot be cancelled "
                        f"once it is {order.order_status}"
                    )
                },
                status=400
            )

        # =================================================
        # RESTORE STOCK + CANCEL
        # =================================================

        with transaction.atomic():

            order = Order.objects.select_for_update().get(
                id=id,
                user_id=user_id
            )

            if order.order_status in non_cancellable:

                return JsonResponse(
                    {
                        "msg": (
                            f"Order cannot be cancelled "
                            f"once it is {order.order_status}"
                        )
                    },
                    status=400
                )

            items = OrderItem.objects.select_related(
                "product"
            ).filter(
                order=order
            )

            for item in items:

                if not item.product:
                    continue

                # ---------------------------------------------
                # SIZE-BASED ITEM
                # ---------------------------------------------

                if item.size:

                    product_size = ProductSize.objects.select_for_update().filter(
                        product=item.product,
                        size=item.size
                    ).first()

                    if product_size:

                        product_size.stock += item.quantity

                        product_size.save(
                            update_fields=[
                                "stock"
                            ]
                        )

                # ---------------------------------------------
                # NORMAL PRODUCT
                # ---------------------------------------------

                else:

                    product = Product.objects.select_for_update().get(
                        id=item.product.id
                    )

                    product.stock += item.quantity

                    product.save(
                        update_fields=[
                            "stock"
                        ]
                    )

            # =============================================
            # UPDATE ORDER STATUS
            # =============================================

            order.order_status = "Cancelled"

            order.save(
                update_fields=[
                    "order_status",
                    "updated_at"
                ]
            )

            # =================================================
            # CREATE ADMIN NOTIFICATION - ORDER CANCELLED
            # =================================================

            AdminNotification.objects.create(
                type="CANCELLED_ORDER",
                title="Order Cancelled",
                message=(
                    f"Order #{order.order_number} "
                    f"was cancelled by {order.user.full_name}."
                ),
                target_id=order.id,
                target_url="/admin/orders",
                is_read=False
            )

        # =====================================================
        # SUCCESS RESPONSE
        # =====================================================

        return JsonResponse(
            {
                "msg": "Order cancelled successfully",

                "order_id": order.id,

                "order_number": order.order_number,

                "order_status": order.order_status,
            },
            status=200
        )

    except Exception as e:

        return JsonResponse(
            {
                "msg": str(e)
            },
            status=500
        )

# =========================================================
# USER RETURN REQUEST
# =========================================================

def return_order(req, id):

    # =====================================================
    # ONLY POST
    # =====================================================

    if req.method != "POST":

        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    # =====================================================
    # CHECK USER LOGIN
    # =====================================================

    user_id = req.session.get(
        "user_id"
    )

    if not user_id:

        return JsonResponse(
            {
                "msg": "Login Required"
            },
            status=401
        )

    try:

        # =================================================
        # GET ORDER
        # =================================================

        try:

            order = (
                Order.objects
                .select_related("user")
                .get(
                    id=id,
                    user_id=user_id
                )
            )

        except Order.DoesNotExist:

            return JsonResponse(
                {
                    "msg": "Order not found"
                },
                status=404
            )

        # =================================================
        # ONLY DELIVERED ORDERS CAN BE RETURNED
        # =================================================

        if order.order_status != "Delivered":

            return JsonResponse(
                {
                    "msg": (
                        "Only delivered orders "
                        "can be returned"
                    )
                },
                status=400
            )

        # =================================================
        # CHECK EXISTING RETURN REQUEST
        # =================================================

        existing_return = (
            ReturnRequest.objects
            .filter(
                order=order
            )
            .first()
        )

        if existing_return:

            return JsonResponse(
                {
                    "msg": (
                        "Return request already exists"
                    ),

                    "return_id": (
                        existing_return.id
                    ),

                    "return_status": (
                        existing_return.status
                    ),
                },
                status=400
            )

        # =================================================
        # GET REQUEST DATA
        # =================================================

        try:

            body = json.loads(
                req.body
            )

        except json.JSONDecodeError:

            return JsonResponse(
                {
                    "msg": "Invalid JSON data"
                },
                status=400
            )

        reason = body.get(
            "reason"
        )

        description = body.get(
            "description",
            ""
        )

        # =================================================
        # VALIDATE REASON
        # =================================================

        valid_reasons = [

            "Defective Product",
            "Wrong Product",
            "Damaged Product",
            "Size Issue",
            "Other",

        ]

        if reason not in valid_reasons:

            return JsonResponse(
                {
                    "msg": "Invalid return reason"
                },
                status=400
            )

        # =================================================
        # DESCRIPTION VALIDATION
        # =================================================

        description = str(
            description
        ).strip()

        if len(description) > 1000:

            return JsonResponse(
                {
                    "msg": (
                        "Description cannot exceed "
                        "1000 characters"
                    )
                },
                status=400
            )

        # =================================================
        # CREATE RETURN REQUEST
        # =================================================

        return_request = (
            ReturnRequest.objects.create(
                order=order,
                user=order.user,
                reason=reason,
                description=description,
                status="Requested"
            )
        )

        # =====================================================
        # CREATE ADMIN NOTIFICATION - NEW RETURN REQUEST
        # =====================================================

        AdminNotification.objects.create(
            type="RETURN",
            title="New Return Request",
            message=(
                f"{order.user.full_name} requested a return "
                f"for order #{order.order_number}."
            ),
            target_id=return_request.id,
            target_url="/admin/returns",
            is_read=False
        )


        # =====================================================
        # RETURN REQUEST SMS
        # =====================================================

        sms_sent = False

        try:

            send_textbee_sms(
                order.mobile,
                (
                    f"ShopNest: Your return request for "
                    f"order {order.order_number} has been received. "
                    f"Reason: {reason}. "
                    f"We will review your request shortly."
                )
            )

            sms_sent = True

        except Exception as sms_error:

            print(
                "Return Request SMS Error:",
                sms_error
            )

        # =================================================
        # RESPONSE
        # =================================================

        return JsonResponse(
            {
                "status": True,

                "msg": (
                    "Return request submitted successfully"
                ),

                "sms": sms_sent,

                "return": {

                    "id": return_request.id,

                    "order_id": order.id,

                    "order_number": (
                        order.order_number
                    ),

                    "reason": (
                        return_request.reason
                    ),

                    "description": (
                        return_request.description
                    ),

                    "status": (
                        return_request.status
                    ),

                    "requested_at": (
                        return_request
                        .requested_at
                        .isoformat()
                    ),

                },

            },
            status=201
        )

    except Exception as e:

        return JsonResponse(
            {
                "status": False,
                "msg": str(e)
            },
            status=500
        )



def product_detail(req, id):
    if req.method != "GET":
        return JsonResponse(
            {"msg": "Invalid Request Method"},
            status=405
        )

    try:

        product = Product.objects.select_related(
            "category"
        ).prefetch_related(
            "sizes",
            "reviews",
            "reviews__user"
        ).get(id=id)

    except Product.DoesNotExist:

        return JsonResponse(
            {"msg": "Product not found"},
            status=404
        )

    image_url = None

    if product.image:
        image_url = req.build_absolute_uri(product.image.url)

    # =========================
    # SIZES
    # =========================

    sizes = []

    for product_size in product.sizes.all():
        sizes.append({
            "id": product_size.id,
            "size": product_size.size,
            "stock": product_size.stock,
        })

        # =========================
        # GALLERY IMAGES
        # =========================

        gallery_images = []

        for img in product.images.all():
            gallery_images.append({
                "id": img.id,
                "image": req.build_absolute_uri(img.image.url),
            })


    # =========================
    # REVIEWS
    # =========================

    reviews_qs = product.reviews.filter(
        is_approved=True
    ).order_by("-created_at")

    reviews = []
    total_rating = 0

    for review in reviews_qs:
        total_rating += review.rating

        reviews.append({
            "id": review.id,
            "user_id": review.user.id,
            "user_name": review.user.full_name,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at.strftime("%d %b %Y"),
        })

    review_count = reviews_qs.count()

    avg_rating = (
        round(total_rating / review_count, 1)
        if review_count > 0
        else 0
    )

    # =========================
    # RESPONSE
    # =========================

    gallery_images = [
        {
            "id": img.id,
            "image": req.build_absolute_uri(img.image.url),
        }
        for img in product.images.all()
    ]

    data = {

        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "description": product.description,
        "price": str(product.price),

        "old_price": (
            str(product.old_price)
            if product.old_price
            else None
        ),

        "stock": product.stock,
        "image": image_url,
        "status": product.status,

        "sizes": sizes,
        "images": gallery_images,

        "category": {
            "id": product.category.id,
            "name": product.category.name,
            "slug": product.category.slug
        },

        "avg_rating": avg_rating,
        "review_count": review_count,
        "reviews": reviews,
    }

    return JsonResponse(data, status=200)


# =========================================================
# PRODUCT REVIEWS - GET list / POST add review
# =========================================================
def product_reviews(req, product_id):

    try:

        product = Product.objects.get(
            id=product_id
        )

    except Product.DoesNotExist:

        return JsonResponse(
            {"msg": "Product not found"},
            status=404
        )

    # =====================================================
    # GET - LIST REVIEWS
    # =====================================================

    if req.method == "GET":

        reviews_qs = product.reviews.filter(
            is_approved=True
        ).select_related(
            "user"
        ).order_by(
            "-created_at"
        )

        data = []

        for review in reviews_qs:

            data.append({
                "id": review.id,
                "user_id": review.user.id,
                "user_name": review.user.full_name,
                "rating": review.rating,
                "comment": review.comment,
                "created_at": review.created_at.strftime(
                    "%d %b %Y"
                ),
            })

        return JsonResponse(
            {
                "reviews": data,
                "count": len(data)
            },
            status=200
        )

    # =====================================================
    # POST - ADD / UPDATE REVIEW
    # =====================================================

    if req.method == "POST":

        # -------------------------------------------------
        # LOGIN CHECK
        # -------------------------------------------------

        user_id = req.session.get(
            "user_id"
        )

        if not user_id:

            return JsonResponse(
                {"msg": "Login Required"},
                status=401
            )

        try:

            user = users.objects.get(
                id=user_id
            )

        except users.DoesNotExist:

            return JsonResponse(
                {"msg": "User not found"},
                status=404
            )

        try:

            body = json.loads(
                req.body
            )

            rating = body.get(
                "rating"
            )

            comment = body.get(
                "comment",
                ""
            )

            # -----------------------------------------
            # VALIDATION
            # -----------------------------------------

            if not rating:

                return JsonResponse(
                    {
                        "msg": "Rating is required"
                    },
                    status=400
                )

            try:

                rating = int(
                    rating
                )

            except (ValueError, TypeError):

                return JsonResponse(
                    {
                        "msg": "Rating must be a number"
                    },
                    status=400
                )

            if rating < 1 or rating > 5:

                return JsonResponse(
                    {
                        "msg": "Rating must be between 1 and 5"
                    },
                    status=400
                )

            # -----------------------------------------
            # CREATE OR UPDATE REVIEW
            # (one review per user per product)
            # -----------------------------------------

            review, created = Review.objects.update_or_create(
                product=product,
                user=user,
                defaults={
                    "rating": rating,
                    "comment": comment,
                    "is_approved": False
                }
            )

            # =================================================
            # CREATE ADMIN NOTIFICATION - NEW REVIEW
            # =================================================

            if created:

                AdminNotification.objects.create(
                    type="REVIEW",
                    title="New Review",
                    message=(
                        f"{user.full_name} submitted a "
                        f"{rating}-star review for "
                        f"{product.name}."
                    ),
                    target_id=review.id,
                    target_url="/admin/reviews",
                    is_read=False
                )

            return JsonResponse(
                {
                    "msg": (
                        "Review submitted successfully"
                        if created
                        else "Review updated successfully"
                    ),

                    "review": {
                        "id": review.id,
                        "user_id": user.id,
                        "user_name": user.full_name,
                        "rating": review.rating,
                        "comment": review.comment,
                        "is_approved": review.is_approved,
                        "created_at": review.created_at.strftime(
                            "%d %b %Y"
                        ),
                    }
                },
                status=201
            )

        except json.JSONDecodeError:

            return JsonResponse(
                {
                    "msg": "Invalid JSON data"
                },
                status=400
            )

        except Exception as e:

            return JsonResponse(
                {
                    "msg": str(e)
                },
                status=500
            )

    return JsonResponse(
        {
            "msg": "Invalid Request Method"
        },
        status=405
    )


# =========================================================
# PRODUCT GALLERY IMAGES API
# =========================================================

def product_images_api(req, product_id):
    try:

        product = Product.objects.get(id=product_id)

    except Product.DoesNotExist:

        return JsonResponse(
            {"msg": "Product not found"},
            status=404
        )

    if req.method == "GET":

        images = product.images.all().order_by("created_at")

        data = []

        for img in images:
            data.append({
                "id": img.id,
                "image": req.build_absolute_uri(img.image.url),
            })

        return JsonResponse(
            {"images": data},
            status=200
        )

    if req.method == "POST":

        admin_id = req.session.get("admin_id")

        if not admin_id:
            return JsonResponse(
                {"msg": "Admin Login Required"},
                status=401
            )

        files = req.FILES.getlist("images")

        if not files:
            return JsonResponse(
                {"msg": "At least one image is required"},
                status=400
            )

        created = []

        for file in files:
            gallery_image = ProductImage.objects.create(
                product=product,
                image=file
            )

            created.append({
                "id": gallery_image.id,
                "image": req.build_absolute_uri(
                    gallery_image.image.url
                ),
            })

        return JsonResponse(
            {
                "msg": "Images uploaded successfully",
                "images": created
            },
            status=201
        )

    return JsonResponse(
        {"msg": "Invalid Request Method"},
        status=405
    )


# =========================================================
# DELETE SINGLE GALLERY IMAGE
# =========================================================

def product_image_delete(req, image_id):

    if req.method != "DELETE":
        return JsonResponse(
            {"msg": "Invalid Request Method"},
            status=405
        )

    admin_id = req.session.get("admin_id")

    if not admin_id:
        return JsonResponse(
            {"msg": "Admin Login Required"},
            status=401
        )

    try:
        image = ProductImage.objects.get(id=image_id)
        image.delete()

        return JsonResponse(
            {"msg": "Image deleted successfully"},
            status=200
        )

    except ProductImage.DoesNotExist:
        return JsonResponse(
            {"msg": "Image not found"},
            status=404
        )


# =========================================================
# WISHLIST API
# =========================================================

def wishlist_api(req):

    user_id = req.session.get("user_id")

    if not user_id:
        return JsonResponse(
            {
                "msg": "Login Required"
            },
            status=401
        )

    try:

        user = users.objects.get(
            id=user_id
        )

    except users.DoesNotExist:

        return JsonResponse(
            {
                "msg": "User not found"
            },
            status=404
        )

    # =====================================================
    # GET - USER WISHLIST
    # =====================================================

    if req.method == "GET":

        wishlist_items = Wishlist.objects.filter(
            user=user
        ).select_related(
            "product",
            "product__category"
        ).prefetch_related(
            "product__images"
        ).order_by(
            "-created_at"
        )

        data = []

        for item in wishlist_items:

            product = item.product

            image_url = None

            if product.image:

                image_url = req.build_absolute_uri(
                    product.image.url
                )

            gallery_images = []

            for product_image in product.images.all():

                if product_image.image:

                    gallery_images.append(
                        req.build_absolute_uri(
                            product_image.image.url
                        )
                    )

            data.append(
                {
                    "wishlist_id": item.id,

                    "product_id": product.id,

                    "name": product.name,

                    "slug": product.slug,

                    "description": product.description,

                    "price": str(product.price),

                    "old_price": (
                        str(product.old_price)
                        if product.old_price
                        else None
                    ),

                    "stock": product.stock,

                    "image": image_url,

                    "images": gallery_images,

                    "status": product.status,

                    "category": {
                        "id": product.category.id,
                        "name": product.category.name,
                        "slug": product.category.slug
                    },

                    "created_at": item.created_at
                }
            )

        return JsonResponse(
            {
                "wishlist": data,
                "count": len(data)
            },
            status=200
        )

    # =====================================================
    # POST - ADD TO WISHLIST
    # =====================================================

    if req.method == "POST":

        try:

            body = json.loads(
                req.body
            )

            product_id = body.get(
                "product_id"
            )

            if not product_id:

                return JsonResponse(
                    {
                        "msg": "Product ID is required"
                    },
                    status=400
                )

            try:

                product = Product.objects.get(
                    id=product_id
                )

            except Product.DoesNotExist:

                return JsonResponse(
                    {
                        "msg": "Product not found"
                    },
                    status=404
                )

            wishlist_item, created = Wishlist.objects.get_or_create(
                user=user,
                product=product
            )

            if not created:

                return JsonResponse(
                    {
                        "msg": "Product already in wishlist",
                        "wishlist_id": wishlist_item.id
                    },
                    status=200
                )

            return JsonResponse(
                {
                    "msg": "Product added to wishlist",
                    "wishlist_id": wishlist_item.id
                },
                status=201
            )

        except json.JSONDecodeError:

            return JsonResponse(
                {
                    "msg": "Invalid JSON data"
                },
                status=400
            )

        except Exception as e:

            return JsonResponse(
                {
                    "msg": str(e)
                },
                status=500
            )

    return JsonResponse(
        {
            "msg": "Invalid Request Method"
        },
        status=405
    )


# =========================================================
# REMOVE FROM WISHLIST
# =========================================================

def wishlist_remove(req, product_id):

    if req.method != "DELETE":

        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    user_id = req.session.get(
        "user_id"
    )

    if not user_id:

        return JsonResponse(
            {
                "msg": "Login Required"
            },
            status=401
        )

    try:

        wishlist_item = Wishlist.objects.get(
            user_id=user_id,
            product_id=product_id
        )

        wishlist_item.delete()

        return JsonResponse(
            {
                "msg": "Product removed from wishlist"
            },
            status=200
        )

    except Wishlist.DoesNotExist:

        return JsonResponse(
            {
                "msg": "Product is not in wishlist"
            },
            status=404
        )

    except Exception as e:

        return JsonResponse(
            {
                "msg": str(e)
            },
            status=500
        )


# =========================================================
# CHECK WISHLIST
# =========================================================

def wishlist_check(req, product_id):

    if req.method != "GET":

        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    user_id = req.session.get(
        "user_id"
    )

    if not user_id:

        return JsonResponse(
            {
                "is_wishlisted": False
            },
            status=200
        )

    exists = Wishlist.objects.filter(
        user_id=user_id,
        product_id=product_id
    ).exists()

    return JsonResponse(
        {

            "is_wishlisted": exists
        },
        status=200
    )



# =========================================================
# RAZORPAY TEST ORDER
# =========================================================

# =========================================================
# RAZORPAY TEST ORDER
# =========================================================

def razorpay_test_order(request):

    if request.method != "POST":
        return JsonResponse(
            {
                "status": False,
                "message": "Invalid Request Method",
            },
            status=405,
        )

    try:

        amount = 100

        razorpay_order = create_razorpay_order(
            amount=amount,
            receipt="TEST-ORDER-001",
            notes={
                "purpose": "Razorpay integration testing",
            },
        )

        return JsonResponse(
            {
                "status": True,
                "message": "Razorpay order created successfully",
                "key_id": RAZORPAY_KEY_ID,
                "order": razorpay_order,
            },
            status=200,
        )

    except Exception as e:

        return JsonResponse(
            {
                "status": False,
                "message": str(e),
            },
            status=500,
        )


# =========================================================
# RAZORPAY CREATE ORDER
# =========================================================

def razorpay_create_order(request):

    if request.method != "POST":

        return JsonResponse(
            {
                "status": False,
                "message": "Invalid Request Method",
            },
            status=405,
        )

    user_id = request.session.get("user_id")

    if not user_id:

        return JsonResponse(
            {
                "status": False,
                "message": "Login Required",
            },
            status=401,
        )

    try:

        user = users.objects.get(
            id=user_id
        )

    except users.DoesNotExist:

        return JsonResponse(
            {
                "status": False,
                "message": "User not found",
            },
            status=404,
        )

    try:

        body = json.loads(
            request.body
        )

        address_id = body.get(
            "address_id"
        )

        payment_method = body.get(
            "payment_method"
        )

        if not address_id:

            return JsonResponse(
                {
                    "status": False,
                    "message": "Address is required",
                },
                status=400,
            )

        if payment_method not in [
            "UPI",
            "CARD",
        ]:

            return JsonResponse(
                {
                    "status": False,
                    "message": "Invalid online payment method",
                },
                status=400,
            )

        # =====================================================
        # VALIDATE ADDRESS
        # =====================================================

        try:

            UserAddress.objects.get(
                id=address_id,
                user=user
            )

        except UserAddress.DoesNotExist:

            return JsonResponse(
                {
                    "status": False,
                    "message": "Address not found",
                },
                status=404,
            )

        # =====================================================
        # GET CART
        # =====================================================

        try:

            cart = Cart.objects.get(
                user=user
            )

        except Cart.DoesNotExist:

            return JsonResponse(
                {
                    "status": False,
                    "message": "Cart is empty",
                },
                status=400,
            )

        cart_items = CartItem.objects.select_related(
            "product",
            "size"
        ).filter(
            cart=cart
        )

        if not cart_items.exists():

            return JsonResponse(
                {
                    "status": False,
                    "message": "Cart is empty",
                },
                status=400,
            )

        # =====================================================
        # CALCULATE ACTUAL TOTAL FROM DATABASE
        # =====================================================

        subtotal = 0

        for cart_item in cart_items:

            product = cart_item.product

            if cart_item.size:

                product_size = ProductSize.objects.filter(
                    id=cart_item.size.id,
                    product=product
                ).first()

                if not product_size:

                    return JsonResponse(
                        {
                            "status": False,
                            "message": (
                                f"Selected size not found "
                                f"for {product.name}"
                            ),
                        },
                        status=400,
                    )

                if product_size.stock < cart_item.quantity:

                    return JsonResponse(
                        {
                            "status": False,
                            "message": (
                                f"Insufficient stock for "
                                f"{product.name}"
                            ),
                        },
                        status=400,
                    )

            else:

                if product.stock < cart_item.quantity:

                    return JsonResponse(
                        {
                            "status": False,
                            "message": (
                                f"Insufficient stock for "
                                f"{product.name}"
                            ),
                        },
                        status=400,
                    )

            subtotal += (
                product.price *
                cart_item.quantity
            )

        # =====================================================
        # SHIPPING
        # =====================================================

        shipping_charge = 0

        total_amount = (
            subtotal +
            shipping_charge
        )

        if total_amount <= 0:

            return JsonResponse(
                {
                    "status": False,
                    "message": "Invalid order amount",
                },
                status=400,
            )

        # =====================================================
        # RAZORPAY ORDER
        # =====================================================

        receipt = (
            f"ORDER-{user.id}-"
            f"{timezone.now().strftime('%Y%m%d%H%M%S')}"
        )

        razorpay_order = create_razorpay_order(
            amount=total_amount,
            receipt=receipt,
            notes={
                "user_id": str(user.id),
                "address_id": str(address_id),
                "payment_method": payment_method,
            }
        )

        return JsonResponse(
            {
                "status": True,
                "message": "Razorpay order created successfully",
                "key_id": RAZORPAY_KEY_ID,
                "order": razorpay_order,
                "amount": str(total_amount),
            },
            status=200,
        )

    except json.JSONDecodeError:

        return JsonResponse(
            {
                "status": False,
                "message": "Invalid JSON data",
            },
            status=400,
        )

    except Exception as e:

        return JsonResponse(
            {
                "status": False,
                "message": str(e),
            },
            status=500,
        )


# =========================================================
# RAZORPAY VERIFY PAYMENT
# =========================================================

def razorpay_verify_payment(request):

    if request.method != "POST":

        return JsonResponse(
            {
                "status": False,
                "message": "Invalid Request Method",
            },
            status=405,
        )

    user_id = request.session.get("user_id")

    if not user_id:

        return JsonResponse(
            {
                "status": False,
                "message": "Login Required",
            },
            status=401,
        )

    try:

        user = users.objects.get(
            id=user_id
        )

    except users.DoesNotExist:

        return JsonResponse(
            {
                "status": False,
                "message": "User not found",
            },
            status=404,
        )

    try:

        body = json.loads(
            request.body
        )

        razorpay_order_id = body.get(
            "razorpay_order_id"
        )

        razorpay_payment_id = body.get(
            "razorpay_payment_id"
        )

        razorpay_signature = body.get(
            "razorpay_signature"
        )

        address_id = body.get(
            "address_id"
        )

        payment_method = body.get(
            "payment_method"
        )

        # =====================================================
        # BASIC VALIDATION
        # =====================================================

        if not razorpay_order_id:

            return JsonResponse(
                {
                    "status": False,
                    "message": "Razorpay Order ID is required",
                },
                status=400,
            )

        if not razorpay_payment_id:

            return JsonResponse(
                {
                    "status": False,
                    "message": "Razorpay Payment ID is required",
                },
                status=400,
            )

        if not razorpay_signature:

            return JsonResponse(
                {
                    "status": False,
                    "message": "Razorpay Signature is required",
                },
                status=400,
            )

        if not address_id:

            return JsonResponse(
                {
                    "status": False,
                    "message": "Address is required",
                },
                status=400,
            )

        if payment_method not in [
            "UPI",
            "CARD",
        ]:

            return JsonResponse(
                {
                    "status": False,
                    "message": "Invalid payment method",
                },
                status=400,
            )

        # =====================================================
        # VALIDATE ADDRESS
        # =====================================================

        try:

            UserAddress.objects.get(
                id=address_id,
                user=user
            )

        except UserAddress.DoesNotExist:

            return JsonResponse(
                {
                    "status": False,
                    "message": "Address not found",
                },
                status=404,
            )

        # =====================================================
        # VERIFY RAZORPAY SIGNATURE
        # =====================================================

        verify_razorpay_payment(
            razorpay_order_id=razorpay_order_id,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature,
        )

        # =====================================================
        # FETCH RAZORPAY ORDER
        # =====================================================

        razorpay_order = client.order.fetch(
            razorpay_order_id
        )

        razorpay_amount = int(
            razorpay_order.get(
                "amount",
                0
            )
        )

        # =====================================================
        # GET CURRENT CART TOTAL
        # =====================================================

        try:

            cart = Cart.objects.get(
                user=user
            )

        except Cart.DoesNotExist:

            return JsonResponse(
                {
                    "status": False,
                    "message": "Cart is empty",
                },
                status=400,
            )

        cart_items = CartItem.objects.select_related(
            "product",
            "size"
        ).filter(
            cart=cart
        )

        if not cart_items.exists():

            return JsonResponse(
                {
                    "status": False,
                    "message": "Cart is empty",
                },
                status=400,
            )

        subtotal = 0

        for cart_item in cart_items:

            product = cart_item.product

            subtotal += (
                product.price *
                cart_item.quantity
            )

        shipping_charge = 0

        total_amount = (
            subtotal +
            shipping_charge
        )

        expected_amount = int(
            round(
                float(total_amount) * 100
            )
        )

        # =====================================================
        # AMOUNT VALIDATION
        # =====================================================

        if razorpay_amount != expected_amount:

            return JsonResponse(
                {
                    "status": False,
                    "message": (
                        "Payment amount does not "
                        "match order amount"
                    ),
                },
                status=400,
            )

        # =====================================================
        # DUPLICATE PAYMENT CHECK
        # =====================================================

        existing_order = Order.objects.filter(
            payment_reference=razorpay_payment_id
        ).first()

        if existing_order:

            return JsonResponse(
                {
                    "status": True,
                    "message": "Payment already processed",
                    "order_id": existing_order.id,
                    "order_number": existing_order.order_number,
                    "payment_status": existing_order.payment_status,
                    "order_status": existing_order.order_status,
                },
                status=200,
            )

        # =====================================================
        # CREATE ACTUAL ORDER
        # =====================================================

        order_request_data = {
            "address_id": address_id,
            "payment_method": payment_method,
            "payment_reference": razorpay_payment_id,
            "razorpay_order_id": razorpay_order_id,
            "payment_verified": True,
        }

        request._body = json.dumps(
            order_request_data
        ).encode("utf-8")

        order_response = place_order(
            request
        )

        # =====================================================
        # RETURN PLACE ORDER RESPONSE
        # =====================================================

        return order_response


    except Exception as e:

        error_message = str(e)

        if "signature" in error_message.lower():
            return JsonResponse(

                {

                    "status": False,

                    "message": "Payment signature verification failed",

                },

                status=400,

            )

        return JsonResponse(

            {

                "status": False,

                "message": error_message,

            },

            status=500,

        )

    except json.JSONDecodeError:

        return JsonResponse(
            {
                "status": False,
                "message": "Invalid JSON data",
            },
            status=400,
        )

    except Exception as e:

        return JsonResponse(
            {
                "status": False,
                "message": str(e),
            },
            status=500,
        )
# =========================================================
# CONTACT US
# =========================================================
def contact_us(req):

    # =====================================================
    # GET - USER'S CONTACT MESSAGES
    # =====================================================

    if req.method == "GET":

        try:

            user_id = req.session.get(
                "user_id"
            )

            if not user_id:

                return JsonResponse(
                    {
                        "msg": "Login Required"
                    },
                    status=401
                )

            contacts = ContactMessage.objects.filter(
                user_id=user_id
            ).order_by(
                "-created_at"
            )

            messages = []

            for contact in contacts:

                messages.append(
                    {
                        "id": contact.id,
                        "name": contact.name,
                        "email": contact.email,
                        "phone": contact.phone,
                        "subject": contact.subject,
                        "message": contact.message,
                        "status": contact.status,
                        "created_at": contact.created_at,
                        "updated_at": contact.updated_at,
                        "admin_response": getattr(
                            contact,
                            "admin_response",
                            ""
                        ),
                    }
                )

            return JsonResponse(
                {
                    "messages": messages,
                    "count": len(messages)
                },
                status=200
            )

        except Exception as e:

            return JsonResponse(
                {
                    "msg": str(e)
                },
                status=500
            )

    # =====================================================
    # POST - CREATE CONTACT MESSAGE
    # =====================================================

    if req.method == "POST":

        try:

            data = json.loads(
                req.body
            )

            name = str(
                data.get(
                    "name",
                    ""
                )
            ).strip()

            email = str(
                data.get(
                    "email",
                    ""
                )
            ).strip()

            phone = str(
                data.get(
                    "phone",
                    ""
                )
            ).strip()

            subject = str(
                data.get(
                    "subject",
                    ""
                )
            ).strip()

            message = str(
                data.get(
                    "message",
                    ""
                )
            ).strip()

            # =================================================
            # VALIDATION
            # =================================================

            if not name or not email or not subject or not message:

                return JsonResponse(
                    {
                        "msg": (
                            "Name, Email, Subject and Message "
                            "are required"
                        )
                    },
                    status=400
                )

            # =================================================
            # GET LOGGED-IN USER
            # =================================================

            user_id = req.session.get(
                "user_id"
            )

            user = None

            if user_id:

                user = users.objects.filter(
                    id=user_id
                ).first()

            # =================================================
            # CREATE CONTACT MESSAGE
            # =================================================

            contact = ContactMessage.objects.create(
                user=user,
                name=name,
                email=email,
                phone=phone or None,
                subject=subject,
                message=message,
            )

            # =================================================
            # CREATE ADMIN NOTIFICATION
            # =================================================

            AdminNotification.objects.create(
                type="CONTACT",
                title="New Contact Message",
                message=(
                    f"{contact.name} sent a new message: "
                    f"{contact.subject}."
                ),
                target_id=contact.id,
                target_url="/admin/contact-queries",
                is_read=False
            )

            # =================================================
            # SUCCESS RESPONSE
            # =================================================

            return JsonResponse(
                {
                    "msg": (
                        "Your message has been sent successfully"
                    ),
                    "contact": {
                        "id": contact.id,
                        "name": contact.name,
                        "email": contact.email,
                        "phone": contact.phone,
                        "subject": contact.subject,
                        "message": contact.message,
                        "status": contact.status,
                        "created_at": contact.created_at,
                    }
                },
                status=201
            )

        except json.JSONDecodeError:

            return JsonResponse(
                {
                    "msg": "Invalid JSON data"
                },
                status=400
            )

        except Exception as e:

            return JsonResponse(
                {
                    "msg": str(e)
                },
                status=500
            )

    # =====================================================
    # OTHER METHODS
    # =====================================================

    return JsonResponse(
        {
            "msg": "Invalid Request Method"
        },
        status=405
    )


# =========================================================
# ADMIN CONTACT MESSAGES
# =========================================================

def admin_contact_messages(req):
    # =====================================================
    # ADMIN AUTHENTICATION
    # =====================================================

    admin_id = req.session.get(
        "admin_id"
    )

    if not admin_id:
        return JsonResponse(
            {
                "msg": "Admin Login Required"
            },
            status=401
        )

    # =====================================================
    # VERIFY ADMIN
    # =====================================================

    try:
        Admin.objects.get(
            id=admin_id
        )
    except Admin.DoesNotExist:
        return JsonResponse(
            {
                "msg": "Admin not found"
            },
            status=404
        )

    # =====================================================
    # ONLY GET
    # =====================================================

    if req.method != "GET":
        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    try:
        # =================================================
        # GET CONTACT MESSAGES
        # =================================================

        contacts = (
            ContactMessage.objects
            .select_related("user")
            .order_by("-created_at")
        )

        data = []

        for contact in contacts:
            data.append({
                "id": contact.id,

                "user_id": (
                    contact.user.id
                    if contact.user
                    else None
                ),

                "name": contact.name,
                "email": contact.email,
                "phone": contact.phone,
                "subject": contact.subject,
                "message": contact.message,

                "admin_response": (
                    contact.admin_response
                    if contact.admin_response
                    else ""
                ),

                "admin_response_at": (
                    contact.admin_response_at.isoformat()
                    if contact.admin_response_at
                    else None
                ),

                "status": contact.status,

                "created_at": (
                    contact.created_at.isoformat()
                    if contact.created_at
                    else None
                ),

                "updated_at": (
                    contact.updated_at.isoformat()
                    if contact.updated_at
                    else None
                ),
            })

        # =================================================
        # SUMMARY
        # =================================================

        total_messages = contacts.count()

        new_messages = contacts.filter(
            status="New"
        ).count()

        read_messages = contacts.filter(
            status="Read"
        ).count()

        in_progress_messages = contacts.filter(
            status="In Progress"
        ).count()

        resolved_messages = contacts.filter(
            status="Resolved"
        ).count()

        return JsonResponse(
            {
                "status": True,

                "messages": data,

                "summary": {
                    "total": total_messages,
                    "new": new_messages,
                    "read": read_messages,
                    "in_progress": in_progress_messages,
                    "resolved": resolved_messages,
                },
            },
            status=200
        )

    except Exception as e:
        return JsonResponse(
            {
                "status": False,
                "msg": str(e)
            },
            status=500
        )


# =========================================================
# ADMIN CONTACT MESSAGE STATUS
# =========================================================

def admin_contact_message_status(req, id):
    # =====================================================
    # ONLY PATCH
    # =====================================================

    if req.method != "PATCH":
        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    # =====================================================
    # ADMIN AUTHENTICATION
    # =====================================================

    admin_id = req.session.get(
        "admin_id"
    )

    if not admin_id:
        return JsonResponse(
            {
                "msg": "Admin Login Required"
            },
            status=401
        )

    # =====================================================
    # VERIFY ADMIN
    # =====================================================

    try:
        Admin.objects.get(
            id=admin_id
        )
    except Admin.DoesNotExist:
        return JsonResponse(
            {
                "msg": "Admin not found"
            },
            status=404
        )

    try:
        # =================================================
        # GET CONTACT
        # =================================================

        contact = ContactMessage.objects.get(
            id=id
        )

    except ContactMessage.DoesNotExist:
        return JsonResponse(
            {
                "msg": "Contact message not found"
            },
            status=404
        )

    try:
        # =================================================
        # PARSE JSON
        # =================================================

        data = json.loads(
            req.body
        )

        status_value = str(
            data.get(
                "status",
                ""
            )
        ).strip()

        # =================================================
        # VALIDATE STATUS
        # =================================================

        allowed_statuses = [
            "New",
            "Read",
            "In Progress",
            "Resolved",
        ]

        if status_value not in allowed_statuses:
            return JsonResponse(
                {
                    "msg": "Invalid contact status",
                    "allowed_statuses": allowed_statuses,
                },
                status=400
            )

        # =================================================
        # UPDATE STATUS
        # =================================================

        old_status = contact.status

        contact.status = status_value

        contact.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return JsonResponse(
            {
                "status": True,
                "msg": "Contact status updated successfully",

                "contact": {
                    "id": contact.id,
                    "old_status": old_status,
                    "status": contact.status,
                    "updated_at": (
                        contact.updated_at.isoformat()
                        if contact.updated_at
                        else None
                    ),
                },
            },
            status=200
        )

    except json.JSONDecodeError:
        return JsonResponse(
            {
                "msg": "Invalid JSON data"
            },
            status=400
        )

    except Exception as e:
        return JsonResponse(
            {
                "status": False,
                "msg": str(e)
            },
            status=500
        )


# =========================================================
# ADMIN DELETE CONTACT MESSAGE
# =========================================================

def admin_contact_message_delete(req, id):
    # =====================================================
    # ONLY DELETE
    # =====================================================

    if req.method != "DELETE":
        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    # =====================================================
    # ADMIN AUTHENTICATION
    # =====================================================

    admin_id = req.session.get(
        "admin_id"
    )

    if not admin_id:
        return JsonResponse(
            {
                "msg": "Admin Login Required"
            },
            status=401
        )

    # =====================================================
    # VERIFY ADMIN
    # =====================================================

    try:
        Admin.objects.get(
            id=admin_id
        )
    except Admin.DoesNotExist:
        return JsonResponse(
            {
                "msg": "Admin not found"
            },
            status=404
        )

    try:
        # =================================================
        # GET CONTACT
        # =================================================

        contact = ContactMessage.objects.get(
            id=id
        )

    except ContactMessage.DoesNotExist:
        return JsonResponse(
            {
                "msg": "Contact message not found"
            },
            status=404
        )

    try:
        contact_id = contact.id

        contact.delete()

        return JsonResponse(
            {
                "status": True,
                "msg": "Contact message deleted successfully",
                "id": contact_id,
            },
            status=200
        )

    except Exception as e:
        return JsonResponse(
            {
                "status": False,
                "msg": str(e)
            },
            status=500
        )



# =========================================================
# ADMIN CONTACT MESSAGE REPLY
# =========================================================

def admin_contact_message_reply(req, id):

    # =====================================================
    # ONLY PATCH
    # =====================================================

    if req.method != "PATCH":
        return JsonResponse(
            {
                "msg": "Invalid Request Method"
            },
            status=405
        )

    # =====================================================
    # ADMIN AUTHENTICATION
    # =====================================================

    admin_id = req.session.get(
        "admin_id"
    )

    if not admin_id:
        return JsonResponse(
            {
                "msg": "Admin Login Required"
            },
            status=401
        )

    # =====================================================
    # VERIFY ADMIN
    # =====================================================

    try:

        admin = Admin.objects.get(
            id=admin_id
        )

    except Admin.DoesNotExist:

        return JsonResponse(
            {
                "msg": "Admin not found"
            },
            status=404
        )

    # =====================================================
    # GET CONTACT MESSAGE
    # =====================================================

    try:

        contact = ContactMessage.objects.get(
            id=id
        )

    except ContactMessage.DoesNotExist:

        return JsonResponse(
            {
                "msg": "Contact message not found"
            },
            status=404
        )

    # =====================================================
    # PARSE JSON
    # =====================================================

    try:

        data = json.loads(
            req.body
        )

        response = str(
            data.get(
                "admin_response",
                ""
            )
        ).strip()

        # =================================================
        # VALIDATION
        # =================================================

        if not response:

            return JsonResponse(
                {
                    "msg": "Admin response is required"
                },
                status=400
            )

        # =================================================
        # SAVE ADMIN RESPONSE
        # =================================================

        contact.admin_response = response

        contact.admin_response_at = timezone.now()

        contact.status = "Resolved"

        contact.save(
            update_fields=[
                "admin_response",
                "admin_response_at",
                "status",
                "updated_at"
            ]
        )

        # =================================================
        # RESPONSE
        # =================================================

        return JsonResponse(
            {
                "status": True,
                "msg": "Response sent successfully",
                "contact": {
                    "id": contact.id,
                    "subject": contact.subject,
                    "message": contact.message,
                    "admin_response": contact.admin_response,
                    "admin_response_at": (
                        contact.admin_response_at.isoformat()
                        if contact.admin_response_at
                        else None
                    ),
                    "status": contact.status,
                    "admin": {
                        "id": admin.id,
                        "name": admin.full_name,
                        "email": admin.email
                    }
                }
            },
            status=200
        )

    except json.JSONDecodeError:

        return JsonResponse(
            {
                "msg": "Invalid JSON data"
            },
            status=400
        )

    except Exception as e:

        return JsonResponse(
            {
                "status": False,
                "msg": str(e)
            },
            status=500
        )



# =========================================================
# ADMIN NOTIFICATIONS
# =========================================================
def admin_notifications(req):

    if req.method != "GET":
        return JsonResponse(
            {
                "status": False,
                "msg": "Invalid Request Method"
            },
            status=405
        )

    # =====================================================
    # LOGIN AUTHENTICATION
    # =====================================================

    user_id = req.session.get("admin_id")

    if not user_id:
        return JsonResponse(
            {
                "status": False,
                "msg": "Login Required"
            },
            status=401
        )

    # =====================================================
    # VERIFY ADMIN
    # =====================================================

    try:

        admin = Admin.objects.get(
            id=user_id
        )

    except Admin.DoesNotExist:

        return JsonResponse(
            {
                "status": False,
                "msg": "Admin not found"
            },
            status=404
        )

    # =====================================================
    # GET NOTIFICATIONS
    # =====================================================

    try:

        notifications = AdminNotification.objects.all().order_by(
            "-created_at"
        )

        data = []

        for notification in notifications:

            data.append(
                {
                    "id": notification.id,
                    "type": notification.type,
                    "title": notification.title,
                    "message": notification.message,
                    "target_id": notification.target_id,
                    "target_url": notification.target_url,
                    "is_read": notification.is_read,
                    "created_at": (
                        notification.created_at.isoformat()
                        if notification.created_at
                        else None
                    ),
                }
            )

        unread_count = notifications.filter(
            is_read=False
        ).count()

        return JsonResponse(
            {
                "status": True,
                "notifications": data,
                "unread_count": unread_count,
            },
            status=200
        )

    except Exception as e:

        return JsonResponse(
            {
                "status": False,
                "msg": str(e)
            },
            status=500
        )




# =========================================================
# MARK SINGLE NOTIFICATION AS READ
# =========================================================
def admin_notification_read(req, id):

    # =====================================================
    # ONLY PATCH
    # =====================================================

    if req.method != "PATCH":
        return JsonResponse(
            {
                "status": False,
                "msg": "Invalid Request Method"
            },
            status=405
        )

    # =====================================================
    # ADMIN AUTHENTICATION
    # =====================================================

    admin_id = req.session.get("admin_id")

    if not admin_id:
        return JsonResponse(
            {
                "status": False,
                "msg": "Admin Login Required"
            },
            status=401
        )

    # =====================================================
    # VERIFY ADMIN
    # =====================================================

    try:

        admin = Admin.objects.get(
            id=admin_id
        )

    except Admin.DoesNotExist:

        return JsonResponse(
            {
                "status": False,
                "msg": "Admin not found"
            },
            status=404
        )

    # =====================================================
    # GET NOTIFICATION
    # =====================================================

    try:

        notification = AdminNotification.objects.get(
            id=id
        )

    except AdminNotification.DoesNotExist:

        return JsonResponse(
            {
                "status": False,
                "msg": "Notification not found"
            },
            status=404
        )

    # =====================================================
    # MARK AS READ
    # =====================================================

    try:

        notification.is_read = True

        notification.save(
            update_fields=[
                "is_read"
            ]
        )

        return JsonResponse(
            {
                "status": True,
                "msg": "Notification marked as read",
                "notification": {
                    "id": notification.id,
                    "is_read": notification.is_read,
                }
            },
            status=200
        )

    except Exception as e:

        return JsonResponse(
            {
                "status": False,
                "msg": str(e)
            },
            status=500
        )

# =========================================================
# MARK ALL NOTIFICATIONS AS READ
# =========================================================

def admin_notifications_read_all(req):

    # =====================================================
    # ONLY PATCH
    # =====================================================

    if req.method != "PATCH":
        return JsonResponse(
            {
                "status": False,
                "msg": "Invalid Request Method"
            },
            status=405
        )

    # =====================================================
    # ADMIN AUTHENTICATION
    # =====================================================

    admin_id = req.session.get("admin_id")

    if not admin_id:
        return JsonResponse(
            {
                "status": False,
                "msg": "Admin Login Required"
            },
            status=401
        )

    # =====================================================
    # VERIFY ADMIN
    # =====================================================

    try:

        admin = Admin.objects.get(
            id=admin_id
        )

    except Admin.DoesNotExist:

        return JsonResponse(
            {
                "status": False,
                "msg": "Admin not found"
            },
            status=404
        )

    # =====================================================
    # MARK ALL AS READ
    # =====================================================

    try:

        updated_count = AdminNotification.objects.filter(
            is_read=False
        ).update(
            is_read=True
        )

        return JsonResponse(
            {
                "status": True,
                "msg": "All notifications marked as read",
                "updated_count": updated_count,
            },
            status=200
        )

    except Exception as e:

        return JsonResponse(
            {
                "status": False,
                "msg": str(e)
            },
            status=500
        )
