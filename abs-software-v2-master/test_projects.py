import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "abv_management.settings")
django.setup()

from projects.models import Project
p = Project.objects.last()
print("Latest project ID:", p.id if p else "None")
print("Assigned team in DB:", repr(p.assigned_team) if p else "None")

from projects.serializers import ProjectSerializer
if p:
    serializer = ProjectSerializer(p)
    print("Serialized assigned_team:", serializer.data.get('assigned_team'))
