from datetime import datetime, timedelta
from django.utils import timezone
import random


def non_to_val(x):
    if x is None:
        return ""
    else:
        return x


def date_range_slicer(
    start_date: datetime,
    stop_date: datetime | str,
    user: int,
    payout: int,
    start_id: int,
    end_id: int,
):
    mytz = timezone.get_current_timezone()
    if type(stop_date) is str:
        return [
            {
                "start_dt": start_date,
                "end_dt": "",
                "duration": 0,
                "is_night": (
                    False
                    if start_date.time().hour < 22 or start_date.time().hour > 6
                    else True
                ),
                "user": int(user),
                "payout": int(payout),
                "start_id": int(start_id),
                "end_id": -1,
            }
        ]
    start_date = start_date.astimezone(mytz)
    stop_date = stop_date.astimezone(mytz)
    date_ranges = []
    if start_date >= stop_date:
        return []
    while start_date < stop_date:
        hr = start_date.time().hour
        adder = 0
        if hr >= 0 and hr < 6:
            adder = 6
        elif hr >= 6 and hr < 22:
            adder = 22
        else:
            adder = 24
        next_date = datetime(
            start_date.year, start_date.month, start_date.day, tzinfo=mytz
        ) + timedelta(hours=adder)
        if next_date < stop_date:
            date_ranges.append(
                {
                    "start_dt": start_date,
                    "end_dt": next_date,
                    "duration": (next_date - start_date).total_seconds() / 3600,
                    "is_night": True if adder == 6 or adder == 24 else False,
                    "user": int(user),
                    "payout": int(payout),
                    "start_id": int(start_id),
                    "end_id": int(end_id),
                }
            )
            start_date = next_date
        else:
            date_ranges.append(
                {
                    "start_dt": start_date,
                    "end_dt": stop_date,
                    "duration": (stop_date - start_date).total_seconds() / 3600,
                    "is_night": True if adder == 6 or adder == 24 else False,
                    "user": int(user),
                    "payout": int(payout),
                    "start_id": int(start_id),
                    "end_id": int(end_id),
                }
            )
            break
    return date_ranges


def obj_list_to_obj_val(**list):
    obj_val = {}
    for key, value in list.items():
        obj_val[key] = value[0]
    return obj_val
