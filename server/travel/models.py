from core import fields
from core.models import CustomModel
from finance.models import PersonalItem
from personal.models import Document
from django.core.exceptions import ValidationError


class ItemToBring(CustomModel):
    inventory_item = fields.CascadeOptionalForeignKey(PersonalItem)
    document = fields.CascadeOptionalForeignKey(Document)
    quantity = fields.DecimalField()
    packed = fields.DefaultBooleanField(False)

    def __str__(self):
        return f"{self.inventory_item if self.inventory_item else self.document} ({round(self.quantity)})"

    def clean(self):
        if not self.inventory_item and not self.document:
            raise ValidationError("One of these is required")
        elif self.inventory_item and self.document:
            raise ValidationError("Create a new item with the two separated.")
        return super().clean()

    class Meta:
        verbose_name_plural = "items to bring"


class TravelPlan(CustomModel):
    PURPOSE_CHOICES = [
        (0, "Work"),
        (1, "Study"),
        (2, "Vacation"),
        (3, "Relocation"),
        (4, "Other"),
    ]

    STATUS_CHOICES = [
        (0, "Planning"),
        (1, "Booking"),
        (2, "Approved"),
        (3, "On Hold"),
        (4, "Completed"),
    ]
    items_to_bring = fields.OptionalManyToManyField(ItemToBring)
    country = fields.ShortCharField(display=True)
    city = fields.ShortCharField()
    purpose = fields.ChoiceIntegerField(PURPOSE_CHOICES, 4)
    target_date = fields.OptionalDateField()
    status = fields.ChoiceIntegerField(STATUS_CHOICES, 0)
    notes = fields.LongCharField()


class Requirement(CustomModel):
    plan = fields.CascadeRequiredForeignKey(TravelPlan)
    name = fields.ShortCharField(display=True)
    cost = fields.AmountField()
    completed = fields.DefaultBooleanField(False)
