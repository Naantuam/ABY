from django.db import models
from equipment.models import Equipment
from django.conf import settings


class OperationRecord(models.Model):
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, null=True, blank=True)
    operator = models.CharField(max_length=100, blank=True, null=True)
    date = models.DateField()
    hours_used = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    activity = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    income = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    expenditure = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    rate = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[('completed', 'Completed'), ('pending', 'Pending')], default='completed')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='operation_records'
    )

    @property
    def balance(self):
        return self.income - self.expenditure

    
class MaintenanceRecord(models.Model):
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, null=True, blank=True)
    description = models.TextField()
    quantity = models.CharField(max_length=100, blank=True, null=True)
    income = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    expenditure = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    rate = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    date = models.DateField()
    status = models.CharField(max_length=20, choices=[('completed', 'Completed'), ('pending', 'Pending')], default='completed')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='maintenance_records'
    )

    @property
    def balance(self):
        return self.income - self.expenditure

