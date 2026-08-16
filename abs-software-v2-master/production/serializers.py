from rest_framework import serializers
from .models import DailyProduction
from operations.models import OperationRecord, MaintenanceRecord
from equipment.models import Equipment

class DailyProductionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyProduction
        fields = '__all__'

class OperationRecordSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)
    balance = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    class Meta:
        model = OperationRecord
        fields = '__all__'

class MaintenanceRecordSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)
    balance = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    class Meta:
        model = MaintenanceRecord
        fields = '__all__'
