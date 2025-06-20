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
from django.utils.timezone import now
from datetime import datetime, timedelta
from dateutil.parser import parse
import re

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


def safe_parse_datetime(value):
    try:
        return parse(value) if value else None
    except Exception:
        return None


def parse_range_param(value: str):
    today = datetime.today()

    if not value:
        return None, None

    if value.lower() == "year":
        start = today.replace(month=1, day=1, hour=0, minute=0, second=0)
        end = start.replace(year=start.year + 1)
        return start, end

    if value.lower() == "month":
        start = today.replace(day=1, hour=0, minute=0, second=0)
        next_month = start.replace(day=28) + timedelta(days=4)
        end = next_month.replace(day=1)
        return start, end

    try:
        dt = parse(value)
        if re.fullmatch(r"\d{4}", value):  # year only
            start = dt.replace(month=1, day=1)
            end = start.replace(year=start.year + 1)
        elif re.fullmatch(r"\d{4}-\d{2}", value):  # year-month
            start = dt.replace(day=1)
            next_month = start.replace(day=28) + timedelta(days=4)
            end = next_month.replace(day=1)
        elif re.fullmatch(r"\d{3}X", value):  # decade like 202X
            decade = int(value[:3]) * 10
            start = datetime(decade, 1, 1)
            end = datetime(decade + 10, 1, 1)
        else:  # exact day
            start = dt.replace(hour=0, minute=0, second=0)
            end = start + timedelta(days=1)

        return start, end
    except Exception:
        return None, None


def ensure_aware(dt):
    from django.utils.timezone import make_aware, is_aware
    from django.utils.timezone import get_current_timezone

    if dt and not is_aware(dt):
        return make_aware(dt, get_current_timezone())
    return dt


def generate_missing_events(params=None):
    from .models import Task, Event

    if params is None:
        params = {"range": "month"}

    start = safe_parse_datetime(params.get("start"))
    end = safe_parse_datetime(params.get("end"))
    range_val = params.get("range")

    if range_val:
        start, end = parse_range_param(range_val)

    start = ensure_aware(start)
    end = ensure_aware(end)

    def is_in_range(dt):
        dt = safe_parse_datetime(dt)
        if range:
            today = now().date()
            if range == "today":
                return dt.date() == today
            elif range == "week":
                start_of_week = today - timedelta(days=today.weekday())
                end_of_week = start_of_week + timedelta(days=6)
                return start_of_week <= dt.date() <= end_of_week
            elif range == "month":
                return dt.year == today.year and dt.month == today.month
            elif range == "year":
                return dt.year == today.year
        if start and dt < start:
            return False
        if end and dt > end:
            return False
        return True

    new_events = []

    for task in Task.objects.all():
        if task.schedule:
            datetimes = task.schedule.datetimes
        else:
            datetimes = []
        deleted, _ = (
            Event.objects.filter(task=task).exclude(date_start__in=datetimes).delete()
        )
        print(f"Deleted {deleted} incorrect events.")

        filtered_datetimes = [dt for dt in datetimes if is_in_range(dt)]
        for dt in filtered_datetimes:
            if Event.objects.filter(task=task, date_start=dt).exists():
                print("Event already exists.")
            else:
                event = Event.objects.create(
                    title=task.title,
                    description=task.description or "",
                    date_start=dt,
                    date_end=None,
                    location="",
                    task=task,
                )
                new_events.append(event)
                print(f"Creating event for Task # {task.pk} at {dt}")

    return new_events
