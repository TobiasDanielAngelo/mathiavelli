from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone


class Journal(models.Model):
    """Represents a user-submitted journal entry with optional status tracking."""

    title = models.CharField(max_length=40, blank=True, default="")
    description = models.CharField(max_length=1000, blank=True, default="")
    datetime_created = models.DateTimeField(default=timezone.now, null=True, blank=True)


class Account(models.Model):
    name = models.CharField(max_length=20, default="")
    datetime_added = models.DateTimeField(default=timezone.now, null=True, blank=True)

    def __str__(self):
        return f"{self.pk} - {self.name}"


class Category(models.Model):
    class Meta:
        verbose_name_plural = "categories"

    CategoryChoices = (
        ("1", "Expense"),
        ("2", "Income"),
        ("3", "Transfer"),
        ("4", "Payable"),
        ("5", "Receivable"),
    )
    title = models.CharField(max_length=30, default="", unique=True)
    nature = models.CharField(choices=CategoryChoices, max_length=20, default="3")
    logo = models.CharField(max_length=30, default="star")

    def __str__(self):
        return f"{self.title}"


class Transaction(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        related_name="transaction_category",
        null=True,
    )
    description = models.CharField(max_length=200, default="", blank=True)
    transmitter = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        related_name="transaction_transmitter",
        blank=True,
        null=True,
    )
    receiver = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        related_name="transaction_receiver",
        blank=True,
        null=True,
    )
    amount = models.DecimalField(default=0, decimal_places=2, max_digits=10)
    datetime_transacted = models.DateTimeField(
        default=timezone.now, null=True, blank=True
    )

    def __str__(self):
        return f"{self.description}"


class Receivable(models.Model):
    payment = models.ManyToManyField(
        Transaction,
        blank=True,
        related_name="payment_receivable",
    )
    borrower_name = models.CharField(max_length=30, default="", blank=True)
    lent_amount = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], default=0
    )
    description = models.CharField(max_length=100, default="", blank=True)
    datetime_opened = models.DateTimeField(default=timezone.now, null=True, blank=True)
    datetime_due = models.DateTimeField(blank=True, null=True)
    datetime_closed = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

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
    payment = models.ManyToManyField(
        Transaction,
        blank=True,
        related_name="payment_payable",
    )
    lender_name = models.CharField(max_length=30, default="", blank=True)
    datetime_opened = models.DateTimeField(default=timezone.now, null=True, blank=True)
    datetime_due = models.DateTimeField(blank=True, null=True)
    description = models.CharField(max_length=100, default="", blank=True)
    datetime_closed = models.DateTimeField(blank=True, null=True)
    borrowed_amount = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], default=0
    )
    is_active = models.BooleanField(default=True)

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
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7, default="#ffffff")

    def __str__(self):
        return self.name


class Goal(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    parent_goal = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="subgoals",
    )
    date_completed = models.DateField(null=True, blank=True)
    date_start = models.DateField(null=True, blank=True)
    date_end = models.DateField(null=True, blank=True)
    date_created = models.DateTimeField(default=timezone.now, null=True, blank=True)
    is_cancelled = models.BooleanField(default=False)

    def __str__(self):
        return self.title

    def clean(self):
        if self.date_start and self.date_end and self.date_start > self.date_end:
            raise ValidationError("Start time must be before end time.")

    @property
    def is_completed(self):
        return self.date_completed is not None


class Task(models.Model):
    FREQUENCY_CHOICES = [
        (0, "None"),
        (1, "Daily"),
        (2, "Weekly"),
        (3, "Monthly"),
        (4, "Yearly"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    goal = models.ForeignKey(
        Goal, null=True, blank=True, on_delete=models.SET_NULL, related_name="tasks"
    )
    repeat = models.IntegerField(choices=FREQUENCY_CHOICES, default=0)
    due_date = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    date_completed = models.DateField(null=True, blank=True)
    date_start = models.DateField(null=True, blank=True)
    date_end = models.DateField(null=True, blank=True)
    date_created = models.DateTimeField(default=timezone.now, null=True, blank=True)
    is_cancelled = models.BooleanField(default=False)

    def __str__(self):
        return self.title

    def clean(self):
        if self.date_start and self.date_end and self.date_start > self.date_end:
            raise ValidationError("Start time must be before end time.")


class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start = models.DateTimeField()
    end = models.DateTimeField()
    all_day = models.BooleanField(default=False)
    location = models.CharField(max_length=255, blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    created_at = models.DateTimeField(default=timezone.now, null=True, blank=True)
    task = models.OneToOneField(
        Task, on_delete=models.CASCADE, null=True, blank=True, related_name="event"
    )

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

    STATUS_CHOICES = [
        (0, "Pending"),
        (1, "Bought"),
        (2, "Canceled"),
    ]

    name = models.CharField(max_length=255)
    estimated_price = models.DecimalField(max_digits=10, decimal_places=2)
    added_at = models.DateTimeField(auto_now_add=True)
    planned_date = models.DateField(null=True, blank=True)
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=1)
    status = models.IntegerField(choices=STATUS_CHOICES, default=0)

    def __str__(self):
        return f"{self.description} (Priority: {self.get_priority_display()}, Status: {self.get_status_display()}) - ${self.estimated_price}"


class Platform(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


AUTHENTICATOR_CHOICES = [
    (0, "None"),
    (1, "Google Authenticator"),
    (2, "Authy"),
    (3, "Microsoft Authenticator"),
    (4, "1Password"),
    (5, "Other"),
]


class Credential(models.Model):

    platform = models.ForeignKey(Platform, on_delete=models.CASCADE)
    billing_accounts = models.ManyToManyField(Account, blank=True)

    username = models.CharField(max_length=150, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    password = models.CharField(max_length=255, blank=True, null=True)

    backup_codes = models.TextField(blank=True, null=True)
    pin = models.CharField(max_length=20, blank=True, null=True)
    account_number = models.CharField(max_length=100, blank=True, null=True)

    associated_email = models.EmailField(blank=True, null=True)
    recovery_email = models.EmailField(blank=True, null=True)
    recovery_phone = models.CharField(max_length=30, blank=True, null=True)

    login_method = models.CharField(max_length=50, blank=True, null=True)
    date_created = models.DateField(blank=True, null=True)
    profile_url = models.URLField(blank=True, null=True)

    authenticator_app = models.IntegerField(choices=AUTHENTICATOR_CHOICES, default=0)
    custom_authenticator = models.CharField(max_length=100, blank=True, null=True)
    authenticator_email = models.EmailField(blank=True, null=True)

    notes = models.TextField(blank=True, null=True)
    added_at = models.DateTimeField(auto_now_add=True)

    def display_authenticator(self):
        if self.authenticator_app == 5:
            return self.custom_authenticator or "Other"
        return dict(AUTHENTICATOR_CHOICES).get(self.authenticator_app, "Unknown")

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

    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    link = models.URLField(blank=True)
    source = models.IntegerField(choices=SOURCE_CHOICES, default=0)
    salary = models.CharField(max_length=100, blank=True)
    deadline = models.DateField(null=True, blank=True)
    status = models.IntegerField(choices=STATUS_CHOICES, default=0)
    applied_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    work_setup = models.IntegerField(
        choices=WORK_SETUP_CHOICES,
        default=0,
    )
    job_type = models.IntegerField(
        choices=JOB_TYPE_CHOICES,
        default=0,
    )

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
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="followups")
    date = models.DateField()
    message = models.TextField(blank=True)
    status = models.IntegerField(default=0)
    reply = models.TextField(blank=True)

    def __str__(self):
        return f"Follow-up on {self.date} for {self.job}"
