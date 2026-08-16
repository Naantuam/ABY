from django.shortcuts import render
from rest_framework import viewsets, views, permissions
from rest_framework.response import Response
from .models import SafetyIncident, RiskAssessment
from .serializers import SafetyIncidentSerializer, RiskAssessmentSerializer
from django.utils import timezone
from datetime import timedelta

class SafetyIncidentViewSet(viewsets.ModelViewSet):
    queryset = SafetyIncident.objects.all().order_by('-incident_date', '-id')
    serializer_class = SafetyIncidentSerializer
    permission_classes = [permissions.IsAuthenticated]

class RiskAssessmentViewSet(viewsets.ModelViewSet):
    queryset = RiskAssessment.objects.all().order_by('-assessment_date', '-id')
    serializer_class = RiskAssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]

class SafetyIncidentStatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        thirty_days_ago = timezone.now().date() - timedelta(days=30)
        total = SafetyIncident.objects.count()
        recent = SafetyIncident.objects.filter(incident_date__gte=thirty_days_ago).count()
        resolved = SafetyIncident.objects.filter(incident_status__iexact='resolved').count()
        investigation = SafetyIncident.objects.filter(incident_status__iexact='investigation').count()
        reported = SafetyIncident.objects.filter(incident_status__iexact='reported').count()

        return Response({
            "total_incidents": total,
            "recent_incidents": recent,
            "resolved_incidents": resolved,
            "investigation_incidents": investigation,
            "reported_incidents": reported
        })
