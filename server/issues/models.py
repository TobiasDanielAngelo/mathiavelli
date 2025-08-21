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
    tags = fields.OptionalManyToManyField(Tag)
    description = fields.LongCharField()
    status = fields.ChoiceIntegerField(STATUS_CHOICES)
    priority = fields.ChoiceIntegerField(PRIORITY_CHOICES)
    assigned_to = fields.SetNullOptionalForeignKey(User)


class Comment(CustomModel):
    ticket = fields.CascadeRequiredForeignKey(Ticket)
    user = fields.CascadeRequiredForeignKey(User)
    content = fields.LongCharField()


class Note(CustomModel):
    title = fields.ShortCharField(display=True)
    body = fields.LongCharField()
    file = fields.FileField("notes/")


class AppRelease(CustomModel):
    title = fields.ShortCharField(display=True)
    description = fields.LongCharField()
    file = fields.FileField("releases/")
