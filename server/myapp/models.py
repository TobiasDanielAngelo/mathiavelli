from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator


class Journal(models.Model):
    """Represents a user-submitted journal entry with optional status tracking."""

    text = models.CharField(max_length=255, blank=True, default="")
    datetime_created = models.DateTimeField(auto_now_add=True)


class Account(models.Model):
    name = models.CharField(max_length=20, default="")
    datetime_added = models.DateTimeField(auto_now_add=True)

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
    description = models.CharField(max_length=200, default="")
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
    datetime_transacted = models.DateTimeField(auto_now_add=True)

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
    datetime_opened = models.DateTimeField(auto_now_add=True)
    datetime_due = models.DateTimeField(blank=True, null=True)
    datetime_closed = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.borrower_name} - {self.description}"


class Payable(models.Model):
    payment = models.ManyToManyField(
        Transaction,
        blank=True,
        related_name="payment_payable",
    )
    lender_name = models.CharField(max_length=30, default="", blank=True)
    datetime_opened = models.DateTimeField(auto_now_add=True)
    datetime_due = models.DateTimeField(blank=True, null=True)
    description = models.CharField(max_length=100, default="", blank=True)
    datetime_closed = models.DateTimeField(blank=True, null=True)
    borrowed_amount = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], default=0
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.lender_name} - {self.description}"
