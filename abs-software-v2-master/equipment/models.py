from django.db import models
from users.models import CustomUser, Employee
from django.conf import settings

# Create your models here.
class Equipment(models.Model):
    equipment_name = models.CharField(max_length=255)
    equipment_type = models.CharField(max_length=100)
    serial_number = models.CharField(max_length=100, blank=True, null=True)
    purchase_date = models.DateField()
    purchase_cost = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=50)  # Available, In Use, Under Maintenance, Retired
    assigned_to = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='assigned_equipment'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='equipment_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.equipment_name)
