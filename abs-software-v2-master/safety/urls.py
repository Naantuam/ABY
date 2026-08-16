from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter


from safety.views import SafetyIncidentViewSet, RiskAssessmentViewSet, SafetyIncidentStatsView

router = DefaultRouter()
router.register(r'safety-incidents', SafetyIncidentViewSet)
router.register(r'risk-assessments', RiskAssessmentViewSet)

urlpatterns = [
    path('safety-incidents/stats/', SafetyIncidentStatsView.as_view(), name='safety-stats'),
    path('', include(router.urls)),
]
