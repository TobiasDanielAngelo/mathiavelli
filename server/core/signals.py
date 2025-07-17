from django.db.models.signals import post_migrate
from django.dispatch import receiver
from finance.models import *
from personal.models import *
from productivity.models import *
from .models import *


@receiver(post_migrate)
def create_default_accounts(sender, **kwargs):
    if sender.name != "core":
        return

    created_goals = {}

    defaults = [
        (Account, 1000001, {"name": "Wallet"}),
        (Account, 1000002, {"name": "Coins"}),
        (Account, 1000003, {"name": "Operations"}),
        (Account, 1000004, {"name": "Initial"}),
        (Category, 1000001, {"title": "Receivable Payment", "nature": 1}),
        (Category, 1000002, {"title": "Payable Payment", "nature": 0}),
        (Category, 1000003, {"title": "Lend Money", "nature": 0}),
        (Category, 1000004, {"title": "Receive Money", "nature": 1}),
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
        (Setting, 1000001, {"key": "Theme", "value": "dark"}),
        (Setting, 1000002, {"key": "UGW"}),
        (Setting, 1000003, {"key": "GW4"}),
        (Setting, 1000004, {"key": "GW3"}),
        (Setting, 1000005, {"key": "GW2"}),
        (Setting, 1000006, {"key": "GW1"}),
        (Goal, 1000001, {"title": "UGW", "parent_goal": None}),
        (Goal, 1000002, {"title": "GW4", "parent_id": 1000001}),
        (Goal, 1000003, {"title": "GW3", "parent_id": 1000002}),
        (Goal, 1000004, {"title": "GW2", "parent_id": 1000003}),
        (Goal, 1000005, {"title": "GW1", "parent_id": 1000004}),
        (Goal, 1000006, {"title": "To UGW", "parent_id": 1000001}),
        (Goal, 1000007, {"title": "To GW4", "parent_id": 1000002}),
        (Goal, 1000008, {"title": "To GW3", "parent_id": 1000003}),
        (Goal, 1000009, {"title": "To GW2", "parent_id": 1000004}),
    ]

    for model, id, fields in defaults:
        parent_id = fields.pop("parent_id", None)
        if parent_id:
            fields["parent_goal"] = created_goals.get(parent_id)
        obj, _ = model.objects.get_or_create(id=id, defaults=fields)
        created_goals[id] = obj
