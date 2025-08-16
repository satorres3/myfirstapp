
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from dashboard.models import Container, UserProfile, ContainerConfig
from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    help = 'Seeds the database with initial default data for users and containers.'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database with initial data...')

        # --- Create Users ---
        admin_user, admin_created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'password': make_password('admin'),
                'is_superuser': True,
                'is_staff': True,
            }
        )
        if admin_created:
            UserProfile.objects.create(user=admin_user)
            self.stdout.write(self.style.SUCCESS('Admin user created.'))

        demo_user, demo_created = User.objects.get_or_create(
            username='demo',
            defaults={
                'email': 'demo@example.com',
                'password': make_password('demo'),
                'is_staff': True,
                'is_superuser': False,
            }
        )
        if demo_created:
            UserProfile.objects.create(user=demo_user)
            self.stdout.write(self.style.SUCCESS('Demo user created.'))

        # --- Create Containers ---
        hr_container, hr_created = Container.objects.get_or_create(
            name='Human Resources',
            owner=admin_user,
            defaults={
                'description': 'Handles all employee-related matters.',
                'quickQuestions': ["What is our vacation policy?", "How do I submit expense reports?", "Where can I find the employee handbook?"],
                'availablePersonas': ["Friendly HR Assistant", "Formal Policy Expert"],
                'availableModels': ['gemini-2.5-flash'],
            }
        )
        if hr_created:
            hr_container.members.add(admin_user, demo_user)
            self.stdout.write(self.style.SUCCESS('"Human Resources" container created.'))

        eng_container, eng_created = Container.objects.get_or_create(
            name='Engineering',
            owner=admin_user,
            defaults={
                'description': 'Builds and maintains the core product.',
                'quickQuestions': ["What are the coding standards for Python?", "How do I set up the local development environment?", "Summarize the latest sprint goals."],
                'availablePersonas': ["Technical Expert", "Project Manager"],
                'availableModels': ['gemini-2.5-flash'],
                'icon': '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20V16"></path></svg>'
            }
        )
        if eng_created:
            eng_container.members.add(admin_user, demo_user)
            self.stdout.write(self.style.SUCCESS('"Engineering" container created.'))

        # --- Create Container Configs ---
        data_security_config, ds_created = ContainerConfig.objects.get_or_create(
            key='data-security',
            defaults={
                'name': 'Data Security',
                'icon': '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
                'route': '/data-security',
                'allowed_roles': ['admin', 'security'],
                'order': 1,
            }
        )
        if ds_created:
            self.stdout.write(self.style.SUCCESS('"Data Security" container config created.'))

        sales_config, sales_created = ContainerConfig.objects.get_or_create(
            key='sales',
            defaults={
                'name': 'Sales',
                'icon': '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>',
                'route': '/sales',
                'allowed_roles': ['admin', 'sales'],
                'order': 2,
            }
        )
        if sales_created:
            self.stdout.write(self.style.SUCCESS('"Sales" container config created.'))

        self.stdout.write(self.style.SUCCESS('Database seeding complete.'))
