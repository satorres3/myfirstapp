
from rest_framework import serializers
from .models import Department

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        # Include all new fields to be exposed in the API
        fields = [
            'id', 
            'name', 
            'description', 
            'icon',
            'quickQuestions',
            'availableModels',
            'availablePersonas',
            'selectedModel',
            'selectedPersona',
            'functions',
            'accessControl',
            'owner',
            'created_at',
        ]
        read_only_fields = ['owner', 'created_at']
