from datetime import datetime
from django.utils import timezone
from .models import Task, Event

# from .models import Schedule
from dateutil.rrule import rrulestr
from django.utils import timezone


def generate_missing_events():
    today = timezone.localdate()

    for task in Task.objects.all():
        if task.schedule:
            datetimes = task.schedule.datetimes
        else:
            datetimes = []
        for dt in datetimes:
            if Event.objects.filter(task=task, start=dt).exists():
                print("Event already exists.")
            else:
                Event.objects.create(
                    title=task.title,
                    description=task.description or "",
                    start=dt,
                    end=None,
                    all_day=False,
                    location="",
                    task=task,
                )
                print(f"Creating event for Task # {task.pk} at {dt}")
