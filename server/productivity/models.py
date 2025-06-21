from django.db import models
from core import fields
from .utils import get_datetimes
from django.core.exceptions import ValidationError


class Productivity(models.Model):
    title = fields.ShortCharField()
    description = fields.MediumCharField()
    date_start = fields.OptionalDateTimeField()
    date_end = fields.OptionalDateTimeField()
    date_created = fields.AutoCreatedAtField()
    date_completed = fields.OptionalDateTimeField()
    is_archived = fields.DefaultBooleanField(False)

    class Meta:
        abstract = True


class Schedule(models.Model):
    """
    Recurrence Range vs. Event Duration:

    - dtstart: When the recurrence rule starts generating events. Defaults to the current date/time.
    - until: Last possible datetime for generating recurring events (inclusive).
      If both `count` and `until` are None, the recurrence is infinite.

    - start_datetime: The actual start time of each generated event occurrence.
    - end_datetime: The actual end time of each generated event occurrence.

    Example:
        A habit every Monday at 9AM to 10AM for 4 weeks:
        - freq = 'weekly', byweekday = ['MO'], byhour = [9]
        - dtstart = '2025-07-01 09:00'
        - until = '2025-07-29 09:00'
        - start_datetime = '09:00'
        - end_datetime = '10:00'
    """

    FREQ_CHOICES = [
        (0, "Yearly"),
        (1, "Monthly"),
        (2, "Weekly"),
        (3, "Daily"),
        (4, "Hourly"),
        (5, "Minutely"),
        (6, "Secondly"),
    ]

    WEEKDAY_CHOICES = [
        (0, "Monday"),
        (1, "Tuesday"),
        (2, "Wednesday"),
        (3, "Thursday"),
        (4, "Friday"),
        (5, "Saturday"),
        (6, "Sunday"),
    ]

    name = fields.ShortCharField()
    freq = fields.ChoiceIntegerField(FREQ_CHOICES)
    interval = fields.LimitedDecimalField(1)
    by_week_day = fields.ChoicesStringArrayField(
        ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]
    )
    by_month_day = fields.ChoicesNumberArrayField(range(1, 32))
    by_month = fields.ChoicesNumberArrayField(range(1, 13))
    by_year_day = fields.ChoicesNumberArrayField(range(1, 367))
    by_week_no = fields.ChoicesNumberArrayField(range(1, 54))
    by_hour = fields.ChoicesNumberArrayField(range(0, 24))
    by_minute = fields.ChoicesNumberArrayField(range(0, 60))
    by_second = fields.ChoicesNumberArrayField(range(0, 60))
    by_set_position = fields.ChoicesNumberArrayField(range(-31, 32))

    count = fields.LimitedDecimalField(1)
    start_date = fields.OptionalDateField()
    end_date = fields.OptionalDateField()
    start_time = fields.OptionalLimitedTimeField()
    end_time = fields.OptionalLimitedTimeField()

    week_start = fields.ChoiceIntegerField(WEEKDAY_CHOICES)

    def __str__(self):
        return self.name or f"{self.freq}"

    @property
    def datetimes(self):
        return get_datetimes(self)


class Goal(Productivity):
    parent_goal = fields.CascadeOptionalForeignKey("self")

    def __str__(self):
        return self.title

    def clean(self):
        if self.date_start and self.date_end and self.date_start > self.date_end:
            raise ValidationError("Start time must be before end time.")


class Habit(Productivity):
    goal = fields.CascadeOptionalForeignKey(Goal)
    schedule = fields.SetNullOptionalForeignKey(Schedule)
    threshold_percent = fields.LimitedDecimalField(0, 100, 80)


class Task(Productivity):
    goal = fields.CascadeOptionalForeignKey(Goal)
    habit = fields.OptionalOneToOneField(Habit)
    schedule = fields.SetNullOptionalForeignKey(Schedule)
    importance = fields.LimitedDecimalField(0, 10)
    due_date = fields.OptionalDateField()

    def __str__(self):
        return self.title

    def clean(self):
        if self.date_start and self.date_end and self.date_start > self.date_end:
            raise ValidationError("Start time must be before end time.")

    class Meta:
        unique_together = ("due_date", "importance")


class Tag(models.Model):
    name = fields.ShortCharField()
    color = fields.ColorField()

    def __str__(self):
        return self.name


class Event(Productivity):
    location = fields.ShortCharField()
    tags = fields.OptionalManyToManyField(Tag)
    task = fields.CascadeOptionalForeignKey(Task)

    def clean(self):
        if self.date_start and self.date_end and self.date_start >= self.date_end:
            raise ValidationError("Start time must be before end time.")

    def __str__(self):
        return f"{self.title} ({self.date_start} - {self.date_end})"


class HabitLog(models.Model):
    habit = fields.CascadeRequiredForeignKey(Habit)
    date = fields.AutoCreatedAtField()
    completed_at = fields.OptionalDateTimeField()
