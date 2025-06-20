from django.utils import timezone
from datetime import datetime, time
from dateutil.rrule import (
    rrule,
    YEARLY,
    MONTHLY,
    WEEKLY,
    DAILY,
    HOURLY,
    MINUTELY,
    SECONDLY,
)


FREQ_MAP = {
    0: YEARLY,
    1: MONTHLY,
    2: WEEKLY,
    3: DAILY,
    4: HOURLY,
    5: MINUTELY,
    6: SECONDLY,
}

WEEKDAY_MAP = {"MO": 0, "TU": 1, "WE": 2, "TH": 3, "FR": 4, "SA": 5, "SU": 6}


def get_datetimes(obj):
    if not obj.start_date:
        return []
    end_dt = None
    # Use start_time if available
    start_dt = timezone.make_aware(
        datetime.combine(obj.start_date, obj.start_time or time(0, 0))
    )
    if obj.end_date:
        end_dt = timezone.make_aware(
            datetime.combine(obj.end_date, obj.end_time or time(23, 59))
        )

    rule_kwargs = {
        "freq": FREQ_MAP.get(obj.freq, DAILY),
        "dtstart": start_dt,
        "interval": int(obj.interval or 1),
    }

    # Optional rule fields
    if obj.count:
        rule_kwargs["count"] = int(obj.count)
    if end_dt:
        end_dt = datetime.combine(obj.end_date, obj.end_time or time(23, 59))
        rule_kwargs["until"] = end_dt
    if obj.by_week_day:
        rule_kwargs["byweekday"] = [WEEKDAY_MAP[d] for d in obj.by_week_day]
    if obj.by_month_day:
        rule_kwargs["bymonthday"] = obj.by_month_day
    if obj.by_month:
        rule_kwargs["bymonth"] = obj.by_month
    if obj.by_year_day:
        rule_kwargs["byyearday"] = obj.by_year_day
    if obj.by_week_no:
        rule_kwargs["byweekno"] = obj.by_week_no
    if obj.by_hour:
        rule_kwargs["byhour"] = obj.by_hour
    if obj.by_minute:
        rule_kwargs["byminute"] = obj.by_minute
    if obj.by_second:
        rule_kwargs["bysecond"] = obj.by_second
    if obj.by_set_position:
        rule_kwargs["bysetpos"] = obj.by_set_position
    if obj.week_start is not None:
        rule_kwargs["wkst"] = obj.week_start

    # Generate occurrences (limit for safety)
    try:
        dates = list(rrule(**rule_kwargs))[:100]  # Limit to first 100 occurrences
        return [dt.isoformat() for dt in dates]
    except Exception as e:
        return []


def generate_missing_events():
    from .models import Task, Event

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
