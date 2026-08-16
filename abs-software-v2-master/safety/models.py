"""
This module contains the models for safety incidents.
"""

from django.db import models
from users.models import CustomUser
from django.conf import settings

# Create your models here.

class SafetyIncident(models.Model):
    incident_date = models.DateField()
    project = models.CharField(max_length=255, default="General")
    location = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField()
    severity = models.CharField(max_length=50, choices=[
        ('low', 'Low'), ('medium', 'Medium'), ('critical', 'Critical')
    ], default='low')
    actions_taken = models.TextField(blank=True, null=True)
    incident_status = models.CharField(max_length=50, choices=[
        ('reported', 'Reported'), ('investigation', 'Investigation'), ('resolved', 'Resolved')
    ], default='reported')
 
    reported_by = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.CASCADE,
    null=True,   # ✅ allows existing rows to stay empty
    blank=True,  # ✅ allows admin forms to skip it
    related_name='safety_reports'
)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.incident_date} - {self.incident_status}"
    
    
    #user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

class RiskAssessment(models.Model):
    assessment_date = models.DateField()
    project = models.CharField(max_length=255)
    hazard_type = models.CharField(max_length=255)
    likelihood = models.CharField(max_length=50, choices=[
        ('low', 'Low'), ('medium', 'Medium'), ('high', 'High')
    ], default='low')
    impact = models.CharField(max_length=50, choices=[
        ('minor', 'Minor'), ('moderate', 'Moderate'), ('severe', 'Severe')
    ], default='minor')
    status = models.CharField(max_length=50, choices=[
        ('reported', 'Reported'), ('investigation', 'Investigation'),
        ('mitigated', 'Mitigated'), ('pending', 'Pending')
    ], default='reported')
    mitigation_plan = models.TextField(blank=True, null=True)
    related_incident = models.ForeignKey(
        SafetyIncident, on_delete=models.SET_NULL, null=True, blank=True, related_name='risk_assessments'
    )
    assessed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assessed_risks'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.project} - {self.hazard_type}"
