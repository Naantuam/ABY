from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DailyProductionViewSet,
    OperationRecordViewSet,
    MaintenanceRecordViewSet,
    OperationSummaryView,
    MaintenanceSummaryView
)

router = DefaultRouter()
router.register(r'daily_production', DailyProductionViewSet, basename='daily_production')
router.register(r'operations', OperationRecordViewSet, basename='operation')
router.register(r'maintenance', MaintenanceRecordViewSet, basename='maintenance')

urlpatterns = [
    path('operations/summary/', OperationSummaryView.as_view(), name='operation-summary'),
    path('maintenance/summary/', MaintenanceSummaryView.as_view(), name='maintenance-summary'),
    path('', include(router.urls)),
]
