from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

def generate_activation_link(user):
    token = PasswordResetTokenGenerator().make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    # Pointing to the frontend activation route
    base_url = settings.FRONTEND_URL.rstrip('/')
    return f"{base_url}/activate/{uid}/{token}/"

def send_resend_email(to, subject, html_content):
    """Sends email using Django's configured backend (Brevo)."""
    return send_mail(
        subject,
        "", # Plain text version (empty for now)
        settings.DEFAULT_FROM_EMAIL,
        [to],
        html_message=html_content,
        fail_silently=False,
    )