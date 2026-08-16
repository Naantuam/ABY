from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ProjectStatsView

router = DefaultRouter()
router.register(r'', ProjectViewSet, basename='project')

urlpatterns = [
    path('stats/', ProjectStatsView.as_view(), name='project-stats'),
    path('', include(router.urls)),
]
