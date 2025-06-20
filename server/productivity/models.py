from django.db import models
from core import fields
from .utils import get_datetimes
from django.core.exceptions import ValidationError


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


class Goal(models.Model):
    title = fields.ShortCharField()
    description = fields.MediumCharField()
    parent_goal = fields.CascadeOptionalForeignKey("self")
    date_completed = fields.OptionalDateField()
    date_start = fields.OptionalDateField()
    date_end = fields.OptionalDateField()
    date_created = fields.AutoCreatedAtField()
    is_cancelled = fields.DefaultBooleanField(False)

    def __str__(self):
        return self.title

    def clean(self):
        if self.date_start and self.date_end and self.date_start > self.date_end:
            raise ValidationError("Start time must be before end time.")

    @property
    def is_completed(self):
        return self.date_completed is not None


class Habit(models.Model):
    title = fields.ShortCharField()
    description = fields.MediumCharField()
    goal = fields.CascadeOptionalForeignKey(Goal)
    schedule = fields.SetNullOptionalForeignKey(Schedule)
    threshold_percent = fields.LimitedDecimalField(0, 100, 80)
    date_start = fields.OptionalDateField()
    date_end = fields.OptionalDateField()
    is_archived = fields.DefaultBooleanField(False)
    date_created = fields.AutoCreatedAtField()


class Task(models.Model):

    title = fields.ShortCharField()
    description = fields.MediumCharField()
    goal = fields.CascadeOptionalForeignKey(Goal)
    habit = fields.CascadeOptionalForeignKey(Habit)
    importance = fields.LimitedDecimalField(0, 10)
    schedule = fields.SetNullOptionalForeignKey(Schedule)
    due_date = fields.OptionalDateField()
    is_completed = fields.DefaultBooleanField(False)
    date_completed = fields.OptionalDateField()
    date_start = fields.OptionalDateField()
    date_end = fields.OptionalDateField()
    date_created = fields.AutoCreatedAtField()
    is_cancelled = fields.DefaultBooleanField(False)

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


class Event(models.Model):
    title = fields.ShortCharField()
    description = fields.MediumCharField()
    start = fields.OptionalDateTimeField()
    end = fields.OptionalDateTimeField()
    all_day = fields.DefaultBooleanField(False)
    location = fields.ShortCharField()
    tags = fields.OptionalManyToManyField(Tag)
    created_at = fields.AutoCreatedAtField()
    task = fields.CascadeOptionalForeignKey(Task)

    def clean(self):
        if self.start and self.end and self.start >= self.end:
            raise ValidationError("Start time must be before end time.")

    def __str__(self):
        return f"{self.title} ({self.start} - {self.end})"


class HabitLog(models.Model):
    habit = fields.CascadeRequiredForeignKey(Habit)
    date = fields.AutoCreatedAtField()
    completed_at = fields.OptionalDateTimeField()
