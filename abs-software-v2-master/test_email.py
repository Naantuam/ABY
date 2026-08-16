import os
import django
from django.core.mail import send_mail
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'abv_management.settings')
django.setup()

def test_send():
    print("Attempting to send test email via GMAIL...")
    print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"PASSWORD SET: {'Yes' if settings.EMAIL_HOST_PASSWORD else 'No'}")
    
    try:
        sent = send_mail(
            "Test Email from ABY Management",
            "This is a test email to verify Brevo configuration.",
            settings.DEFAULT_FROM_EMAIL,
            ["nathaniellongmen@gmail.com"], # Recipient (user's email from superuser creation)
            fail_silently=False,
        )
        print(f"Success! Email sent. Result code: {sent}")
    except Exception as e:
        print(f"FAILED to send email: {e}")

if __name__ == "__main__":
    test_send()
