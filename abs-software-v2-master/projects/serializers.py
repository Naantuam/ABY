from rest_framework import serializers
from .models import Project
from django.contrib.auth import get_user_model
import json

User = get_user_model()

class ProjectSerializer(serializers.ModelSerializer):
    owner_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True,
        required=False,
        allow_null=True
    )
    assigned_team_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Project
        fields = '__all__'
        extra_kwargs = {
            'assigned_team': {'required': False, 'allow_blank': True},
            'assigned_projects': {'required': False},
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        # Populate owner for the frontend
        if instance.user:
            representation['owner'] = {
                'id': instance.user.id,
                'username': instance.user.username,
                'email': getattr(instance.user, 'email', ''),
                'role': {
                    'id': instance.user.role.id,
                    'name': instance.user.role.name
                } if instance.user.role else None
            }
        else:
            representation['owner'] = None
            
        # Populate assigned_team as a list of objects
        team = []
        if instance.assigned_team:
            try:
                # Handle possible malformed or empty data safely
                data = instance.assigned_team.strip()
                if data:
                    ids = json.loads(data)
                    if isinstance(ids, list):
                        users = User.objects.select_related('role').filter(id__in=ids)
                        for u in users:
                            team.append({
                                'id': u.id,
                                'username': u.username,
                                'email': getattr(u, 'email', ''),
                                'role': {
                                    'id': u.role.id,
                                    'name': u.role.name
                                } if u.role else None
                            })
            except Exception:
                pass
        representation['assigned_team'] = team
        return representation

    def create(self, validated_data):
        team_ids = self.initial_data.get('assigned_team_ids', [])
        validated_data.pop('assigned_team_ids', None)
        validated_data['assigned_team'] = json.dumps(team_ids)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        team_ids = self.initial_data.get('assigned_team_ids')
        validated_data.pop('assigned_team_ids', None)
        if team_ids is not None:
            validated_data['assigned_team'] = json.dumps(team_ids)
        return super().update(instance, validated_data)