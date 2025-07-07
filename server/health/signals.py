from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import WeighIn
from core.models import Setting
from productivity.models import Goal
from decimal import Decimal
from django.utils import timezone


@receiver([post_save, post_delete], sender=WeighIn)
@receiver([post_save, post_delete], sender=Setting)
def update_gw_completion(sender, instance, **kwargs):
    latest_weighin = WeighIn.objects.order_by("-date").first()
    for setting in Setting.objects.filter(key__in=["UGW", "GW4", "GW3", "GW2", "GW1"]):

        goal = Goal.objects.filter(title=setting.key).first()

        if setting.value is not None and setting.value != "":
            goal.description = f"To reach {setting.value} kg"
        else:
            goal.description = ""

        if not goal:
            continue
        if not setting.value:
            goal.date_completed = timezone.now()
        elif latest_weighin.weight_kg <= Decimal(setting.value):
            goal.date_completed = timezone.now()
        else:
            goal.date_completed = None
        goal.save()

        transition_goal = Goal.objects.filter(title="To " + setting.key).first()
        if not transition_goal:
            continue
        if not setting.value:
            transition_goal.date_completed = timezone.now()
        elif latest_weighin.weight_kg <= Decimal(setting.value):
            transition_goal.date_completed = timezone.now()
        else:
            transition_goal.date_completed = None
        transition_goal.save()
