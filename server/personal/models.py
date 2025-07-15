from core.models import CustomModel
from finance.models import Account
from core import fields


class Journal(CustomModel):
    title = fields.ShortCharField()
    description = fields.LongCharField()
    datetime_created = fields.DefaultNowField()


class Dream(CustomModel):
    entry = fields.LongCharField()
    date_created = fields.DefaultTodayField()


class Platform(CustomModel):
    name = fields.ShortCharField()

    def __str__(self):
        return self.name


class Credential(CustomModel):
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


class Document(CustomModel):
    DOCUMENT_TYPE_CHOICES = [
        (0, "ID"),
        (1, "Certificate"),
        (2, "Contract"),
        (3, "Bill"),
        (4, "Other"),
    ]
    title = fields.ShortCharField(display=True)
    description = fields.MediumCharField()
    document_type = fields.ChoiceIntegerField(DOCUMENT_TYPE_CHOICES, 4)
    file = fields.FileField("documents/")
    issued_date = fields.OptionalDateField()
    expiry_date = fields.OptionalDateField()
    is_active = fields.DefaultBooleanField(True)
    created_at = fields.AutoCreatedAtField()
    updated_at = fields.AutoUpdatedAtField()
