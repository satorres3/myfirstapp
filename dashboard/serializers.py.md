

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Container, UserProfile

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    avatar_url = serializers.URLField(source='userprofile.avatar_url', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'avatar_url')


class ContainerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Container
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