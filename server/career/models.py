from django.db import models
from core import fields


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
