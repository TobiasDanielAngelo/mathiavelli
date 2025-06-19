from datetime import datetime
from django.utils import timezone
from .models import Task, Event

# from .models import Schedule
from dateutil.rrule import rrulestr
from django.utils import timezone


def generate_missing_events_for_today():
    today = timezone.localdate()

    for task in Task.objects.select_related("schedule"):
        if not task.schedule or not task.date_start or not task.date_end:
            continue

        # Skip if event already exists for today
        if Event.objects.filter(task=task, start__date=today).exists():
            continue

        try:
            rule = rrulestr(task.schedule.rrule, dtstart=task.date_start)
        except Exception as e:
            print(f"Invalid RRULE for task {task.id}: {e}")
            continue

        occurrences = rule.between(
            datetime.datetime.combine(today, datetime.time.min),
            datetime.datetime.combine(today, datetime.time.max),
            inc=True,
        )

        for occ in occurrences:
            if not Event.objects.filter(task=task, start=occ).exists():
                Event.objects.create(
                    title=task.title,
                    description=task.description or "",
                    start=occ,
                    end=None,
                    all_day=False,
                    location="",
                    task=task,
                )
