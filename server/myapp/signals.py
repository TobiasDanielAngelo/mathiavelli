from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import *


@receiver(post_migrate)
def create_default_accounts(sender, **kwargs):
    if sender.name != "myapp":
        return

    defaults = [
        (Account, 1, {"name": "Wallet"}),
        (Account, 2, {"name": "Coins"}),
        (Account, 3, {"name": "Operations"}),
        (Account, 4, {"name": "Initial"}),
        (Category, 1, {"title": "Receivable Payment"}),
        (Category, 2, {"title": "Payable Payment"}),
    ]

    for model, id, fields in defaults:
        model.objects.get_or_create(id=id, defaults=fields)
