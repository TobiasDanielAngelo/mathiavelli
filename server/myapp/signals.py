from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import *


@receiver(post_migrate)
def create_default_accounts(sender, **kwargs):
    if sender.name != "myapp":
        return

    defaults = [
        (Account, 1000001, {"name": "Wallet"}),
        (Account, 1000002, {"name": "Coins"}),
        (Account, 1000003, {"name": "Operations"}),
        (Account, 1000004, {"name": "Initial"}),
        (Category, 1000001, {"title": "Receivable Payment"}),
        (Category, 1000002, {"title": "Payable Payment"}),
        (Platform, 1000001, {"name": "Google"}),
        (Platform, 1000002, {"name": "GitHub"}),
        (Platform, 1000003, {"name": "Facebook"}),
        (Platform, 1000004, {"name": "Twitter"}),
        (Platform, 1000005, {"name": "Microsoft"}),
        (Platform, 1000006, {"name": "Apple"}),
        (Platform, 1000007, {"name": "Amazon"}),
        (Platform, 1000008, {"name": "Netflix"}),
        (Platform, 1000009, {"name": "Steam"}),
        (Platform, 1000010, {"name": "Spotify"}),
    ]

    for model, id, fields in defaults:
        model.objects.get_or_create(id=id, defaults=fields)
