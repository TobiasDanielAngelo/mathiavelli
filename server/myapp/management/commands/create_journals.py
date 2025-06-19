# journal/management/commands/create_journal.py
from django.core.management.base import BaseCommand
from myapp.models import Journal


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        count = Journal.objects.count() + 1
        Journal.objects.create(title=f"Entry {count}")
