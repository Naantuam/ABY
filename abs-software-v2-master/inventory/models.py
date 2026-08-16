from django.db import models
from users.models import CustomUser
from django.conf import settings


# Create your models here.

class Inventory(models.Model):
    STATUS_CHOICES = (
        ('in_stock', 'In Stock'),
        ('low_stock', 'Low Stock'),
        ('restocking', 'Restocking'),
    )

    item_name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    quantity = models.IntegerField()
    unit = models.CharField(max_length=50)  # e.g., Pieces, Liters
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_stock')  # 👈 NEW
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.item_name
