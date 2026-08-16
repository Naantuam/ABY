from django.db import models

class DailyProduction(models.Model):
    date = models.DateField()
    trucks = models.IntegerField(default=0)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    federal_royalty = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    state_haulage = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    mou_fee = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    remarks = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Production on {self.date} - {self.trucks} trucks"
