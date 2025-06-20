from datetime import datetime, time
from django.utils import timezone
from django.db.models.functions import (
    ExtractYear,
    ExtractMonth,
    ExtractDay,
    ExtractWeek,
    ExtractWeekDay,
    ExtractQuarter,
)
from django.db.models import CharField, F, Value, Func
from django.db.models.functions import Concat, Cast, Right
import re

# from .models import Schedule
from dateutil.rrule import rrulestr
from django.utils import timezone
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


def obj_list_to_obj_val(**list):
    obj_val = {}
    for key, value in list.items():
        obj_val[key] = value[0]
    return obj_val


# List of annotations (name, function)
date_annotations = [
    ("year", ExtractYear),
    ("month", ExtractMonth),
    ("day", ExtractDay),
    ("week", ExtractWeek),
    ("weekday", ExtractWeekDay),
    ("quarter", ExtractQuarter),
]


def annotate_period(qs, datetime_key, *fields):
    for name, func in date_annotations:
        qs = qs.annotate(**{name: func(datetime_key)})
    return qs.annotate(period=Period(*fields))


class LPAD(Func):
    function = "LPAD"
    arity = 3  # needs 3 arguments: value, length, pad_char


def Period(*fields, separator="-"):
    parts = []
    for i, f in enumerate(fields):
        if f == "quarter":
            parts.append(Value("Q"))
            parts.append(Cast(F(f), output_field=CharField()))
        elif f == "week":
            parts.append(Value("W"))
            padded = Right(Concat(Value("00"), Cast(F(f), output_field=CharField())), 2)
            parts.append(padded)
        elif f == "weekday":
            parts.append(Value("D"))
            parts.append(Cast(F(f), output_field=CharField()))
        elif f in ["month", "day"]:
            padded = Right(Concat(Value("00"), Cast(F(f), output_field=CharField())), 2)
            parts.append(padded)
        else:
            parts.append(Cast(F(f), output_field=CharField()))

        if i < len(fields) - 1:
            parts.append(Value(separator))

    return Concat(*parts, output_field=CharField())


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


def camel_to_kebab(name: str) -> str:
    return re.sub(r"(?<!^)(?=[A-Z])", "-", name).lower()
