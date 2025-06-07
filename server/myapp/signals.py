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
        (Platform, 1, {"name": "Google"}),
        (Platform, 2, {"name": "GitHub"}),
        (Platform, 3, {"name": "Facebook"}),
        (Platform, 4, {"name": "Twitter"}),
        (Platform, 5, {"name": "Microsoft"}),
        (Platform, 6, {"name": "Apple"}),
        (Platform, 7, {"name": "Amazon"}),
        (Platform, 8, {"name": "Netflix"}),
        (Platform, 9, {"name": "Steam"}),
        (Platform, 10, {"name": "Spotify"}),
    ]

    for model, id, fields in defaults:
        model.objects.get_or_create(id=id, defaults=fields)
