from django.db import models
from finance.models import Account
from core import fields


class Journal(models.Model):
    title = fields.ShortCharField()
    description = fields.LongCharField()
    datetime_created = fields.DefaultNowField()


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
