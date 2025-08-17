from django.contrib.auth.models import User
from django.test import TestCase

from dashboard.models import Container
from dashboard.serializers import ContainerSerializer


class TestContainerSerializerValidation(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="owner", password="pass")
        self.container = Container.objects.create(name="Test", owner=self.user)

    def test_valid_quick_questions_and_functions(self):
        data = {
            "quickQuestions": ["What is up?", "Another question"],
            "functions": [
                {
                    "id": "func1",
                    "name": "Func",
                    "description": "desc",
                    "icon": "<svg></svg>",
                    "parameters": [
                        {"name": "q", "type": "string", "description": "question"}
                    ],
                    "promptTemplate": "Hi {{q}}",
                    "enabled": True,
                }
            ],
        }
        serializer = ContainerSerializer(instance=self.container, data=data, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_invalid_quick_question_type(self):
        data = {"quickQuestions": ["ok", 123]}
        serializer = ContainerSerializer(instance=self.container, data=data, partial=True)
        self.assertFalse(serializer.is_valid())
        self.assertIn("quickQuestions", serializer.errors)

    def test_invalid_function_schema(self):
        data = {
            "functions": [
                {
                    "id": "func1",
                    "name": "Func",
                    "description": "desc",
                    "icon": "<svg></svg>",
                    "parameters": [
                        {"name": "q", "type": "invalid", "description": "question"}
                    ],
                    "promptTemplate": "Hi {{q}}",
                    "enabled": True,
                }
            ]
        }
        serializer = ContainerSerializer(instance=self.container, data=data, partial=True)
        self.assertFalse(serializer.is_valid())
        self.assertIn("functions", serializer.errors)
