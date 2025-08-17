import os
import logging
from celery import Celery

logger = logging.getLogger(__name__)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portal.settings')

app = Celery('portal')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
logger.info("Celery app configured")

__all__ = ('app',)
