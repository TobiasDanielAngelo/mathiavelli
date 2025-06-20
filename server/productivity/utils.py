from django.utils import timezone
from .models import Task, Event

from django.utils import timezone


def generate_missing_events():
    today = timezone.localdate()

    new_events = []

    for task in Task.objects.all():
        print(task.pk)
        if task.schedule:
            datetimes = task.schedule.datetimes
        else:
            datetimes = []
        deleted, _ = (
            Event.objects.filter(task=task).exclude(start__in=datetimes).delete()
        )
        print(f"Deleted {deleted} incorrect events.")
        print(f"There are {len(datetimes)} events for task {task.pk}.")
        for dt in datetimes:
            if Event.objects.filter(task=task, start=dt).exists():
                print("Event already exists.")
            else:
                event = Event.objects.create(
                    title=task.title,
                    description=task.description or "",
                    start=dt,
                    end=None,
                    all_day=False,
                    location="",
                    task=task,
                )
                new_events.append(event)
                print(f"Creating event for Task # {task.pk} at {dt}")

    return new_events
