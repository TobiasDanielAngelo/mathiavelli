from django.contrib.auth.models import User
from core import fields
from core.models import CustomModel


class Tag(CustomModel):
    name = fields.LongCharField(display=True, unique=True)


class Ticket(CustomModel):
    STATUS_CHOICES = [
        (0, "Open"),
        (1, "In Progress"),
        (2, "Closed"),
    ]

    PRIORITY_CHOICES = [
        (0, "Low"),
        (1, "Medium"),
        (2, "High"),
    ]

    title = fields.MediumCharField(display=True)
    tags = fields.ManyToManyField(Tag)
    description = fields.LongCharField()
    status = fields.ChoiceIntegerField(STATUS_CHOICES)
    priority = fields.ChoiceIntegerField(PRIORITY_CHOICES)
    created_at = fields.AutoCreatedAtField()
    updated_at = fields.DefaultNowField()
    assigned_to = fields.SetNullOptionalForeignKey(User)


class Comment(CustomModel):
    ticket = fields.CascadeRequiredForeignKey(Ticket)
    user = fields.CascadeRequiredForeignKey(User)
    content = fields.LongCharField()
    created_at = fields.AutoCreatedAtField()


class Note(CustomModel):
    title = fields.ShortCharField(display=True)
    body = fields.LongCharField()
    file = fields.FileField("notes/")
    created_at = fields.AutoCreatedAtField()
    updated_at = fields.AutoUpdatedAtField()
