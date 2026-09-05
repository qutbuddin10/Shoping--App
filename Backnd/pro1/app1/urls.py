from django.urls import path
from .views import *

urlpatterns = [
    path('register-page/',register),
    path('login-page/',login),
    path("google-auth/",google_login),
    path("forget-password/",forget_password),
    path("verify-otp/",verify_otp),
    path("reset-password/",reset_password),

    # Admin-url

    path('admin-login/',admin_login),
    path('admin-check/',admin_check),
    path('admin-logout/',admin_logout),
    path("admin/search/", admin_global_search),

    # =========================================================
    # ADMIN RETURNS
    # =========================================================
    path("admin-returns/", admin_return_requests),
    path("admin/returns/<int:id>/",admin_return_update),
    path("admin/returns/<int:id>/received/",admin_return_received),
    path("admin/returns/<int:id>/refund/",admin_return_refund),

    # =====================
    # CATEGORY
    # =====================

    path("categories/",categories_api),
    path("categories/<int:id>/",category_update),
    path("categories/<int:id>/delete/",category_delete),

    path("products/",products_api),

    path("products/<int:id>/", product_detail),
    path("products/<int:product_id>/reviews/", product_reviews),
    path("products/<int:product_id>/sizes/",product_sizes ),

    path("products/<int:id>/delete/",product_delete),
    path("products/<int:id>/update/",product_update),

    path("products/<int:product_id>/images/", product_images_api),
    path("product-images/<int:image_id>/delete/", product_image_delete),

    # Category-wise products
    path("categories/<int:category_id>/products/",category_products),

    # =========================
    # CART
    # =========================

    path("cart/",cart_api),

    path( "cart/<int:item_id>/increase/",cart_increment),

    path("cart/<int:item_id>/decrease/",cart_decrement),

    path("cart/<int:item_id>/remove/",cart_remove),

    # existing urls...

    path("admin/customers/",admin_customers),
    path("admin/customers/<int:id>/delete/", admin_customer_delete),
    path('admin/dashboard/',admin_dashboard),

    # checkout & address

    path('addresses/',addresses),
    path("addresses/<int:id>/",address_detail),
    path("order/place/",place_order,),
    path("orders/", user_orders),
    path("orders/<int:id>/cancel/", cancel_order),
    path("orders/<int:id>/return/",return_order),

    # Admin Orders
    path("admin-orders/",admin_orders_api),

    # =========================
    # ADMIN REVIEWS
    # =========================

    path("admin/reviews/",admin_reviews),
    path("admin/reviews/<int:id>/approve/",admin_review_approve),
    path("admin/reviews/<int:id>/delete/",admin_review_delete),


    # =========================
    # WISHLIST
    # =========================

    path("wishlist/", wishlist_api),
    path("wishlist/<int:product_id>/remove/",wishlist_remove),
    path("wishlist/<int:product_id>/check/",wishlist_check),

    # =========================
    # RAZORPAY
    # =========================

    path("razorpay/test-order/",razorpay_test_order),
    path("razorpay/create-order/",razorpay_create_order),
    path("razorpay/verify-payment/",razorpay_verify_payment),

    # =========================
    #  CONTACT_US
    # =========================

    path("contact/", contact_us),
    path("admin/contact-messages/",admin_contact_messages),
    path("admin/contact-messages/<int:id>/status/",admin_contact_message_status),
    path("admin/contact-messages/<int:id>/delete/",admin_contact_message_delete),
    path("admin/contact-messages/<int:id>/reply/",admin_contact_message_reply),


    # =========================================================
    # ADMIN NOTIFICATIONS
    # =========================================================

    path("admin/notifications/",admin_notifications),
    path("admin/notifications/<int:id>/read/",admin_notification_read),
    path("admin/notifications/read-all/",admin_notifications_read_all),

]
