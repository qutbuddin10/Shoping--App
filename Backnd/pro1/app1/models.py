from django.db import models
from django.utils import timezone
import uuid


# =========================================================
# USER
# =========================================================

class users(models.Model):

    full_name = models.CharField(
        max_length=100
    )

    email = models.EmailField(
        unique=True
    )

    mobile = models.CharField(
        max_length=10,
        unique=True,
        null=True,
        blank=True
    )

    password = models.CharField(
        max_length=255
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    Role = models.CharField(
        max_length=50, default='user', null=True, blank=True
    )

    def __str__(self):
        return self.email


# =========================================================
# ADMIN
# =========================================================

class Admin(models.Model):

    full_name = models.CharField(
        max_length=100
    )

    email = models.EmailField(
        unique=True
    )

    password = models.CharField(
        max_length=255
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.email


# =========================================================
# CATEGORY
# =========================================================

class Category(models.Model):

    name = models.CharField(
        max_length=100,
        unique=True
    )

    slug = models.SlugField(
        max_length=120,
        unique=True
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    image = models.ImageField(
        upload_to="categories/",
        blank=True,
        null=True
    )

    status = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.name


# =========================================================
# PRODUCT
# =========================================================

class Product(models.Model):

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="products"
    )

    name = models.CharField(
        max_length=200
    )

    slug = models.SlugField(
        max_length=220,
        unique=True
    )

    description = models.TextField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    old_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
    )

    image = models.ImageField(
        upload_to="products/"
    )

    stock = models.PositiveIntegerField(
        default=0
    )

    status = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    # =========================================================
    # PRODUCT IMAGE / GALLERY
    # =========================================================


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images"
    )

    image = models.ImageField(
        upload_to="products/gallery/"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )



# =========================================================
# PRODUCT SIZE
# =========================================================

class ProductSize(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="sizes"
    )

    size = models.CharField(
        max_length=20
    )

    stock = models.PositiveIntegerField(
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = (
            "product",
            "size"
        )




# =========================================================
# CART
# =========================================================

class Cart(models.Model):

    user = models.OneToOneField(
        users,
        on_delete=models.CASCADE,
        related_name="cart"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"Cart - {self.user.email}"


# =========================================================
# CART ITEM
# =========================================================
class CartItem(models.Model):

    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    size = models.ForeignKey(
        ProductSize,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    quantity = models.PositiveIntegerField(
        default=1
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        unique_together = ("cart", "product", "size")

# =========================================================
# USER ADDRESS
# =========================================================

class UserAddress(models.Model):

    user = models.ForeignKey(
        users,
        on_delete=models.CASCADE,
        related_name="addresses"
    )

    full_name = models.CharField(
        max_length=100
    )

    mobile = models.CharField(
        max_length=15
    )

    house = models.CharField(
        max_length=255
    )

    area = models.CharField(
        max_length=255
    )

    city = models.CharField(
        max_length=100
    )

    state = models.CharField(
        max_length=100
    )

    pincode = models.CharField(
        max_length=10
    )

    address_type = models.CharField(
        max_length=20,
        choices=[
            ("Home", "Home"),
            ("Office", "Office"),
            ("Other", "Other"),
        ],
        default="Home"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.full_name} - {self.city}"


# =========================================================
# ORDER NUMBER GENERATOR
# =========================================================

def generate_order_number():

    return (
        "ORD-"
        + timezone.now().strftime("%Y%m%d")
        + "-"
        + uuid.uuid4().hex[:8].upper()
    )


# =========================================================
# TRACKING NUMBER GENERATOR
# =========================================================

def generate_tracking_number():

    return (
        "SN-TRK-"
        + timezone.now().strftime("%Y%m%d")
        + "-"
        + uuid.uuid4().hex[:8].upper()
    )

# =========================================================
# ORDER
# =========================================================

class Order(models.Model):

    PAYMENT_CHOICES = [
        ("COD", "Cash on Delivery"),
        ("UPI", "UPI"),
        ("CARD", "Card"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Paid", "Paid"),
        ("Failed", "Failed"),
        ("Refunded", "Refunded"),
    ]

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Confirmed", "Confirmed"),
        ("Shipped", "Shipped"),
        ("Out for Delivery", "Out for Delivery"),
        ("Delivered", "Delivered"),
        ("Cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(
        users,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders"
    )

    # =====================================================
    # ORDER NUMBER
    # =====================================================

    order_number = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        editable=False
    )


    # =====================================================
    # SHIPPING / TRACKING NUMBER
    # =====================================================

    tracking_number = models.CharField(
        max_length=50,
        unique=True,
        null=True,
        blank=True,
        editable=False
    )



    # =====================================================
    # ADDRESS SNAPSHOT
    # =====================================================

    full_name = models.CharField(
        max_length=100
    )

    mobile = models.CharField(
        max_length=15
    )

    house = models.CharField(
        max_length=255
    )

    area = models.CharField(
        max_length=255
    )

    city = models.CharField(
        max_length=100
    )

    state = models.CharField(
        max_length=100
    )

    pincode = models.CharField(
        max_length=10
    )

    address_type = models.CharField(
        max_length=20
    )

    # =====================================================
    # AMOUNT
    # =====================================================

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    shipping_charge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    # =====================================================
    # PAYMENT
    # =====================================================

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_CHOICES
    )

    payment_status = models.CharField(
        max_length=30,
        choices=PAYMENT_STATUS_CHOICES,
        default="Pending"
    )

    payment_reference = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    paid_at = models.DateTimeField(
        blank=True,
        null=True
    )

    # =====================================================
    # ORDER STATUS
    # =====================================================

    order_status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="Pending"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )


# =========================================================
# ORDER TRACKING HISTORY
# =========================================================

class OrderTracking(models.Model):

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Confirmed", "Confirmed"),
        ("Shipped", "Shipped"),
        ("Out for Delivery", "Out for Delivery"),
        ("Delivered", "Delivered"),
        ("Cancelled", "Cancelled"),
    ]

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="tracking_history"
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES
    )

    message = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["created_at"]




# =========================================================
# ORDER ITEM
# =========================================================

class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # Snapshot of product name
    product_name = models.CharField(
        max_length=200
    )

    # Snapshot of selected size
    size = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    # Price at the time of order
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    quantity = models.PositiveIntegerField()

    total = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    image = models.CharField(
        max_length=500,
        blank=True,
        null=True
    )


class Review(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="reviews"
    )

    user = models.ForeignKey(
        users,
        on_delete=models.CASCADE,
        related_name="reviews"
    )

    rating = models.PositiveSmallIntegerField()

    comment = models.TextField(
        blank=True,
        null=True
    )

    is_approved = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = (
            "product",
            "user"
        )


# =========================================================
# WISHLIST
# =========================================================

class Wishlist(models.Model):

    user = models.ForeignKey(
        users,
        on_delete=models.CASCADE,
        related_name="wishlist"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="wishlisted_by"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = (
            "user",
            "product"
        )


# =========================================================
# RETURN REQUEST
# =========================================================

class ReturnRequest(models.Model):

    STATUS_CHOICES = [
        ("Requested", "Requested"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
        ("Product Received", "Product Received"),
        ("Refund Processing", "Refund Processing"),
        ("Refunded", "Refunded"),
        ("Cancelled", "Cancelled"),
    ]

    REASON_CHOICES = [
        ("Defective Product", "Defective Product"),
        ("Wrong Product", "Wrong Product"),
        ("Damaged Product", "Damaged Product"),
        ("Size Issue", "Size Issue"),
        ("Other", "Other"),
    ]

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="return_request"
    )

    user = models.ForeignKey(
        users,
        on_delete=models.CASCADE,
        related_name="return_requests"
    )

    reason = models.CharField(
        max_length=100,
        choices=REASON_CHOICES
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="Requested"
    )

    requested_at = models.DateTimeField(
        auto_now_add=True
    )

    approved_at = models.DateTimeField(
        blank=True,
        null=True
    )

    rejected_at = models.DateTimeField(
        blank=True,
        null=True
    )

    product_received_at = models.DateTimeField(
        blank=True,
        null=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )



# =========================================================
# REFUND
# =========================================================

class Refund(models.Model):

    REFUND_METHOD_CHOICES = [
        ("RAZORPAY", "Razorpay"),
        ("UPI", "UPI"),
        ("BANK", "Bank Transfer"),
    ]

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Processing", "Processing"),
        ("Completed", "Completed"),
        ("Failed", "Failed"),
    ]

    return_request = models.OneToOneField(
        ReturnRequest,
        on_delete=models.CASCADE,
        related_name="refund"
    )

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="refunds"
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    method = models.CharField(
        max_length=20,
        choices=REFUND_METHOD_CHOICES
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Pending"
    )

    razorpay_refund_id = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    refund_reference = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    customer_upi_id = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    customer_bank_name = models.CharField(
        max_length=150,
        blank=True,
        null=True
    )

    customer_account_number = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    customer_ifsc = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    processed_at = models.DateTimeField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )


# =========================================================
# CONTACT MESSAGE
# =========================================================

class ContactMessage(models.Model):

    STATUS_CHOICES = [
        ("New", "New"),
        ("Read", "Read"),
        ("In Progress", "In Progress"),
        ("Resolved", "Resolved"),
    ]

    user = models.ForeignKey(
        users,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="contact_messages"
    )

    name = models.CharField(
        max_length=100
    )

    email = models.EmailField()

    phone = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )

    subject = models.CharField(
        max_length=200
    )

    message = models.TextField()

    # =====================================================
    # ADMIN RESPONSE
    # =====================================================

    admin_response = models.TextField(
        blank=True,
        null=True
    )

    admin_response_at = models.DateTimeField(
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="New"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )



# =========================================================
# ADMIN NOTIFICATION
# =========================================================

class AdminNotification(models.Model):

    TYPE_CHOICES = [
        ("ORDER", "Order"),
        ("CANCELLED_ORDER", "Cancelled Order"),
        ("REVIEW", "Review"),
        ("CONTACT", "Contact"),
        ("RETURN", "Return"),
    ]

    type = models.CharField(
        max_length=30,
        choices=TYPE_CHOICES
    )

    title = models.CharField(
        max_length=150
    )

    message = models.CharField(
        max_length=255
    )

    target_id = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    target_url = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-created_at"]

