from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from . import fields


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

    # Date-based recurrence
    by_week_day = fields.ChoicesStringArrayField(
        ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]
    )
    by_month_day = fields.ChoicesNumberArrayField(range(1, 32))
    by_month = fields.ChoicesNumberArrayField(range(1, 13))
    by_year_day = fields.ChoicesNumberArrayField(range(1, 367))
    by_week_no = fields.ChoicesNumberArrayField(range(1, 54))

    # Time-based recurrence
    by_hour = fields.ChoicesNumberArrayField(range(0, 24))
    by_minute = fields.ChoicesNumberArrayField(range(0, 60))
    by_second = fields.ChoicesNumberArrayField(range(0, 60))
    by_set_position = fields.ChoicesNumberArrayField(range(-31, 32))

    count = fields.LimitedDecimalField(1)
    start_date = fields.OptionalDateField()
    end_date = fields.OptionalDateField()
    week_start = fields.ChoiceIntegerField(WEEKDAY_CHOICES)

    # Metadata
    start_time = fields.OptionalLimitedTimeField()
    end_time = fields.OptionalLimitedTimeField()

    def __str__(self):
        return self.name or f"{self.freq}"


class Journal(models.Model):
    title = fields.ShortCharField()
    description = fields.LongCharField()
    datetime_created = fields.DefaultNowField()


class Account(models.Model):
    name = fields.ShortCharField()
    datetime_added = fields.DefaultNowField()

    def __str__(self):
        return f"{self.pk} - {self.name}"


class Category(models.Model):
    CATEGORY_CHOICES = [
        (0, "Expense"),
        (1, "Income"),
        (2, "Transfer"),
        (3, "Payable"),
        (4, "Receivable"),
    ]

    class Meta:
        verbose_name_plural = "categories"

    title = fields.ShortCharField()
    nature = fields.ChoiceIntegerField(CATEGORY_CHOICES)
    logo = fields.ShortCharField()

    def __str__(self):
        return f"{self.title}"


class Transaction(models.Model):
    category = fields.SetNullOptionalForeignKey(Category)
    description = fields.MediumCharField()
    transmitter = fields.SetNullOptionalForeignKey(Account)
    receiver = fields.SetNullOptionalForeignKey(Account)
    amount = fields.AmountField()
    datetime_transacted = fields.DefaultNowField()

    def __str__(self):
        return f"{self.description}"

    def clean(self):
        super().clean()
        if self.transmitter and self.receiver and self.transmitter == self.receiver:
            raise ValidationError("Transmitter and receiver must be different.")


class Receivable(models.Model):
    payment = fields.OptionalManyToManyField(Transaction)
    borrower_name = fields.ShortCharField()
    lent_amount = fields.AmountField()
    description = fields.MediumCharField()
    datetime_opened = fields.DefaultNowField()
    datetime_due = fields.OptionalDateTimeField()
    datetime_closed = fields.OptionalDateTimeField()
    is_active = fields.DefaultBooleanField(True)

    def __str__(self):
        return f"{self.borrower_name} - {self.description}"

    def payment_total(self):
        return sum(p.amount for p in self.payment.all())

    def check_and_close(self):
        if self.payment_total() >= self.lent_amount and self.is_active:
            self.is_active = False
            self.datetime_closed = timezone.now()
            self.save()


class Payable(models.Model):
    payment = fields.OptionalManyToManyField(Transaction)
    lender_name = fields.ShortCharField()
    datetime_opened = fields.DefaultNowField()
    datetime_due = fields.OptionalDateTimeField()
    description = fields.MediumCharField()
    datetime_closed = fields.OptionalDateTimeField()
    borrowed_amount = fields.AmountField()
    is_active = fields.DefaultBooleanField(True)

    def __str__(self):
        return f"{self.lender_name} - {self.description}"

    def payment_total(self):
        return sum(p.amount for p in self.payment.all())

    def check_and_close(self):
        if self.payment_total() >= self.borrowed_amount and self.is_active:
            self.is_active = False
            self.datetime_closed = timezone.now()
            self.save()


class Tag(models.Model):
    name = fields.ShortCharField()
    color = fields.ColorField()

    def __str__(self):
        return self.name


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


class Event(models.Model):
    title = fields.ShortCharField()
    description = fields.MediumCharField()
    start = fields.OptionalDateTimeField()
    end = fields.OptionalDateTimeField()
    all_day = fields.DefaultBooleanField(False)
    location = fields.ShortCharField()
    tags = fields.OptionalManyToManyField(Tag)
    created_at = fields.AutoCreatedAtField()
    task = fields.OptionalOneToOneField(Task)

    def clean(self):
        if self.start and self.end and self.start >= self.end:
            raise ValidationError("Start time must be before end time.")

    def __str__(self):
        return f"{self.title} ({self.start} - {self.end})"


class BuyListItem(models.Model):
    PRIORITY_CHOICES = [
        (0, "Low"),
        (1, "Medium"),
        (2, "High"),
    ]

    WISHLIST_STATUS_CHOICES = [
        (0, "Pending"),
        (1, "Bought"),
        (2, "Canceled"),
    ]

    name = fields.ShortCharField()
    description = fields.MediumCharField()
    estimated_price = fields.AmountField()
    added_at = fields.AutoCreatedAtField()
    planned_date = fields.OptionalDateField()
    priority = fields.ChoiceIntegerField(PRIORITY_CHOICES)
    status = fields.ChoiceIntegerField(WISHLIST_STATUS_CHOICES)

    def __str__(self):
        return f"{self.description} (Priority: {self.get_priority_display()}, Status: {self.get_status_display()}) - ${self.estimated_price}"


class Platform(models.Model):
    name = fields.ShortCharField()

    def __str__(self):
        return self.name


class Credential(models.Model):
    AUTHENTICATOR_CHOICES = [
        (0, "None"),
        (1, "Google Authenticator"),
        (2, "Authy"),
        (3, "Microsoft Authenticator"),
        (4, "1Password"),
        (5, "Other"),
    ]

    platform = fields.CascadeRequiredForeignKey(Platform)
    billing_accounts = fields.OptionalManyToManyField(Account)
    email = fields.OptionalEmailField()
    recovery_email = fields.OptionalEmailField()
    associated_email = fields.OptionalEmailField()
    authenticator_email = fields.OptionalEmailField()
    profile_url = fields.OptionalURLField()
    pin = fields.ShortCharField()
    login_method = fields.ShortCharField()
    recovery_phone = fields.ShortCharField()
    password = fields.MediumCharField()
    username = fields.MediumCharField()
    account_number = fields.MediumCharField()
    custom_authenticator = fields.MediumCharField()
    notes = fields.LongCharField()
    backup_codes = fields.LongCharField()
    date_created = fields.OptionalDateField()
    authenticator_app = fields.ChoiceIntegerField(AUTHENTICATOR_CHOICES)
    added_at = fields.AutoCreatedAtField()

    def __str__(self):
        main_id = self.username or self.email or "unknown"
        return f"{self.platform.name} - {main_id}"


class Job(models.Model):
    STATUS_CHOICES = [
        (0, "Wishlist"),
        (1, "Applied"),
        (2, "Interview"),
        (3, "Offer"),
        (4, "Rejected"),
        (5, "Accepted"),
    ]

    SOURCE_CHOICES = [
        (0, "Walk-in"),
        (1, "LinkedIn"),
        (2, "Indeed"),
        (3, "Glassdoor"),
        (4, "JobStreet"),
        (5, "Referral"),
        (6, "Company Website"),
        (7, "Facebook"),
        (8, "Twitter / X"),
        (9, "Other"),
    ]

    WORK_SETUP_CHOICES = [
        (0, "On-site"),
        (1, "Remote"),
        (2, "Hybrid"),
    ]

    JOB_TYPE_CHOICES = [
        (0, "Full-time"),
        (1, "Part-time"),
        (2, "Freelance"),
        (3, "Contract"),
        (4, "Internship"),
        (5, "Temporary"),
    ]

    title = fields.ShortCharField()
    company = fields.ShortCharField()
    location = fields.MediumCharField()
    link = fields.OptionalURLField()
    salary = fields.MediumCharField()
    deadline = fields.OptionalDateField()
    applied_date = fields.OptionalDateField()
    notes = fields.LongCharField()

    created_at = fields.AutoCreatedAtField()
    updated_at = fields.AutoUpdatedAtField()

    source = fields.ChoiceIntegerField(SOURCE_CHOICES)
    status = fields.ChoiceIntegerField(STATUS_CHOICES)
    work_setup = fields.ChoiceIntegerField(WORK_SETUP_CHOICES)
    job_type = fields.ChoiceIntegerField(JOB_TYPE_CHOICES)

    def __str__(self):
        return f"{self.title} @ {self.company}"


class FollowUp(models.Model):
    FOLLOWUP_STATUS_CHOICES = [
        (0, "No Response"),
        (1, "Initial Follow-up"),
        (2, "Reminder Email"),
        (3, "Thank You Note"),
        (4, "Checking for Updates"),
        (5, "Interview Scheduled"),
        (6, "Got a Response"),
    ]
    job = fields.CascadeRequiredForeignKey(Job)
    date = fields.OptionalDateField()
    message = fields.LongCharField()
    status = fields.ChoiceIntegerField(FOLLOWUP_STATUS_CHOICES)
    reply = fields.LongCharField()

    def __str__(self):
        return f"Follow-up on {self.date} for {self.job}"


class WeighIn(models.Model):
    weight_kg = fields.DecimalField()
    date = fields.AutoCreatedAtField()


class BodyFat(models.Model):
    body_fat_percent = fields.DecimalField()
    date = fields.AutoCreatedAtField()


class WaistMeasurement(models.Model):
    waist_cm = fields.DecimalField()
    date = fields.AutoCreatedAtField()


class Meal(models.Model):
    MEAL_CATEGORY_CHOICES = [
        (0, "Breakfast"),
        (1, "Lunch"),
        (2, "Dinner"),
        (3, "Snack"),
    ]

    name = fields.MediumCharField()
    category = fields.ChoiceIntegerField(MEAL_CATEGORY_CHOICES)
    calories = fields.DecimalField()
    date = fields.DefaultNowField()


class Workout(models.Model):
    WORKOUT_CATEGORY_CHOICES = [
        (0, "Cardio"),
        (1, "Upper Body"),
        (2, "Lower Body"),
        (3, "Core"),
        (4, "Full Body"),
        (5, "Other"),
    ]

    name = fields.MediumCharField()
    category = fields.ChoiceIntegerField(WORKOUT_CATEGORY_CHOICES)
    duration_minutes = fields.DecimalField()
    calories_burned = fields.DecimalField()
    date = fields.DefaultNowField()


class InventoryCategory(models.Model):
    name = fields.ShortCharField()


class PersonalItem(models.Model):
    name = fields.ShortCharField()
    category = fields.SetNullOptionalForeignKey(InventoryCategory)
    location = fields.ShortCharField()
    quantity = fields.LimitedDecimalField(1)
    acquired_date = fields.OptionalDateField()
    worth = fields.AmountField()
    notes = fields.LongCharField()
    is_important = fields.DefaultBooleanField(False)


class HabitLog(models.Model):
    habit = fields.CascadeRequiredForeignKey(Habit)
    date = fields.AutoCreatedAtField()
    completed_at = fields.OptionalDateTimeField()
