from datetime import datetime, timedelta
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
