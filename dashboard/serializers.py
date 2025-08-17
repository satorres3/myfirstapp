

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Container, UserProfile, ContainerConfig

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    avatar_url = serializers.CharField(source='userprofile.avatar_url', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'avatar_url')


class ContainerSerializer(serializers.ModelSerializer):
    MAX_LIST_ITEMS = 20
    MAX_FUNCTION_PARAMETERS = 10
    ALLOWED_PARAM_TYPES = {"string", "number", "textarea"}

    def _validate_string_list(self, value, field_name, item_max_length=100):
        if not isinstance(value, list):
            raise serializers.ValidationError(f"{field_name} must be a list.")
        if len(value) > self.MAX_LIST_ITEMS:
            raise serializers.ValidationError(
                f"{field_name} cannot contain more than {self.MAX_LIST_ITEMS} items."
            )
        for item in value:
            if not isinstance(item, str):
                raise serializers.ValidationError(
                    f"Each entry in {field_name} must be a string."
                )
            if len(item) > item_max_length:
                raise serializers.ValidationError(
                    f"Entries in {field_name} must be at most {item_max_length} characters."
                )
        return value

    def validate_quickQuestions(self, value):
        return self._validate_string_list(value, "quickQuestions", item_max_length=200)

    def validate_availableModels(self, value):
        return self._validate_string_list(value, "availableModels")

    def validate_availablePersonas(self, value):
        return self._validate_string_list(value, "availablePersonas")

    def validate_accessControl(self, value):
        return self._validate_string_list(value, "accessControl")

    def validate_functions(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("functions must be a list.")
        if len(value) > self.MAX_LIST_ITEMS:
            raise serializers.ValidationError(
                f"functions cannot contain more than {self.MAX_LIST_ITEMS} items."
            )
        for func in value:
            if not isinstance(func, dict):
                raise serializers.ValidationError(
                    "Each function must be an object with the required fields."
                )

            required_fields = {
                "id",
                "name",
                "description",
                "icon",
                "parameters",
                "promptTemplate",
                "enabled",
            }
            missing = required_fields - func.keys()
            if missing:
                raise serializers.ValidationError(
                    f"Function missing fields: {', '.join(sorted(missing))}."
                )

            if not isinstance(func["id"], str) or not func["id"]:
                raise serializers.ValidationError("Function 'id' must be a non-empty string.")
            if not isinstance(func["name"], str) or not func["name"]:
                raise serializers.ValidationError("Function 'name' must be a non-empty string.")
            if not isinstance(func["description"], str):
                raise serializers.ValidationError("Function 'description' must be a string.")
            if not isinstance(func["icon"], str):
                raise serializers.ValidationError("Function 'icon' must be a string.")
            if not isinstance(func["promptTemplate"], str):
                raise serializers.ValidationError("Function 'promptTemplate' must be a string.")
            if not isinstance(func["enabled"], bool):
                raise serializers.ValidationError("Function 'enabled' must be a boolean.")

            parameters = func.get("parameters")
            if not isinstance(parameters, list):
                raise serializers.ValidationError(
                    "Function 'parameters' must be a list."
                )
            if len(parameters) > self.MAX_FUNCTION_PARAMETERS:
                raise serializers.ValidationError(
                    f"Function 'parameters' cannot contain more than {self.MAX_FUNCTION_PARAMETERS} items."
                )
            for param in parameters:
                if not isinstance(param, dict):
                    raise serializers.ValidationError(
                        "Each parameter must be an object with the required fields."
                    )
                param_required = {"name", "type", "description"}
                missing_param = param_required - param.keys()
                if missing_param:
                    raise serializers.ValidationError(
                        f"Parameter missing fields: {', '.join(sorted(missing_param))}."
                    )

                if not isinstance(param["name"], str) or not param["name"]:
                    raise serializers.ValidationError(
                        "Parameter 'name' must be a non-empty string."
                    )
                if param["type"] not in self.ALLOWED_PARAM_TYPES:
                    raise serializers.ValidationError(
                        "Parameter 'type' must be one of: string, number, textarea."
                    )
                if not isinstance(param["description"], str):
                    raise serializers.ValidationError(
                        "Parameter 'description' must be a string."
                    )
        return value
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


class ContainerConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContainerConfig
        fields = [
            'key',
            'name',
            'icon',
            'route',
            'allowed_roles',
            'is_active',
            'order',
        ]
