from core.models import CustomModel
from core import fields
from core.models import CustomModel
from django.core.exceptions import ValidationError
from django.utils import timezone


class Account(CustomModel):
    # CURRENCY_CHOICES = [
    #     (0, "PHP"),
    #     (1, "USD"),
    # ]
    name = fields.ShortCharField(display=True)
    datetime_added = fields.DefaultNowField()
    # currency = fields.ChoiceIntegerField(CURRENCY_CHOICES)

    # def __str__(self):
    #     return f"{self.pk} - {self.name}"


class Category(CustomModel):
    CATEGORY_CHOICES = [
        (0, "Expense"),
        (1, "Income"),
        (2, "Transfer"),
        (3, "Payable"),
        (4, "Receivable"),
    ]

    class Meta:
        verbose_name_plural = "categories"

    title = fields.ShortCharField(display=True)
    nature = fields.ChoiceIntegerField(CATEGORY_CHOICES)
    logo = fields.ShortCharField()


class Transaction(CustomModel):
    category = fields.SetNullOptionalForeignKey(Category)
    description = fields.MediumCharField(display=True)
    transmitter = fields.SetNullOptionalForeignKey(Account)
    receiver = fields.SetNullOptionalForeignKey(Account)
    amount = fields.AmountField()
    datetime_transacted = fields.DefaultNowField()

    def clean(self):
        super().clean()
        if self.transmitter and self.receiver and self.transmitter == self.receiver:
            raise ValidationError("Transmitter and receiver must be different.")


class Receivable(CustomModel):
    charge_transaction = fields.SetNullOptionalForeignKey(Transaction)
    payment = fields.OptionalManyToManyField(Transaction)
    borrower_name = fields.ShortCharField(display=True)
    lent_amount = fields.AmountField()
    description = fields.MediumCharField(display=True)
    datetime_opened = fields.DefaultNowField()
    datetime_due = fields.OptionalDateTimeField()
    datetime_closed = fields.OptionalDateTimeField()
    is_active = fields.DefaultBooleanField(True)

    def payment_total(self):
        return sum(p.amount for p in self.payment.all())

    def check_and_close(self):
        if self.payment_total() >= self.lent_amount and self.is_active:
            self.is_active = False
            self.datetime_closed = timezone.now()
            self.save()


class Payable(CustomModel):
    payment = fields.OptionalManyToManyField(Transaction)
    lender_name = fields.ShortCharField(display=True)
    datetime_opened = fields.DefaultNowField()
    datetime_due = fields.OptionalDateTimeField()
    description = fields.MediumCharField(display=True)
    datetime_closed = fields.OptionalDateTimeField()
    borrowed_amount = fields.AmountField()
    is_active = fields.DefaultBooleanField(True)

    def payment_total(self):
        return sum(p.amount for p in self.payment.all())

    def check_and_close(self):
        if self.payment_total() >= self.borrowed_amount and self.is_active:
            self.is_active = False
            self.datetime_closed = timezone.now()
            self.save()


class BuyListItem(CustomModel):
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

    name = fields.ShortCharField(display=True)
    description = fields.MediumCharField()
    estimated_price = fields.AmountField()
    added_at = fields.AutoCreatedAtField()
    planned_date = fields.OptionalDateField()
    priority = fields.ChoiceIntegerField(PRIORITY_CHOICES)
    status = fields.ChoiceIntegerField(WISHLIST_STATUS_CHOICES)


class InventoryCategory(CustomModel):
    name = fields.ShortCharField()

    class Meta:
        verbose_name_plural = "inventory categories"


class PersonalItem(CustomModel):
    name = fields.ShortCharField(display=True)
    category = fields.SetNullOptionalForeignKey(InventoryCategory)
    location = fields.ShortCharField()
    quantity = fields.LimitedDecimalField(1)
    acquired_date = fields.OptionalDateField()
    worth = fields.AmountField()
    notes = fields.LongCharField()
    is_important = fields.DefaultBooleanField(False)
