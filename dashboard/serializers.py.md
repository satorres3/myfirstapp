

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Department

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'full_name')

    def get_full_name(self, obj):
        return obj.get_full_name()

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